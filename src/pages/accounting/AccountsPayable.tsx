import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Banknote, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useBills, useCreateBill, useUpdateBillStatus, Bill } from "@/hooks/accounting/useErp";
import { toast } from "sonner";

export default function AccountsPayable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [category, setCategory] = useState<Bill['category']>("SERVICIOS_CLOUD");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const { data: bills, isLoading } = useBills();
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBillStatus();

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !billNumber || !totalAmount || !dueDate) {
        toast.error("Por favor completa los campos obligatorios.");
        return;
    }
    try {
        await createMutation.mutateAsync({
            vendor_name: vendorName,
            bill_number: billNumber,
            category: category,
            issue_date: issueDate,
            due_date: dueDate,
            total_amount: parseFloat(totalAmount),
            status: 'PENDING'
        });
        toast.success("Factura de proveedor registrada.");
        setIsDialogOpen(false);
        setVendorName(""); setBillNumber(""); setTotalAmount(""); setDueDate("");
    } catch (err: any) {
        toast.error("Error al crear: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PAID": return <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-none font-medium">Pagada</Badge>;
      case "OVERDUE": return <Badge variant="destructive" className="font-medium">Vencida</Badge>;
      case "PENDING": return <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 font-medium">Pendiente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBills = bills?.filter(b => 
    b.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.bill_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPagar = bills?.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
  const totalPagado = bills?.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Tesorería & Proveedores
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cuentas por Pagar (CxP)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de obligaciones con proveedores de servidores, licencias y servicios.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-9 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Registrar Obligación (CxP)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Registrar Factura de Proveedor</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3.5 py-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Proveedor / Razón Social *</Label>
                      <Input value={vendorName} onChange={e=>setVendorName(e.target.value)} className="h-9 text-sm mt-1" placeholder="Ej: Amazon Web Services (AWS)" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">No. Factura / Ref *</Label>
                        <Input value={billNumber} onChange={e=>setBillNumber(e.target.value)} className="h-9 text-sm mt-1 font-mono" placeholder="INV-2025-01" required />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Categoría</Label>
                        <select 
                          value={category} 
                          onChange={e=>setCategory(e.target.value as any)}
                          className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        >
                          <option value="SERVICIOS_CLOUD">Servicios Cloud</option>
                          <option value="INFRAESTRUCTURA">Infraestructura & APIs</option>
                          <option value="NOMINA">Nómina y Salarios</option>
                          <option value="HONORARIOS">Honorarios Profesionales</option>
                          <option value="SUMINISTROS">Suministros Oficina</option>
                          <option value="OTRO">Otro Gasto</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Fecha Emisión</Label>
                        <Input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="h-9 text-sm mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Fecha Vencimiento *</Label>
                        <Input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} required className="h-9 text-sm mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Total a Pagar (COP) *</Label>
                      <Input type="number" value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} className="h-9 text-sm font-mono mt-1" placeholder="350000" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold w-full">Guardar Cuenta por Pagar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>Total Pendiente de Pago (CxP)</span>
              <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-md">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600">{formatCOP(totalPagar)}</div>
            <div className="mt-1 text-xs text-slate-500">Deudas activas por cancelar</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>Total Pagado a Proveedores</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">{formatCOP(totalPagado)}</div>
            <div className="mt-1 text-xs text-slate-500">Obligaciones canceladas oportunamente</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Facturas de Proveedores</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input type="search" placeholder="Buscar proveedor..." className="h-9 w-64 pl-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
          ) : filteredBills.length === 0 ? (
             <div className="flex flex-col items-center p-12 text-slate-500">
                 <Banknote className="h-10 w-10 mb-2 opacity-50" />
                 <p className="text-sm font-semibold">No hay cuentas por pagar registradas</p>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase text-slate-600">Fecha Emisión</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-slate-600">No. Factura</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-slate-600">Proveedor</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-slate-600">Categoría</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-slate-600">Vencimiento</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase text-slate-600">Total (COP)</TableHead>
                  <TableHead className="text-center font-bold text-xs uppercase text-slate-600">Estado</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase text-slate-600">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <TableCell className="text-xs font-mono">{bill.issue_date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{bill.bill_number}</TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">{bill.vendor_name}</TableCell>
                    <TableCell className="text-xs text-slate-500"><Badge variant="outline">{bill.category}</Badge></TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{bill.due_date}</TableCell>
                    <TableCell className="text-right text-sm font-mono font-bold text-slate-900 dark:text-white">{formatCOP(bill.total_amount)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(bill.status)}</TableCell>
                    <TableCell className="text-right">
                        {bill.status !== 'PAID' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40" onClick={() => updateMutation.mutate({ id: bill.id, status: 'PAID' })}>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marcar Pago
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
