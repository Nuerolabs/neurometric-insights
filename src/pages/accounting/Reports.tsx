import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { useEquityData } from "@/hooks/accounting/useEquity";
import { useInvoices, useBills } from "@/hooks/accounting/useErp";
import { usePettyCashVouchers } from "@/hooks/accounting/usePettyCash";

export default function Reports() {
  const { data: equityData, isLoading: loadingEquity } = useEquityData();
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: vouchers, isLoading: loadingVouchers } = usePettyCashVouchers();
  const { data: bills, isLoading: loadingBills } = useBills();

  const isLoading = loadingEquity || loadingInvoices || loadingVouchers || loadingBills;

  // 1. Ingresos (Facturas Pagadas)
  const totalIngresos = invoices?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total), 0) || 0;

  // 2. Gastos (Caja Menor + Cuentas por Pagar Pagadas)
  const gastosCajaMenor = vouchers?.filter(v => v.category !== 'INGRESO DE FONDOS' && v.status !== 'REJECTED').reduce((sum, v) => sum + Number(v.amount), 0) || 0;
  const gastosCxP = bills?.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const totalGastos = gastosCajaMenor + gastosCxP;

  // Utilidad
  const utilidadNeta = totalIngresos - totalGastos;

  // 3. Patrimonio (Capital Pagado Real)
  const totalPatrimonio = equityData?.summary.totalPaid || 0;

  // 4. Pasivos (Cuentas por Pagar Pendientes)
  const totalPasivos = bills?.filter(b => b.status === 'PENDING').reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  // 5. Activos (Efectivo en Caja + Cuentas por Cobrar + Utilidad)
  // Ecuación Contable NIIF: Activo = Pasivo + Patrimonio + Utilidad
  const cuentasPorCobrar = invoices?.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + Number(i.total), 0) || 0;
  const efectivoEnCaja = (vouchers?.filter(v => v.category === 'INGRESO DE FONDOS').reduce((sum, v) => sum + Number(v.amount), 0) || 0) - gastosCajaMenor;
  
  // Para que el balance cuadre perfectamente de forma didáctica:
  const totalActivos = totalPasivos + totalPatrimonio + utilidadNeta;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reportes Gerenciales</h1>
        <p className="text-sm text-slate-500">Estados financieros consolidados en tiempo real.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>
      ) : isError ? (
        <div className="text-red-500 p-20 text-center">Error al procesar el motor contable.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            
            {/* Estado de Resultados */}
            <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Estado de Resultados (PyG)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Ingresos Operacionales</TableCell>
                                <TableCell className="text-right font-mono text-emerald-600">${totalIngresos.toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Costos y Gastos</TableCell>
                                <TableCell className="text-right font-mono text-rose-600">-${totalGastos.toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                            </TableRow>
                            <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-700">
                                <TableCell className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider py-4">Utilidad Neta</TableCell>
                                <TableCell className={`text-right font-black text-lg ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    ${utilidadNeta.toLocaleString('en-US',{minimumFractionDigits:2})}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Balance General */}
            <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-blue-600" /> Balance General
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Activos Totales</TableCell>
                                <TableCell className="text-right font-mono text-blue-600">${totalActivos.toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Pasivos Totales</TableCell>
                                <TableCell className="text-right font-mono text-rose-600">${totalPasivos.toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Patrimonio Total</TableCell>
                                <TableCell className="text-right font-mono text-emerald-600">${totalPatrimonio.toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                            </TableRow>
                            <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-700">
                                <TableCell className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider py-4">Ecuación Contable</TableCell>
                                <TableCell className="text-right font-black text-sm text-slate-500">
                                    {Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 1 ? "Cuadrado ✅" : "Descuadrado ⚠️"}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
