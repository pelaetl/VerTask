import { Component, OnInit } from '@angular/core';
import { Tarefa } from 'src/app/model/tarefa';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { TarefaService } from 'src/app/services/tarefa.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Usuario } from 'src/app/model/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ClienteDto, ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-editar-tarefa',
  templateUrl: './editar-tarefa.page.html',
  styleUrls: ['./editar-tarefa.page.scss'],
  standalone: false,
})
export class EditarTarefaPage implements OnInit {

  tarefa: Tarefa;
  formGroup: FormGroup;
  todosUsuarios: Usuario[] = [];
  usuariosSelecionados: Usuario[] = [];
  selectedFile: File | null = null;
  private pendingUsuariosIds: number[] = [];
  clienteNomeExibicao = '';
  clientes: ClienteDto[] = [];
  

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService
  ) {

    this.tarefa = new Tarefa();

    this.formGroup = this.formBuilder.group({
      'nome': ['', Validators.compose([Validators.required])],
      'descricao': ['', Validators.compose([Validators.required])],
      'dataEntrega': [''],
      'usuarios': [[]],
      'clienteId': [null],
      'documento': ['']
    });
  }

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarClientes();
    
    const id = parseFloat(this.activatedRoute.snapshot.params['id']);
    if (!isNaN(id)) {
      this.tarefaService.buscarPorId(id).subscribe({
        next: (tarefa) => {
          this.tarefa = tarefa;
          this.formGroup.get('nome')?.setValue(this.tarefa.nome);
          this.formGroup.get('descricao')?.setValue(this.tarefa.descricao);
          this.clienteNomeExibicao = this.resolverNomeCliente(tarefa);
          this.carregarNomeCliente(tarefa);
          const clienteId = tarefa?.clienteId ?? (tarefa as any)?.cliente?.id ?? null;
          this.formGroup.get('clienteId')?.setValue(clienteId);
          // preencher dataEntrega como string compatível com datetime-local
          try {
            const formatted = this.tarefa.getDataEntregaFormatada();
            this.formGroup.get('dataEntrega')?.setValue(formatted);
          } catch (e) {
            // ignore
          }
          // preencher responsáveis (usuarios) se vier no payload
          if (this.tarefa.usuarios && this.tarefa.usuarios.length) {
            // garante que temos os ids dos responsaveis mesmo se vierem como objetos
            this.pendingUsuariosIds = (this.tarefa.usuarios as any[])
              .map(u => (u as any).idUsuario ?? (u as any).id ?? u);
            this.sincronizarUsuariosSelecionados();
          } else if (this.tarefa.usuariosIds && this.tarefa.usuariosIds.length) {
            this.pendingUsuariosIds = this.tarefa.usuariosIds;
            this.sincronizarUsuariosSelecionados();
          }

          // Se a tarefa estiver concluída, desabilitar o formulário para impedir edição
          if (this.tarefa.statusTarefa === StatusTarefa.Concluida) {
            this.formGroup.disable();
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar tarefa por ID:', erro);
        }
      });
    }

  }

  salvar() {
    // Se a tarefa estiver concluída, não permita salvar alterações
    if (this.tarefa.statusTarefa === StatusTarefa.Concluida) {
      this.exibirMensagem('Tarefa concluída não pode ser editada.');
      return;
    }

    this.tarefa.nome = this.formGroup.value.nome;
    this.tarefa.descricao = this.formGroup.value.descricao;
    // atualizar dataEntrega a partir do input
    const dataInput = this.formGroup.value.dataEntrega;
    if (dataInput) {
      // bloquear datas no passado
      const chosen = new Date(dataInput);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        this.exibirMensagem('A data de entrega não pode ser no passado.');
        return;
      }
      this.tarefa.setDataEntregaFromInput(dataInput);
    }
    // atualizar responsáveis a partir do select
    const usuariosForm = this.formGroup.value.usuarios || [];
    this.tarefa.usuarios = usuariosForm;
    this.tarefa.clienteId = this.formGroup.value.clienteId ?? null;
    //this.tarefaService.existeTarefaComNome(this.tarefa.nome).subscribe({
    // next: (existe) => {
    //   if (existe) {
    //     this.exibirMensagem('Este tarefa já está cadastrado.');
    //   } else {
    // preparar payload com usuariosIds
    const payload: any = { ...this.tarefa };
    payload.usuariosIds = (this.tarefa.usuarios || []).map((u: Usuario) => u.idUsuario);
    payload.clienteId = this.tarefa.clienteId ?? null;

    // se foi selecionado arquivo, enviar multipart/form-data
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('documento', this.selectedFile, this.selectedFile.name);
      formData.append('tarefa', JSON.stringify(payload));

      this.tarefaService.salvarComArquivo(formData).subscribe({
        next: () => {
          this.exibirMensagem('Tarefa salva com sucesso!!!');
          this.navController.navigateBack('/tarefas');
        },
        error: () => {
          this.exibirMensagem('Erro ao salvar tarefa.');
        }
      });

      return;
    }

    this.tarefaService.salvar(payload).subscribe({
      next: () => {
        this.exibirMensagem('Tarefa salva com sucesso!!!');
        this.navController.navigateBack('/tarefas');
      },
      error: () => {
        this.exibirMensagem('Erro ao salvar tarefa.');
      }
    });
    //   }
    // },
    //error: () => {
    //  this.exibirMensagem('Erro ao verificar nome do tarefa.');
    //}
    //});
  }


  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  carregarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.todosUsuarios = usuarios || [];
        this.sincronizarUsuariosSelecionados();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }

  carregarClientes() {
    this.clienteService.list().subscribe({
      next: (clientes) => {
        this.clientes = clientes || [];
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      }
    });
  }

  onUsuariosChange() {
    this.usuariosSelecionados = this.formGroup.value.usuarios || [];
    // mantém usuariosIds em sincronia
    this.pendingUsuariosIds = (this.usuariosSelecionados || []).map(u => (u as any).idUsuario ?? (u as any).id ?? u);
  }

  compareUsuarios = (a: Usuario, b: Usuario) => {
    return a && b ? a.idUsuario === b.idUsuario : a === b;
  };

  formatarNomeCliente(cliente: ClienteDto): string {
    return cliente?.nome || cliente?.nomeFantasia || cliente?.razaoSocial || `Cliente #${cliente?.id}`;
  }

  private sincronizarUsuariosSelecionados() {
    if (!this.pendingUsuariosIds.length || !this.todosUsuarios.length) {
      return;
    }

    const selecionados = this.pendingUsuariosIds
      .map(id => this.todosUsuarios.find(u => u.idUsuario === id))
      .filter((u): u is Usuario => !!u);

    if (selecionados.length) {
      this.usuariosSelecionados = selecionados;
      this.formGroup.get('usuarios')?.setValue(selecionados);
    }
  }

  onClienteChange(event: any) {
    const clienteId = event?.detail?.value ?? null;
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (cliente) {
      this.clienteNomeExibicao = this.formatarNomeCliente(cliente);
    }
  }

  private resolverNomeCliente(tarefa: any): string {
    const nome = tarefa?.cliente?.nome
      ?? tarefa?.cliente?.razaoSocial
      ?? tarefa?.clienteNome
      ?? '';
    const id = tarefa?.clienteId ?? tarefa?.cliente?.id;

    if (nome) return nome;
    if (id) return `Cliente #${id}`;
    return 'Cliente não informado';
  }

  private carregarNomeCliente(tarefa: any) {
    const clienteId = tarefa?.clienteId ?? tarefa?.cliente?.id;
    if (!clienteId) {
      this.clienteNomeExibicao = 'Cliente não informado';
      return;
    }

    // Mantém placeholder enquanto busca o nome real
    this.clienteNomeExibicao = this.resolverNomeCliente(tarefa);

    this.clienteService.get(clienteId).subscribe({
      next: (cliente: any) => {
        const nome = cliente?.nome || cliente?.nomeFantasia || cliente?.razaoSocial;
        this.clienteNomeExibicao = nome ? nome : `Cliente #${clienteId}`;
      },
      error: () => {
        this.clienteNomeExibicao = `Cliente #${clienteId}`;
      }
    });
  }

  onFileSelected(event: any) {
    const target = event?.target as HTMLInputElement | null;
    const file: File | null = target && target.files && target.files.length ? target.files[0] : null;
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  // usado pelo ion-datetime para impedir seleção de datas anteriores ao dia atual
  getMinDate(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  baixarDocumento() {
    if (!this.tarefa || !this.tarefa.idTarefa) {
      return;
    }
    this.tarefaService.downloadDocumento(this.tarefa.idTarefa).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Erro ao baixar documento:', err);
        this.exibirMensagem('Erro ao baixar documento');
      }
    });
  }

}

