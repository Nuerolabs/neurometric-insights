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
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientDoc, setClientDoc] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
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

  // Autocompletar datos cuando se selecciona un cliente registrado
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId || clientId === "custom") {
      return;
    }
    const found = clients?.find(c => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientDoc(found.document_id);
      setClientContact(found.contact_person || "");
      setClientEmail(found.email || "");
      setClientPhone(found.phone || "");
      setTotalAmount(found.monthly_fee ? found.monthly_fee.toString() : "600000");
      setDescription(`Servicio de tecnología e Inteligencia Artificial - ${found.name}`);
    }
  };

  // Helper para extraer datos del cliente desde las notas de la factura
  const parseInvoiceClientMeta = (inv: any) => {
    if (!inv) return { doc: '', contact: '', email: '', phone: '' };
    try {
      if (inv.notes && inv.notes.startsWith('{')) {
        const parsed = JSON.parse(inv.notes);
        return {
          doc: parsed.client_doc || '',
          contact: parsed.contact_person || '',
          email: parsed.email || '',
          phone: parsed.phone || ''
        };
      }
    } catch {}
    // Fallback buscando en la lista de clientes
    const matchedClient = clients?.find(c => c.name.toLowerCase() === inv.client_name?.toLowerCase());
    if (matchedClient) {
      return {
        doc: matchedClient.document_id,
        contact: matchedClient.contact_person,
        email: matchedClient.email,
        phone: matchedClient.phone
      };
    }
    return { doc: '', contact: '', email: '', phone: '' };
  };

  // Crear Factura manual con datos completos de la empresa y representante
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber || !totalAmount || !dueDate) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      const metaNotes = JSON.stringify({
        client_doc: clientDoc,
        contact_person: clientContact,
        email: clientEmail,
        phone: clientPhone
      });

      await createInvoiceMutation.mutateAsync({
        client_name: clientName,
        client_id: selectedClientId && selectedClientId !== 'custom' ? selectedClientId : undefined,
        invoice_number: invoiceNumber,
        concept_type: conceptType,
        description: description || (conceptType === 'RECURRING_MONTHLY' ? 'Cobro mensualidad recurrente de servicio' : 'Implementación y puesta en marcha'),
        issue_date: issueDate,
        due_date: dueDate,
        total_amount: parseFloat(totalAmount),
        status: 'DRAFT',
        notes: metaNotes
      });

      // Si es un cliente nuevo y tiene NIT, guardarlo automáticamente en la cartera de clientes
      if ((!selectedClientId || selectedClientId === 'custom') && clientDoc && !clients?.some(c => c.document_id === clientDoc)) {
        try {
          await createClientMutation.mutateAsync({
            name: clientName,
            document_id: clientDoc,
            contact_person: clientContact,
            email: clientEmail,
            phone: clientPhone,
            service_description: description || "Servicio NeuroLabs",
            implementation_fee: 0,
            monthly_fee: parseFloat(totalAmount) || 600000,
            billing_day: 5,
            status: 'ACTIVE'
          });
        } catch {}
      }

      toast.success("Factura emitida y registrada exitosamente.");
      setIsInvoiceDialogOpen(false);
      setSelectedClientId("");
      setClientName("");
      setClientDoc("");
      setClientContact("");
      setClientEmail("");
      setClientPhone("");
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
            <DialogContent className="sm:max-w-[560px]">
              <form onSubmit={handleCreateInvoice}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Emitir Factura de Cobro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3.5 py-4 max-h-[75vh] overflow-y-auto pr-1">
                  
                  {/* Selector de Cliente Registrado */}
                  {clients && clients.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Seleccionar Cliente Existente (Opcional)</Label>
                      <select 
                        value={selectedClientId} 
                        onChange={e => handleSelectClient(e.target.value)}
                        className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
                      >
                        <option value="custom">-- Escribir cliente nuevo manualmente --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (NIT: {c.document_id}) {c.contact_person ? `- Rep: ${c.contact_person}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Datos Corporativos del Cliente */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Datos de la Empresa / Cliente Adquirente
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Cliente / Razón Social *</Label>
                        <Input 
                          value={clientName} 
                          onChange={e => setClientName(e.target.value)} 
                          placeholder="Ej: Inversiones Globales S.A.S." 
                          required 
                          className="h-9 text-sm mt-1" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">NIT / Identificación *</Label>
                        <Input 
                          value={clientDoc} 
                          onChange={e => setClientDoc(e.target.value)} 
                          placeholder="Ej: 901.345.678-9" 
                          required 
                          className="h-9 text-sm mt-1 font-mono" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Representante Legal / Contacto *</Label>
                        <Input 
                          value={clientContact} 
                          onChange={e => setClientContact(e.target.value)} 
                          placeholder="Ej: Carlos Mendoza (Representante)" 
                          className="h-9 text-sm mt-1" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Correo Electrónico</Label>
                        <Input 
                          type="email" 
                          value={clientEmail} 
                          onChange={e => setClientEmail(e.target.value)} 
                          placeholder="facturacion@empresa.com" 
                          className="h-9 text-sm mt-1" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Datos de la Factura */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">No. Factura *</Label>
                      <Input 
                        value={invoiceNumber} 
                        onChange={e => setInvoiceNumber(e.target.value)} 
                        placeholder={`FAC-2025-${String((invoices?.length || 0) + 1).padStart(3, '0')}`} 
                        required 
                        className="h-9 text-sm mt-1 font-mono" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Tipo de Concepto</Label>
                      <select 
                        value={conceptType} 
                        onChange={e => setConceptType(e.target.value as InvoiceConceptType)} 
                        className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
                      >
                        <option value="RECURRING_MONTHLY">Mensualidad Recurrente</option>
                        <option value="IMPLEMENTATION">Implementación y Setup</option>
                        <option value="CONSULTING">Consultoría / Desarrollo</option>
                        <option value="OTHER">Otro Servicio</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Descripción del Servicio / Cobro</Label>
                    <Input 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Detalle del servicio o mes facturado" 
                      className="h-9 text-sm mt-1" 
                    />
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
                    <Input 
                      type="number" 
                      value={totalAmount} 
                      onChange={e => setTotalAmount(e.target.value)} 
                      placeholder="600000" 
                      required 
                      className="h-9 text-sm font-mono mt-1 font-bold text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold w-full dark:bg-blue-600">
                    Emitir y Registrar Factura
                  </Button>
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
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Cliente / Empresa & NIT</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Concepto</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Valor Total</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Estado</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvoices ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                  ) : filteredInvoices.map((inv) => {
                    const meta = parseInvoiceClientMeta(inv);
                    return (
                      <TableRow key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-mono font-bold text-xs">{inv.invoice_number}</TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.client_name}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {meta.doc ? `NIT: ${meta.doc}` : ''} {meta.contact ? `• Rep: ${meta.contact}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{inv.description}</div>
                        </TableCell>
                        <TableCell>{getConceptBadge(inv.concept_type)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm">{formatCOP(inv.total_amount)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'PAID' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkPaid(inv.id, inv.client_name, inv.total_amount)} className="h-7 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marcar Pago
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInvoiceForReceipt(inv)} className="h-7 text-xs font-medium text-blue-600 hover:bg-blue-50" title="Ver Factura">
                              <FileText className="w-3.5 h-3.5 mr-1" /> Factura
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Empresa / Razón Social & NIT</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Representante / Contacto</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Mensualidad</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Día Cobro</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Generar Cobro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingClients ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                  ) : filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-semibold text-sm">
                          <div className="text-slate-900 dark:text-slate-100">{client.name}</div>
                          <div className="text-xs font-mono text-slate-500 font-normal">NIT: {client.document_id}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          <div>{client.contact_person || 'No especificado'}</div>
                          <div className="text-slate-400">{client.email}</div>
                        </TableCell>
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

      {/* Modal / Vista de Impresión de Factura Oficial con Encabezado Corporativo */}
      {selectedInvoiceForReceipt && (() => {
        const meta = parseInvoiceClientMeta(selectedInvoiceForReceipt);
        return (
          <Dialog open={!!selectedInvoiceForReceipt} onOpenChange={() => setSelectedInvoiceForReceipt(null)}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center justify-between">
                  <span>Factura de Cobro Oficial</span>
                  <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    {selectedInvoiceForReceipt.invoice_number}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4 space-y-4 text-xs border-t border-b text-slate-800 dark:text-slate-200">
                {/* Encabezado Emisor */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">NEUROLABS TECH SOLUTIONS S.A.S.</h3>
                    <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">NIT: 901.882.253-1</p>
                    <p className="text-slate-600 dark:text-slate-400"><strong>Representante Legal:</strong> Jesús David Cantillo Parejo</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">contabilidad@neurolabs.com.co • neurolabs.com.co</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono font-bold bg-white dark:bg-slate-900">
                      {selectedInvoiceForReceipt.invoice_number}
                    </Badge>
                    <p className="text-[11px] text-slate-500 mt-1"><strong>Emisión:</strong> {selectedInvoiceForReceipt.issue_date}</p>
                    <p className="text-[11px] text-rose-600 font-semibold"><strong>Vence:</strong> {selectedInvoiceForReceipt.due_date}</p>
                  </div>
                </div>

                {/* Datos del Cliente Adquirente */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Adquirente / Cliente</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Razón Social:</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedInvoiceForReceipt.client_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">NIT / Identificación:</p>
                      <p className="font-mono font-semibold text-slate-900 dark:text-white">{meta.doc || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Representante / Contacto:</p>
                      <p className="font-medium text-slate-900 dark:text-white">{meta.contact || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Correo Electrónico:</p>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{meta.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Detalle del Cobro */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Concepto Facturado</p>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedInvoiceForReceipt.description || 'Servicios Tecnológicos de IA'}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Concepto: {selectedInvoiceForReceipt.concept_type}</p>
                    </div>
                    <p className="font-mono font-bold text-sm">{formatCOP(selectedInvoiceForReceipt.total_amount)}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">TOTAL A PAGAR (COP)</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Estado: {selectedInvoiceForReceipt.status === 'PAID' ? 'PAGADA' : 'PENDIENTE DE PAGO'}</p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatCOP(selectedInvoiceForReceipt.total_amount)}
                  </p>
                </div>

                {/* Firma */}
                <div className="pt-3 flex justify-between items-end text-[11px] text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Jesús David Cantillo Parejo</p>
                    <p>Representante Legal • NeuroLabs Tech Solutions S.A.S.</p>
                  </div>
                  <div className="text-right">
                    <p>Generado por Módulo Contable NeuroLabs</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceForReceipt(null)}>Cerrar</Button>
                <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold" size="sm">
                  <Printer className="w-4 h-4 mr-1.5" /> Imprimir Factura / PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}


