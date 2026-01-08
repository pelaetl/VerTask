import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Tarefa } from 'src/app/model/tarefa';
import { Router } from '@angular/router';
import { TarefaService } from 'src/app/services/tarefa.service';
import { Usuario } from 'src/app/model/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder } from '@angular/forms';
import { ToastController, LoadingController, ModalController, AlertController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { ClienteService, ClienteDto } from 'src/app/services/cliente.service';
import { ChatService } from 'src/app/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalhes-tarefa',
  templateUrl: './detalhes-tarefa.page.html',
  styleUrls: ['./detalhes-tarefa.page.scss'],
  standalone: false,
})
export class DetalhesTarefaPage implements OnInit {

  tarefa: Tarefa;
  usuario: Usuario;
  cliente?: ClienteDto | null;
  isFavorita: boolean = false;
  exibirBotaoConcluir = false;
  statusTarefaEnum = StatusTarefa;
  documentUrl?: SafeResourceUrl | null;
  mostrarVisualizador: boolean = false;
  private _blobUrl?: string | null = null;

  // PDF.js related
  @ViewChild('pdfCanvas', { static: false }) pdfCanvas?: ElementRef<HTMLCanvasElement>;
  pdfDoc: any = null;
  currentPage: number = 1;
  totalPages: number = 0;
  scale: number = 1.2;
  rotation: number = 0; // degrees
  loadingPdf: boolean = false;


