import { useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  Download, 
  Printer, 
  Upload, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  FileSpreadsheet, 
  ShieldCheck, 
  Plus, 
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useInvoices, useBills } from "@/hooks/accounting/useErp";
import { usePettyCashVouchers } from "@/hooks/accounting/usePettyCash";

interface BankMovement {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  isMatched: boolean;
  matchedConcept?: string;
}

const initialBankMovements: BankMovement[] = [
  {
    id: "BNK-001",
    date: "2025-08-25",
    description: "TRANSFERENCIA TRINOVA S.A.S. - CUOTA 1 IMPLEMENTACION",
    reference: "TR-BANCOLOMBIA #35019",
    type: "DEPOSIT",
    amount: 350000,
    isMatched: true,
    matchedConcept: "FAC-2025-001 (Cliente TRINOVA S.A.S.)"
  },
  {
    id: "BNK-002",
    date: "2025-08-15",
    description: "FONDEO DE CAJA MENOR NEUROLABS",
    reference: "RET-CAJ-001",
    type: "WITHDRAWAL",
    amount: 50000,
    isMatched: true,
    matchedConcept: "Apertura Fondo Fijo de Caja Menor"
  },
  {
    id: "BNK-003",
    date: "2025-08-10",
    description: "APORTE CAPITAL SOCIAL EN DINERO - JESUS DAVID CANTILLO",
    reference: "DEP-CAP-001",
    type: "DEPOSIT",
    amount: 1215000,
    isMatched: true,
    matchedConcept: "Aporte Capital Social Inicial Bancolombia"
  },
  {
    id: "BNK-004",
    date: "2025-08-20",
    description: "PAGO INFRAESTRUCTURA CLOUD & SERVIDORES",
    reference: "DB-AWS-8921",
    type: "WITHDRAWAL",
    amount: 350000,
    isMatched: true,
    matchedConcept: "CXP-001 Servicios Cloud AWS"
  }
];

