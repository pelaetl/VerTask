import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Funcionario } from 'src/app/model/funcionario';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-relatorio-funcionario',
  templateUrl: './relatorio-funcionario.page.html',
  styleUrls: ['./relatorio-funcionario.page.scss'],
  standalone: false
})
export class RelatorioFuncionarioPage implements OnInit, AfterViewInit, OnDestroy {

  funcionarios: Funcionario[] = [];
  // filtered view and mapping to original indexes
  funcionariosFiltrados: Funcionario[] = [];
  displayedIndices: number[] = [];
  searchTerm: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  selectedMonth: string | null = null; // formato ISO (YYYY-MM)
  selectedYear: string | null = null; // formato YYYY
  tarefas: any[] = [];
  // Avatares por índice do funcionário
  avatarUrls: (string | null)[] = [];
  private avatarObjectUrls: (string | null)[] = [];

  // Dados de gráfico por funcionário: [pend, and, concl, atra]
  chartData: number[][] = [];
  charts: (Chart | null)[] = [];

  chartLabels = ['Pendente', 'Em Andamento', 'Concluída', 'Atrasada'];
  chartColors = ['#36A2EB', '#fbbf24', '#4BC0C0', '#FF6384'];

  @ViewChildren('chartCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(
    private funcionarioService: FuncionarioService,
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarFuncionarios();
  }

  ngAfterViewInit(): void {
    // Tenta renderizar quando os canvases estiverem disponíveis
    this.canvases.changes.subscribe(() => this.renderCharts());
    // Chamada inicial (caso a lista já tenha sido carregada antes da view)
    setTimeout(() => this.renderCharts(), 0);
  }

  ngOnDestroy(): void {
    // Liberar object URLs e destruir charts
    this.avatarObjectUrls.forEach(url => { if (url) URL.revokeObjectURL(url); });
    this.charts.forEach(ch => ch?.destroy());
  }

