import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard,
    Activity,
    Download,
    Filter
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

const mockChartData = [
  { name: "Ene", ingresos: 45000, egresos: 32400 },
  { name: "Feb", ingresos: 52000, egresos: 31398 },
  { name: "Mar", ingresos: 48000, egresos: 39800 },
  { name: "Abr", ingresos: 61000, egresos: 42908 },
  { name: "May", ingresos: 59000, egresos: 44800 },
  { name: "Jun", ingresos: 65000, egresos: 43800 },
  { name: "Jul", ingresos: 72000, egresos: 48300 },
];

export default function AccountingDashboard() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Enterprise Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Financiero</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visión global consolidada del estado financiero actual.</p>
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
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Ingresos (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$402,000.00</div>
            <p className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs año anterior
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Egresos (YTD)</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$283,406.00</div>
            <p className="text-xs font-medium text-rose-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +8.2% vs año anterior
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Margen Operativo</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">29.5%</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Objetivo: 30.0%</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Efectivo Equivalente</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$145,890.50</div>
            <p className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> Liquidez saludable
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Main Chart */}
        <Card className="md:col-span-2 lg:col-span-3 rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Flujo de Caja - Ejercicio Fiscal</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {[
                { ref: "FAC-1042", entity: "TechCorp Inc.", amount: "+$12,400.00", date: "05 Ago 2026", type: "ingreso" },
                { ref: "PAG-0084", entity: "Servicios Cloud", amount: "-$1,250.00", date: "04 Ago 2026", type: "egreso" },
                { ref: "FAC-1041", entity: "Global Solutions", amount: "+$8,900.00", date: "03 Ago 2026", type: "ingreso" },
                { ref: "NOM-AGO", entity: "Nómina Q1", amount: "-$24,500.00", date: "01 Ago 2026", type: "egreso" },
                { ref: "IMP-07", entity: "Retención DIAN", amount: "-$3,100.00", date: "28 Jul 2026", type: "egreso" },
                { ref: "FAC-1040", entity: "Alpha Systems", amount: "+$4,500.00", date: "26 Jul 2026", type: "ingreso" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-default last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.entity}</span>
                    <span className="text-xs text-slate-500 font-mono mt-0.5">{item.ref} • {item.date}</span>
                  </div>
                  <div className={cn(
                    "text-sm font-bold tracking-tight",
                    item.type === "ingreso" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20 text-center">
                <Button variant="link" className="text-xs text-blue-600 h-auto p-0 font-semibold">Ver Libro Diario Completo →</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
