import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-relatorio-empresa',
  templateUrl: './relatorio-empresa.page.html',
  styleUrls: ['./relatorio-empresa.page.scss'],
  standalone: false
})
export class RelatorioEmpresaPage implements OnInit, AfterViewInit, OnDestroy {

  clientes: any[] = [];
  tarefas: any[] = [];
  // filtered view and index mapping
  clientesFiltrados: any[] = [];
  displayedIndices: number[] = [];
  searchTerm: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  selectedMonth: string | null = null; // YYYY-MM
  selectedYear: string | null = null; // YYYY

  chartData: number[][] = [];
  charts: (Chart | null)[] = [];

  chartLabels = ['Pendente', 'Em Andamento', 'Concluída', 'Atrasada'];
  chartColors = ['#36A2EB', '#fbbf24', '#4BC0C0', '#FF6384'];

  @ViewChildren('chartCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(private clienteService: ClienteService, private tarefaService: TarefaService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.carregarEmpresas();
  }

  ngAfterViewInit(): void {
    this.canvases.changes.subscribe(() => this.ensureAndRenderCharts());
    // try to render once after view init (if canvases already present)
    setTimeout(() => this.renderCharts(), 50);
  }

  ngOnDestroy(): void {
    this.charts.forEach(ch => ch?.destroy());
  }

  carregarEmpresas() {
    // Use forkJoin to load both clientes and tarefas in parallel
    forkJoin([
      this.clienteService.list(),
      this.tarefaService.listar()
    ]).subscribe(
      ([clientes, tarefas]: [any[], any[]]) => {
        this.clientes = clientes || [];
        this.tarefas = tarefas || [];
        
        // Initialize filtered view
        this.clientesFiltrados = this.clientes.slice();
        this.displayedIndices = this.clientes.map((_, i) => i);
        
        // Prepare arrays
        this.chartData = new Array(this.clientes.length).fill([0,0,0,0]).map(() => [0,0,0,0]);
        this.charts = new Array(this.clientes.length).fill(null);
        this.recalcularChartData();

        // Trigger change detection to update the view
        this.cdr.detectChanges();

        // Ensure charts are rendered/updated after data is ready
        // wait until canvases are present and sizes are computed
        setTimeout(() => {
          this.ensureAndRenderCharts();
        }, 80);
      },
      (err) => {
        console.error('Erro ao carregar dados', err);
      }
    );
  }

  private renderCharts() {
    if (!this.canvases || this.canvases.length === 0) return;
    // only render charts for displayed (filtered) set
    const canvasesArr = this.canvases.toArray();
    const count = Math.min(canvasesArr.length, this.displayedIndices.length);
    for (let idx = 0; idx < count; idx++) {
      const ref = canvasesArr[idx];
      this.createOrUpdateChart(idx, ref.nativeElement);
    }
  }

  private updateChartAt(index: number) {
    const canvasRef = this.canvases?.toArray?.()[index];
    if (canvasRef) {
      this.createOrUpdateChart(index, canvasRef.nativeElement);
    }
  }

  private ensureAndRenderCharts(retries = 0) {
    const canvasesArr = this.canvases?.toArray?.() || [];
    // wait until we have canvases and data counts match (use filtered length)
    const needed = Math.min(this.displayedIndices.length || this.clientes.length, this.chartData.length || 0);
    if (!canvasesArr.length || canvasesArr.length < needed) {
      if (retries < 8) {
        setTimeout(() => this.ensureAndRenderCharts(retries + 1), 120);
      }
      return;
    }

    // ensure each canvas has non-zero size before creating chart
    let ready = true;
    for (let i = 0; i < this.displayedIndices.length; i++) {
      const c = canvasesArr[i]?.nativeElement;
      if (!c || (c.clientWidth || 0) === 0 || (c.clientHeight || 0) === 0) { ready = false; break; }
    }

    if (!ready && retries < 8) {
      setTimeout(() => this.ensureAndRenderCharts(retries + 1), 120);
      return;
    }

    // render/destroy/create all charts for displayed set
    this.renderCharts();
    for (let i = 0; i < this.displayedIndices.length; i++) {
      this.updateChartAt(i);
    }
  }

