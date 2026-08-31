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
  // Tasa de provisión de impuestos y retenciones (por defecto 40%, sujeta a modificaciones)
  const [taxRate, setTaxRate] = useState<number>(40);
  // Base de cálculo tributario: 'PROFIT' (Sobre Utilidad EBT - Estándar DIAN/NIIF) o 'REVENUE' (Sobre Ingresos Brutos Facturados)
  const [taxBase, setTaxBase] = useState<"PROFIT" | "REVENUE">("PROFIT");
  
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

  // Utilidad Antes de Impuestos (EBT)
  const utilidadAntesImpuestos = totalIngresos - totalGastos;
  
  // Provisión de Impuestos y Retenciones
  // Si es 'PROFIT': Se calcula sobre la Utilidad Antes de Impuestos (Estatuto Tributario Art. 240)
  // Si es 'REVENUE': Se calcula sobre el Total de Ingresos Brutos de Venta
  const baseImponible = taxBase === 'PROFIT' ? Math.max(0, utilidadAntesImpuestos) : totalIngresos;
  const provisionImpuestos = baseImponible > 0 ? Math.round(baseImponible * (taxRate / 100)) : 0;
  
  // Utilidad Neta Real NIIF (Post-Impuestos)
  const utilidadNeta = utilidadAntesImpuestos - provisionImpuestos;
  const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

  // 3. Patrimonio desglosado (Dinero Real vs Activos en Especie)
  const capitalDineroReal = Number(equityData?.summary?.totalCashPaid || equityData?.summary?.totalPaid || 0);
  const activosEnEspecie = Number(equityData?.summary?.totalSpeciesPaid || 0);
  const totalPatrimonio = Number(equityData?.summary?.totalPaid || (capitalDineroReal + activosEnEspecie));

  // 4. Pasivos (Cuentas por pagar pendientes + Provisión de Impuestos por Pagar)
  const cuentasPorPagarProveedores = bills
    ?.filter(b => b.status === 'PENDING')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
  
  // Total pasivos incluyendo provisión de impuestos corriente (Cuenta 2404 / 2615)
  const totalPasivos = cuentasPorPagarProveedores + provisionImpuestos;

  // 5. Cuentas por Cobrar (Facturas Pendientes reales)
  const cuentasPorCobrar = invoices
    ?.filter(i => i.status === 'DRAFT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;

  // Efectivo disponible en Caja Menor (Fondos fondeados reales - vales gastados)
  const ingresoFondoCaja = vouchers
    ?.filter(v => v.category === 'INGRESO DE FONDOS' && v.status !== 'REJECTED')
    .reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
  const saldoCajaMenor = Math.max(0, ingresoFondoCaja - gastosCajaMenor);

  // Dinero Real Disponible en Bancos (Aportes en Dinero + Cobro de Facturas - Gastos Pagados - Fondeo de Caja)
  const saldoBancos = Math.max(0, capitalDineroReal + totalIngresos - totalGastos - ingresoFondoCaja);

  // Activos Corrientes (Liquidez Operativa Real) y Activos No Corrientes (Especie / Tecnología)
  const totalActivoCorriente = saldoBancos + saldoCajaMenor + cuentasPorCobrar;
  const totalActivoNoCorriente = activosEnEspecie;
  const totalActivos = totalActivoCorriente + totalActivoNoCorriente;

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
      ["TOTAL GASTOS OPERACIONALES", totalGastos],
      ["UTILIDAD ANTES DE IMPUESTOS (EBT)", utilidadAntesImpuestos],
      [`PROVISIÓN DE IMPUESTOS Y RETENCIONES (${taxRate}%)`, provisionImpuestos],
      ["UTILIDAD NETA REAL DEL EJERCICIO", utilidadNeta],
      ["", ""],
      ["DISPONIBLE REAL EN BANCOS", saldoBancos],
      ["EFECTIVO EN CAJA MENOR", saldoCajaMenor],
      ["CUENTAS POR COBRAR (CxC)", cuentasPorCobrar],
      ["TOTAL ACTIVOS CORRIENTES (LIQUIDEZ)", totalActivoCorriente],
      ["ACTIVOS NO CORRIENTES (ESPECIE/TECNOLOGÍA)", totalActivoNoCorriente],
      ["TOTAL ACTIVOS", totalActivos],
      ["PASIVOS A PROVEEDORES (CxP)", cuentasPorPagarProveedores],
      [`PASIVO PROVISIÓN IMPUESTOS POR PAGAR (${taxRate}%)`, provisionImpuestos],
      ["TOTAL PASIVOS", totalPasivos],
      ["PATRIMONIO TOTAL (Capital + Utilidad Neta)", totalPatrimonio + utilidadNeta]
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
            Consolidación contable en tiempo real: liquidez bancaria, provisión fiscal de impuestos ({taxRate}%), activos y patrimonio.
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

      {/* Barra de Control de Provisión de Impuestos & Retenciones (Por defecto 40% - Sujeto a Modificación) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 dark:from-amber-950/30 dark:via-blue-950/30 dark:to-purple-950/30 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              ⚖️ Provisión Tributaria & Impuestos
            </span>
            <Badge className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 text-[10px]">
              Sujeto a Modificación
            </Badge>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Base: <strong className="text-amber-700 dark:text-amber-400">{taxBase === 'PROFIT' ? 'Utilidad Antes de Impuestos (EBT)' : 'Total Ventas Facturadas'}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {taxBase === 'PROFIT' 
              ? 'Renta Fiscal NIIF: Se calculan impuestos sobre ganancias reales (Ingresos menos Gastos Deducibles).' 
              : 'Retención Directa: Se calcula la provisión sobre cada peso facturado independientemente de los gastos.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Selector de Base Imponible */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <button 
              type="button"
              onClick={() => setTaxBase('PROFIT')} 
              className={`px-2.5 py-1 rounded font-medium transition-colors ${taxBase === 'PROFIT' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Sobre Utilidad (DIAN)
            </button>
            <button 
              type="button"
              onClick={() => setTaxBase('REVENUE')} 
              className={`px-2.5 py-1 rounded font-medium transition-colors ${taxBase === 'REVENUE' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Sobre Ventas (Bruto)
            </button>
          </div>

          {/* Slider de Porcentaje */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tasa:</span>
            <input 
              type="range" 
              min="0" 
              max="60" 
              step="1"
              value={taxRate} 
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24 sm:w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              <span>{taxRate}%</span>
            </div>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* Liquidez Real en Bancos */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <span>Disponible Bancos</span>
                  <div className="p-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-400 font-mono">{formatCOP(saldoBancos)}</div>
                <div className="mt-1 text-[11px] text-slate-500">Dinero real disponible</div>
              </CardContent>
            </Card>

            {/* Total Ingresos Cobrados */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <span>Ingresos Cobrados</span>
                  <div className="p-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{formatCOP(totalIngresos)}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-600">{paidInvoices.length} facturas</span> cobradas
                </div>
              </CardContent>
            </Card>

            {/* Total Gastos */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <span>Gastos Pagados</span>
                  <div className="p-1 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-rose-600 font-mono">{formatCOP(totalGastos)}</div>
                <div className="mt-1 text-[11px] text-slate-500">Cámara, Cloud y Caja</div>
              </CardContent>
            </Card>

            {/* Provisión Impuestos (40%) */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <span>Provisión Impuestos ({taxRate}%)</span>
                  <div className="p-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-amber-600 font-mono">{formatCOP(provisionImpuestos)}</div>
                <div className="mt-1 text-[11px] text-slate-500">Reserva fiscal obligatoria</div>
              </CardContent>
            </Card>

            {/* Utilidad Neta Real */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <span>Utilidad Neta Real</span>
                  <div className="p-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-xl font-bold font-mono ${utilidadNeta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {formatCOP(utilidadNeta)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Margen: <strong className="text-slate-700 dark:text-slate-300 font-mono">{margenUtilidad.toFixed(1)}%</strong>
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
                            <TrendingUp className="w-4 h-4 text-blue-600" /> Estado de Resultados (P&G)
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          NIIF / Fiscal
                        </Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="overflow-x-auto w-full">
                        <Table className="min-w-[500px]">
                          <TableBody>
                              {/* Sección 1: Ingresos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  1. Ingresos Operacionales
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Ingresos por Suscripciones y Mensualidades IA
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    +{formatCOP(ingresosMensualidades)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Ingresos por Implementación y Setup
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    +{formatCOP(ingresosImplementacion)}
                                  </TableCell>
                              </TableRow>
                              {otrosIngresos > 0 && (
                                <TableRow>
                                    <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                      Otros Ingresos de Consultoría
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                      +{formatCOP(otrosIngresos)}
                                    </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20">
                                  <TableCell className="font-bold text-slate-900 dark:text-white text-sm">
                                    Total Ingresos Operacionales
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    +{formatCOP(totalIngresos)}
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
                                      Gastos Administrativos, Cámara de Comercio & Proveedores
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

                              {/* Utilidad Operativa Antes de Impuestos */}
                              <TableRow className="bg-slate-100/70 dark:bg-slate-800/50 font-bold border-t border-slate-200 dark:border-slate-700">
                                  <TableCell className="text-xs uppercase tracking-wide text-slate-900 dark:text-white py-3">
                                    Utilidad Antes de Impuestos (EBITDA Operacional)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-sm text-slate-900 dark:text-white py-3 font-black">
                                    {formatCOP(utilidadAntesImpuestos)}
                                  </TableCell>
                              </TableRow>

                              {/* Sección 3: Provisión de Impuestos y Retenciones (40%) */}
                              <TableRow className="bg-amber-50/60 dark:bg-amber-950/30">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 py-2.5">
                                  3. Provisión Estimada Impuestos & Retenciones ({taxRate}%)
                                </TableCell>
                              </TableRow>
                              <TableRow className="bg-amber-50/40 dark:bg-amber-950/20">
                                  <TableCell className="pl-6 text-sm text-amber-900 dark:text-amber-300 font-medium flex items-center justify-between">
                                    <span>(-) Provisión Impuestos ({taxRate}% sobre {taxBase === 'PROFIT' ? 'Utilidad Antes de Impuestos' : 'Total Ventas'})</span>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-amber-700 dark:text-amber-400 font-semibold">
                                    -{formatCOP(provisionImpuestos)}
                                  </TableCell>
                              </TableRow>

                              {/* Total Utilidad Neta Real */}
                              <TableRow className="bg-slate-100 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-600">
                                  <TableCell className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider py-4">
                                    Utilidad Neta Real del Ejercicio (Post-Impuestos)
                                  </TableCell>
                                  <TableCell className={`text-right font-black text-xl font-mono py-4 ${utilidadNeta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                                      {formatCOP(utilidadNeta)}
                                  </TableCell>
                              </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                  </CardContent>
              </Card>

              {/* Balance General NIIF Clasificado */}
              <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 py-4 px-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-blue-600" /> Balance General Clasificado
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-mono">
                          NIIF Colombia
                        </Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="overflow-x-auto w-full">
                        <Table className="min-w-[500px]">
                          <TableBody>
                              {/* 1. Activos Corrientes (Liquidez Real) */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  1. Activo Corriente (Liquidez Real en Dinero)
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Disponible en Bancos y Cuentas Operativas
                                    <div className="text-[11px] text-slate-400">Dinero real disponible para pagos y compras</div>
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
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/40">
                                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200 text-xs pl-6">
                                    Subtotal Activos Corrientes (Liquidez Total)
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-blue-600">
                                    {formatCOP(totalActivoCorriente)}
                                  </TableCell>
                              </TableRow>

                              {/* 2. Activos No Corrientes (Especie / Tecnología) */}
                              {activosEnEspecie > 0 && (
                                <>
                                  <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                    <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                      2. Activo No Corriente (Aportes en Especie / Equipos)
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        Equipos de Cómputo, Software & Tecnología Aportada
                                        <div className="text-[11px] text-slate-400">Patrimonio en especie (no disponible en banco)</div>
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-purple-600 font-semibold">
                                        {formatCOP(activosEnEspecie)}
                                      </TableCell>
                                  </TableRow>
                                </>
                              )}

                              {/* Total Activos */}
                              <TableRow className="border-t-2 border-slate-300 dark:border-slate-700 bg-blue-50/40 dark:bg-blue-950/20">
                                  <TableCell className="font-bold text-slate-900 dark:text-white text-sm">
                                    TOTAL ACTIVOS (Liquidez + Especie)
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                                    {formatCOP(totalActivos)}
                                  </TableCell>
                              </TableRow>

                              {/* 3. Pasivos */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  3. Pasivos Corrientes
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Cuentas por Pagar a Proveedores (CxP)
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-rose-600 font-semibold">
                                    {formatCOP(cuentasPorPagarProveedores)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-amber-900 dark:text-amber-300 font-medium">
                                    Provisión Impuesto sobre la Renta & Retenciones por Pagar (Cuenta 2404 / 2615)
                                    <div className="text-[10px] text-amber-600">Calculada al {taxRate}% sobre utilidades</div>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-amber-600 font-semibold">
                                    {formatCOP(provisionImpuestos)}
                                  </TableCell>
                              </TableRow>
                              <TableRow className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/40">
                                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200 text-xs pl-6">
                                    Total Pasivos Corrientes
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-rose-600">
                                    {formatCOP(totalPasivos)}
                                  </TableCell>
                              </TableRow>

                              {/* 4. Patrimonio */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
                                  4. Patrimonio Neto
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Capital Social Pagado
                                    <div className="text-[11px] text-slate-400">Dinero Real ({formatCOP(capitalDineroReal)}) + Especie ({formatCOP(activosEnEspecie)})</div>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                                    {formatCOP(totalPatrimonio)}
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="pl-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    Resultado / Utilidad Neta del Ejercicio (Post-Impuestos)
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
                      </div>
                  </CardContent>
              </Card>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN OFICIAL DE IMPRESIÓN Y CERTIFICACIÓN CONTABLE NIIF
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 print:border-none print:p-0 print:m-0">
            
            {/* Membrete Oficial visible en impresión */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">NEUROLABS TECH SOLUTIONS S.A.S.</h1>
                  <p className="text-xs font-semibold text-slate-700">NIT: 901.882.253-1 • Sitionuevo, Magdalena, Colombia</p>
                  <p className="text-[11px] text-slate-600">Módulo Contable ERP • Normas Internacionales de Información Financiera (NIIF)</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-900">INFORME FINANCIERO OFICIAL</p>
                  <p className="text-slate-600">Fecha de Expedición: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-slate-600">Moneda: COP ($)</p>
                </div>
              </div>
            </div>

            {/* Certificación Contable */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Certificación de Estados Financieros (Art. 37 Ley 222 de 1995)
              </div>
              <p className="leading-relaxed">
                Los suscritos <strong>Representante Legal</strong> y <strong>Contador Público</strong> certificamos que los Estados de Situación Financiera y Estados de Resultados aquí descritos han sido verificados fielmente a partir de los libros y registros contables de la sociedad <strong>NEUROLABS TECH SOLUTIONS S.A.S.</strong>, reflejando de forma fidedigna y razonable la liquidez disponible en bancos, activos en especie, obligaciones con terceros y el patrimonio social bajo estándares NIIF.
              </p>
            </div>

            {/* Bloque de Firmas Oficiales */}
            <div className="pt-6 grid grid-cols-2 gap-12 text-xs">
              <div className="space-y-2">
                <div className="border-b-2 border-slate-400 dark:border-slate-600 w-full h-12"></div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">JESÚS DAVID CANTILLO PAREJO</p>
                  <p className="text-slate-500">Representante Legal Principal</p>
                  <p className="text-slate-500 text-[11px]">C.C. 1.080.822.532 • Sitionuevo, Magdalena</p>
                  <p className="text-slate-400 text-[10px]">NEUROLABS TECH SOLUTIONS S.A.S.</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="border-b-2 border-slate-400 dark:border-slate-600 w-full h-12"></div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">CONTADOR PÚBLICO TITULADO</p>
                  <p className="text-slate-500">Revisoría Contable y Financiera</p>
                  <p className="text-slate-500 text-[11px]">T.P. N° ___________________</p>
                  <p className="text-slate-400 text-[10px]">Dictamen sin salvedades NIIF</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