  public carregarFuncionarios() {
    forkJoin({
      funcs: this.funcionarioService.listar(),
      tarefas: this.tarefaService.listar()
    }).subscribe({
      next: ({ funcs, tarefas }) => {
        this.funcionarios = funcs || [];
        this.tarefas = tarefas || [];
        // initialize filtered view as full list
        this.funcionariosFiltrados = this.funcionarios.slice();
        this.displayedIndices = this.funcionarios.map((_, i) => i);
        // Inicializa arrays auxiliares conforme tamanho
        this.avatarUrls = new Array(this.funcionarios.length).fill(null);
        this.avatarObjectUrls = new Array(this.funcionarios.length).fill(null);
        this.chartData = new Array(this.funcionarios.length).fill([0, 0, 0, 0]).map(() => [0,0,0,0]);
        this.charts = new Array(this.funcionarios.length).fill(null);

        // Para cada funcionário, carrega avatar e dados do gráfico
        this.funcionarios.forEach((f, idx) => {
          this.carregarAvatar(f, idx);
          this.carregarDadosGrafico(f, idx);
        });

        // Tenta renderizar após popular dados iniciais
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => {
        console.error('Erro ao listar funcionários ou tarefas:', err);
      }
    });
  }

  onSearchChange(event: any) {
    const raw = event?.detail?.value ?? event?.target?.value ?? this.searchTerm;
    const v = (raw || '').toString().trim();
    this.searchTerm = v;
    this.applyFilters();
  }

  onStartDateChange(event: any) {
    const newDate = event.detail?.value ?? null;
    
    // Validate: startDate should not be greater than endDate
    if (newDate && this.endDate) {
      const start = new Date(newDate);
      const end = new Date(this.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      
      if (start > end) {
        console.warn('Data inicial não pode ser maior que a data final');
        // Reset to previous value or clear
        return;
      }
    }
    
    this.startDate = newDate;
    // exclusivity: manual range clears month/year
    this.endDate = this.endDate;
    this.selectedMonth = null;
    this.selectedYear = null;
    this.applyFilters();
  }

  onEndDateChange(event: any) {
    const newDate = event.detail?.value ?? null;
    
    // Validate: endDate should not be less than startDate
    if (newDate && this.startDate) {
      const start = new Date(this.startDate);
      const end = new Date(newDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      
      if (end < start) {
        console.warn('Data final não pode ser menor que a data inicial');
        // Reset to previous value or clear
        return;
      }
    }
    
    this.endDate = newDate;
    // exclusivity: manual range clears month/year
    this.startDate = this.startDate;
    this.selectedMonth = null;
    this.selectedYear = null;
    this.applyFilters();
  }

  isStartDateEnabled = (dateString: string): boolean => {
    // Allow all dates when no end date is set
    if (!this.endDate) return true;
    
    const selectedDate = new Date(dateString);
    const endDate = new Date(this.endDate);
    selectedDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    
    // Disable dates after endDate
    return selectedDate <= endDate;
  }

  isEndDateEnabled = (dateString: string): boolean => {
    // Allow all dates when no start date is set
    if (!this.startDate) return true;
    
    const selectedDate = new Date(dateString);
    const startDate = new Date(this.startDate);
    selectedDate.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);
    
    // Disable dates before startDate
    return selectedDate >= startDate;
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.detail?.value ?? null;
    // exclusivity: month clears year and manual range
    this.selectedYear = null;
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  onYearChange(event: any) {
    this.selectedYear = event.detail?.value ?? null;
    // exclusivity: year clears month and manual range
    this.selectedMonth = null;
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  clearMonth() {
    this.selectedMonth = null;
    this.applyFilters();
  }

  clearYear() {
    this.selectedYear = null;
    this.applyFilters();
  }

  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.selectedMonth = null;
    this.selectedYear = null;
    this.applyFilters();
  }

  private applyFilters() {
    const term = this.searchTerm.toLowerCase();

    if (!term && !this.startDate && !this.endDate && !this.selectedMonth && !this.selectedYear) {
      this.funcionariosFiltrados = this.funcionarios.slice();
      this.displayedIndices = this.funcionarios.map((_, i) => i);
    } else {
      this.funcionariosFiltrados = this.funcionarios.filter((f) => {
        // Filter by name
        const matchesName = !term || (f.nome || '').toLowerCase().includes(term);
        if (!matchesName) return false;

        // Filter by date range (based on tasks)
        if (this.startDate || this.endDate || this.selectedMonth || this.selectedYear) {
          const funcIndex = this.funcionarios.indexOf(f);
          const hasTasksInRange = this.hasTasksInDateRange(funcIndex);
          if (!hasTasksInRange) return false;
        }

        return true;
      });
      this.displayedIndices = this.funcionariosFiltrados.map(f => this.funcionarios.indexOf(f));
    }

    // Re-render charts for the filtered set
    setTimeout(() => this.renderCharts(), 50);
  }

  private hasTasksInDateRange(funcIndex: number): boolean {
    if (!this.tarefas || !this.tarefas.length) return true; // sem tarefas carregadas, não filtra
    const func = this.funcionarios[funcIndex];
    if (!func || !func.idUsuario) return true;

    const range = this.getFiltroRange();
    if (!range.inicio && !range.fim) return true;

    const assignedTasks = this.tarefas.filter(t => this.isTaskOfUser(t, func.idUsuario));
    if (!assignedTasks.length) return false;

    return assignedTasks.some(t => {
      const dEntrega = t?.dataEntrega || t?.data_entrega || t?.dataFinal || t?.data_fim;
      if (!dEntrega) return false;
      const dt = new Date(dEntrega);
      if (isNaN(dt.getTime())) return false;
      dt.setHours(0,0,0,0);
      if (range.inicio && dt < range.inicio) return false;
      if (range.fim && dt > range.fim) return false;
      return true;
    });
  }

  private getFiltroRange(): { inicio: Date | null, fim: Date | null } {
    // Prioridade: mês/ano selecionados; se ambos mês e ano selecionados, mês define intervalo; se só ano, ano define; se start/end definidos manualmente, usam eles.
    if (this.selectedMonth) {
      const [yearStr, monthStr] = this.selectedMonth.split('-');
      const y = parseInt(yearStr, 10); const m = parseInt(monthStr, 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        const inicio = new Date(Date.UTC(y, m, 1));
        const fim = new Date(Date.UTC(y, m + 1, 0));
        return { inicio, fim };
      }
    }

    if (this.selectedYear) {
      const y = parseInt(this.selectedYear, 10);
      if (!isNaN(y)) {
        const inicio = new Date(Date.UTC(y, 0, 1));
        const fim = new Date(Date.UTC(y, 11, 31));
        return { inicio, fim };
      }
    }

    const inicio = this.startDate ? new Date(this.startDate) : null;
    const fim = this.endDate ? new Date(this.endDate) : null;
    if (inicio) inicio.setHours(0,0,0,0);
    if (fim) fim.setHours(0,0,0,0);
    return { inicio, fim };
  }

  private isTaskOfUser(t: any, idUsuario: number): boolean {
    if (!t) return false;
    if (Array.isArray(t.usuariosIds) && t.usuariosIds.includes(idUsuario)) return true;
    if (Array.isArray(t.usuarios) && t.usuarios.some((u: any) => u?.idUsuario === idUsuario)) return true;
    // fallback: if task has single idUsuario field
    if (t.idUsuario === idUsuario) return true;
    return false;
  }

  // Helpers to map displayed index to original arrays
  public getChartDataForDisplay(displayIndex: number): number[] {
    const orig = this.displayedIndices[displayIndex];
    return this.chartData[orig] || [0,0,0,0];
  }

  public getAvatarForDisplay(displayIndex: number): string | null {
    const orig = this.displayedIndices[displayIndex];
    return this.avatarUrls[orig] || null;
  }

  private carregarAvatar(f: Funcionario, index: number) {
    const id = f?.idUsuario;
    if (!id) {
      this.definirAvatar(index, null);
      return;
    }

    this.usuarioService.downloadFoto(id).pipe(
      catchError(() => of(null))
    ).subscribe((blob) => {
      if (blob instanceof Blob) {
        const objUrl = URL.createObjectURL(blob);
        this.definirAvatar(index, objUrl);
      } else {
        this.definirAvatar(index, null);
      }
    });
  }

  private definirAvatar(index: number, objUrl: string | null) {
    const anterior = this.avatarObjectUrls[index];
    if (anterior && anterior !== objUrl) {
      URL.revokeObjectURL(anterior);
    }
    this.avatarObjectUrls[index] = objUrl;
    this.avatarUrls[index] = objUrl;
  }

  private carregarDadosGrafico(f: Funcionario, index: number) {
    const id = f?.idUsuario;
    if (!id) {
      this.chartData[index] = [0, 0, 0, 0];
      this.updateChartAt(index);
      return;
    }

    forkJoin({
      pend: this.tarefaService.getPendentes(id).pipe(catchError(() => of(0 as any))),
      and: this.tarefaService.getAndamentos(id).pipe(catchError(() => of(0 as any))),
      concl: this.tarefaService.getConcluidas(id).pipe(catchError(() => of(0 as any))),
      atra: this.tarefaService.getAtrasadas(id).pipe(catchError(() => of(0 as any)))
    }).subscribe(({ pend, and, concl, atra }) => {
      // Os serviços retornam arrays de Tarefa nos inicios; aqui o backend devolve contagem?
      // Pelo uso nas páginas de início, ele usa diretamente o retorno como número.
      // Para robustez, se vier array, pega length.
      const toNum = (v: any) => Array.isArray(v) ? v.length : (typeof v === 'number' ? v : 0);
      this.chartData[index] = [toNum(pend), toNum(and), toNum(concl), toNum(atra)];
      this.updateChartAt(index);
    }, (err) => {
      console.error('Erro ao carregar dados de gráfico do funcionário', f, err);
      this.chartData[index] = [0, 0, 0, 0];
      this.updateChartAt(index);
    });
  }

  private renderCharts() {
    if (!this.canvases || this.canvases.length === 0) return;
    this.canvases.forEach((ref, idx) => {
      this.createOrUpdateChart(idx, ref.nativeElement);
    });
  }

  private updateChartAt(index: number) {
    const canvasRef = this.canvases?.toArray?.()[index];
    if (canvasRef) {
      this.createOrUpdateChart(index, canvasRef.nativeElement);
    }
  }

  private createOrUpdateChart(index: number, canvas: HTMLCanvasElement) {
    const data = this.chartData[index] || [0, 0, 0, 0];

    if (this.charts[index]) {
      // Atualiza
      this.charts[index]!.data.datasets[0].data = data;
      this.charts[index]!.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Plugin that draws the total number in the center of the doughnut
    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        const dataset = chart.data.datasets && chart.data.datasets[0];
        if (!dataset) return;
        const values = dataset.data || [];
        const total = values.reduce((s: number, v: any) => s + (typeof v === 'number' ? v : 0), 0);

        const ctx = chart.ctx;
        const chartArea = chart.chartArea || { left: 0, right: chart.width, top: 0, bottom: chart.height };
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        // font size relative to chart size — reduced so number is smaller
        const width = Math.max(0, chartArea.right - chartArea.left);
        const baseSize = Math.round(width / 5.2); // increased divisor => smaller text
        const fontSize = Math.max(14, Math.min(56, baseSize));

        ctx.save();
        // draw dark circular background (improves contrast)
        const radius = Math.round(fontSize * 1.4);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // draw the total number
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.fillText(String(total), centerX, centerY - Math.round(fontSize * 0.08));

        // draw label under number
        const labelFont = Math.max(10, Math.round(fontSize / 4));
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `600 ${labelFont}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.fillText('Total', centerX, centerY + Math.round(fontSize * 0.6));

        ctx.restore();
      }
    };

    this.charts[index] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.chartLabels,
        datasets: [{
          data: data,
          backgroundColor: this.chartColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      },
      plugins: [centerTextPlugin]
    });
  }

  totalFor(index: number): number {
    const arr = this.chartData[index] || [];
    return arr.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
  }

  navegarParaTarefas(funcionario: Funcionario) {
    const funcionarioId = funcionario?.idUsuario ?? funcionario?.idFuncionario;
    if (funcionarioId) {
      this.router.navigate(['/tarefa-funcionario', funcionarioId]);
    }
  }
}