  private createOrUpdateChart(index: number, canvas: HTMLCanvasElement) {
    // `index` here is display index; map to original client index
    const orig = this.displayedIndices[index] ?? index;
    const data = this.chartData[orig] || [0,0,0,0];
    // If a chart already exists for this index, destroy it so we recreate
    // the chart fresh. This avoids timing issues where the plugin reads
    // stale dataset values when redrawing the center text.
    try {
      if (this.charts[index]) {
        this.charts[index]!.destroy();
        this.charts[index] = null;
      }
    } catch (e) {
      // ignore destroy errors
      console.warn('Error destroying chart at', index, e);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ensure canvas has size (handle DPR for crisp rendering)
    const clientW = Math.max(1, Math.round(canvas.clientWidth || 0));
    const clientH = Math.max(1, Math.round(canvas.clientHeight || 0));
    if (clientW === 0 || clientH === 0) {
      // canvas not yet sized; retry shortly
      setTimeout(() => this.createOrUpdateChart(index, canvas), 80);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = clientW * dpr;
    canvas.height = clientH * dpr;
    try { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } catch(e) {}

    // clear canvas to ensure old drawings are removed
    try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch(e) {}

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

        const width = Math.max(0, chartArea.right - chartArea.left);
        const baseSize = Math.round(width / 5.2);
        const fontSize = Math.max(14, Math.min(56, baseSize));

        ctx.save();
        const radius = Math.round(fontSize * 1.4);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.fillText(String(total), centerX, centerY - Math.round(fontSize * 0.08));

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
        datasets: [{ data: data, backgroundColor: this.chartColors }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      plugins: [centerTextPlugin]
    });
  }

  totalFor(index: number): number {
    const orig = this.displayedIndices[index] ?? index;
    const arr = this.chartData[orig] || [];
    return arr.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
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
    // exclusivity: using range clears month/year
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
    // exclusivity: using range clears month/year
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
    const digits = (this.searchTerm || '').replace(/\D/g, '');

    if (!term && !this.startDate && !this.endDate && !this.selectedMonth && !this.selectedYear) {
      this.clientesFiltrados = this.clientes.slice();
      this.displayedIndices = this.clientes.map((_, i) => i);
    } else {
      this.clientesFiltrados = this.clientes.filter(c => {
        // Filter by name, CPF, or CNPJ
        let matchesSearch = !term;
        if (term) {
          const nome = (c.nome || c.razaoSocial || '').toString().toLowerCase();
          if (nome.includes(term)) matchesSearch = true;
          const cnpj = (c.cnpj || '').toString().replace(/\D/g, '');
          const cpf = (c.cpf || '').toString().replace(/\D/g, '');
          if (digits && (cnpj.includes(digits) || cpf.includes(digits))) matchesSearch = true;
          if ((c.cnpj || c.cpf || '').toString().toLowerCase().includes(term)) matchesSearch = true;
        } else {
          matchesSearch = true;
        }
        
        if (!matchesSearch) return false;

        // Filter by date range (based on tasks)
        if (this.startDate || this.endDate || this.selectedMonth || this.selectedYear) {
          const clientIndex = this.clientes.indexOf(c);
          const hasTasksInRange = this.hasTasksInDateRange(clientIndex);
          if (!hasTasksInRange) return false;
        }

        return true;
      });
      this.displayedIndices = this.clientesFiltrados.map(c => this.clientes.indexOf(c));
    }

    // Recalcular dados do gráfico com o filtro de período atual
    this.recalcularChartData();
    setTimeout(() => this.ensureAndRenderCharts(), 80);
  }

  private recalcularChartData() {
    const range = this.getFiltroRange();
    this.clientes.forEach((c, idx) => {
      const id = c?.id ?? c?.clienteId ?? c?.codigo ?? null;
      const tasks = id == null ? [] : this.tarefas.filter(t => (t?.clienteId ?? t?.cliente?.id) === id);

      const tasksNoPeriodo = tasks.filter(t => {
        const dEntrega = t?.dataEntrega || t?.data_entrega || t?.dataFinal || t?.data_fim;
        if (!dEntrega) return false;
        const dt = new Date(dEntrega);
        if (isNaN(dt.getTime())) return false;
        dt.setHours(0,0,0,0);
        if (range.inicio && dt < range.inicio) return false;
        if (range.fim && dt > range.fim) return false;
        return true;
      });

      const pend = tasksNoPeriodo.filter(t => (t?.statusTarefa || t?.status) === 'PENDENTE').length;
      const and = tasksNoPeriodo.filter(t => (t?.statusTarefa || t?.status) === 'EM_ANDAMENTO').length;
      const concl = tasksNoPeriodo.filter(t => (t?.statusTarefa || t?.status) === 'CONCLUIDA').length;
      const atra = tasksNoPeriodo.filter(t => (t?.statusTarefa || t?.status) === 'ATRASADO').length;

      this.chartData[idx] = [pend, and, concl, atra];
    });
  }

  private hasTasksInDateRange(clientIndex: number): boolean {
    if (!this.tarefas || !this.tarefas.length) return true;
    const cliente = this.clientes[clientIndex];
    const clienteId = cliente?.id ?? cliente?.clienteId ?? cliente?.codigo;
    if (!clienteId) return true;

    const range = this.getFiltroRange();
    if (!range.inicio && !range.fim) return true;

    const tasks = this.tarefas.filter(t => {
      const cid = t?.clienteId ?? t?.cliente?.id;
      return cid === clienteId;
    });
    if (!tasks.length) return false;

    return tasks.some(t => {
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
    if (this.selectedMonth) {
      const [yStr, mStr] = this.selectedMonth.split('-');
      const y = parseInt(yStr, 10); const m = parseInt(mStr, 10) - 1;
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

  navegarParaTarefas(cliente: any) {
    const clienteId = cliente?.id ?? cliente?.clienteId ?? cliente?.codigo;
    if (clienteId) {
      this.router.navigate(['/tarefa-empresa', clienteId]);
    }
  }

}
 
