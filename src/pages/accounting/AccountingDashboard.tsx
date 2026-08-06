import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard,
    Activity,
    Download,
    Filter,
    Loader2
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
import { useInvoices, useBills } from "@/hooks/accounting/useErp";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { Link } from "react-router-dom";

export default function AccountingDashboard() {
  const { data: invoices, isLoading: loadingInv } = useInvoices();
  const { data: bills, isLoading: loadingBills } = useBills();
  const { data: entries, isLoading: loadingEntries } = useJournalEntries();

  if (loadingInv || loadingBills || loadingEntries) {
      return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  // Calculate Real KPI Metrics
  const totalIngresos = invoices?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total_amount), 0) || 0;
  const totalEgresos = bills?.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
  
  // Efectivo equivalente: Ingresos pagados - Egresos pagados (Simplificación de caja)
  const efectivo = totalIngresos - totalEgresos;
  const margen = totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0;

  // Build Recent Transactions from Journal Entries
  const recientes = entries?.filter(e => e.status === 'POSTED').slice(0, 6).map(e => ({
      ref: e.entry_number,
      entity: e.description,
      amount: e.totalDebit,
      date: new Date(e.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: e.description.toLowerCase().includes('factura') ? 'ingreso' : 'egreso' // Simplification
  })) || [];

  // Transform data for the chart (Group by Month for Invoices and Bills)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentMonth = new Date().getMonth();
  
  const chartData = [];
  // Go back 6 months
  for (let i = 5; i >= 0; i--) {
      let d = new Date();
      d.setMonth(currentMonth - i);
      const mLabel = months[d.getMonth()];
      
      const invMonth = invoices?.filter(inv => new Date(inv.issue_date).getMonth() === d.getMonth() && inv.status === 'PAID') || [];
      const billMonth = bills?.filter(b => new Date(b.issue_date).getMonth() === d.getMonth() && b.status === 'PAID') || [];
      
      chartData.push({
          name: mLabel,
          ingresos: invMonth.reduce((s, x) => s + Number(x.total_amount), 0),
          egresos: billMonth.reduce((s, x) => s + Number(x.total_amount), 0)
      });
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Enterprise Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Financiero</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visión global consolidada en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Filter className="h-3.5 w-3.5 mr-2" />
                Filtrar Periodo
            </Button>
            <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-3.5 w-3.5 mr-2" />
                Exportar Reporte
            </Button>
        </div>
      </div>

      {/* Key Performance Indicators (KPIs) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Ingresos (Pagados)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(totalIngresos)}</div>
            <p className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              Real time DB Sync
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Egresos (Pagados)</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(totalEgresos)}</div>
            <p className="text-xs font-medium text-rose-600 flex items-center mt-1">
              Real time DB Sync
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Margen Operativo</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${margen >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{margen.toFixed(1)}%</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Objetivo: 30.0%</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Caja / Efectivo</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${efectivo >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>{formatMoney(efectivo)}</div>
            <p className="text-xs font-medium text-slate-500 flex items-center mt-1">
              Liquidez actual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Main Chart */}
        <Card className="md:col-span-2 lg:col-span-3 rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Flujo de Caja - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value: number) => formatMoney(value)}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                <Area type="monotone" dataKey="egresos" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorEgresos)" name="Egresos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Dense List */}
        <Card className="md:col-span-1 lg:col-span-1 rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {recientes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No hay transacciones registradas.</div>
              ) : (
                  recientes.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-default last:border-0">
                      <div className="flex flex-col max-w-[120px]">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.entity}>{item.entity}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">{item.ref} • {item.date}</span>
                      </div>
                      <div className={cn(
                        "text-sm font-bold tracking-tight text-right",
                        item.type === "ingreso" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {item.type === "ingreso" ? "+" : ""}{formatMoney(item.amount)}
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20 text-center">
                <Link to="/contabilidad/asientos">
                    <Button variant="link" className="text-xs text-blue-600 h-auto p-0 font-semibold">Ver Libro Diario Completo →</Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
