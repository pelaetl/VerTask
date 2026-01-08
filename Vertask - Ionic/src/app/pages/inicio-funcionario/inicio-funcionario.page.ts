import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { EditarPerfilPage } from '../editar-perfil/editar-perfil.page';
import { Usuario } from '../../model/usuario';
import { Tarefa } from 'src/app/model/tarefa';
import { StatusTarefa } from 'src/app/enum/status-tarefa.enum';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inicio-funcionario',
  templateUrl: './inicio-funcionario.page.html',
  styleUrls: ['./inicio-funcionario.page.scss'],
  standalone: false
})
export class InicioFuncionarioPage implements OnInit, AfterViewInit {

  tarefasFiltradas: Tarefa[] = [];
  tarefasFavoritas: Tarefa[] = [];
  minhasTarefas: Tarefa[] = [];
  calendarioStatus: string = 'Não há tarefas para esta data';
  popoverAberto = false;
  popoverEvento: any;
  funcionario: Usuario;
  tarefas: Tarefa[]; 
  selectedDate: string = new Date().toISOString();
  avatarUrl: string | null = null;
  private avatarObjectUrl: string | null = null;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
    private usuarioService: UsuarioService,
    private tarefaService: TarefaService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { 
    this.tarefas = [];
    this.funcionario = new Usuario();
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
      if (!u) {
        return;
      }
      const usuarioAlterado = this.funcionario?.idUsuario !== u.idUsuario;
      this.funcionario = u;
      if (this.funcionario?.idUsuario) {
        this.carregarAvatar(this.funcionario.idUsuario);
      } else {
        this.definirAvatar(null);
      }
      if (usuarioAlterado) {
        this.recarregarDadosDoUsuario();
      }
    });
  }

  ngAfterViewInit(): void {
    this.atualizarChart();
  }

  ionViewWillEnter() {
    this.popoverAberto = false;
    if (this.funcionario?.idUsuario) {
      this.recarregarDadosDoUsuario();
      this.carregarAvatar(this.funcionario.idUsuario);
    }
  }

  ionViewWillLeave() {
    this.popoverAberto = false;
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

  private recarregarDadosDoUsuario() {
    this.carregarPrioridades();
    this.carregarMinhasTarefas();
    this.atualizarChart();
  }

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
            this.tarefaService.listar().subscribe({
              next: (tarefas) => {
                this.tarefas = tarefas
              },
              error: (error) => {
                console.error('Erro ao excluir tarefa:', error)
                this.exibirMensagem('Erro ao excluir tarefa')
              }
            });
            this.exibirMensagem('Registro excluído com sucesso!!!');
          }
        }
      ]
    })
    await alert.present()
  }

  criarChart() {
    if (!this.doughnutCanvas || !this.funcionario?.idUsuario) return;
      const ctx = this.doughnutCanvas.nativeElement.getContext('2d')!;
  
      if (this.doughnutChart) {
        this.doughnutChart.destroy();
      }
  
      this.tarefaService.listarPorIdUsuario(this.funcionario.idUsuario).subscribe(tasks => {
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
      if (!this.funcionario?.idUsuario) {
        return;
      }

      if (!this.doughnutChart) {
        this.criarChart();
        return;
      }
  
      this.tarefaService.listarPorIdUsuario(this.funcionario.idUsuario).subscribe(tasks => {
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
      return Number.isFinite(dt) && Date.now() < dt;
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

  abrirPerfil(ev: any) {
    this.popoverEvento = ev;
    this.popoverAberto = true;
  }

  async editarPerfil() {
    this.popoverAberto = false;

    console.log('Dados do funcionario antes do modal:', this.funcionario); // Debug

    const modal = await this.modalController.create({
      component: EditarPerfilPage,
      componentProps: {
        usuario: { ...this.funcionario } // Passa uma cópia dos dados
      }
    });

    modal.onDidDismiss().then((result) => {
      console.log('Resultado do modal:', result); // Debug

      if (result.role === 'salvar' && result.data) {
        // Atualizar dados locais
        this.funcionario = { ...result.data };

        // Atualizar no serviço (localStorage/sessionStorage)
        this.usuarioService.setCurrentUser(this.funcionario);

        // Salvar no backend
        this.usuarioService.salvar(this.funcionario).subscribe({
          next: (usuarioAtualizado) => {
            console.log('Perfil salvo no backend:', usuarioAtualizado);
            this.exibirMensagem('Perfil atualizado com sucesso!');

            // Atualizar dados locais com resposta do backend
            this.funcionario = usuarioAtualizado;
            this.usuarioService.setCurrentUser(usuarioAtualizado);
            
            // Recarregar avatar imediatamente após salvar
            if (this.funcionario?.idUsuario) {
              this.carregarAvatar(this.funcionario.idUsuario);
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

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
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

    if (!this.funcionario?.idUsuario) {
      return;
    }

    this.tarefaService.listarFavoritas(this.funcionario.idUsuario).subscribe({
      next: (tarefas) => {
        this.tarefasFavoritas = (tarefas || []).filter(t => t.statusTarefa !== StatusTarefa.Concluida && t.statusTarefa !== StatusTarefa.ConcluidaAtrasada);
      },
      error: (error) => {
        console.error('Erro ao buscar tarefas favoritas:', error)
        this.exibirMensagem('Erro ao buscar tarefas favoritas')
      }
    });

  }

  carregarMinhasTarefas() {
    if (!this.funcionario?.idUsuario) {
      return;
    }

    this.tarefaService.listarPorIdUsuario(this.funcionario.idUsuario).subscribe({
      next: (tarefas) => {
        const resultado = tarefas ?? [];
        this.tarefas = resultado;
        this.minhasTarefas = resultado;

        if (this.selectedDate) {
          this.onDateChange({ detail: { value: this.selectedDate } });
        } else {
          this.tarefasFiltradas = [...resultado];
        }
      },
      error: (error) => {
        console.error('Erro ao buscar minhas tarefas:', error)
        this.exibirMensagem('Erro ao buscar minhas tarefas')
      }
    });

}
}