  usuariosResponsaveis: Usuario[] = [];
  responsaveisTexto: string = '';
  temNovasMensagens: boolean = false;
  private chatSubscription?: Subscription;
  private mensagensContadasAntes: number = 0;


  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private router: Router,
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private sanitizer: DomSanitizer,
    private clienteService: ClienteService,
    private alertController: AlertController,
    private modalController: ModalController,
    private chatService: ChatService
  ) {

    this.usuario = new Usuario();
    this.tarefa = new Tarefa();
  }

  async openChat() {
    if (!this.tarefa || !this.tarefa.idTarefa) return;
    const modal = await this.modalController.create({
      component: (await import('../chat-tarefa/chat-tarefa.page')).ChatTarefaPage,
      componentProps: { tarefaId: this.tarefa.idTarefa },
      cssClass: 'chat-modal'
    });
    // Ao abrir o chat, marcar como lido
    this.temNovasMensagens = false;
    this.mensagensContadasAntes = this.chatService.getMessagesForTarefa(this.tarefa.idTarefa).length;
    await modal.present();
  }

  ngOnInit() {

    this.usuarioService.currentUser$.subscribe(u => {
      if (u) this.usuario = u;
    });


    const id = parseFloat(this.activatedRoute.snapshot.params['id']);
    if (!isNaN(id)) {
      this.tarefaService.buscarPorId(id).subscribe({
        next: (tarefa) => {
          this.tarefa = tarefa;
          this.atualizarVisibilidadeBotoes();

          // Inicializar rastreamento de mensagens do chat
          this.mensagensContadasAntes = this.chatService.getMessagesForTarefa(tarefa.idTarefa).length;
          
          // Subscrever a novas mensagens
          this.chatSubscription = this.chatService.subscribeToTarefa(tarefa.idTarefa).subscribe({
            next: () => {
              const todasMensagens = this.chatService.getMessagesForTarefa(tarefa.idTarefa);
              const novasMensagensDoOutros = todasMensagens.filter(msg => msg.senderId !== this.usuario?.idUsuario);
              const novasMensagensDoOutrosAntes = todasMensagens.slice(0, this.mensagensContadasAntes).filter(msg => msg.senderId !== this.usuario?.idUsuario);
              
              // Mostrar badge se recebeu mensagens de OUTROS usuários
              if (novasMensagensDoOutros.length > novasMensagensDoOutrosAntes.length) {
                this.temNovasMensagens = true;
              }
            }
          });

          // se a tarefa já vier com usuarios, usa direto; senão busca do serviço
          if (tarefa.usuarios && tarefa.usuarios.length) {
            this.usuariosResponsaveis = tarefa.usuarios;
            this.responsaveisTexto = this.usuariosResponsaveis.map(u => u.nome).join(', ');
          } else {
            this.carregarResponsaveis();
          }

          // preparar indicador de documento (não atribuímos URL direto porque o endpoint requer autenticação)
          if (tarefa.documentoNome) {
            this.documentUrl = null; // será carregado sob demanda com autorização
          } else {
            this.documentUrl = null;
          }

          // Buscar se é favorita para o usuário atual
          if (this.usuario && this.usuario.idUsuario) {
            this.tarefaService.isFavorita(this.tarefa.idTarefa, this.usuario.idUsuario).subscribe({
              next: (favorita) => {
                this.isFavorita = favorita;
                  if ((this.tarefa.statusTarefa === StatusTarefa.Concluida || this.tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) && favorita) {
                  this.removerFavoritoSeNecessario();
                }
              }
            });
          }

          // Buscar informações do cliente associado, se houver
          if (tarefa.clienteId) {
            this.clienteService.get(tarefa.clienteId).subscribe({
              next: (c) => {
                this.cliente = c;
              },
              error: (err) => {
                console.error('Erro ao buscar cliente da tarefa:', err);
                this.cliente = null;
              }
            });
          } else {
            this.cliente = null;
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar tarefa por ID:', erro);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Limpar subscrição do chat
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    
    // Limpar PDF
    this.destroyPdf();
    if (this._blobUrl) {
      try { URL.revokeObjectURL(this._blobUrl); } catch (e) { }
      this._blobUrl = null;
    }
  }

  iniciarTarefa() {
    // Lógica para iniciar a tarefa
    this.tarefaService.iniciarTarefa(this.tarefa).subscribe({
      next: (tarefaAtualizada) => {
        if (tarefaAtualizada && typeof tarefaAtualizada === 'object') {
          Object.assign(this.tarefa, tarefaAtualizada);
        }
        const novoStatus = (tarefaAtualizada as Tarefa)?.statusTarefa as StatusTarefa | undefined;
        this.tarefa.statusTarefa = novoStatus ?? StatusTarefa.EmAndamento;
        this.atualizarVisibilidadeBotoes();
        this.exibirMensagem('Tarefa iniciada com sucesso!');
      },
      error: (erro) => {
        console.error('Erro ao iniciar tarefa:', erro);
        this.exibirMensagem('Erro ao iniciar a tarefa.');
      }
    });
  }


  async concluirTarefa() {
    // Prompt the user for an optional observação before concluding
    const alert = await this.alertController.create({
      header: 'Concluir tarefa',
      message: 'Deseja adicionar uma observação ao concluir esta tarefa? (opcional)',
      inputs: [
        {
          name: 'observacao',
          type: 'textarea',
          placeholder: 'Observação...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            const loading = await this.loadingController.create({
              message: 'Concluindo Tarefa',
              spinner: 'crescent',
              backdropDismiss: false
            });
            await loading.present();
            const dismissLoading = () => loading.dismiss().catch(() => undefined);

            const observacao = data?.observacao?.toString();

            this.tarefaService.updateStatus(this.tarefa.idTarefa, StatusTarefa.Concluida, observacao).subscribe({
              next: (response) => {
                // apply updated fields
                if (response && typeof response === 'object') {
                  Object.assign(this.tarefa, response as Tarefa);
                }
                // Remove from favorites when concluding
                this.removerFavoritoSeNecessario();
                const shouldNotifyAdmin = (response && (response as any).notifyAdmin) || this.tarefa.notifyAdmin;
                if (shouldNotifyAdmin) {
                  this.tarefaService.notificarAdministradorTarefaConcluida((response as any).idTarefa, (response as any).idAdministrador).subscribe({
                    next: async () => {
                      await dismissLoading();
                      this.exibirMensagem('Tarefa concluida e e-mails enviados!');
                      if (this.usuario && this.usuario.role === 'ADMINISTRADOR') {
                        this.router.navigate(['/inicio-administrador']);
                      } else {
                        this.router.navigate(['/inicio-funcionario']);
                      }
                    },
                    error: async (emailError) => {
                      await dismissLoading();
                      this.exibirMensagem('Tarefa concluida.');
                      if (this.usuario && this.usuario.role === 'FUNCIONARIO') {
                        this.router.navigate(['/inicio-funcionario']);
                      } else {
                        this.router.navigate(['/inicio-administrador']);
                      }
                    }
                  });
                } else {
                  (async () => {
                    await dismissLoading();
                    this.exibirMensagem('Tarefa concluida.');
                    if (this.usuario && this.usuario.role === 'FUNCIONARIO') {
                      this.router.navigate(['/inicio-funcionario']);
                    } else {
                      this.router.navigate(['/inicio-administrador']);
                    }
                  })();
                }
              },
              error: async (error) => {
                console.error('Erro ao concluir tarefa:', error);
                await dismissLoading();
                this.exibirMensagem('Erro ao concluir a tarefa');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  favorita(): boolean {
    return this.isFavorita;
  }

  favoritar2(tarefa: Tarefa) {
    if (this.tarefa.statusTarefa === StatusTarefa.Concluida || this.tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) {
      return;
    }

    tarefa.favorita = !tarefa.favorita;

    this.tarefaService.favoritar(this.tarefa.idTarefa, this.tarefa.favorita, this.usuario.idUsuario).subscribe({
      next: (tarefaAtualizada) => {
        if (tarefaAtualizada && typeof tarefaAtualizada === 'object') {
          // Só atualiza os campos que vieram do backend
          Object.assign(this.tarefa, tarefaAtualizada);
        }
        const mensagem = this.tarefa.favorita ?
          'Tarefa adicionada aos favoritos!' :
          'Tarefa removida dos favoritos!';
        this.exibirMensagem(mensagem);
      },

    });
  }


  private carregarResponsaveis() {
    if (!this.tarefa || !this.tarefa.idTarefa) {
      this.usuariosResponsaveis = [];
      this.responsaveisTexto = '';
      return;
    }

    this.tarefaService.getResponsaveis(this.tarefa.idTarefa).subscribe({
      next: (usuarios) => {
        this.usuariosResponsaveis = usuarios || [];
        this.responsaveisTexto = this.usuariosResponsaveis.length
          ? this.usuariosResponsaveis.map(u => u.nome).join(', ')
          : '';
      },
      error: (erro) => {
        console.error('Erro ao buscar responsáveis:', erro);
        this.usuariosResponsaveis = [];
        this.responsaveisTexto = '';
      }
    });
  }

  async openClientePopup() {
    if (!this.cliente) {
      const alert = await this.alertController.create({
        header: 'Cliente',
        message: 'Nenhuma informação de cliente disponível para esta tarefa.',
        buttons: ['Fechar']
      });
      await alert.present();
      return;
    }

    // Open a custom modal for better layout
    const modal = await this.modalController.create({
      component: (await import('../cliente-modal/cliente-modal.page')).ClienteModalPage,
      componentProps: { cliente: this.cliente },
      cssClass: 'cliente-modal'
    });
    await modal.present();
  }

  favoritar() {
    if (this.tarefa.statusTarefa === StatusTarefa.Concluida || this.tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) {
      return;
    }
    const novoFavorito = !this.isFavorita;
    if (this.isFavorita) {

      this.tarefaService.desFavoritar(this.tarefa.idTarefa, this.usuario.idUsuario).subscribe({
        next: (tarefaAtualizada) => {
          if (tarefaAtualizada && typeof tarefaAtualizada === 'object') {
            Object.assign(this.tarefa, tarefaAtualizada);
          }
          this.isFavorita = false; // Atualiza o status local
          this.exibirMensagem('Tarefa removida dos favoritos!');
        }
      });
    } else {
      this.tarefaService.favoritar(this.tarefa.idTarefa, novoFavorito, this.usuario.idUsuario).subscribe({
        next: (tarefaAtualizada) => {
          if (tarefaAtualizada && typeof tarefaAtualizada === 'object') {
            Object.assign(this.tarefa, tarefaAtualizada);
          }
          this.isFavorita = true; // Atualiza o status local
          this.exibirMensagem('Tarefa adicionada aos favoritos!');
        }
      });
    }
  }

  // salvar() {
  //   this.tarefa.nome = this.formGroup.value.nomeTarefa;
  //   this.tarefa.descricao = this.formGroup.value.descricaoTarefa;

  //   this.tarefaService.existeTarefaComNome(this.tarefa.nome).subscribe({
  //     next: (existe) => {
  //       if (existe) {
  //         this.exibirMensagem('Este tarefa já está cadastrado.');
  //       } else {
  //         this.tarefaService.salvar(this.tarefa).subscribe({
  //           next: () => {
  //             this.exibirMensagem('Tarefa salvo com sucesso!!!');
  //             this.navController.navigateBack('/tarefaes');
  //           },
  //           error: () => {
  //             this.exibirMensagem('Erro ao salvar tarefa.');
  //           }
  //         });
  //       }
  //     },
  //     error: () => {
  //       this.exibirMensagem('Erro ao verificar nome do tarefa.');
  //     }
  //   });
  // }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  private atualizarVisibilidadeBotoes() {
    // Botão Concluir visível apenas quando a tarefa está em andamento ou atrasada
    this.exibirBotaoConcluir = (this.tarefa.statusTarefa === StatusTarefa.EmAndamento || this.tarefa.statusTarefa === StatusTarefa.Atrasado);
  }

  tarefaAtrasada(): boolean {
    if (!this.tarefa?.dataEntrega) return false;
    const prazo = new Date(this.tarefa.dataEntrega);
    const agora = new Date();
    // Não exibir badge de atraso para tarefas concluídas (inclusive concluída atrasada)
    return prazo.getTime() < agora.getTime() && this.tarefa.statusTarefa !== StatusTarefa.Concluida && this.tarefa.statusTarefa !== StatusTarefa.ConcluidaAtrasada;
  }

  private removerFavoritoSeNecessario() {
    if (!this.isFavorita) {
      return;
    }

    this.isFavorita = false;
    this.tarefa.favorita = false;

    if (!this.usuario?.idUsuario) {
      return;
    }

    this.tarefaService.desFavoritar(this.tarefa.idTarefa, this.usuario.idUsuario).subscribe({
      next: () => {
      },
      error: (erro) => {
        console.error('Erro ao remover tarefa concluída dos favoritos:', erro);
      }
    });
  }

  abrirDocumentoEmNovaAba() {
  if (!this.tarefa || !this.tarefa.idTarefa) return;
  // Baixa o blob com autenticação e abre em nova aba usando object URL
  this.tarefaService.downloadDocumento(this.tarefa.idTarefa).subscribe({
    next: (blob: Blob) => {
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // não revoga imediatamente; o navegador manterá o blob enquanto a aba existir
    },
    error: (err) => {
      console.error('Erro ao baixar documento para nova aba:', err);
      this.exibirMensagem('Não foi possível abrir o documento.');
    }
  });
  }

  alternarVisualizadorInline() {
    const novo = !this.mostrarVisualizador;
    this.mostrarVisualizador = novo;

    // quando abrimos o visualizador, fazemos download do arquivo com Authorization
    if (novo && this.tarefa && this.tarefa.idTarefa) {
      // se já temos URL (blob) não baixa de novo
      if (!this.documentUrl) {
        this.loadingPdf = true;
        this.tarefaService.downloadDocumento(this.tarefa.idTarefa).subscribe({
          next: async (blob: Blob) => {
            this.loadingPdf = false;
            // initialize PDF.js viewer from blob
            try {
              await this.loadPdfFromBlob(blob);
            } catch (e) {
              console.error('Erro ao carregar PDF com PDF.js:', e);
              this.exibirMensagem('Não foi possível carregar o documento.');
              this.mostrarVisualizador = false;
            }
          },
          error: (err) => {
            this.loadingPdf = false;
            console.error('Erro ao baixar documento:', err);
            this.exibirMensagem('Não foi possível carregar o documento.');
            this.mostrarVisualizador = false;
          }
        });
      }
    } else {
      // fechar visualizador: liberar URL
      if (this._blobUrl) {
        try { URL.revokeObjectURL(this._blobUrl); } catch (e) { /* ignore */ }
        this._blobUrl = null;
      }
      this.documentUrl = null;
      this.destroyPdf();
    }
  }

  async ensurePdfJs(): Promise<any> {
    // Load PDF.js from CDN if not present
    const win = window as any;
    if (win.pdfjsLib) return win.pdfjsLib;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        // set workerSrc
        try {
          win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        } catch (e) { /* ignore */ }
        resolve(win.pdfjsLib);
      };
      script.onerror = (e) => reject(new Error('Falha ao carregar pdf.js'));
      document.head.appendChild(script);
    });
  }

  async loadPdfFromBlob(blob: Blob) {
    const pdfjsLib = await this.ensurePdfJs();
    const arrayBuffer = await blob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    this.loadingPdf = true;
    const pdf = await loadingTask.promise;
    this.pdfDoc = pdf;
    this.totalPages = pdf.numPages || 0;
    this.currentPage = 1;
    this.scale = 1.2;
    this.rotation = 0;
    this.loadingPdf = false;
    await this.renderPage(this.currentPage);
  }

  async renderPage(pageNum: number) {
    if (!this.pdfDoc || !this.pdfCanvas) return;
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.scale, rotation: this.rotation / 90 });
      const canvas = this.pdfCanvas.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);
      await renderTask.promise;
    } catch (e) {
      console.error('Erro ao renderizar página PDF:', e);
    }
  }

  async nextPage() {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    await this.renderPage(this.currentPage);
  }

  async prevPage() {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    await this.renderPage(this.currentPage);
  }

  async zoomIn() {
    this.scale = Math.min(this.scale + 0.2, 3);
    await this.renderPage(this.currentPage);
  }

  async zoomOut() {
    this.scale = Math.max(this.scale - 0.2, 0.4);
    await this.renderPage(this.currentPage);
  }

  async rotateClockwise() {
    this.rotation = (this.rotation + 90) % 360;
    await this.renderPage(this.currentPage);
  }

  async rotateCounter() {
    this.rotation = (this.rotation + 270) % 360;
    await this.renderPage(this.currentPage);
  }

  downloadPdf() {
    // download the currently loaded blob by creating objectURL from pdfDoc (if available)
    if (!this.pdfDoc) {
      this.exibirMensagem('Nenhum documento carregado');
      return;
    }
    // We can't directly get Blob from pdfDoc; fallback to opening in new tab using existing _blobUrl when available
    if (this._blobUrl) {
      const a = document.createElement('a');
      a.href = this._blobUrl;
      a.download = this.tarefa.documentoNome || 'documento.pdf';
      a.click();
    } else {
      this.exibirMensagem('Download indisponível');
    }
  }

  openPdfInNewTab() {
    if (this._blobUrl) {
      window.open(this._blobUrl, '_blank');
    } else if (this.tarefa && this.tarefa.idTarefa) {
      // fallback: trigger a normal download that opens in a new tab
      this.abrirDocumentoEmNovaAba();
    }
  }

  destroyPdf() {
    try {
      if (this.pdfDoc && this.pdfDoc.destroy) {
        this.pdfDoc.destroy();
      }
    } catch (e) { }
    this.pdfDoc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.scale = 1.2;
    this.rotation = 0;
  }

}

