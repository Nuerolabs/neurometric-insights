import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Banknote, Loader2 } from "lucide-react";
import { useBills, useCreateBill, useUpdateBillStatus } from "@/hooks/accounting/useErp";
import { toast } from "sonner";

export default function AccountsPayable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const { data: bills, isLoading, isError } = useBills();
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBillStatus();

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
      case "PAID": return <Badge className="bg-emerald-100 text-emerald-800 border-none">Pagada</Badge>;
      case "OVERDUE": return <Badge variant="destructive">Vencida</Badge>;
      case "PENDING": return <Badge variant="outline" className="bg-rose-100 text-rose-800 border-none">Pendiente de Pago</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBills = bills?.filter(b => 
    b.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.bill_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPagar = bills?.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cuentas por Pagar (CxP)</h1>
          <p className="text-sm text-slate-500">Registro de facturas de proveedores y programación de pagos.</p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Registrar CxP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Registrar Deuda / Factura</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Proveedor</Label>
                      <Input value={vendorName} onChange={e=>setVendorName(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Nombre Comercial" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">No. Factura</Label>
                      <Input value={billNumber} onChange={e=>setBillNumber(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="INV-1234" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">F. Emisión</Label>
                      <Input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">F. Vencim.</Label>
                      <Input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Total ($)</Label>
                      <Input type="number" step="0.01" value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-rose-600 text-white" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase text-slate-500">Total Obligaciones por Pagar</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold text-rose-600">${totalPagar.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 pt-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Facturas de Proveedores</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input type="search" placeholder="Buscar proveedor..." className="h-8 w-64 pl-8 text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
          ) : filteredBills.length === 0 ? (
             <div className="flex flex-col items-center p-12 text-slate-500">
                 <Banknote className="h-10 w-10 mb-2 opacity-50" />
                 <p className="text-sm font-semibold">No hay deudas registradas</p>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="text-xs h-9">Fecha</TableHead>
                  <TableHead className="text-xs h-9">No. Factura</TableHead>
                  <TableHead className="text-xs h-9">Proveedor</TableHead>
                  <TableHead className="text-xs h-9">Vencimiento</TableHead>
                  <TableHead className="text-right text-xs h-9">Total</TableHead>
                  <TableHead className="text-center text-xs h-9">Estado</TableHead>
                  <TableHead className="h-9"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="text-xs">{bill.issue_date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-700">{bill.bill_number}</TableCell>
                    <TableCell className="text-xs font-semibold">{bill.vendor_name}</TableCell>
                    <TableCell className="text-xs text-rose-500">{bill.due_date}</TableCell>
                    <TableCell className="text-right text-xs font-bold">${Number(bill.total_amount).toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(bill.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                        {bill.status !== 'PAID' && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-emerald-600 hover:bg-emerald-50" onClick={() => updateMutation.mutate({ id: bill.id, status: 'PAID' })}>
                                Marcar Pagada
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
