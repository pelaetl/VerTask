import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Tarefa } from '../../model/tarefa';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../model/usuario';
import { TarefaService } from '../../services/tarefa.service';
import { UsuarioService } from '../../services/usuario.service';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../model/cliente';
import { FeriadoService, Feriado } from '../../services/feriado.service';

@Component({
  selector: 'app-add-tarefa',
  templateUrl: './add-tarefa.page.html',
  styleUrls: ['./add-tarefa.page.scss'],
  standalone: false
})
export class AddTarefaPage implements OnInit {

  tarefa: Tarefa;
  todosUsuarios: Usuario[];
  usuariosSelecionados: Usuario[];
  clientes: Cliente[] = [];
  dataEntregaInput: string = '';
  formGroup: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  feriados: Feriado[] = [];
  feriadosCarregados: boolean = false;

  constructor(
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private feriadoService: FeriadoService
  ) {
    this.todosUsuarios = [];
    this.usuariosSelecionados = [];
    this.tarefa = new Tarefa();
    this.formGroup = this.formBuilder.group({
      'nome': [this.tarefa.nome, Validators.compose([Validators.required])],
      'descricao': [this.tarefa.descricao, Validators.compose([Validators.required])],
      'dataEntrega': [this.tarefa.dataEntrega, Validators.compose([Validators.required])],
      'usuarios': [this.tarefa.usuarios, Validators.compose([Validators.required])],
      'clienteId': [this.tarefa.clienteId, Validators.compose([Validators.required])],
      'notifyAdmin': [this.tarefa.notifyAdmin]
    });

  }

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarClientes();
    this.carregarFeriados();
    // Garantir que dataInicio e dataEntrega sejam inicializados
    // Use setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      // Garantir que dataInicio seja sempre agora
      this.tarefa.setDataInicioAgora();
      // Definir data entrega padrão (ex: 7 dias a partir de hoje)
      this.setDataEntregaPadrao();
    });
  }

  carregarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.todosUsuarios = usuarios;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
      }
    });
  }

  carregarClientes() {
    this.clienteService.list().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      }
    });
  }

  carregarFeriados() {
    const anoAtual = new Date().getFullYear();
    const proximoAno = anoAtual + 1;
    
    // Carregar feriados do ano atual e próximo ano
    this.feriadoService.buscarFeriados(anoAtual).subscribe(feriados1 => {
      this.feriadoService.buscarFeriados(proximoAno).subscribe(feriados2 => {
        this.feriados = [...feriados1, ...feriados2];
        this.feriadosCarregados = true;
        console.log('Feriados carregados:', this.feriados.length);
      });
    });
  }

  setDataEntregaPadrao() {
    // Data padrão: 7 dias a partir de agora
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 7);
    this.tarefa.dataEntrega = dataFutura;
    this.dataEntregaInput = this.tarefa.getDataEntregaFormatada();
  }

  getDataInicioFormatada(): string {
    return this.tarefa.dataInicio.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMinDate(): string {
    // Data mínima é agora
    return new Date().toISOString();
  }

  private isDiaUtil(data: Date): boolean {
    const diaSemana = data.getDay();
    // 0 = domingo, 6 = sábado
    return diaSemana !== 0 && diaSemana !== 6;
  }

  isDateEnabled = (dateString: string): boolean => {
    // Parsear a data no formato ISO (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexed
    const diaSemana = date.getDay();
    
    // Desabilitar sábados e domingos
    if (diaSemana === 0 || diaSemana === 6) {
      return false;
    }
    
    // Desabilitar feriados
    if (this.feriadosCarregados && this.feriadoService.isFeriado(date, this.feriados)) {
      return false;
    }
    
    return true;
  }

  onDataEntregaChange(event: any) {
    if (event.detail.value) {
      const dataSelecionada = new Date(event.detail.value);
      
      if (!this.isDiaUtil(dataSelecionada)) {
        this.exibirMensagem('Sábados e domingos não são permitidos como data de entrega');
        this.dataEntregaInput = '';
        this.tarefa.dataEntrega = null as any;
        this.formGroup.get('dataEntrega')?.reset();
        return;
      }
      
      // Verificar se é feriado
      if (this.feriadoService.isFeriado(dataSelecionada, this.feriados)) {
        const nomeFeriado = this.feriadoService.getFeriadoNome(dataSelecionada, this.feriados);
        this.exibirMensagem(`Esta data é feriado: ${nomeFeriado}. Por favor, escolha outra data.`);
        this.dataEntregaInput = '';
        this.tarefa.dataEntrega = null as any;
        this.formGroup.get('dataEntrega')?.reset();
        return;
      }
      
      this.tarefa.setDataEntregaFromInput(event.detail.value);
    }
  }

  onUsuariosChange() {
    this.tarefa.usuarios = [...this.usuariosSelecionados];
  }

  onClienteChange(event: any) {
    const selected = event.detail ? event.detail.value : event;
    this.tarefa.clienteId = selected;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files && event.target.files.length ? event.target.files[0] : null;
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  removerArquivo() {
    this.selectedFile = null;
    this.selectedFileName = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removerUsuario(usuario: Usuario) {
    this.tarefa.usuarios = this.tarefa.usuarios.filter(u => u.idUsuario !== usuario.idUsuario);
    this.usuariosSelecionados = [...this.tarefa.usuarios];
  }

  async salvar() {

    this.tarefa.nome = this.formGroup.value.nome;
    this.tarefa.descricao = this.formGroup.value.descricao;
    this.tarefa.dataEntrega = this.formGroup.value.dataEntrega;
    this.tarefa.usuarios = this.formGroup.value.usuarios;
    this.tarefa.notifyAdmin = !!this.formGroup.value.notifyAdmin;
    this.tarefa.clienteId = this.formGroup.value.clienteId;
    this.tarefa.setDataInicioAgora();
    this.tarefa.statusTarefa = this.tarefa.statusTarefa || 'Pendente'; // Definir status padrão se não estiver definido

    // Obter usuário atual e setar idAdministrador corretamente
    const usuarioAtual = this.usuarioService.getCurrentUserValue();
    if (!usuarioAtual) {
      this.exibirMensagem('Usuário não autenticado. Faça login.');
      return;
    }
    this.tarefa.idAdministrador = usuarioAtual.idUsuario;

    // Garantir que dataEntrega seja um Date (quando vem do form pode ser string)
    if (typeof this.tarefa.dataEntrega === 'string' && this.tarefa.dataEntrega) {
      this.tarefa.setDataEntregaFromInput(this.tarefa.dataEntrega);
    }




    
    
    // Garantir que usuarios seja array
    if (!this.tarefa.usuarios) {
      this.tarefa.usuarios = [];
    }

    if (!this.validarTarefa()) {
      return;
    }

    const payload = {
      ...this.tarefa,
      usuariosIds: (this.tarefa.usuarios || []).map(u => u.idUsuario)
    } as any;

    console.log('Payload tarefa (com usuariosIds):', payload);

    const loading = await this.loadingController.create({
      message: 'Cadastrando Tarefa no sistema',
      spinner: 'crescent',
      backdropDismiss: false
    });

    await loading.present();

    const dismissLoading = () => loading.dismiss().catch(() => undefined);

    // If a file was selected, send multipart/form-data with the tarefa JSON and the file
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('documento', this.selectedFile, this.selectedFile.name);
      formData.append('tarefa', JSON.stringify(payload));

      this.tarefaService.salvarComArquivo(formData).subscribe({
        next: (response) => {
          this.tarefaService.notificarUsuariosNovaTarefa(response.idTarefa, payload.usuariosIds).subscribe({
            next: async () => {
              await dismissLoading();
              this.exibirMensagem('Tarefa criada e e-mails enviados!');
              this.router.navigate(['/inicio-administrador']);
            },
            error: async (emailError) => {
              await dismissLoading();
              this.exibirMensagem('Tarefa criada. Falha ao enviar e-mails.');
              this.router.navigate(['/inicio-administrador']);
            }
          });
        },
        error: async (error) => {
          console.error('Erro ao criar tarefa com arquivo:', error);
          await dismissLoading();
          this.exibirMensagem('Erro ao criar tarefa');
        }
      });

      return; // we've handled submission
    }

    this.tarefaService.salvar(payload).subscribe({
      next: (response) => {
        this.tarefaService.notificarUsuariosNovaTarefa(response.idTarefa, payload.usuariosIds).subscribe({
          next: async () => {
            await dismissLoading();
            this.exibirMensagem('Tarefa criada e e-mails enviados!');
            this.router.navigate(['/inicio-administrador']);
          },
          error: async (emailError) => {
            //console.error('Falha ao enviar e-mails:', emailError);
            await dismissLoading();
            this.exibirMensagem('Tarefa criada.');
            this.router.navigate(['/inicio-administrador']);
          }
        });
      },
      error: async (error) => {
        console.error('Erro ao criar tarefa:', error);
        await dismissLoading();
        this.exibirMensagem('Erro ao criar tarefa');
      }
    });
  }

  validarTarefa(): boolean {
    if (!this.tarefa.nome.trim()) {
      this.exibirMensagem('Nome da tarefa é obrigatório');
      return false;
    }

    if (!this.tarefa.dataEntrega) {
      this.exibirMensagem('Data de entrega é obrigatória');
      return false;
    }

    if (this.tarefa.dataEntrega <= this.tarefa.dataInicio) {
      this.exibirMensagem('Data de entrega deve ser posterior à data atual');
      return false;
    }

    // Validar que a data de entrega não é fim de semana
    const dataEntrega = new Date(this.tarefa.dataEntrega);
    if (!this.isDiaUtil(dataEntrega)) {
      this.exibirMensagem('Data de entrega não pode ser sábado ou domingo');
      return false;
    }

    if (this.tarefa.usuarios.length === 0) {
      this.exibirMensagem('Selecione pelo menos um usuário responsável');
      return false;
    }

    return true;
  }

  cancelar() {
    this.router.navigate(['/inicio-administrador']);
  }

  limpar() {
    this.tarefa = new Tarefa();
    this.usuariosSelecionados = [];
    this.tarefa.usuarios = [];
    this.selectedFile = null;

    // reset file input element value if present
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }

    // reset dates and defaults
    this.tarefa.setDataInicioAgora();
    this.setDataEntregaPadrao();

    this.formGroup.reset({
      nome: '',
      descricao: '',
      dataEntrega: this.tarefa.dataEntrega,
      usuarios: [],
      clienteId: null,
      notifyAdmin: false
    });
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}