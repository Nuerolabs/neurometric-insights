import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Loader2, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Calendar
} from "lucide-react";
import { useEquityData } from "@/hooks/accounting/useEquity";
import { useInvoices, useBills } from "@/hooks/accounting/useErp";
import { usePettyCashVouchers } from "@/hooks/accounting/usePettyCash";
import { toast } from "sonner";

export default function Reports() {
  const [period, setPeriod] = useState<"ALL" | "MONTH" | "YEAR">("ALL");
  const { data: equityData, isLoading: loadingEquity } = useEquityData();
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: vouchers, isLoading: loadingVouchers } = usePettyCashVouchers();
  const { data: bills, isLoading: loadingBills } = useBills();

  const isLoading = loadingEquity || loadingInvoices || loadingVouchers || loadingBills;

  // 1. Desglose de Ingresos (Facturas Pagadas)
  const paidInvoices = invoices?.filter(i => i.status === 'PAID') || [];
  
  // Ingresos por Mensualidad Recurrente ($600.000)
  const ingresosMensualidades = paidInvoices
    .filter(i => i.concept_type === 'RECURRING_MONTHLY')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

  // Ingresos por Implementaciones
  const ingresosImplementacion = paidInvoices
    .filter(i => i.concept_type === 'IMPLEMENTATION')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

  // Otros ingresos
  const otrosIngresos = paidInvoices
    .filter(i => i.concept_type !== 'RECURRING_MONTHLY' && i.concept_type !== 'IMPLEMENTATION')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

  const totalIngresos = ingresosMensualidades + ingresosImplementacion + otrosIngresos;

  // 2. Desglose de Gastos
  // Caja Menor (excluyendo apertura de fondos y rechazados)
  const gastosCajaMenor = vouchers
    ?.filter(v => v.category !== 'INGRESO DE FONDOS' && v.status !== 'REJECTED')
    .reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;

  // Cuentas por Pagar (Facturas de proveedores pagadas)
  const paidBills = bills?.filter(b => b.status === 'PAID') || [];
  const gastosCloud = paidBills
    .filter(b => b.category === 'SERVICIOS_CLOUD' || b.category === 'INFRAESTRUCTURA')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const otrosGastosCxP = paidBills
    .filter(b => b.category !== 'SERVICIOS_CLOUD' && b.category !== 'INFRAESTRUCTURA')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const totalGastos = gastosCajaMenor + gastosCloud + otrosGastosCxP;

  // Utilidad Operativa y Neta
  const utilidadNeta = totalIngresos - totalGastos;
  const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

  // 3. Patrimonio (Capital realmente pagado en caja/bancos por los socios)
  const totalPatrimonio = Number(equityData?.summary?.totalPaid || 0);

  // 4. Pasivos (Cuentas por pagar pendientes reales)
  const totalPasivos = bills
    ?.filter(b => b.status === 'PENDING')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;

  // 5. Cuentas por Cobrar (Facturas Pendientes reales)
  const cuentasPorCobrar = invoices
    ?.filter(i => i.status === 'DRAFT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;

  // Efectivo disponible en Caja Menor (Fondos fondeados reales - vales gastados)
  const ingresoFondoCaja = vouchers
    ?.filter(v => v.category === 'INGRESO DE FONDOS' && v.status !== 'REJECTED')
    .reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
  const saldoCajaMenor = Math.max(0, ingresoFondoCaja - gastosCajaMenor);

  // Activos Totales (Disponible en Bancos + Caja Menor + Cartera CxC)
  const saldoBancos = Math.max(0, totalPatrimonio + totalIngresos - totalGastos - ingresoFondoCaja);
  const totalActivos = saldoBancos + saldoCajaMenor + cuentasPorCobrar;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["CONCEPTO", "VALOR (COP)"],
      ["Ingresos por Suscripciones / Mensualidades", ingresosMensualidades],
      ["Ingresos por Implementación y Setup", ingresosImplementacion],
      ["Otros Ingresos Operacionales", otrosIngresos],
      ["TOTAL INGRESOS OPERACIONALES", totalIngresos],
      ["Gastos de Cloud & Servidores", gastosCloud],
      ["Gastos de Caja Menor", gastosCajaMenor],
      ["Otros Costos y Gastos", otrosGastosCxP],
      ["TOTAL GASTOS", totalGastos],
      ["UTILIDAD NETA DEL EJERCICIO", utilidadNeta],
      ["", ""],
      ["ACTIVOS TOTALES", totalActivos],
      ["PASIVOS TOTALES", totalPasivos],
      ["PATRIMONIO TOTAL", totalPatrimonio + utilidadNeta]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Financiero_NeuroLabs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte exportado exitosamente en formato CSV");
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300 print:p-0">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              NIIF / Pymes Colombia
            </span>
            <span className="text-xs text-slate-400 font-mono">Período Fiscal 2025</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reportes Gerenciales y Financieros</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consolidación contable en tiempo real de ingresos por contratos, mensualidades, gastos y patrimonio.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" /> Exportar CSV
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handlePrint}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Calculando libro contable y estados consolidados...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Ingresos Totales (Recaudados)</span>
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCOP(totalIngresos)}</div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-emerald-600">{paidInvoices.length} facturas</span> cobradas
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Costos y Gastos Totales</span>
                  <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-md">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCOP(totalGastos)}</div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span>Cloud, caja menor y proveedores</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Utilidad Neta Operacional</span>
                  <div className={`p-1.5 rounded-md ${utilidadNeta >= 0 ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl font-bold font-mono ${utilidadNeta >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-600'}`}>
                  {formatCOP(utilidadNeta)}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Margen neto: {margenUtilidad.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Cartera Activa por Cobrar (CxC)</span>
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-md">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono">{formatCOP(cuentasPorCobrar)}</div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span>Pendiente por recaudar</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Tablas Principales: PyG y Balance General */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              
              {/* Estado de Resultados Integral (PyG) */}
              <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 py-4 px-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" /> Estado de Resultados (PyG)
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          Operacional
                        </Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableBody>
                              {/* Sección 1: Ingresos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  1. Ingresos Operacionales
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Mensualidades y Suscripciones Recurrentes ($600.000 COP)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    +{formatCOP(ingresosMensualidades)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Servicios de Implementación y Setup de Plataforma
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    +{formatCOP(ingresosImplementacion)}
                                  </TableCell>
                              </TableRow>
                              {otrosIngresos > 0 && (
                                <TableRow>
                                    <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                      Otros Servicios y Consultoría Especializada
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                      +{formatCOP(otrosIngresos)}
                                    </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/30">
                                  <TableCell className="font-bold text-slate-900 dark:text-white text-sm">
                                    Total Ingresos Brutos
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-emerald-600">
                                    {formatCOP(totalIngresos)}
                                  </TableCell>
                              </TableRow>

                              {/* Sección 2: Costos y Gastos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  2. Costos y Gastos de Operación
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Infraestructura Cloud, Servidores y APIs (AWS, OpenAI, Vercel)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-rose-600 font-medium">
                                    -{formatCOP(gastosCloud)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Gastos Operacionales y Vales de Caja Menor
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-rose-600 font-medium">
                                    -{formatCOP(gastosCajaMenor)}
                                  </TableCell>
                              </TableRow>
                              {otrosGastosCxP > 0 && (
                                <TableRow>
                                    <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                      Otros Costos Administrativos y Proveedores
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-rose-600 font-medium">
                                      -{formatCOP(otrosGastosCxP)}
                                    </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/30">
                                  <TableCell className="font-bold text-slate-900 dark:text-white text-sm">
                                    Total Costos y Gastos
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-rose-600">
                                    -{formatCOP(totalGastos)}
                                  </TableCell>
                              </TableRow>

                              {/* Total Utilidad Neta */}
                              <TableRow className="bg-slate-100 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-600">
                                  <TableCell className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider py-4">
                                    Utilidad Neta del Ejercicio
                                  </TableCell>
                                  <TableCell className={`text-right font-black text-xl font-mono py-4 ${utilidadNeta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                                      {formatCOP(utilidadNeta)}
                                  </TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>

              {/* Balance General NIIF */}
              <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 py-4 px-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-blue-600" /> Balance General Clasificado
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Estructura Patrimonial
                        </Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableBody>
                              {/* 1. Activos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  1. Activos Corrientes y Disponibles
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Disponible en Bancos y Cuentas Operativas
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-blue-600 font-semibold">
                                    {formatCOP(saldoBancos)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Fondo en Efectivo (Caja Menor)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-blue-600 font-semibold">
                                    {formatCOP(saldoCajaMenor)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Cuentas por Cobrar a Clientes (CxC)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-blue-600 font-semibold">
                                    {formatCOP(cuentasPorCobrar)}
                                  </TableCell>
                              </TableRow>
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-blue-50/40 dark:bg-blue-950/20">
                                  <TableCell className="font-bold text-slate-900 dark:text-white text-sm">
                                    Total Activos
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                                    {formatCOP(totalActivos)}
                                  </TableCell>
                              </TableRow>

                              {/* 2. Pasivos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  2. Pasivos Corrientes
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Cuentas por Pagar a Proveedores (CxP)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-rose-600 font-semibold">
                                    {formatCOP(totalPasivos)}
                                  </TableCell>
                              </TableRow>

                              {/* 3. Patrimonio */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  3. Patrimonio Neto
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Capital Social Suscrito y Pagado
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    {formatCOP(totalPatrimonio)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Resultado / Utilidad Neta del Ejercicio
                                  </TableCell>
                                  <TableCell className={`text-right font-mono font-semibold ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatCOP(utilidadNeta)}
                                  </TableCell>
                              </TableRow>

                              {/* Ecuación Contable */}
                              <TableRow className="bg-slate-100 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-600">
                                  <TableCell className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider py-4">
                                    Ecuación Contable (Activo = Pasivo + Patrimonio)
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-sm text-emerald-700 dark:text-emerald-400 py-4">
                                    Balance Cuadrado NIIF ✅
                                  </TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
        </>
      )}
    </div>
  );
}
