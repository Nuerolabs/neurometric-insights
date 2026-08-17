import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Building2, 
  DollarSign, 
  Printer,
  FileText
} from "lucide-react";
import { 
  useInvoices, 
  useCreateInvoice, 
  useUpdateInvoiceStatus, 
  useClients, 
  useCreateClient,
  Client,
  InvoiceConceptType
} from "@/hooks/accounting/useErp";
import { toast } from "sonner";

export default function AccountsReceivable() {
  const [activeTab, setActiveTab] = useState<"invoices" | "clients">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<any | null>(null);

  // Form State: Invoice
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [conceptType, setConceptType] = useState<InvoiceConceptType>("RECURRING_MONTHLY");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("600000");

  // Form State: Client
  const [newClientName, setNewClientName] = useState("");
  const [newClientDoc, setNewClientDoc] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientService, setNewClientService] = useState("");
  const [newClientImplementationFee, setNewClientImplementationFee] = useState("2500000");
  const [newClientMonthlyFee, setNewClientMonthlyFee] = useState("600000");
  const [newClientBillingDay, setNewClientBillingDay] = useState("5");

  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: clients, isLoading: loadingClients } = useClients();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoiceStatus();
  const createClientMutation = useCreateClient();

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Crear Factura manual
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber || !totalAmount || !dueDate) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      await createInvoiceMutation.mutateAsync({
        client_name: clientName,
        invoice_number: invoiceNumber,
        concept_type: conceptType,
        description: description || (conceptType === 'RECURRING_MONTHLY' ? 'Cobro mensualidad recurrente de servicio' : 'Implementación y puesta en marcha'),
        issue_date: issueDate,
        due_date: dueDate,
        total_amount: parseFloat(totalAmount),
        status: 'DRAFT'
      });
      toast.success("Factura emitida exitosamente.");
      setIsInvoiceDialogOpen(false);
      setClientName("");
      setInvoiceNumber("");
      setDescription("");
      setTotalAmount("600000");
      setDueDate("");
    } catch (err: any) {
      toast.error("Error al crear factura: " + err.message);
    }
  };

  // Crear Cliente Corporativo
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientDoc) {
      toast.error("Ingresa la razón social y el NIT/Identificación");
      return;
    }

    try {
      await createClientMutation.mutateAsync({
        name: newClientName,
        document_id: newClientDoc,
        contact_person: newClientContact,
        email: newClientEmail,
        phone: newClientPhone,
        service_description: newClientService || "Servicio de Inteligencia Artificial y ERP NeuroLabs",
        implementation_fee: parseFloat(newClientImplementationFee) || 0,
        monthly_fee: parseFloat(newClientMonthlyFee) || 600000,
        billing_day: parseInt(newClientBillingDay) || 5,
        status: 'ACTIVE'
      });

      toast.success("Cliente registrado con contrato activo");
      setIsClientDialogOpen(false);
      setNewClientName("");
      setNewClientDoc("");
      setNewClientContact("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientService("");
    } catch (err: any) {
      toast.error("Error al registrar cliente: " + err.message);
    }
  };

  // Generar Factura Rápida desde Cliente
  const handleQuickInvoice = async (client: Client, type: 'IMPLEMENTATION' | 'RECURRING_MONTHLY') => {
    const nextSeq = (invoices?.length || 0) + 1;
    const invNum = `FAC-2025-${String(nextSeq).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    
    const due = new Date();
    due.setDate(due.getDate() + 15);
    const dueDateStr = due.toISOString().split('T')[0];

    const amount = type === 'IMPLEMENTATION' ? client.implementation_fee : client.monthly_fee;
    const desc = type === 'IMPLEMENTATION'
      ? `Servicio de Implementación y Setup - ${client.service_description}`
      : `Mensualidad Recurrente ($${amount.toLocaleString('es-CO')} COP) - ${client.service_description}`;

    try {
      await createInvoiceMutation.mutateAsync({
        client_id: client.id,
        client_name: client.name,
        invoice_number: invNum,
        concept_type: type,
        description: desc,
        issue_date: today,
        due_date: dueDateStr,
        total_amount: amount,
        status: 'DRAFT',
        notes: `Cobro automático para día ${client.billing_day} del mes`
      });

      toast.success(`Factura ${invNum} generada para ${client.name} por ${formatCOP(amount)}`);
      setActiveTab("invoices");
    } catch (err: any) {
      toast.error("Error al generar factura rápida: " + err.message);
    }
  };

  const handleMarkPaid = async (id: string, clientName: string, amount: number) => {
    try {
      await updateInvoiceMutation.mutateAsync({ id, status: 'PAID' });
      toast.success(`Pago registrado: ${formatCOP(amount)} de ${clientName}`);
    } catch (err: any) {
      toast.error("Error al registrar pago");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PAID": 
        return <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-none font-medium">Pagada</Badge>;
      case "OVERDUE": 
        return <Badge variant="destructive" className="font-medium">Vencida</Badge>;
      case "DRAFT": 
        return <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 font-medium">Pendiente</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConceptBadge = (type: InvoiceConceptType) => {
    switch(type) {
      case "RECURRING_MONTHLY":
        return <Badge className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-none">Mensualidad ($600k)</Badge>;
      case "IMPLEMENTATION":
        return <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-none">Implementación</Badge>;
      case "CONSULTING":
        return <Badge className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-none">Consultoría</Badge>;
      default:
        return <Badge variant="secondary">Servicio</Badge>;
    }
  };

  const filteredInvoices = invoices?.filter(i => 
    i.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredClients = clients?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalCobrar = invoices?.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;
  const totalRecaudado = invoices?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total_amount || 0), 0) || 0;
  const totalMRR = clients?.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + Number(c.monthly_fee || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Módulo de Clientes & Facturación
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Facturación y Gestión de Clientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de contratos, cobros por implementación y mensualidades recurrentes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                <Building2 className="h-4 w-4 mr-1.5 text-blue-600" />
                Registrar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleCreateClient}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Registrar Nuevo Cliente Corporativo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3.5 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Razón Social / Empresa *</Label>
                      <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej: Inversiones Globales S.A.S." required className="h-9 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">NIT / Identificación *</Label>
                      <Input value={newClientDoc} onChange={e => setNewClientDoc(e.target.value)} placeholder="901.345.678-9" required className="h-9 text-sm mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Persona de Contacto</Label>
                      <Input value={newClientContact} onChange={e => setNewClientContact(e.target.value)} placeholder="Nombre del gerente o líder" className="h-9 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Teléfono / WhatsApp</Label>
                      <Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+57 300 000 0000" className="h-9 text-sm mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Correo Electrónico de Facturación</Label>
                    <Input type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="facturacion@empresa.com" className="h-9 text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Servicio / Solución Contratada</Label>
                    <Input value={newClientService} onChange={e => setNewClientService(e.target.value)} placeholder="Ej: Agente IA Automatizado + ERP NeuroLabs" className="h-9 text-sm mt-1" />
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Implementación (Setup)</Label>
                      <Input type="number" value={newClientImplementationFee} onChange={e => setNewClientImplementationFee(e.target.value)} className="h-9 text-sm font-mono mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-blue-600 dark:text-blue-400">Mensualidad (Recurrente)</Label>
                      <Input type="number" value={newClientMonthlyFee} onChange={e => setNewClientMonthlyFee(e.target.value)} className="h-9 text-sm font-mono mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Día de Cobro</Label>
                      <Input type="number" min="1" max="31" value={newClientBillingDay} onChange={e => setNewClientBillingDay(e.target.value)} className="h-9 text-sm font-mono mt-1" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full">Guardar y Activar Contrato</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" /> Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleCreateInvoice}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Emitir Factura de Cobro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3.5 py-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Cliente / Razón Social *</Label>
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej: Inversiones y Servicios Nova S.A.S." required className="h-9 text-sm mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">No. Factura *</Label>
                      <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder={`FAC-2025-${String((invoices?.length || 0) + 1).padStart(3, '0')}`} required className="h-9 text-sm mt-1 font-mono" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Tipo de Concepto</Label>
                      <select value={conceptType} onChange={e => setConceptType(e.target.value as InvoiceConceptType)} className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        <option value="RECURRING_MONTHLY">Mensualidad Recurrente ($600k)</option>
                        <option value="IMPLEMENTATION">Implementación y Setup</option>
                        <option value="CONSULTING">Consultoría / Desarrollo</option>
                        <option value="OTHER">Otro Servicio</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Descripción del Servicio</Label>
                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalle del cobro o período" className="h-9 text-sm mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Fecha de Emisión</Label>
                      <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-9 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Fecha de Vencimiento *</Label>
                      <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="h-9 text-sm mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Monto Total a Cobrar (COP) *</Label>
                    <Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="600000" required className="h-9 text-sm font-mono mt-1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold w-full">Emitir y Registrar Factura</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>MRR (Ingreso Recurrente Mensual)</span>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-mono">{formatCOP(totalMRR)}</div>
            <div className="mt-1 text-xs text-slate-500">Suscripciones activas de clientes</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>Recaudado Total (Histórico)</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{formatCOP(totalRecaudado)}</div>
            <div className="mt-1 text-xs text-slate-500">Ingresos confirmados y aplicados a caja</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>Cartera Pendiente por Cobrar</span>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-md"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono">{formatCOP(totalCobrar)}</div>
            <div className="mt-1 text-xs text-slate-500">Facturas emitidas en espera de pago</div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg">
            <TabsTrigger value="invoices" className="text-xs font-bold px-4 py-2"><Receipt className="w-3.5 h-3.5 mr-1.5" /> Facturas Emitidas ({invoices?.length || 0})</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs font-bold px-4 py-2"><Building2 className="w-3.5 h-3.5 mr-1.5" /> Clientes y Contratos ({clients?.length || 0})</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder={activeTab === 'invoices' ? "Buscar factura o cliente..." : "Buscar cliente o NIT..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
          </div>
        </div>
        <TabsContent value="invoices" className="m-0">
          <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">No. Factura</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Cliente / Empresa</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Concepto</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Valor Total</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Estado</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvoices ? <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow> : filteredInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-mono font-bold text-xs">{inv.invoice_number}</TableCell>
                        <TableCell className="font-medium text-sm">{inv.client_name}<div className="text-xs text-slate-400">{inv.description}</div></TableCell>
                        <TableCell>{getConceptBadge(inv.concept_type)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm">{formatCOP(inv.total_amount)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'PAID' && (<Button size="sm" variant="outline" onClick={() => handleMarkPaid(inv.id, inv.client_name, inv.total_amount)} className="h-7 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marcar Pago</Button>)}
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInvoiceForReceipt(inv)} className="h-7 text-xs"><FileText className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clients" className="m-0">
          <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Empresa / Razón Social</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Mensualidad</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Día Cobro</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Generar Cobro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingClients ? <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow> : filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-semibold text-sm">{client.name}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm text-blue-600">{formatCOP(client.monthly_fee)}/mes</TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="font-mono text-xs">Día {client.billing_day}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => handleQuickInvoice(client, 'RECURRING_MONTHLY')} className="h-7 text-xs font-semibold text-blue-700 bg-blue-50">+ Mensualidad</Button>
                            <Button size="sm" variant="outline" onClick={() => handleQuickInvoice(client, 'IMPLEMENTATION')} className="h-7 text-xs font-semibold text-purple-700 bg-purple-50">+ Setup</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {selectedInvoiceForReceipt && (
        <Dialog open={!!selectedInvoiceForReceipt} onOpenChange={() => setSelectedInvoiceForReceipt(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle className="text-base font-bold flex items-center justify-between">Comprobante de Facturación <span className="font-mono text-xs text-blue-600">{selectedInvoiceForReceipt.invoice_number}</span></DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 text-sm border-t border-b">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between"><span>Cliente:</span><span className="font-bold">{selectedInvoiceForReceipt.client_name}</span></div>
                <div className="flex justify-between"><span>Total:</span><span className="text-lg font-mono text-emerald-600">{formatCOP(selectedInvoiceForReceipt.total_amount)}</span></div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center"><Button variant="ghost" onClick={() => setSelectedInvoiceForReceipt(null)}>Cerrar</Button><Button onClick={() => window.print()} className="bg-slate-900"><Printer className="w-4 h-4 mr-1.5" /> Imprimir</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
