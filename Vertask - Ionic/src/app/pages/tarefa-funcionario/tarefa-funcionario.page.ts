import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TarefaService } from 'src/app/services/tarefa.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-tarefa-funcionario',
  templateUrl: './tarefa-funcionario.page.html',
  styleUrls: ['./tarefa-funcionario.page.scss'],
  standalone: false
})
export class TarefaFuncionarioPage implements OnInit {

  funcionarioId: number | null = null;
  funcionario: any = null;
  tarefas: any[] = [];
  tarefasFiltradas: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  backendFiltrado: boolean = false;

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
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.funcionarioId = parseInt(params['id'], 10);
        this.carregarDados();
      }
    });
  }

  carregarDados() {
    if (!this.funcionarioId) return;

    // Carregar dados do funcionário
    this.usuarioService.buscarPorId(this.funcionarioId).subscribe({
      next: (usuario) => {
        this.funcionario = usuario;
      },
      error: (err) => console.error('Erro ao carregar funcionário:', err)
    });

    // Buscar tarefas já filtradas pelo funcionário no backend para evitar perdas de vínculo
    this.tarefaService.listarPorIdUsuario(this.funcionarioId).subscribe({
      next: (tarefas) => {
        this.tarefas = tarefas || [];
        this.backendFiltrado = true; // já vem filtrado pelo backend
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Erro ao listar tarefas do funcionário:', err);
        this.backendFiltrado = false;
        // Fallback: tentar lista geral e filtrar manualmente para não ficar vazio
        this.tarefaService.listar().subscribe({
          next: (todas) => {
            this.tarefas = (todas || []).filter(t => {
              const usuarios = t?.usuarios || [];
              const usuariosIds = usuarios.map((u: any) => u?.idUsuario ?? u?.id).filter((v: any) => v != null);
              const usuariosIdsAlt = Array.isArray((t as any)?.usuariosIds) ? (t as any).usuariosIds as any[] : [];
              const idAdm = (t as any)?.idAdministrador;
              // alguns backends retornam criadoPor/usuarioCriacao; tratar como any para evitar erro de tipo
              const criadoPor = (t as any)?.criadoPor ?? (t as any)?.usuarioCriacao?.idUsuario;

              return (
                usuariosIds.includes(this.funcionarioId!) ||
                usuariosIdsAlt.includes(this.funcionarioId!) ||
                idAdm === this.funcionarioId ||
                criadoPor === this.funcionarioId
              );
            });
            this.aplicarFiltros();
          },
          error: (err2) => console.error('Erro ao listar tarefas (fallback):', err2)
        });
      }
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
      // Se o backend já filtrou por funcionário, não revalidar vínculo; apenas aplicar busca/status
      if (!this.backendFiltrado) {
        const usuarios = t?.usuarios || [];
        const usuariosIds = usuarios.map((u: any) => u?.idUsuario ?? u?.id).filter((v: any) => v != null);
        const usuariosIdsAlt = Array.isArray((t as any)?.usuariosIds) ? (t as any).usuariosIds as any[] : [];
        const idAdm = (t as any)?.idAdministrador;
        const criadoPor = (t as any)?.criadoPor ?? (t as any)?.usuarioCriacao?.idUsuario;
        const temFuncionario = usuariosIds.includes(this.funcionarioId) || usuariosIdsAlt.includes(this.funcionarioId) || idAdm === this.funcionarioId || criadoPor === this.funcionarioId;
        if (!temFuncionario) return false;
      }

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
    this.router.navigate(['/relatorio-funcionario']);
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

  abrirTarefa(tarefa: any) {
    if (tarefa?.idTarefa) {
      this.router.navigate(['/tarefa', tarefa.idTarefa]);
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