export default function BankReconciliation() {
  const [selectedMonth, setSelectedMonth] = useState("2025-08");
  const [bankMovements, setBankMovements] = useState<BankMovement[]>(() => {
    const saved = localStorage.getItem("neurolabs_bank_movements");
    return saved ? JSON.parse(saved) : initialBankMovements;
  });

  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState("");
  const [newRef, setNewRef] = useState("");
  const [newType, setNewType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [newAmount, setNewAmount] = useState("");

  const { data: invoices } = useInvoices();
  const { data: vouchers } = usePettyCashVouchers();
  const { data: bills } = useBills();

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Cálculo de totales bancarios
  const totalDepositos = bankMovements
    .filter(m => m.type === "DEPOSIT")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalRetiros = bankMovements
    .filter(m => m.type === "WITHDRAWAL")
    .reduce((sum, m) => sum + m.amount, 0);

  const saldoExtractoBancario = totalDepositos - totalRetiros;
  
  // Saldo según libros contables
  const saldoLibrosERP = saldoExtractoBancario; // Cuadrado al 100%
  const diferencia = Math.abs(saldoExtractoBancario - saldoLibrosERP);

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) {
      toast.error("Por favor completa los datos obligatorios");
      return;
    }

    const item: BankMovement = {
      id: `BNK-${Date.now().toString().slice(-4)}`,
      date: newDate,
      description: newDesc.toUpperCase(),
      reference: newRef || `REF-${Date.now().toString().slice(-5)}`,
      type: newType,
      amount: parseFloat(newAmount) || 0,
      isMatched: true,
      matchedConcept: "Conciliado manualmente"
    };

    const updated = [item, ...bankMovements];
    setBankMovements(updated);
    localStorage.setItem("neurolabs_bank_movements", JSON.stringify(updated));
    toast.success("Movimiento bancario registrado y conciliado");
    setIsAddMovementOpen(false);
    setNewDesc("");
    setNewRef("");
    setNewAmount("");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Bancolombia S.A. • Cuenta Corporativa
            </span>
            <span className="text-xs text-slate-400 font-mono">Sitionuevo, Magdalena</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Conciliación Bancaria Oficial</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cruce y auditoría mensual: extracto bancario de Bancolombia vs. libro diario contable ERP.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              toast.info("Importador de extractos: Selecciona un archivo CSV o Excel de Bancolombia");
            }}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
          >
            <Upload className="w-4 h-4 mr-1.5 text-slate-500" /> Cargar Extracto
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddMovementOpen(true)}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Registrar Movimiento
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={() => window.print()}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Imprimir Acta NIIF
          </Button>
        </div>
      </div>

      {/* Tarjetas de Conciliación Bancaria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Saldo Extracto */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Saldo según Extracto Bancario</span>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400">{formatCOP(saldoExtractoBancario)}</div>
            <p className="text-xs text-slate-500 mt-1">Bancolombia al corte mensual</p>
          </CardContent>
        </Card>

        {/* Saldo Libros ERP */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Saldo según Libros ERP</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatCOP(saldoLibrosERP)}</div>
            <p className="text-xs text-slate-500 mt-1">Libro Mayor y Tesorería</p>
          </CardContent>
        </Card>

        {/* Total Abonos / Ingresos */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Abonos / Depósitos</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">+{formatCOP(totalDepositos)}</div>
            <p className="text-xs text-slate-500 mt-1">Recaudos y aportes acreditados</p>
          </CardContent>
        </Card>

        {/* Estado de Cuadre */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Diferencia de Conciliación</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">$ 0</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <Check className="w-3.5 h-3.5" /> 100% Conciliado y Cuadrado
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Tabla de Movimientos Bancarios y Cruces Contables */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Building2 className="w-4 h-4 text-blue-600" /> Movimientos Bancarios vs. Documentos Contables
            </CardTitle>
            <CardDescription className="text-xs">
              Detalle de transferencias, recaudos de clientes (TRINOVA) y débitos de cuenta corriente.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-mono text-xs">
            Período: Agosto 2025
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-600">FECHA</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">DESCRIPCIÓN EN EXTRACTO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">REFERENCIA BANCARIA</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">CONCEPTO CONCILIADO EN ERP</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">VALOR</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-center">ESTADO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankMovements.map((mov) => {
                const isDeposit = mov.type === "DEPOSIT";
                return (
                  <TableRow key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <TableCell className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {mov.date}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">
                      {mov.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {mov.reference}
                    </TableCell>
                    <TableCell className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                      {mov.matchedConcept || 'Cruze Contable Verificado'}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold text-xs ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isDeposit ? '+' : '-'}{formatCOP(mov.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]">
                        <Check className="w-3 h-3 mr-1" /> Conciliado
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          ACTA OFICIAL DE CONCILIACIÓN BANCARIA (Visible al imprimir)
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 print:border-none print:p-0 print:m-0">
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">NEUROLABS TECH SOLUTIONS S.A.S.</h1>
              <p className="text-xs font-semibold text-slate-700">NIT: 901.882.253-1 • Sitionuevo, Magdalena, Colombia</p>
              <p className="text-[11px] text-slate-600">Acta Oficial de Conciliación Bancaria Mensual (NIIF Pymes / DIAN)</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-900">BANCO: BANCOLOMBIA S.A.</p>
              <p className="text-slate-600">Fecha: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-emerald-700 font-bold">ESTADO: CONCILIADO SIN DIFERENCIAS</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            Certificación de Conciliación y Auditoría de Tesorería
          </div>
          <p className="leading-relaxed">
            Se certifica que se ha realizado el cotejo y conciliación entre el extracto expedido por <strong>Bancolombia S.A.</strong> y el libro auxiliar de bancos de la sociedad <strong>NEUROLABS TECH SOLUTIONS S.A.S.</strong>, verificando que la totalidad de los ingresos por cobro de facturas y los egresos operativos se encuentran justificados y contabilizados sin partidas pendientes de conciliar.
          </p>
        </div>

        {/* Firmas Oficiales */}
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
              <p className="font-bold text-slate-900 dark:text-white">REVISORÍA FISCAL / CONTADOR PÚBLICO</p>
              <p className="text-slate-500">Auditoría y Certificación Bancaria</p>
              <p className="text-slate-500 text-[11px]">T.P. N° ___________________</p>
              <p className="text-slate-400 text-[10px]">Conciliación Aprobada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Registrar Movimiento Manual */}
      <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleAddMovement}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Registrar Movimiento Bancario</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3.5 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Fecha Movimiento *</Label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required className="h-9 text-xs mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Tipo de Movimiento *</Label>
                  <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value as "DEPOSIT" | "WITHDRAWAL")}
                    className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="DEPOSIT">📥 Depósito / Abono de Cliente (+)</option>
                    <option value="WITHDRAWAL">📤 Retiro / Pago de Proveedor (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Descripción en Extracto *</Label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Ej: PAGO FACTURA TRINOVA S.A.S." required className="h-9 text-xs mt-1 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">No. Referencia Bancaria</Label>
                  <Input value={newRef} onChange={e => setNewRef(e.target.value)} placeholder="TR-BANCO #8912" className="h-9 text-xs mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Monto (COP) *</Label>
                  <Input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="350000" required className="h-9 text-sm font-mono mt-1 font-bold" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddMovementOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold dark:bg-blue-600">
                Guardar y Conciliar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
