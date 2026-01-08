import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface ChatMessage {
  tarefaId: number;
  senderId?: number;
  senderName?: string;
  content: string;
  timestamp?: string;
  // optional ids to help deduplication / persistence
  id?: number | string;
  tempId?: string;
  replyToId?: number | string;
  replyToSenderName?: string;
  replyToContent?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: Client | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  private subjectsByTarefa = new Map<number, Subject<ChatMessage>>();
  // in-memory cache of messages per tarefa while the SPA is running
  private messagesByTarefa = new Map<number, ChatMessage[]>();
  // track seen message keys per tarefa to avoid duplicates when server echoes
  private seenMessageKeys = new Map<number, Set<string>>();
  // queue messages while STOMP connection is not ready
  private pendingOutgoing: Array<{ tarefaId: number; message: ChatMessage }> = [];
  // track locally deleted messages to hide after refresh
  private deletedMessageIds = new Set<string>();

  // HTTP base for conversation endpoints
  private api = `${environment.apiUrl ?? 'http://localhost:8080'}/api/v1/conversa`;

  constructor(private usuarioService: UsuarioService, private http: HttpClient) {
    this.loadDeletedFromStorage();
    this.connect();
  }

  /**
   * HTTP helper: create or get conversation for a tarefa (backend creates if missing)
   */
  getOrCreateConversationForTask(tarefaId: number, payload?: any): Observable<any> {
    return this.http.post(`${this.api}/tarefa/${tarefaId}`, payload || {});
  }

  listarMensagens(conversationId: number) {
    return this.http.get(`${this.api}/${conversationId}/mensagens`);
  }

  postarMensagem(conversationId: number, message: { senderId: number; content: string; replyToId?: number }) {
    return this.http.post(`${this.api}/${conversationId}/mensagens`, message);
  }

  deleteMessage(messageId: number | string) {
    const url = `${environment.apiUrl ?? 'http://localhost:8080'}/api/v1/mensagem/${messageId}`;
    this.markDeleted(messageId);
    return this.http.delete(url);
  }

  connect(): void {
    if (this.client && this.client.active) return;
    const socketUrl = environment.apiUrl ? `${environment.apiUrl}/ws` : 'http://localhost:8080/ws';

    const token = this.usuarioService.carregar?.()?.token ?? this.usuarioService.getCurrentUserValue?.()?.token;
    const connectHeaders: any = {};
    if (token) connectHeaders.Authorization = token.startsWith('Bearer') ? token : `Bearer ${token}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl) as any,
      debug: (str) => {
        console.debug('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders,
    });

    this.client.onConnect = (frame) => {
      console.info('STOMP connected', frame ? frame.headers : 'no-frame');
      this.connected$.next(true);
      for (const [tarefaId, subj] of Array.from(this.subjectsByTarefa.entries())) {
        this.ensureSubscription(tarefaId, subj);
      }
      this.flushPending();
    };

    this.client.onStompError = (frame: any) => {
      console.error('STOMP error', frame);
    };

    this.client.onWebSocketClose = (evt: any) => {
      console.warn('WebSocket closed', evt);
      this.connected$.next(false);
    };

    this.client.onWebSocketError = (evt: any) => {
      console.error('WebSocket error', evt);
    };

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected$.next(false);
    }
  }

  subscribeToTarefa(tarefaId: number): Observable<ChatMessage> {
    if (!this.subjectsByTarefa.has(tarefaId)) {
      const subj = new Subject<ChatMessage>();
      this.subjectsByTarefa.set(tarefaId, subj);
      this.ensureConnectedAndSubscribe(tarefaId, subj);
    }
    return this.subjectsByTarefa.get(tarefaId)!.asObservable();
  }

  private ensureConnectedAndSubscribe(tarefaId: number, subj: Subject<ChatMessage>) {
    if (!this.client) this.connect();
    const trySubscribe = () => {
      if (!this.client || !this.client.connected) {
        setTimeout(trySubscribe, 200);
        return;
      }
      this.ensureSubscription(tarefaId, subj);
    };
    trySubscribe();
  }

  private ensureSubscription(tarefaId: number, subj: Subject<ChatMessage>) {
    const dest = `/topic/tarefa/${tarefaId}`;
    try {
      this.client!.subscribe(dest, (msg: IMessage) => {
        try {
          const body = JSON.parse(msg.body) as ChatMessage;
          if (body.id && this.isDeleted(body.id)) return;
          const key = String(
            body.tempId ?? body.id ?? `${body.timestamp ?? ''}|${body.senderId ?? ''}|${(body.content ?? '').slice(0, 80)}`
          );
          if (!this.seenMessageKeys.has(tarefaId)) this.seenMessageKeys.set(tarefaId, new Set<string>());
          const set = this.seenMessageKeys.get(tarefaId)!;
          if (set.has(key)) return;
          set.add(key);
          if (!this.messagesByTarefa.has(tarefaId)) this.messagesByTarefa.set(tarefaId, []);
          this.messagesByTarefa.get(tarefaId)!.push(body);
          subj.next(body);
        } catch (e) {
          console.error('Invalid chat message', e);
        }
      });
    } catch (e) {
      console.error('Failed to subscribe to', dest, e);
    }
  }

  sendMessage(tarefaId: number, message: ChatMessage) {
    if (!this.client || !this.client.active) this.connect();
    const dest = `/app/tarefa/${tarefaId}/chat`;
    message.tarefaId = tarefaId;
    if (!this.client) return;
    if (!this.client.connected) {
      this.pendingOutgoing.push({ tarefaId, message });
    } else {
      this.client.publish({ destination: dest, body: JSON.stringify(message) });
    }
    const key = String(message.tempId ?? message.id ?? `${message.timestamp ?? ''}|${message.senderId ?? ''}|${(message.content ?? '').slice(0, 80)}`);
    if (!this.seenMessageKeys.has(tarefaId)) this.seenMessageKeys.set(tarefaId, new Set<string>());
    this.seenMessageKeys.get(tarefaId)!.add(key);
    if (!this.messagesByTarefa.has(tarefaId)) this.messagesByTarefa.set(tarefaId, []);
    this.messagesByTarefa.get(tarefaId)!.push(message);
    const subj = this.subjectsByTarefa.get(tarefaId);
    if (subj) subj.next(message);
  }

  private flushPending() {
    if (!this.client || !this.client.connected) return;
    while (this.pendingOutgoing.length) {
      const item = this.pendingOutgoing.shift()!;
      const dest = `/app/tarefa/${item.tarefaId}/chat`;
      try {
        this.client.publish({ destination: dest, body: JSON.stringify(item.message) });
      } catch (e) {
        console.error('Failed to publish queued message', e);
        this.pendingOutgoing.unshift(item);
        break;
      }
    }
  }

  /**
   * Busca histórico persistido do backend para a tarefa e coloca no cache em memória.
   */
  fetchHistory(tarefaId: number): Observable<ChatMessage[]> {
    const url = `${environment.apiUrl ?? 'http://localhost:8080'}/api/v1/tarefa/${tarefaId}/mensagens`;
    const usuario = this.usuarioService.carregar?.() ?? this.usuarioService.getCurrentUserValue?.();
    const token = usuario?.token ?? '';
    const headers = token ? new HttpHeaders({ Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}` }) : undefined;

    return new Observable<ChatMessage[]>((observer) => {
      this.http.get<any[]>(url, headers ? { headers } : {}).subscribe({
        next: (arr) => {
          const msgs: ChatMessage[] = arr.map((m) => ({
            tarefaId: m.idTarefa,
            senderId: m.idRemetente,
            senderName: m.nomeRemetente,
            content: m.conteudo,
            timestamp: m.dataEnvio,
            id: m.idMensagem,
            replyToId: m.idResposta,
            replyToSenderName: m.nomeResposta,
            replyToContent: m.conteudoResposta,
          }));
          const filtered = msgs.filter(msg => !msg.id || !this.isDeleted(msg.id));
          // Limpar cache anterior e adicionar mensagens carregadas
          if (!this.messagesByTarefa.has(tarefaId)) this.messagesByTarefa.set(tarefaId, []);
          const cache = this.messagesByTarefa.get(tarefaId)!;
          cache.length = 0;
          cache.push(...filtered);
          
          // Atualizar conjunto de mensagens vistas para evitar duplicatas
          if (!this.seenMessageKeys.has(tarefaId)) this.seenMessageKeys.set(tarefaId, new Set<string>());
          const seenSet = this.seenMessageKeys.get(tarefaId)!;
          seenSet.clear();
          filtered.forEach(msg => {
            const key = String(msg.id ?? msg.tempId ?? `${msg.timestamp}|${msg.senderId}|${msg.content.slice(0, 80)}`);
            seenSet.add(key);
          });
          
          observer.next(filtered);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Return in-memory cached messages for a tarefa (not persisted across page reloads).
   */
  getMessagesForTarefa(tarefaId: number): ChatMessage[] {
    if (!this.messagesByTarefa.has(tarefaId)) this.messagesByTarefa.set(tarefaId, []);
    return this.messagesByTarefa.get(tarefaId)!;
  }

  private markDeleted(messageId: number | string) {
    const key = String(messageId);
    this.deletedMessageIds.add(key);
    this.saveDeletedToStorage();
    // Remove de todos os caches
    for (const arr of Array.from(this.messagesByTarefa.values())) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].id && String(arr[i].id) === key) {
          arr.splice(i, 1);
        }
      }
    }
    // Limpa seen keys para evitar reentrada dessa mensagem
    for (const set of Array.from(this.seenMessageKeys.values())) {
      Array.from(set).forEach(k => {
        if (k.includes(key)) set.delete(k);
      });
    }
  }

  private isDeleted(messageId: number | string): boolean {
    return this.deletedMessageIds.has(String(messageId));
  }

  private loadDeletedFromStorage() {
    try {
      const raw = localStorage.getItem('chatDeletedMessages');
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        arr.forEach(id => this.deletedMessageIds.add(String(id)));
      }
    } catch (e) {
      // ignore
    }
  }

  private saveDeletedToStorage() {
    try {
      localStorage.setItem('chatDeletedMessages', JSON.stringify(Array.from(this.deletedMessageIds)));
    } catch (e) {
      // ignore
    }
  }
}
