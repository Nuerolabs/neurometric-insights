import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Receipt, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus } from "@/hooks/accounting/useErp";
import { toast } from "sonner";

export default function AccountsReceivable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const { data: invoices, isLoading, isError } = useInvoices();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoiceStatus();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber || !totalAmount || !dueDate) {
        toast.error("Por favor completa los campos obligatorios.");
        return;
    }
    try {
        await createMutation.mutateAsync({
            client_name: clientName,
            invoice_number: invoiceNumber,
            issue_date: issueDate,
            due_date: dueDate,
            total_amount: parseFloat(totalAmount),
            status: 'DRAFT'
        });
        toast.success("Factura creada exitosamente.");
        setIsDialogOpen(false);
        setClientName(""); setInvoiceNumber(""); setTotalAmount(""); setDueDate("");
    } catch (err: any) {
        toast.error("Error al crear: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PAID": return <Badge className="bg-emerald-100 text-emerald-800 border-none">Pagada</Badge>;
      case "OVERDUE": return <Badge variant="destructive">Vencida</Badge>;
      case "DRAFT": return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-none">Pendiente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices?.filter(i => 
    i.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalCobrar = invoices?.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.total_amount), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Facturación y Cuentas por Cobrar</h1>
          <p className="text-sm text-slate-500">Emisión de facturas a clientes y control de cartera.</p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Nueva Factura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Emitir Factura</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Cliente</Label>
                      <Input value={clientName} onChange={e=>setClientName(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Razón Social" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">No. Factura</Label>
                      <Input value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="FAC-001" />
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
                    <Button type="submit" size="sm" className="bg-blue-600 text-white" disabled={createMutation.isPending}>
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
            <CardTitle className="text-[11px] font-bold uppercase text-slate-500">Cartera Pendiente de Cobro</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold text-blue-600">${totalCobrar.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 pt-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Facturas Emitidas</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input type="search" placeholder="Buscar cliente..." className="h-8 w-64 pl-8 text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
          ) : filteredInvoices.length === 0 ? (
             <div className="flex flex-col items-center p-12 text-slate-500">
                 <Receipt className="h-10 w-10 mb-2 opacity-50" />
                 <p className="text-sm font-semibold">No hay facturas</p>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="text-xs h-9">Fecha</TableHead>
                  <TableHead className="text-xs h-9">No. Factura</TableHead>
                  <TableHead className="text-xs h-9">Cliente</TableHead>
                  <TableHead className="text-xs h-9">Vencimiento</TableHead>
                  <TableHead className="text-right text-xs h-9">Total</TableHead>
                  <TableHead className="text-center text-xs h-9">Estado</TableHead>
                  <TableHead className="h-9"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs">{inv.issue_date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-700">{inv.invoice_number}</TableCell>
                    <TableCell className="text-xs font-semibold">{inv.client_name}</TableCell>
                    <TableCell className="text-xs text-rose-500">{inv.due_date}</TableCell>
                    <TableCell className="text-right text-xs font-bold">${Number(inv.total_amount).toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                        {inv.status !== 'PAID' && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-emerald-600 hover:bg-emerald-50" onClick={() => updateMutation.mutate({ id: inv.id, status: 'PAID' })}>
                                Marcar Cobrada
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
