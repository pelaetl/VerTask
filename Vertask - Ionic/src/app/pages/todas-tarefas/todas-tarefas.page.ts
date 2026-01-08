import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { Tarefa } from 'src/app/model/tarefa';
import { Usuario } from 'src/app/model/usuario';
import { TarefaService } from 'src/app/services/tarefa.service';

@Component({
  selector: 'app-todas-tarefas',
  templateUrl: './todas-tarefas.page.html',
  styleUrls: ['./todas-tarefas.page.scss'],
  standalone: false
})
export class TodasTarefasPage implements OnInit {

  tarefas: Tarefa[];
  tarefasFiltradas: Tarefa[];
  searchTerm = '';
  selectedDate: string | null = null;
  selectedMonth: string | null = null; // YYYY-MM
  selectedYear: string | null = null;  // YYYY
  selectedStatus = 'todos';
  selectedUsuario: number | 'todos' = 'todos';
  StatusTarefa = StatusTarefa;
  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendente', value: StatusTarefa.Pendente },
    { label: 'Em andamento', value: StatusTarefa.EmAndamento },
    { label: 'Concluída', value: StatusTarefa.Concluida },
    { label: 'Concluída Atrasada', value: StatusTarefa.ConcluidaAtrasada },
    { label: 'Atrasada', value: StatusTarefa.Atrasado }
  ];
  usuarioOptions: Array<{ label: string; value: number | 'todos' }> = [
    { label: 'Todos', value: 'todos' }
  ];
  new: any;

  constructor(private router: Router, private popoverController: PopoverController, private tarefaService: TarefaService, private toastController: ToastController, private alertController: AlertController) {
    this.tarefas = [];
    this.tarefasFiltradas = [];
  }

  ngOnInit() {
    this.carregarTarefas();
  }

  ionViewWillEnter() {
    this.carregarTarefas();
  }

  async excluir(tarefa: Tarefa) {

    const alert = await this.alertController.create({
      header: 'Confirma a exclusão',
      message: tarefa.nome,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            this.tarefaService.excluir(tarefa.idTarefa).subscribe({
              next:
                () => {
                  this.carregarTarefas();
                  this.exibirMensagem('Tarefa excluída com sucesso!');
                },
              error: (erro) => {
                console.error('Erro ao excluir tarefa:', erro);
                this.exibirMensagem('Erro ao excluir o registro.');
              }
            });
          }
        }
      ]
    })
    await alert.present()
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  carregarTarefas() {
    this.tarefaService.listar().subscribe({
      next: (dados) => {
        this.tarefas = dados;
        this.carregarUsuariosResponsaveis(this.tarefas);
      },
      error: (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
      }
    });
  }

  onSearchTermChange(event: any) {
    this.searchTerm = event.detail?.value ?? '';
    this.aplicarFiltro();
  }

  onDateChange(event: any) {
    this.selectedDate = event?.detail?.value ?? null;
    if (this.selectedDate) {
      this.selectedMonth = null;
      this.selectedYear = null;
    }
    this.aplicarFiltro();
  }

  onMonthChange(event: any) {
    this.selectedMonth = event?.detail?.value ?? null;
    if (this.selectedMonth) {
      this.selectedDate = null;
      this.selectedYear = null;
    }
    this.aplicarFiltro();
  }

  onYearChange(event: any) {
    this.selectedYear = event?.detail?.value ?? null;
    if (this.selectedYear) {
      this.selectedDate = null;
      this.selectedMonth = null;
    }
    this.aplicarFiltro();
  }

  onStatusChange(event: any) {
    this.selectedStatus = event?.detail?.value ?? 'todos';
    this.aplicarFiltro();
  }

  onUsuarioChange(event: any) {
    const value = event?.detail?.value;

    if (value === undefined || value === null || value === '' || value === 'todos') {
      this.selectedUsuario = 'todos';
    } else {
      const parsed = typeof value === 'number' ? value : Number(value);
      this.selectedUsuario = Number.isNaN(parsed) ? 'todos' : parsed;
    }

    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    const termo = this.searchTerm.trim().toLowerCase();
    const range = this.getFiltroRange();
    const statusFiltro = this.selectedStatus;
    const usuarioFiltro = this.selectedUsuario;

    this.tarefasFiltradas = this.tarefas.filter(tarefa => {
      const nomeMatch = !termo || (tarefa.nome ?? '').toLowerCase().includes(termo);
      const dataMatch = this.dataCorresponde(tarefa, range);
      const statusMatch =
        statusFiltro === 'todos' || tarefa.statusTarefa === statusFiltro;
      const usuarioMatch =
        usuarioFiltro === 'todos' ||
  (tarefa.usuarios ?? []).some(usuario => usuario?.idUsuario === usuarioFiltro);

      return nomeMatch && dataMatch && statusMatch && usuarioMatch;
    });

    // Ordenar por status: ATRASADA, PENDENTE, EM ANDAMENTO, CONCLUIDA, CONCLUIDA_ATRASADA
    const rank = (s: StatusTarefa | string | undefined): number => {
      switch (s) {
        case StatusTarefa.Atrasado:
        case 'ATRASADO':
          return 1;
        case StatusTarefa.Pendente:
        case 'PENDENTE':
          return 2;
        case StatusTarefa.EmAndamento:
        case 'EM_ANDAMENTO':
          return 3;
        case StatusTarefa.Concluida:
        case 'CONCLUIDA':
          return 4;
        case StatusTarefa.ConcluidaAtrasada:
        case 'CONCLUIDA_ATRASADA':
          return 5;
        default:
          return 999;
      }
    };

    this.tarefasFiltradas.sort((a, b) => rank(a.statusTarefa) - rank(b.statusTarefa));
  }

  private getFiltroRange(): { inicio: Date | null; fim: Date | null } {
    if (this.selectedMonth) {
      const [yStr, mStr] = this.selectedMonth.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      if (!Number.isNaN(y) && !Number.isNaN(m)) {
        const inicio = new Date(Date.UTC(y, m - 1, 1));
        const fim = new Date(Date.UTC(y, m, 0));
        return { inicio, fim };
      }
    }

    if (this.selectedYear) {
      const y = parseInt(this.selectedYear, 10);
      if (!Number.isNaN(y)) {
        const inicio = new Date(Date.UTC(y, 0, 1));
        const fim = new Date(Date.UTC(y, 11, 31));
        return { inicio, fim };
      }
    }

    if (this.selectedDate) {
      const d = new Date(this.selectedDate);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(0,0,0,0);
        const inicio = new Date(d);
        const fim = new Date(d);
        return { inicio, fim };
      }
    }

    return { inicio: null, fim: null };
  }

  private dataCorresponde(tarefa: Tarefa, range: { inicio: Date | null; fim: Date | null }): boolean {
    if (!range.inicio && !range.fim) return true;

    const dataEntrega = tarefa?.dataEntrega ? new Date(tarefa.dataEntrega) : null;
    if (!dataEntrega || Number.isNaN(dataEntrega.getTime())) return false;
    dataEntrega.setHours(0,0,0,0);

    if (range.inicio && dataEntrega < range.inicio) return false;
    if (range.fim && dataEntrega > range.fim) return false;
    return true;
  }

  clearDateFilter() {
    this.selectedDate = null;
    this.selectedMonth = null;
    this.selectedYear = null;
    this.aplicarFiltro();
  }

  clearMonth() {
    this.selectedMonth = null;
    this.aplicarFiltro();
  }

  clearYear() {
    this.selectedYear = null;
    this.aplicarFiltro();
  }

  async verObservacao(tarefa: Tarefa, ev?: Event) {
    ev?.stopPropagation();
    if (!tarefa?.observacao) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Comentário da tarefa',
      message: tarefa.observacao,
      buttons: ['Fechar']
    });

    await alert.present();
  }

  private atualizarUsuariosDisponiveis() {
    const mapaUsuarios = new Map<number, string>();

    this.tarefas.forEach(tarefa => {
      (tarefa.usuarios ?? []).forEach(usuario => {
        if (usuario?.idUsuario) {
          const nome = (usuario.nome && usuario.nome.trim().length > 0)
            ? usuario.nome.trim()
            : usuario.email ?? `Usuário #${usuario.idUsuario}`;
          mapaUsuarios.set(usuario.idUsuario, nome);
        }
      });
    });

    const opcoes = Array.from(mapaUsuarios.entries())
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR', { sensitivity: 'base' }))
      .map(([id, nome]) => ({ label: nome, value: id }));

    this.usuarioOptions = [{ label: 'Todos', value: 'todos' }, ...opcoes];

    if (this.selectedUsuario !== 'todos') {
      const aindaExiste = opcoes.some(opcao => opcao.value === this.selectedUsuario);
      if (!aindaExiste) {
        this.selectedUsuario = 'todos';
      }
    }
  }

  private carregarUsuariosResponsaveis(tarefas: Tarefa[]): void {
    if (!tarefas.length) {
      this.usuarioOptions = [{ label: 'Todos', value: 'todos' }];
      this.aplicarFiltro();
      return;
    }

    const requisicoes = tarefas.map(tarefa =>
      this.tarefaService.getResponsaveis(tarefa.idTarefa).pipe(
        map((usuarios: Usuario[]) => ({ tarefa, usuarios })),
        catchError(() => of({ tarefa, usuarios: [] as Usuario[] }))
      )
    );

    forkJoin(requisicoes).subscribe({
      next: resultados => {
        resultados.forEach(({ tarefa, usuarios }) => {
          tarefa.usuarios = usuarios;
        });

        this.atualizarUsuariosDisponiveis();
        this.aplicarFiltro();
      },
      error: erro => {
        console.error('Erro ao carregar responsáveis das tarefas:', erro);
        this.atualizarUsuariosDisponiveis();
        this.aplicarFiltro();
      }
    });
  }

  editarTarefa(tarefa: Tarefa) {
    this.router.navigate(['/editar-tarefa', tarefa.idTarefa]);
  }

  popoverAberto = false;
  popoverEvento: any;

  abrirPerfil(ev: any) {
    this.popoverEvento = ev;
    this.popoverAberto = true;
  }

  editarPerfil() {

  }

  sair() {
    // Fecha o popover primeiro
    this.popoverController.dismiss().then(() => {
      // Depois navega
      this.router.navigate(['/login']);
    });
  }

  statusBadgeColor(status: StatusTarefa | undefined): string {
    switch (status) {
      case StatusTarefa.Concluida:
        return 'success';
      case StatusTarefa.ConcluidaAtrasada:
        return 'success';
      case StatusTarefa.EmAndamento:
        return 'warning';
      case StatusTarefa.Atrasado:
        return 'danger';
      case StatusTarefa.Pendente:
        return 'primary';
      default:
        return 'medium';
    }
  }

  tarefaIndicadorClass(tarefa: Tarefa): string {
    if (tarefa.statusTarefa === StatusTarefa.Concluida) {
      return 'tarefa-indicador--concluida';
    }

    if (tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) {
      return 'tarefa-indicador--concluida-atrasada';
    }

    if (tarefa.statusTarefa === StatusTarefa.Pendente) {
      return 'tarefa-indicador--pendente';
    }

    if (tarefa.statusTarefa === StatusTarefa.EmAndamento) {
      return 'tarefa-indicador--em-andamento';
    }

    // const dias = this.diasRestantes(tarefa);

    // if (dias === null) {
    //   return 'tarefa-indicador--alerta';
    // }

    // if (dias < 0 || tarefa.statusTarefa === StatusTarefa.Atrasado) {
    //   return 'tarefa-indicador--atrasada';
    // }

    if (tarefa.statusTarefa === StatusTarefa.Atrasado) {
      return 'tarefa-indicador--atrasada';
    }

    // if (dias <= 2) {
    //   return 'tarefa-indicador--alerta';
    // }

    return '';
  }

  prazoLabel(tarefa: Tarefa): string {
    const dias = this.diasRestantes(tarefa);

    if (tarefa.statusTarefa === 'CONCLUIDA' || tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) {
      return '';
    }

    if (dias === null) {
      return 'Sem prazo definido';
    }

    if (dias === 0) {
      return 'Entrega hoje';
    }

    if (dias > 0) {
      return dias === 1 ? 'Em 1 dia' : `Em ${dias} dias`;
    }

    const atraso = Math.abs(dias);
    return atraso === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${atraso} dias`;
  }

  statusLabel(status: StatusTarefa | string | undefined): string {
    if (!status) return '';
    switch (status) {
      case StatusTarefa.Pendente:
        return 'Pendente';
      case StatusTarefa.EmAndamento:
        return 'Em Andamento';
      case StatusTarefa.Concluida:
        return 'Concluida';
      case StatusTarefa.ConcluidaAtrasada:
        return 'Concluida Atrasada';
      case StatusTarefa.Atrasado:
        return 'Atrasada';
      // handle raw string values too
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDA':
        return 'Concluida';
      case 'CONCLUIDA_ATRASADA':
        return 'Concluida Atrasada';
      case 'ATRASADO':
        return 'Atrasada';
      default:
        // fallback: prettify by replacing underscores and titlecasing
        return String(status).replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase());
    }
  }

  podeVerObservacao(tarefa: Tarefa): boolean {
    return (tarefa.statusTarefa === StatusTarefa.Concluida || tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) && !!tarefa.observacao;
  }

  get usuarioSelecionadoLabel(): string | null {
    if (this.selectedUsuario === 'todos') {
      return null;
    }

    const usuario = this.usuarioOptions.find(option => option.value === this.selectedUsuario);
    return usuario?.label ?? null;
  }

  private diasRestantes(tarefa: Tarefa): number | null {
    if (!tarefa.dataEntrega) {
      return null;
    }

    const prazo = new Date(tarefa.dataEntrega).getTime();

    if (Number.isNaN(prazo)) {
      return null;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(tarefa.dataEntrega);
    limite.setHours(0, 0, 0, 0);

    const diffMs = limite.getTime() - hoje.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

}


