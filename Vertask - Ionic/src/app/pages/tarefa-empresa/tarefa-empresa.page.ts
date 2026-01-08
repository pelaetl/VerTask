import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TarefaService } from 'src/app/services/tarefa.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-tarefa-empresa',
  templateUrl: './tarefa-empresa.page.html',
  styleUrls: ['./tarefa-empresa.page.scss'],
  standalone: false
})
export class TarefaEmpresaPage implements OnInit {

  clienteId: number | null = null;
  cliente: any = null;
  tarefas: any[] = [];
  tarefasFiltradas: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';

  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CONCLUIDA_ATRASADA', label: 'Concluída Atrasada' },
    { value: 'ATRASADO', label: 'Atrasada' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tarefaService: TarefaService,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.clienteId = parseInt(params['id'], 10);
        this.carregarDados();
      }
    });
  }

  carregarDados() {
    if (!this.clienteId) return;

    // Carregar dados do cliente
    this.clienteService.get(this.clienteId).subscribe({
      next: (cliente: any) => {
        this.cliente = cliente;
      },
      error: (err: any) => console.error('Erro ao carregar cliente:', err)
    });

    // Carregar todas as tarefas e filtrar
    this.tarefaService.listar().subscribe({
      next: (tarefas: any[]) => {
        this.tarefas = tarefas || [];
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Erro ao listar tarefas:', err)
    });
  }

  onSearchChange(event: any) {
    const raw = event?.detail?.value ?? event?.target?.value ?? this.searchTerm;
    this.searchTerm = (raw || '').toString().trim();
    this.aplicarFiltros();
  }

  onStatusChange(event: any) {
    const value = event?.detail?.value ?? event?.target?.value ?? this.statusFilter;
    this.statusFilter = value;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    const filtradas = this.tarefas.filter(t => {
      // Filtrar por cliente
      const tarefaClienteId = t?.clienteId ?? t?.cliente?.id;
      if (tarefaClienteId !== this.clienteId) return false;

      // Filtrar por search term
      if (this.searchTerm) {
        const nome = (t?.nome || '').toString().toLowerCase();
        const descricao = (t?.descricao || '').toString().toLowerCase();
        const term = this.searchTerm.toLowerCase();
        if (!nome.includes(term) && !descricao.includes(term)) return false;
      }

      // Filtrar por status
      if (this.statusFilter) {
        const status = t?.statusTarefa || t?.status;
        if (status !== this.statusFilter) return false;
      }

      return true;
    });

    const statusOrder: Record<string, number> = {
      'ATRASADO': 1,
      'ATRASADA': 1,
      'PENDENTE': 2,
      'EM_ANDAMENTO': 3,
      'CONCLUIDA': 4,
      'CONCLUIDA_ATRASADA': 5
    };

    this.tarefasFiltradas = filtradas.sort((a, b) => {
      const sa = ((a?.statusTarefa || a?.status || '') as string).toUpperCase();
      const sb = ((b?.statusTarefa || b?.status || '') as string).toUpperCase();
      const oa = statusOrder[sa] ?? 999;
      const ob = statusOrder[sb] ?? 999;
      if (oa !== ob) return oa - ob;
      const da = a?.dataVencimento || a?.dataEntrega;
      const db = b?.dataVencimento || b?.dataEntrega;
      const ta = da ? new Date(da).getTime() : 0;
      const tb = db ? new Date(db).getTime() : 0;
      return ta - tb;
    });
  }

  voltar() {
    this.router.navigate(['/relatorio-empresa']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDENTE':
        return '#36A2EB';
      case 'EM_ANDAMENTO':
        return '#fbbf24';
      case 'CONCLUIDA':
        return '#4BC0C0';
      case 'CONCLUIDA_ATRASADA':
        return '#1e7c34';
      case 'ATRASADO':
        return '#FF6384';
      default:
        return '#999999';
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }

  tarefaIndicadorClass(tarefa: any): string {
    const status = (tarefa?.statusTarefa || tarefa?.status || '').toUpperCase();
    switch (status) {
      case 'PENDENTE':
        return 'tarefa-indicador--pendente';
      case 'EM_ANDAMENTO':
        return 'tarefa-indicador--em-andamento';
      case 'CONCLUIDA':
        return 'tarefa-indicador--concluida';
      case 'CONCLUIDA_ATRASADA':
        return 'tarefa-indicador--concluida-atrasada';
      case 'ATRASADO':
      case 'ATRASADA':
        return 'tarefa-indicador--atrasada';
      default:
        return '';
    }
  }

  statusBadgeColor(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'PENDENTE':
        return 'primary';
      case 'EM_ANDAMENTO':
        return 'warning';
      case 'CONCLUIDA':
        return 'success';
      case 'CONCLUIDA_ATRASADA':
        return 'success';
      case 'ATRASADO':
      case 'ATRASADA':
        return 'danger';
      default:
        return 'medium';
    }
  }

  prazoLabel(tarefa: any): string {
    if (!tarefa?.dataVencimento) return '';

    const vencimento = new Date(tarefa.dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Entrega hoje';
    if (diffDays === 1) return 'Entrega amanhã';
    if (diffDays > 1) return `Entrega em ${diffDays} dias`;
    if (diffDays === -1) return 'Vencida ontem';
    if (diffDays < -1) return `Vencida há ${Math.abs(diffDays)} dias`;

    return '';
  }

}
