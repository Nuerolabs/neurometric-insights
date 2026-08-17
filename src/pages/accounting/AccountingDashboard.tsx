import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard,
    Activity,
    Download,
    Filter,
    Loader2,
    Building2,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { useInvoices, useBills, useClients } from "@/hooks/accounting/useErp";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { Link } from "react-router-dom";

export default function AccountingDashboard() {
  const { data: invoices, isLoading: loadingInv } = useInvoices();
  const { data: bills, isLoading: loadingBills } = useBills();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: entries, isLoading: loadingEntries } = useJournalEntries();

  if (loadingInv || loadingBills || loadingEntries || loadingClients) {
      return (
        <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Cargando panel contable...</p>
        </div>
      );
  }

  // Calculate Real KPI Metrics in COP
  const totalIngresos = invoices?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;
  const totalEgresos = bills?.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
  const carteraPendiente = invoices?.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;
  
  // MRR (Suma de mensualidades de clientes activos)
  const totalMRR = clients?.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + Number(c.monthly_fee || 0), 0) || 0;
  const clientesActivos = clients?.filter(c => c.status === 'ACTIVE').length || 0;

  // Efectivo equivalente y margen
  const efectivo = totalIngresos - totalEgresos;
  const margen = totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0;

  // Build Recent Transactions from Journal Entries
  const recientes = entries?.filter(e => e.status === 'POSTED').slice(0, 6).map(e => ({
      ref: e.entry_number,
      entity: e.description,
      amount: e.totalDebit,
      date: new Date(e.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: e.description.toLowerCase().includes('factura') || e.description.toLowerCase().includes('recaudo') ? 'ingreso' : 'egreso'
  })) || [];

  // Transform data for the chart (Group by Month for Invoices and Bills)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentMonth = new Date().getMonth();
  
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
      let d = new Date();
      d.setMonth(currentMonth - i);
      const mLabel = months[d.getMonth()];
      
      const invMonth = invoices?.filter(inv => new Date(inv.issue_date).getMonth() === d.getMonth() && inv.status === 'PAID') || [];
      const billMonth = bills?.filter(b => new Date(b.issue_date).getMonth() === d.getMonth() && b.status === 'PAID') || [];
      
      chartData.push({
          name: mLabel,
          ingresos: invMonth.reduce((s, x) => s + Number(x.total_amount || 0), 0),
          egresos: billMonth.reduce((s, x) => s + Number(x.total_amount || 0), 0)
      });
  }

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP',
    maximumFractionDigits: 0 
  }).format(val);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ERP NeuroLabs • Moneda: COP
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Financiero y Operativo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de ingresos recurrentes (MRR), implementación de contratos y flujo de caja en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/contabilidad/facturacion">
            <Button variant="outline" size="sm" className="h-9 font-medium text-slate-700 dark:text-slate-200">
              <Building2 className="h-4 w-4 mr-1.5 text-blue-600" /> Gestionar Clientes
            </Button>
          </Link>
          <Link to="/contabilidad/reportes">
            <Button variant="default" size="sm" className="h-9 font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 shadow-sm">
              <TrendingUp className="h-4 w-4 mr-1.5" /> Ver Reportes (PyG)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* MRR */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>MRR (Mensualidades IA)</span>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400">{formatCOP(totalMRR)}</div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{clientesActivos} clientes activos</span>
              <span className="font-semibold text-blue-600">$600k / cliente</span>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Recaudados */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Recaudado (Caja)</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatCOP(totalIngresos)}</div>
            <div className="mt-2 text-xs text-slate-500">
              Implementaciones y mensualidades
            </div>
          </CardContent>
        </Card>

        {/* Egresos */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Costos y Gastos Pagados</span>
              <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-md">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{formatCOP(totalEgresos)}</div>
            <div className="mt-2 text-xs text-slate-500">
              Cloud, APIs y caja menor
            </div>
          </CardContent>
        </Card>

        {/* Cartera por Cobrar */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Cartera por Cobrar (CxC)</span>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-md">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">{formatCOP(carteraPendiente)}</div>
            <div className="mt-2 text-xs text-slate-500">
              Facturas pendientes de cobro
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Gráfico y Transacciones */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Main Chart */}
        <Card className="lg:col-span-2 rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Flujo de Ingresos vs Egresos</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Histórico comparativo semestral en Pesos Colombianos (COP)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Egresos</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val > 999999 ? (val/1000000).toFixed(1) + 'M' : (val/1000).toFixed(0) + 'k'}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}
                  formatter={(value: number) => formatCOP(value)}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                <Area type="monotone" dataKey="egresos" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEgresos)" name="Egresos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transacciones Recientes */}
        <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {recientes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No hay transacciones registradas.</div>
                ) : (
                    recientes.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex flex-col max-w-[170px]">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.entity}>{item.entity}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">{item.ref} • {item.date}</span>
                        </div>
                        <div className={cn(
                          "text-xs font-bold font-mono tracking-tight text-right",
                          item.type === "ingreso" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {item.type === "ingreso" ? "+" : ""}{formatCOP(item.amount)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </div>
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 text-center">
            <Link to="/contabilidad/asientos">
              <Button variant="link" className="text-xs text-blue-600 font-semibold p-0 h-auto">
                Ver Asientos en Libro Diario →
              </Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
