import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Tarefa } from 'src/app/model/tarefa';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { ToastController, AlertController, PopoverController, ModalController } from '@ionic/angular';
import { Usuario } from 'src/app/model/usuario';
import { Router } from '@angular/router';
import { EditarPerfilPage } from '../editar-perfil/editar-perfil.page';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inicio-administrador',
  templateUrl: './inicio-administrador.page.html',
  styleUrls: ['./inicio-administrador.page.scss'],
  standalone: false
})
export class InicioAdministradorPage implements OnInit {

  // @ViewChild('doughnutCanvas') doughnutCanvas;
  // doughnutChart: any;



  tarefasFiltradas: Tarefa[] = [];
  tarefas: Tarefa[];
  tarefasFavoritas: Tarefa[] = [];
  administrador: Usuario;
  todasTarefas: Tarefa[] = [];
  minhasTarefas: Tarefa[] = [];
  popoverAberto = false;
  popoverEvento: any;
  // notificações
  notificacoes: Tarefa[] = [];
  notificacoesCount = 0;
  notificacoesAberto = false;
  notificacoesEvento: any;
  avatarUrl: string | null = null;
  private avatarObjectUrl: string | null = null;

  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,
    private tarefaService: TarefaService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private usuarioService: UsuarioService,
    private funcionarioService: FuncionarioService
  ) {
    this.tarefas = [];
    this.administrador = new Usuario();
  }

  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  doughnutChart: any = null;
  // dados do gráfico
  chartLabels = ['Pendente', 'Em Andamento', 'Concluída', 'Atrasada'];
  chartColors = ['#36A2EB', '#fbbf24', '#4BC0C0', '#FF6384'];
  statusCounts = { pend: 0, and: 0, concl: 0, atra: 0 };
  totalMinhasTarefas = 0;
  private readonly centerTextPlugin = this.buildCenterTextPlugin();

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(u => {
      if (u) {
        this.administrador = u;
        if (this.administrador?.idUsuario) {
          this.carregarAvatar(this.administrador.idUsuario);
        } else {
          this.definirAvatar(null);
        }
      }
    });
    this.carregarPrioridades();
    this.carregarTodasTarefas();
    this.carregarMinhasTarefas();
    this.atualizarNotificacoes();
    this.atualizarChart();
  }

  ionViewWillEnter() {
    this.popoverAberto = false;
    this.carregarPrioridades();
    this.carregarTodasTarefas();
    this.carregarMinhasTarefas();
    this.atualizarNotificacoes();
    this.atualizarChart();
    if (this.administrador?.idUsuario) {
      this.carregarAvatar(this.administrador.idUsuario);
    }
  }

  ionViewWillLeave() {
    this.popoverAberto = false;
    this.atualizarChart();
  }

  ngAfterViewInit(): void {
    // cria o chart assim que o canvas estiver pronto
    this.atualizarChart();
  }

  // criarChart() {
  //   if (!this.doughnutCanvas) return;
  //   const ctx = this.doughnutCanvas.nativeElement.getContext('2d')!;
  //   if (this.doughnutChart) {
  //     this.doughnutChart.destroy();
  //   }
  //   this.doughnutChart = new Chart(ctx, {
  //     type: 'doughnut',
  //     data: {
  //       labels: this.chartLabels,
  //       datasets: [{
  //         data: [2, 5, 4],
  //         backgroundColor: this.chartColors
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: {
  //         legend: { position: 'bottom' }
  //       }
  //     }
  //   });
  // }

  criarChart() {
    if (!this.doughnutCanvas || !this.administrador?.idUsuario) return;
    const ctx = this.doughnutCanvas.nativeElement.getContext('2d')!;

    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }

    this.tarefaService.listarPorIdUsuario(this.administrador.idUsuario).subscribe(tasks => {
      const counts = this.computeCounts(tasks || []);
      this.statusCounts = counts;
      this.totalMinhasTarefas = counts.pend + counts.and + counts.concl + counts.atra;

      this.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.chartLabels,
          datasets: [{
            data: [counts.pend, counts.and, counts.concl, counts.atra],
            backgroundColor: this.chartColors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        },
        plugins: [this.centerTextPlugin]
      });
    });
  }

  atualizarChart() {
    if (!this.administrador?.idUsuario) return;

    if (!this.doughnutChart) {
      this.criarChart();
      return;
    }

    this.tarefaService.listarPorIdUsuario(this.administrador.idUsuario).subscribe(tasks => {
      const counts = this.computeCounts(tasks || []);
      this.statusCounts = counts;
      this.totalMinhasTarefas = counts.pend + counts.and + counts.concl + counts.atra;
      this.doughnutChart.data.datasets[0].data = [counts.pend, counts.and, counts.concl, counts.atra];
      this.doughnutChart.update();
    });
  }

  private toNum(v: any): number {
    if (Array.isArray(v)) return v.length;
    return typeof v === 'number' ? v : 0;
  }

  private buildCenterTextPlugin() {
    return {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        const dataset = chart?.data?.datasets?.[0];
        if (!dataset) return;
        const values = dataset.data || [];
        const total = values.reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

        const ctx = chart.ctx;
        const area = chart.chartArea || { left: 0, right: chart.width, top: 0, bottom: chart.height };
        const centerX = (area.left + area.right) / 2;
        const centerY = (area.top + area.bottom) / 2;

        const width = Math.max(0, area.right - area.left);
        const baseSize = Math.round(width / 6);
        const fontSize = Math.max(12, Math.min(42, baseSize));

        ctx.save();
        const radius = Math.round(fontSize * 1.4);
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.fillText(String(total), centerX, centerY - Math.round(fontSize * 0.08));

        const labelFont = Math.max(9, Math.round(fontSize / 5));
        ctx.fillStyle = '#374151';
        ctx.font = `600 ${labelFont}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.fillText('Total', centerX, centerY + Math.round(fontSize * 0.6));

        ctx.restore();
      }
    } as const;
  }

  private isPrazoFuturo(tarefa: Tarefa): boolean {
    if (!tarefa?.dataEntrega) return false;
    const dt = new Date(tarefa.dataEntrega).getTime();
    return Number.isFinite(dt) && Date.now() < dt; // data atual menor que data de entrega
  }

  private filtrarPorPrazoOuAtrasada(lista: Tarefa[]): Tarefa[] {
    return (lista || []).filter(t => t?.statusTarefa === StatusTarefa.Atrasado || this.isPrazoFuturo(t));
  }

  private contarFiltradas(v: any): number {
    if (Array.isArray(v)) return this.filtrarPorPrazoOuAtrasada(v).length;
    return this.toNum(v);
  }

  private computeCounts(tasks: Tarefa[]): { pend: number; and: number; concl: number; atra: number } {
    const elegiveis = this.filtrarPorPrazoOuAtrasada(tasks);
    let pend = 0, and = 0, concl = 0, atra = 0;
    for (const t of elegiveis) {
      switch (t.statusTarefa) {
        case StatusTarefa.Pendente:
          pend++; break;
        case StatusTarefa.EmAndamento:
          and++; break;
        case StatusTarefa.Concluida:
          concl++; break;
        case StatusTarefa.Atrasado:
          atra++; break;
      }
    }
    return { pend, and, concl, atra };
  }

  // atualizarChart() {
  //   if (!this.doughnutChart) {
  //     // caso o chart ainda não exista, crie e depois atualize
  //     this.criarChart();
  //   }
  //   const pend = this.tarefaService.getPendentes(this.administrador.idUsuario);
  //   const and = this.tarefaService.getAndamentos(this.administrador.idUsuario);
  //   const concl = this.tarefaService.getConcluidas(this.administrador.idUsuario);
  //   console.log('Pendentes:', pend, 'Em Andamento:', and, 'Concluídas:', concl);
  //   this.doughnutChart.data.datasets[0].data = [pend, and, concl];
  //   this.doughnutChart.update();
  // }

  async excluir(tarefa: Tarefa) {

    const alert = await this.alertController.create({
      header: 'Confirma a exclusão',
      message: tarefa.descricao,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            this.tarefaService.excluir(tarefa.idTarefa);
            // após exclusão, recarregar prioridades e todas as tarefas e notificações
            this.carregarPrioridades();
            this.carregarTodasTarefas();
            this.atualizarNotificacoes();
            this.exibirMensagem('Registro excluído com sucesso!!!');
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

  selectedDate: string = ''; // ou o tipo correto
  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    const dataSelecionada = new Date(this.selectedDate);

    this.tarefasFiltradas = this.minhasTarefas.filter(tarefa => {
      const dataEntrega = new Date(tarefa.dataEntrega);

      // Compara apenas o dia, mês e ano (ignora hora)
      return (
        dataEntrega.getFullYear() === dataSelecionada.getFullYear() &&
        dataEntrega.getMonth() === dataSelecionada.getMonth() &&
        dataEntrega.getDate() === dataSelecionada.getDate()
      );
    });

    console.log('Data selecionada:', this.selectedDate);
    console.log('Tarefas filtradas:', this.tarefasFiltradas);
  }

  // abre o popover de notificações
  abrirNotificacoes(ev: any) {
    this.notificacoesEvento = ev;
    this.notificacoesAberto = true;
  }

  // atualiza lista de notificações (ex: tarefas com entrega hoje)
  atualizarNotificacoes() {
    // garante que todasTarefas esteja carregada
    if (!this.todasTarefas || this.todasTarefas.length === 0) {
      // carrega e depois calcula
      this.tarefaService.listar().subscribe({
        next: (tarefas) => {
          this.todasTarefas = tarefas;
          this.calcularNotificacoes();
        },
        error: (error) => {
          console.error('Erro ao carregar tarefas para notificações:', error);
        }
      });
    } else {
      this.calcularNotificacoes();
    }
  }

  private calcularNotificacoes() {
    const hoje = new Date();
    const hojeAno = hoje.getFullYear();
    const hojeMes = hoje.getMonth();
    const hojeDia = hoje.getDate();

    this.notificacoes = this.todasTarefas.filter(t => {
      const d = new Date(t.dataEntrega);
      return d.getFullYear() === hojeAno && d.getMonth() === hojeMes && d.getDate() === hojeDia;
    });
    this.notificacoesCount = this.notificacoes.length;
  }

  abrirPerfil(ev: any) {
    this.popoverEvento = ev;
    this.popoverAberto = true;

  }

  async editarPerfil() {
    this.popoverAberto = false;

    console.log('Dados do administrador antes do modal:', this.administrador); // Debug

    const modal = await this.modalController.create({
      component: EditarPerfilPage,
      componentProps: {
        usuario: { ...this.administrador } // Passa uma cópia dos dados
      }
    });

    modal.onDidDismiss().then((result) => {
      console.log('Resultado do modal:', result); // Debug

      if (result.role === 'salvar' && result.data) {
        // Atualizar dados locais
        this.administrador = { ...result.data };

        // Atualizar no serviço (localStorage/sessionStorage)
        this.usuarioService.setCurrentUser(this.administrador);

        // Salvar no backend
        this.usuarioService.salvar(this.administrador).subscribe({
          next: (usuarioAtualizado) => {
            console.log('Perfil salvo no backend:', usuarioAtualizado);
            this.exibirMensagem('Perfil atualizado com sucesso!');

            // Atualizar dados locais com resposta do backend
            this.administrador = usuarioAtualizado;
            this.usuarioService.setCurrentUser(usuarioAtualizado);
            
            // Recarregar avatar imediatamente após salvar
            if (this.administrador?.idUsuario) {
              this.carregarAvatar(this.administrador.idUsuario);
            }
          },
          error: (err) => {
            console.error('Erro ao salvar perfil:', err);
            this.exibirMensagem('Erro ao atualizar perfil.');
          }
        });
      }
    });

    return await modal.present();
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

  // prioridadeIndicadorClass(tarefa: Tarefa): string {
  //   if (tarefa.statusTarefa === StatusTarefa.Concluida) {
  //     return 'prioridade-indicador--concluida';
  //   }

  //   const dias = this.diasRestantes(tarefa);

  //   if (dias === null) {
  //     return 'prioridade-indicador--alerta';
  //   }

  //   if (dias < 0 || tarefa.statusTarefa === StatusTarefa.Atrasado) {
  //     return 'prioridade-indicador--atrasada';
  //   }

  //   if (dias <= 2) {
  //     return 'prioridade-indicador--alerta';
  //   }

  //   return '';
  // }

  prioridadeIndicadorClass(tarefa: Tarefa): string {
    if (tarefa.statusTarefa === StatusTarefa.Concluida) {
      return 'tarefa-indicador--concluida';
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

  carregarPrioridades() {

    this.tarefaService.listarFavoritas(this.administrador.idUsuario).subscribe({
      next: (tarefas) => {
        this.tarefasFavoritas = (tarefas || []).filter(t => t.statusTarefa !== StatusTarefa.Concluida && t.statusTarefa !== StatusTarefa.ConcluidaAtrasada);
      },
      error: (error) => {
        console.error('Erro ao buscar tarefas favoritas:', error)
        this.exibirMensagem('Erro ao buscar tarefas favoritas')
      }
    });

  }

  carregarTodasTarefas() {
    this.tarefaService.listar().subscribe({
      next: (tarefas) => {
        this.todasTarefas = tarefas;
      },
      error: (error) => {
        console.error('Erro ao carregar todas as tarefas:', error)
        this.exibirMensagem('Erro ao carregar tarefas')
      }
    });
  }

  carregarMinhasTarefas() {
    if (!this.administrador?.idUsuario) {
      return;
    }

    this.tarefaService.listarPorIdUsuario(this.administrador.idUsuario).subscribe({
      next: (tarefas) => {
        const resultado = tarefas ?? [];
        this.tarefas = resultado;
        this.minhasTarefas = resultado;

        if (this.selectedDate) {
          this.onDateChange({ detail: { value: this.selectedDate } });
        }
      },
      error: (error) => {
        console.error('Erro ao buscar minhas tarefas:', error)
        this.exibirMensagem('Erro ao buscar minhas tarefas')
      }
    });

}

  private definirAvatar(objUrl: string | null) {
    if (this.avatarObjectUrl && this.avatarObjectUrl !== objUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
    }
    this.avatarObjectUrl = objUrl;
    this.avatarUrl = objUrl;
  }

  private carregarAvatar(idUsuario: number) {
    this.usuarioService.downloadFoto(idUsuario).subscribe({
      next: (blob) => this.definirAvatar(URL.createObjectURL(blob)),
      error: () => this.definirAvatar(null)
    });
  }

}

