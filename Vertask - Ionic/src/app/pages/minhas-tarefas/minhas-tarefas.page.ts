import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { Tarefa } from 'src/app/model/tarefa';
import { TarefaService } from 'src/app/services/tarefa.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/model/usuario';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';

@Component({
  selector: 'app-minhas-tarefas',
  templateUrl: './minhas-tarefas.page.html',
  styleUrls: ['./minhas-tarefas.page.scss'],
  standalone: false
})
export class MinhasTarefasPage implements OnInit {

  tarefas: Tarefa[];
  tarefasFiltradas: Tarefa[];
  // Default to Kanban so users see the board first
  viewMode: 'list' | 'kanban' = 'kanban';
  // Kanban state (inclui coluna de tarefas Atrasadas)
  // Ordem: Pendente -> EmAndamento -> Atrasado -> Concluida
  // Logical progression order (used for move validation)
  kanbanStatuses = [StatusTarefa.Pendente, StatusTarefa.EmAndamento, StatusTarefa.Atrasado, StatusTarefa.Concluida];
  // Visual order for rendering columns (put Atrasado first visually)
  displayStatuses: StatusTarefa[] = [StatusTarefa.Atrasado, StatusTarefa.Pendente, StatusTarefa.EmAndamento, StatusTarefa.Concluida];
  kanban: Record<string, Tarefa[]> = {} as any;
  searchTerm = '';
  selectedDate: string | null = null;
  selectedMonth: string | null = null; // YYYY-MM
  selectedYear: string | null = null;  // YYYY
  selectedStatus = 'todos';
  StatusTarefa = StatusTarefa;
  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendente', value: StatusTarefa.Pendente },
    { label: 'Em andamento', value: StatusTarefa.EmAndamento },
    { label: 'Concluída', value: StatusTarefa.Concluida },
    { label: 'Concluída Atrasada', value: StatusTarefa.ConcluidaAtrasada },
    { label: 'Atrasada', value: StatusTarefa.Atrasado }
  ];
  new: any;
  usuario: Usuario;

  constructor(private usuarioService: UsuarioService, private router: Router, private popoverController: PopoverController, private tarefaService: TarefaService, private toastController: ToastController, private alertController: AlertController) {
    this.tarefas = []
    this.tarefasFiltradas = [];
    this.usuario = new Usuario();
  }

  inicioRoute: string = '/inicio-funcionario'; // valor padrão

  ngOnInit() {
    const user = this.usuarioService.getCurrentUserValue();
    if (user && user.role === 'administrador') {
      this.inicioRoute = '/inicio-administrador';
    } else {
      this.inicioRoute = '/inicio-funcionario';
    }

    this.usuarioService.currentUser$.subscribe(u => {
      if (u) {
        this.usuario = u;
        this.carregarTarefas(this.usuario.idUsuario);
      }
    });
    // remover chamada imediata que estava usando id 0
  }

  ionViewWillEnter() {
    if (this.usuario && this.usuario.idUsuario > 0) {
      this.carregarTarefas(this.usuario.idUsuario);
    }
  }

  verTarefa(tarefa: Tarefa) {
    // Lógica para iniciar a tarefa
    this.router.navigate(['/detalhes-tarefa', tarefa.idTarefa]);
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
                  this.carregarTarefas(this.usuario.idUsuario);
                  this.exibirMensagem('Registro excluído com sucesso!');
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

  carregarTarefas(idUsuario: number) {
    this.tarefaService.listarPorIdUsuario(idUsuario).subscribe({
      next: (dados) => {
        this.tarefas = dados;
        this.aplicarFiltro();
        this.buildKanban();
      },
      error: (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
        // detalhes úteis para debug
        console.error('URL:', erro?.url, 'status:', erro?.status, 'msg:', erro?.error?.message ?? erro.message);
        this.exibirMensagem('Erro ao carregar tarefas. Verifique o backend (ver console).');
      }
    });
  }

  private buildKanban() {
    // init columns
    this.kanban = {} as any;
    for (const s of this.kanbanStatuses) {
      this.kanban[s] = [];
    }

    // ensure displayStatuses includes all logical statuses (and keeps Atrasado first)
    // Rebuild from kanbanStatuses (don't rely on previous displayStatuses which may have been mutated)
    const remaining = this.kanbanStatuses.filter(s => s !== StatusTarefa.Atrasado && s !== StatusTarefa.Concluida && s !== StatusTarefa.ConcluidaAtrasada);
    this.displayStatuses = [StatusTarefa.Atrasado, ...remaining, StatusTarefa.Concluida].filter((v, i, a) => a.indexOf(v) === i);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar apenas tarefas com data de entrega futura ou atrasadas
    for (const t of this.tarefas) {
      const dataEntrega = new Date(t.dataEntrega);
      dataEntrega.setHours(0, 0, 0, 0);

      // Mostrar no Kanban apenas se:
      // 1. A data de entrega é maior ou igual a hoje (data futura ou hoje)
      // 2. OU o status é ATRASADO
      // 3. OU o status é CONCLUIDA_ATRASADA (para mostrar tarefas que foram concluídas com atraso)
      const isFuturaOuHoje = dataEntrega >= hoje;
      const isAtrasada = t.statusTarefa === StatusTarefa.Atrasado || t.statusTarefa === StatusTarefa.ConcluidaAtrasada;

      if (isFuturaOuHoje || isAtrasada) {
        const key = t.statusTarefa || StatusTarefa.Pendente;
        if (!this.kanban[key]) this.kanban[key] = [];
        this.kanban[key].push(t);
      }
    }
  }

  /** Return list ids that current drop list should be connected to (CDK requires explicit connections in some setups) */
  getConnectedIds(status: StatusTarefa): string[] {
    // map all displayStatuses to the ids used in the template
    return this.displayStatuses.map(s => `kanban-${s}`);
  }

  async drop(event: CdkDragDrop<Tarefa[]>, targetStatus: string) {
    // Prevent no-op when dropped in same container
    if (event.previousContainer === event.container) {
      return;
    }
    // Use the drag item's data to find the source status reliably
    const movedItem = event.item.data as Tarefa;
    const fromStatusKey = this.kanbanStatuses.find(s => this.kanban[s] && this.kanban[s].includes(movedItem));
    const fromIndex = fromStatusKey ? this.kanbanStatuses.indexOf(fromStatusKey) : -1;
    const toIndex = this.kanbanStatuses.indexOf(targetStatus as any);

    // If attempting to move backwards (toIndex < fromIndex), disallow
    if (toIndex < fromIndex) {
      this.buildKanban();
      this.exibirMensagem('Não é permitido mover tarefa para uma etapa anterior');
      return;
    }

    // Ask user to confirm the move. If moving to CONCLUIDA include an observação textarea.
    const inputs: any[] = [];
    if (targetStatus === StatusTarefa.Concluida) {
      inputs.push({ name: 'observacao', type: 'textarea', placeholder: 'Observação...' });
    }

    const alert = await this.alertController.create({
      header: 'Confirmar ação',
      message: `Mover tarefa "${movedItem.nome}" para ${this.statusLabel(targetStatus as any)}?`,
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => {
            const observacao = data?.observacao?.toString();
            const oldStatus = movedItem.statusTarefa;
            
            // Se está movendo para CONCLUIDA, verificar se a tarefa está atrasada
            let statusFinal: any = targetStatus;
            if (targetStatus === StatusTarefa.Concluida) {
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              
              const dataEntrega = new Date(movedItem.dataEntrega);
              dataEntrega.setHours(0, 0, 0, 0);
              
              console.log('DEBUG - Verificando atraso:');
              console.log('  Data atual:', hoje);
              console.log('  Data entrega:', dataEntrega);
              console.log('  Está atrasada?', dataEntrega < hoje);
              
              // Se a data de entrega passou, marca como CONCLUIDA_ATRASADA
              if (dataEntrega < hoje) {
                statusFinal = StatusTarefa.ConcluidaAtrasada;
                console.log('  Status final: CONCLUIDA_ATRASADA');
              } else {
                console.log('  Status final: CONCLUIDA');
              }
            }

            // show a loading via toast or local feedback could be added; proceed to update backend
            this.tarefaService.updateStatus(movedItem.idTarefa, statusFinal, observacao).subscribe({
              next: (updated) => {
                console.log('Tarefa atualizada:', updated);
                // update local model and UI only after success
                movedItem.statusTarefa = statusFinal;
                transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
                this.buildKanban();

                // if backend indicates notifyAdmin, call the notification endpoint based on target status
                const shouldNotifyAdmin = (updated && (updated as any).notifyAdmin) || movedItem.notifyAdmin;
                if (shouldNotifyAdmin) {
                  if (statusFinal === StatusTarefa.Concluida || statusFinal === StatusTarefa.ConcluidaAtrasada) {
                    this.tarefaService.notificarAdministradorTarefaConcluida((updated as any).idTarefa, (updated as any).idAdministrador).subscribe({
                      next: () => { /* ignore */ },
                      error: () => { /* ignore */ }
                    });
                  } else if (statusFinal === StatusTarefa.EmAndamento) {
                    this.tarefaService.notificarAdministradorTarefaIniciada((updated as any).idTarefa, (updated as any).idAdministrador).subscribe({
                      next: () => { /* ignore */ },
                      error: () => { /* ignore */ }
                    });
                  }
                }
              },
              error: (err) => {
                console.error('Erro ao atualizar status', err);
                this.exibirMensagem('Erro ao atualizar status da tarefa');
                this.buildKanban();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // helper to find the status index for a given kanban list reference
  private indexOfStatusList(list: Tarefa[] | undefined): number {
    if (!list) return -1;
    for (let i = 0; i < this.kanbanStatuses.length; i++) {
      const s = this.kanbanStatuses[i];
      if (this.kanban[s] === list) return i;
    }
    // fallback: try to find by membership
    for (let i = 0; i < this.kanbanStatuses.length; i++) {
      const s = this.kanbanStatuses[i];
      if (this.kanban[s] && list.length && this.kanban[s].includes(list[0])) return i;
    }
    return -1;
  }

  // CDK predicate to prevent entering an earlier column
  canEnter = (drag: CdkDrag, drop: CdkDropList) => {
    try {
      const from = this.indexOfStatusList((drag.dropContainer && (drag.dropContainer.data as Tarefa[])) || undefined);
      const to = this.indexOfStatusList((drop && (drop.data as Tarefa[])) || undefined);
      if (from === -1 || to === -1) return true; // be permissive if unknown
      return to >= from; // allow only forward or same column
    } catch (e) {
      return true;
    }
  }

  onSearchTermChange(event: any) {
    this.searchTerm = event.detail?.value ?? '';
    this.aplicarFiltro();
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail?.value ?? null;
    // selecting a specific day clears month/year
    if (this.selectedDate) {
      this.selectedMonth = null;
      this.selectedYear = null;
    }
    this.aplicarFiltro();
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.detail?.value ?? null;
    if (this.selectedMonth) {
      this.selectedDate = null;
      this.selectedYear = null;
    }
    this.aplicarFiltro();
  }

  onYearChange(event: any) {
    this.selectedYear = event.detail?.value ?? null;
    if (this.selectedYear) {
      this.selectedDate = null;
      this.selectedMonth = null;
    }
    this.aplicarFiltro();
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

  onStatusChange(event: any) {
    this.selectedStatus = event.detail?.value ?? 'todos';
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    const termo = this.searchTerm.trim().toLowerCase();
    const range = this.getFiltroRange();
    const statusFiltro = this.selectedStatus;

    this.tarefasFiltradas = this.tarefas.filter(t => {
      const nomeMatch = (t.nome ?? '').toLowerCase().includes(termo);

      if (statusFiltro !== 'todos' && t.statusTarefa !== statusFiltro) {
        return false;
      }

      if (!t.dataEntrega) {
        return nomeMatch;
      }

      if (!range.inicio && !range.fim) {
        return nomeMatch;
      }

      const dataTarefa = new Date(t.dataEntrega);
      if (Number.isNaN(dataTarefa.getTime())) {
        return false;
      }
      dataTarefa.setHours(0, 0, 0, 0);

      if (range.inicio && dataTarefa < range.inicio) return false;
      if (range.fim && dataTarefa > range.fim) return false;

      return nomeMatch;
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

    this.tarefasFiltradas.sort((a, b) => {
      // Prioridade primeiro: tarefas marcadas como favorita aparecem no topo
      if (a.favorita !== b.favorita) {
        return a.favorita ? -1 : 1; // true vem primeiro
      }
      // Se mesmo nível de prioridade, ordenar por status
      return rank(a.statusTarefa) - rank(b.statusTarefa);
    });
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

  // Return a friendly label for a status value (used in UI instead of raw enum)
  statusLabel(status: StatusTarefa | string | undefined): string {
    if (!status) return '';
    switch (status) {
      case StatusTarefa.Pendente:
        return 'Pendente';
      case StatusTarefa.EmAndamento:
        return 'Em Andamento';
      case StatusTarefa.Concluida:
        return 'Concluída';
      case StatusTarefa.ConcluidaAtrasada:
        return 'Concluída Atrasada';
      case StatusTarefa.Atrasado:
        return 'Atrasada';
      // handle raw string values too
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'PENDENTE':
        return 'Pendente';
      case 'CONCLUIDA':
        return 'Concluída';
      case 'CONCLUIDA_ATRASADA':
        return 'Concluída Atrasada';
      case 'ATRASADO':
        return 'Atrasada';
      default:
        // fallback: prettify by replacing underscores and titlecasing
        return String(status).replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase());
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

    const status = tarefa.statusTarefa as StatusTarefa | string | undefined;
    if (status === 'CONCLUIDA' || status === StatusTarefa.ConcluidaAtrasada || status === StatusTarefa.Concluida) {
      return 'Concluída';
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

  podeVerObservacao(tarefa: Tarefa): boolean {
    return (tarefa.statusTarefa === StatusTarefa.Concluida || tarefa.statusTarefa === StatusTarefa.ConcluidaAtrasada) && !!tarefa.observacao;
  }

}


