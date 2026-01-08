import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ChatService, ChatMessage } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-tarefa',
  templateUrl: './chat-tarefa.page.html',
  styleUrls: ['./chat-tarefa.page.scss'],
  standalone: false,
})
export class ChatTarefaPage implements OnInit, OnDestroy {
  @Input() tarefaId!: number;
  messages: ChatMessage[] = [];
  texto: string = '';
  sub?: Subscription;
  canSend: boolean = true;
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  // Avatar cache por usuário
  avatarUrls: { [userId: number]: string | null } = {};
  private avatarObjectUrls: { [userId: number]: string | null } = {};
  replyingTo: ChatMessage | null = null;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    public usuarioService: UsuarioService
    ,
    private tarefaService: TarefaService,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If tarefaId wasn't passed as @Input (modal), try to read from route params (page navigation)
    if (!this.tarefaId) {
      const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
      this.tarefaId = id;
    }
    this.chatService.connect();
    // load tarefa status to decide if sending is allowed
    try {
      this.tarefaService.buscarPorId(this.tarefaId).subscribe(t => {
        this.canSend = (t?.statusTarefa !== StatusTarefa.Concluida);
      }, (err) => {
        // if error fetching tarefa, keep canSend true (fail-open), but log
        console.error('Erro ao buscar tarefa para chat:', err);
      });
    } catch (e) {
      // ignore
    }
    
    // Obter referência ao cache de mensagens do serviço (será atualizado automaticamente)
    this.messages = this.chatService.getMessagesForTarefa(this.tarefaId);
    
    // Buscar histórico de mensagens do backend
    this.chatService.fetchHistory(this.tarefaId).subscribe({
      next: (msgs) => {
        // O fetchHistory já atualiza o cache interno, então não precisa fazer nada aqui
        setTimeout(() => {
          this.loadAvatarsForMessages();
          this.scrollToBottom();
        }, 80);
      },
      error: (err) => {
        console.error('Erro ao carregar histórico do chat:', err);
        setTimeout(() => {
          this.loadAvatarsForMessages();
          this.scrollToBottom();
        }, 80);
      }
    });
    
    // subscribe to incoming messages — the service pushes into the shared array, so avoid pushing again here
    this.sub = this.chatService.subscribeToTarefa(this.tarefaId).subscribe(() => {
      // Atualiza avatares e scroll ao receber novas mensagens
      setTimeout(() => {
        this.loadAvatarsForMessages();
        this.scrollToBottom();
      }, 50);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    // liberar object URLs
    Object.values(this.avatarObjectUrls).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }

  enviar() {
    if (!this.canSend) {
      // optionally show a client-side hint instead of sending
      return;
    }
    if (!this.texto || !this.texto.trim()) return;
    const usuario = this.usuarioService.getCurrentUserValue?.() ?? this.usuarioService.carregar?.();
    const tempId = this.generateTempId();
    const msg: ChatMessage = {
      tarefaId: this.tarefaId,
      senderId: usuario?.idUsuario,
      senderName: usuario?.nome ?? 'Anon',
      content: this.texto.trim(),
      timestamp: new Date().toISOString(),
      tempId,
      replyToId: this.replyingTo?.id ?? this.replyingTo?.tempId,
      replyToSenderName: this.replyingTo?.senderName,
      replyToContent: this.replyingTo?.content
    };
    this.chatService.sendMessage(this.tarefaId, msg);
    this.texto = '';
    this.replyingTo = null;
    // garantir que o avatar do remetente atual esteja carregado
    if (usuario?.idUsuario) {
      this.carregarAvatar(usuario.idUsuario);
    }
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {
      // ignore
    }
  }

  private generateTempId(): string {
    // lightweight uuid v4-ish
    return 't.' + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 9);
  }

  async close() {
    try {
      await this.modalController.dismiss();
    } catch (e) {
      // not opened as modal, fallback to history back
      try { history.back(); } catch (err) { this.router.navigateByUrl('/minhas-tarefas'); }
    }
  }

  getInitials(name?: string | null): string {
    if (!name) return '??';
    try {
      const parts = name.split(' ').filter(p => p && p.length);
      const initials = parts.map(p => p[0]).slice(0, 2).join('');
      return initials.toUpperCase();
    } catch (e) {
      return name.slice(0, 2).toUpperCase();
    }
  }

  private definirAvatar(userId: number, objUrl: string | null) {
    const anterior = this.avatarObjectUrls[userId];
    if (anterior && anterior !== objUrl) {
      URL.revokeObjectURL(anterior);
    }
    this.avatarObjectUrls[userId] = objUrl;
    this.avatarUrls[userId] = objUrl;
  }

  private carregarAvatar(userId: number) {
    if (!userId || this.avatarUrls[userId] !== undefined) return;
    this.usuarioService.downloadFoto(userId).subscribe({
      next: (blob) => {
        if (blob instanceof Blob) {
          const obj = URL.createObjectURL(blob);
          this.definirAvatar(userId, obj);
        } else {
          this.definirAvatar(userId, null);
        }
      },
      error: () => this.definirAvatar(userId, null)
    });
  }

  private loadAvatarsForMessages() {
    try {
      const ids = new Set<number>();
      (this.messages || []).forEach(m => {
        const id = m.senderId as number | undefined;
        if (id) ids.add(id);
      });
      ids.forEach(id => this.carregarAvatar(id));
    } catch (e) {
      // ignore
    }
  }

  isMine(m: ChatMessage): boolean {
    const currentId = this.usuarioService.getCurrentUserValue?.()?.idUsuario ?? this.usuarioService.carregar?.()?.idUsuario;
    return !!currentId && !!m.senderId && m.senderId === currentId;
  }

  selectReply(m: ChatMessage) {
    this.replyingTo = m;
  }

  cancelReply() {
    this.replyingTo = null;
  }

  deleteMessage(m: ChatMessage) {
    if (!this.isMine(m)) return;
    // Remove da lista local
    const arr = this.messages;
    const idx = arr.indexOf(m);
    if (idx >= 0) {
      arr.splice(idx, 1);
    }
    // Best-effort delete no backend (se suportado)
    if (m.id) {
      this.chatService.deleteMessage(m.id).subscribe({
        error: (err) => console.error('Falha ao excluir mensagem', err)
      });
    }
  }
}
