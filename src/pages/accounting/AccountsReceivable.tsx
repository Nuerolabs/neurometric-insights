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
  FileText,
  Paperclip,
  Eye,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Trash2
} from "lucide-react";
import { 
  useInvoices, 
  useCreateInvoice, 
  useUpdateInvoiceStatus, 
  useDeleteInvoice,
  useClients, 
  useCreateClient,
  useUpdateClient,
  Client,
  InvoiceConceptType,
  Invoice
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
  const [conceptType, setConceptType] = useState<InvoiceConceptType>("IMPLEMENTATION");
  const [implementationPhase, setImplementationPhase] = useState<string>("CUOTA_1");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("350000");

  // State: Retenciones Tributarias en la Fuente (Opcional)
  const [hasWithholding, setHasWithholding] = useState(false);
  const [reteFuenteRate, setReteFuenteRate] = useState<number>(4); // 4% consultoría/servicios
  const [reteIcaRate, setReteIcaRate] = useState<number>(0.966); // ICA Sitionuevo, Magdalena

  // State: Ya pagado al emitir
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(true);
  const [createdPaymentDate, setCreatedPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [createdPaymentRef, setCreatedPaymentRef] = useState("");
  const [createdVoucherData, setCreatedVoucherData] = useState<string | null>(null);

  // State: Modal para Registrar Pago & Volante en Factura Existente
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState<any | null>(null);
  const [payModalDate, setPayModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [payModalRef, setPayModalRef] = useState("");
  const [payModalVoucherData, setPayModalVoucherData] = useState<string | null>(null);

  // State: Modal Visor de Volante
  const [isVoucherViewerOpen, setIsVoucherViewerOpen] = useState(false);
  const [viewingVoucherData, setViewingVoucherData] = useState<{ url: string; client: string; invNum: string; ref?: string; date?: string; amount?: number } | null>(null);

  // Form State: Client
  const [newClientName, setNewClientName] = useState("");
  const [newClientDoc, setNewClientDoc] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientService, setNewClientService] = useState("");
  const [newClientImplementationFee, setNewClientImplementationFee] = useState("700000");
  const [newClientMonthlyFee, setNewClientMonthlyFee] = useState("600000");
  const [newClientBillingDay, setNewClientBillingDay] = useState("5");

  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: clients, isLoading: loadingClients } = useClients();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoiceStatus();
  const deleteInvoiceMutation = useDeleteInvoice();
  const createClientMutation = useCreateClient();

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Helper para autocompletar descripción y valores según fase de concepto
  const handleConceptChange = (type: InvoiceConceptType, phase: string, clientObj?: Client) => {
    setConceptType(type);
    setImplementationPhase(phase);

    const client = clientObj || clients?.find(c => c.id === selectedClientId);
    const cName = client ? client.name : (clientName || "Cliente");
    const implFee = client?.implementation_fee || 700000;
    const mFee = client?.monthly_fee || 600000;

    if (type === "IMPLEMENTATION") {
      if (phase === "CUOTA_1") {
        const half = Math.round(implFee / 2);
        setTotalAmount(half.toString());
        setDescription(`Fase 1: Implementación Inicial & Setup (Cuota 1 de 2 - 50%) - ${cName}`);
      } else if (phase === "CUOTA_2") {
        const half = Math.round(implFee / 2);
        setTotalAmount(half.toString());
        setDescription(`Fase 2: Despliegue Final & Puesta en Marcha (Cuota 2 de 2 - 50%) - ${cName}`);
      } else {
        setTotalAmount(implFee.toString());
        setDescription(`Fase de Implementación Completa & Configuración Integral - ${cName}`);
      }
    } else if (type === "RECURRING_MONTHLY") {
      setTotalAmount(mFee.toString());
      setDescription(`Mensualidad Recurrente de Servicio Tecnológico IA - ${cName}`);
    } else if (type === "CONSULTING") {
      setTotalAmount("450000");
      setDescription(`Consultoría y Soporte Especializado en IA - ${cName}`);
    }
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
      handleConceptChange(conceptType, implementationPhase, found);
    }
  };

  // Helper para extraer metadatos completos de la factura (NIT, contacto, volante, retenciones)
  const parseInvoiceClientMeta = (inv: any) => {
    if (!inv) return { doc: '', contact: '', email: '', phone: '', voucher_url: '', payment_ref: '', phase: '', rete_fuente: 0, rete_ica: 0 };
    try {
      if (inv.notes && inv.notes.startsWith('{')) {
        const parsed = JSON.parse(inv.notes);
        return {
          doc: parsed.client_doc || '',
          contact: parsed.contact_person || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          voucher_url: parsed.voucher_url || '',
          payment_ref: parsed.payment_ref || '',
          phase: parsed.phase || '',
          rete_fuente: parsed.rete_fuente || 0,
          rete_ica: parsed.rete_ica || 0
        };
      }
    } catch {}
    
    // Fallback buscando en la lista de clientes
    const matchedClient = clients?.find(c => c.name.toLowerCase() === inv.client_name?.toLowerCase());
    return {
      doc: matchedClient?.document_id || '',
      contact: matchedClient?.contact_person || '',
      email: matchedClient?.email || '',
      phone: matchedClient?.phone || '',
      voucher_url: '',
      payment_ref: '',
      phase: '',
      rete_fuente: 0,
      rete_ica: 0
    };
  };

  // Crear Factura manual o con volante de transferencia
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber || !totalAmount || !dueDate) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      const rawAmount = parseFloat(totalAmount) || 0;
      const reteFuenteVal = hasWithholding ? Math.round(rawAmount * (reteFuenteRate / 100)) : 0;
      const reteIcaVal = hasWithholding ? Math.round(rawAmount * (reteIcaRate / 100)) : 0;

      const metaNotes = JSON.stringify({
        client_doc: clientDoc,
        contact_person: clientContact,
        email: clientEmail,
        phone: clientPhone,
        phase: conceptType === 'IMPLEMENTATION' ? implementationPhase : undefined,
        payment_ref: isAlreadyPaid ? createdPaymentRef : undefined,
        voucher_url: isAlreadyPaid ? createdVoucherData : undefined,
        rete_fuente: reteFuenteVal,
        rete_ica: reteIcaVal,
        has_withholding: hasWithholding
      });

      await createInvoiceMutation.mutateAsync({
        client_name: clientName,
        client_id: selectedClientId && selectedClientId !== 'custom' ? selectedClientId : undefined,
        invoice_number: invoiceNumber,
        concept_type: conceptType,
        description: description || `Servicio de Tecnología e IA - ${clientName}`,
        issue_date: issueDate,
        due_date: dueDate,
        payment_date: isAlreadyPaid ? createdPaymentDate : undefined,
        total_amount: parseFloat(totalAmount),
        status: isAlreadyPaid ? 'PAID' : 'DRAFT',
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
            service_description: description || "Agentes IA + ERP NeuroLabs",
            implementation_fee: conceptType === 'IMPLEMENTATION' ? parseFloat(totalAmount) * 2 : 700000,
            monthly_fee: 600000,
            billing_day: 5,
            status: 'ACTIVE'
          });
        } catch {}
      }

      toast.success(isAlreadyPaid ? "Factura emitida y registrada con pago/volante confirmado." : "Factura emitida en estado pendiente.");
      setIsInvoiceDialogOpen(false);
      setSelectedClientId("");
      setClientName("");
      setClientDoc("");
      setClientContact("");
      setClientEmail("");
      setClientPhone("");
      setInvoiceNumber("");
      setDescription("");
      setTotalAmount("350000");
      setDueDate("");
      setCreatedPaymentRef("");
      setCreatedVoucherData(null);
    } catch (err: any) {
      toast.error("Error al crear factura: " + err.message);
    }
  };

  // Confirmar Pago & Subir Volante para una Factura Existente
  const handleConfirmInvoicePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceToPay) return;

    try {
      const existingMeta = parseInvoiceClientMeta(invoiceToPay);
      const updatedMeta = JSON.stringify({
        ...existingMeta,
        payment_ref: payModalRef || existingMeta.payment_ref,
        voucher_url: payModalVoucherData || existingMeta.voucher_url
      });

      await updateInvoiceMutation.mutateAsync({
        id: invoiceToPay.id,
        status: 'PAID',
        payment_date: payModalDate,
        notes: updatedMeta
      });

      toast.success(`Pago y volante de transferencia registrados para ${invoiceToPay.client_name}`);
      setIsPaymentModalOpen(false);
      setInvoiceToPay(null);
      setPayModalRef("");
      setPayModalVoucherData(null);
    } catch (err: any) {
      toast.error("Error al registrar pago: " + err.message);
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
        implementation_fee: parseFloat(newClientImplementationFee) || 700000,
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

  // Generar Factura Rápida con Hitos de Implementación o Mensualidad
  const handleQuickEmit = (client: Client, type: 'CUOTA_1' | 'CUOTA_2' | 'RECURRING_MONTHLY') => {
    const nextSeq = (invoices?.length || 0) + 1;
    const invNum = `FAC-2025-${String(nextSeq).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 10);
    const dueDateStr = due.toISOString().split('T')[0];

    setSelectedClientId(client.id);
    setClientName(client.name);
    setClientDoc(client.document_id);
    setClientContact(client.contact_person || "");
    setClientEmail(client.email || "");
    setClientPhone(client.phone || "");
    setInvoiceNumber(invNum);
    setIssueDate(today);
    setDueDate(dueDateStr);

    if (type === 'CUOTA_1') {
      setConceptType('IMPLEMENTATION');
      setImplementationPhase('CUOTA_1');
      const amount = Math.round((client.implementation_fee || 700000) / 2);
      setTotalAmount(amount.toString());
      setDescription(`Fase 1: Implementación Inicial & Setup (Cuota 1 de 2 - 50%) - ${client.name}`);
      setIsAlreadyPaid(true); // El usuario ya recibió este pago
    } else if (type === 'CUOTA_2') {
      setConceptType('IMPLEMENTATION');
      setImplementationPhase('CUOTA_2');
      const amount = Math.round((client.implementation_fee || 700000) / 2);
      setTotalAmount(amount.toString());
      setDescription(`Fase 2: Despliegue Final & Puesta en Marcha (Cuota 2 de 2 - 50%) - ${client.name}`);
      setIsAlreadyPaid(false);
    } else {
      setConceptType('RECURRING_MONTHLY');
      setImplementationPhase('SINGLE');
      const amount = client.monthly_fee || 600000;
      setTotalAmount(amount.toString());
      setDescription(`Mensualidad Recurrente de Servicio Tecnológico IA - ${client.name}`);
      setIsAlreadyPaid(false);
    }

    setIsInvoiceDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PAID": 
        return <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-none font-semibold">Pagada</Badge>;
      case "OVERDUE": 
        return <Badge variant="destructive" className="font-semibold">Vencida</Badge>;
      case "DRAFT": 
        return <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 font-semibold">Pendiente</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConceptBadge = (type: InvoiceConceptType, description?: string) => {
    const desc = (description || '').toLowerCase();
    if (type === "IMPLEMENTATION" || desc.includes("implementación") || desc.includes("fase") || desc.includes("cuota")) {
      if (desc.includes("cuota 1") || desc.includes("fase 1")) {
        return <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-none font-semibold">Fase 1: Setup (50%)</Badge>;
      } else if (desc.includes("cuota 2") || desc.includes("fase 2")) {
        return <Badge className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-none font-semibold">Fase 2: Final (50%)</Badge>;
      }
      return <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-none font-semibold">Implementación</Badge>;
    }
    if (type === "RECURRING_MONTHLY") {
      return <Badge className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-none font-semibold">Mensualidad ($600k)</Badge>;
    }
    return <Badge variant="secondary" className="font-medium">Consultoría / Servicio</Badge>;
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
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 mx-auto animate-in fade-in duration-300">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs w-full min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Módulo de Facturación & Hitos de Cobro
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Facturación y Gestión de Contratos</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control de fases de implementación por cuotas, volantes de transferencia bancaria y mensualidades recurrentes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botón Registrar Cliente */}
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
                      <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej: TRINOVA S.A.S." required className="h-9 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">NIT / Identificación *</Label>
                      <Input value={newClientDoc} onChange={e => setNewClientDoc(e.target.value)} placeholder="901.890.123-4" required className="h-9 text-sm mt-1 font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Persona de Contacto</Label>
                      <Input value={newClientContact} onChange={e => setNewClientContact(e.target.value)} placeholder="Representante o Gerente" className="h-9 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Teléfono / WhatsApp</Label>
                      <Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+57 300 000 0000" className="h-9 text-sm mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Correo Electrónico de Facturación</Label>
                    <Input type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="facturacion@trinova.com.co" className="h-9 text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Solución Contratada</Label>
                    <Input value={newClientService} onChange={e => setNewClientService(e.target.value)} placeholder="Agente IA de Operaciones + Módulo Contable NeuroLabs" className="h-9 text-sm mt-1" />
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Implementación Total</Label>
                      <Input type="number" value={newClientImplementationFee} onChange={e => setNewClientImplementationFee(e.target.value)} className="h-9 text-sm font-mono mt-1" placeholder="700000" />
                      <span className="text-[10px] text-slate-400">2 cuotas de $350k</span>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-blue-600 dark:text-blue-400">Mensualidad Recurrente</Label>
                      <Input type="number" value={newClientMonthlyFee} onChange={e => setNewClientMonthlyFee(e.target.value)} className="h-9 text-sm font-mono mt-1 font-bold" placeholder="600000" />
                      <span className="text-[10px] text-blue-500">Valor fijo mensual</span>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Día de Cobro</Label>
                      <Input type="number" min="1" max="31" value={newClientBillingDay} onChange={e => setNewClientBillingDay(e.target.value)} className="h-9 text-sm font-mono mt-1" />
                      <span className="text-[10px] text-slate-400">Día de cada mes</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full">Guardar Cliente y Activar Contrato</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Botón Nueva Factura */}
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" /> Nueva Factura / Hito
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[580px]">
              <form onSubmit={handleCreateInvoice}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Emitir Factura de Cobro / Hito</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-3.5 py-4 max-h-[75vh] overflow-y-auto pr-1">
                  
                  {/* Selector de Cliente */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Seleccionar Cliente Existente</Label>
                    <select 
                      value={selectedClientId} 
                      onChange={e => handleSelectClient(e.target.value)}
                      className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    >
                      <option value="custom">-- Seleccionar o escribir manual --</option>
                      {clients?.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (NIT: {c.document_id}) - Impl: {formatCOP(c.implementation_fee)} | Mensual: {formatCOP(c.monthly_fee)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Datos del Cliente */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Datos Corporativos del Cliente
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Razón Social *</Label>
                        <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej: TRINOVA S.A.S." required className="h-9 text-sm mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">NIT / Identificación *</Label>
                        <Input value={clientDoc} onChange={e => setClientDoc(e.target.value)} placeholder="901.890.123-4" required className="h-9 text-sm mt-1 font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Representante / Contacto</Label>
                        <Input value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder="Contacto principal" className="h-9 text-sm mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Correo Electrónico</Label>
                        <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="facturacion@empresa.com" className="h-9 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Estructura del Concepto e Hitos */}
                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Concepto</Label>
                        <select 
                          value={conceptType} 
                          onChange={e => handleConceptChange(e.target.value as InvoiceConceptType, implementationPhase)} 
                          className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-blue-700 dark:text-blue-300"
                        >
                          <option value="IMPLEMENTATION">🚀 Fase de Implementación & Setup</option>
                          <option value="RECURRING_MONTHLY">🔄 Mensualidad Recurrente ($600k)</option>
                          <option value="CONSULTING">🧠 Consultoría / Desarrollo Adicional</option>
                          <option value="OTHER">📄 Otro Concepto</option>
                        </select>
                      </div>

                      {conceptType === "IMPLEMENTATION" ? (
                        <div>
                          <Label className="text-xs font-bold text-purple-700 dark:text-purple-400">Hito / Cuota de Implementación</Label>
                          <select 
                            value={implementationPhase} 
                            onChange={e => handleConceptChange("IMPLEMENTATION", e.target.value)} 
                            className="w-full h-9 mt-1 px-3 rounded-md border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs font-semibold text-purple-700 dark:text-purple-300"
                          >
                            <option value="CUOTA_1">Cuota 1 de 2: Anticipo Setup (50% - $350.000)</option>
                            <option value="CUOTA_2">Cuota 2 de 2: Saldo Final Entrega (50% - $350.000)</option>
                            <option value="SINGLE">Pago Único Completo ($700.000)</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <Label className="text-xs font-semibold text-slate-600">No. Factura *</Label>
                          <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="FAC-2025-001" required className="h-9 text-sm mt-1 font-mono" />
                        </div>
                      )}
                    </div>

                    {conceptType === "IMPLEMENTATION" && (
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">No. Factura / Comprobante *</Label>
                        <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder={`FAC-2025-${String((invoices?.length || 0) + 1).padStart(3, '0')}`} required className="h-9 text-sm mt-1 font-mono" />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Descripción Detallada del Cobro</Label>
                      <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9 text-sm mt-1" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Fecha Emisión</Label>
                        <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-9 text-xs mt-1 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Vencimiento *</Label>
                        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="h-9 text-xs mt-1 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-900 dark:text-white">Total Bruto (COP) *</Label>
                        <Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required className="h-9 text-sm font-mono mt-1 font-bold text-slate-900 dark:text-white" />
                      </div>
                    </div>

                    {/* Módulo de Retención en la Fuente / ReteICA (Opcional) */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input 
                          type="checkbox" 
                          checked={hasWithholding} 
                          onChange={e => setHasWithholding(e.target.checked)} 
                          className="h-3.5 w-3.5 rounded text-blue-600"
                        />
                        ¿El cliente aplica Retención en la Fuente o ReteICA? (Opcional)
                      </label>

                      {hasWithholding && (
                        <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600">ReteFuente (%)</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              value={reteFuenteRate} 
                              onChange={e => setReteFuenteRate(Number(e.target.value))} 
                              className="h-8 text-xs font-mono mt-1" 
                            />
                            <span className="text-[10px] text-slate-400">Ej: 4% o 3.5%</span>
                          </div>
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600">ReteICA (%)</Label>
                            <Input 
                              type="number" 
                              step="0.001" 
                              value={reteIcaRate} 
                              onChange={e => setReteIcaRate(Number(e.target.value))} 
                              className="h-8 text-xs font-mono mt-1" 
                            />
                            <span className="text-[10px] text-slate-400">Ej: 0.966% / 1%</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-700 dark:text-slate-300">
                            <span>Neto Estimado a Recibir en Banco:</span>
                            <span className="font-mono font-bold text-sm text-emerald-600">
                              {formatCOP(Math.max(0, parseFloat(totalAmount || '0') - Math.round(parseFloat(totalAmount || '0') * (reteFuenteRate / 100)) - Math.round(parseFloat(totalAmount || '0') * (reteIcaRate / 100))))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección de Pago Inmediato y Volante de Transferencia */}
                  <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <input 
                          type="checkbox" 
                          checked={isAlreadyPaid} 
                          onChange={e => setIsAlreadyPaid(e.target.checked)} 
                          className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        ¿Este abono ya fue transferido por el cliente? (Marcar Pagada)
                      </label>
                      {isAlreadyPaid && (
                        <Badge className="bg-emerald-600 text-white text-[10px]">Ingreso Inmediato a Caja/Bancos</Badge>
                      )}
                    </div>

                    {isAlreadyPaid && (
                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Fecha de Transferencia</Label>
                          <Input type="date" value={createdPaymentDate} onChange={e => setCreatedPaymentDate(e.target.value)} className="h-8 text-xs mt-1 font-mono bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Referencia / No. Transferencia</Label>
                          <Input value={createdPaymentRef} onChange={e => setCreatedPaymentRef(e.target.value)} placeholder="TR-Bancolombia #35019" className="h-8 text-xs mt-1 font-mono bg-white dark:bg-slate-900" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Subir Volante de Transferencia (Evidencia PNG, JPG, PDF)</Label>
                          <Input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const dataUrl = await readFileAsDataUrl(file);
                                setCreatedVoucherData(dataUrl);
                                toast.success("Volante cargado correctamente");
                              }
                            }} 
                            className="h-8 text-xs py-1 mt-1 cursor-pointer bg-white dark:bg-slate-900 file:bg-emerald-100 file:text-emerald-800 file:border-0 file:rounded file:px-2 file:mr-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold w-full dark:bg-blue-600">
                    Emitir Factura {isAlreadyPaid ? 'y Confirmar Recaudo' : ''}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen Financiero Directo sin Contenedor */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 py-2 px-1">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">MRR Recurrente</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 truncate">{formatCOP(totalMRR)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Mensualidades fijas</span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Recaudado</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">{formatCOP(totalRecaudado)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Confirmado en banco</span>
        </div>

        <div className="space-y-0.5 col-span-2 sm:col-span-1 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Cartera Pendiente</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 truncate">{formatCOP(totalCobrar)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Cuotas e hitos por cobrar</span>
        </div>
      </div>

      {/* Pestañas: Facturas Emitidas vs Clientes y Contratos */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg">
            <TabsTrigger value="invoices" className="text-xs font-bold px-4 py-2"><Receipt className="w-3.5 h-3.5 mr-1.5" /> Facturas e Hitos Emitidos ({invoices?.length || 0})</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs font-bold px-4 py-2"><Building2 className="w-3.5 h-3.5 mr-1.5" /> Clientes y Planes de Contrato ({clients?.length || 0})</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder={activeTab === 'invoices' ? "Buscar factura o cliente..." : "Buscar cliente o NIT..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
          </div>
        </div>

        {/* TABLA DE FACTURAS */}
        <TabsContent value="invoices" className="m-0 w-full min-w-0 max-w-full">
          <Card className="rounded-xl shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-full min-w-0 max-w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
              <Table className="min-w-[750px]">
                <TableHeader className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">No. Factura</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Cliente / Empresa & NIT</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Concepto / Hito</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Valor Total</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Estado</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Soporte Transferencia</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvoices ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                        No hay facturas registradas. Puedes emitir una con el botón superior o desde la pestaña de Clientes.
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.map((inv) => {
                    const meta = parseInvoiceClientMeta(inv);
                    const hasVoucher = !!meta.voucher_url;
                    return (
                      <TableRow key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.client_name}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {meta.doc ? `NIT: ${meta.doc}` : ''} {meta.contact ? `• Rep: ${meta.contact}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{inv.description}</div>
                        </TableCell>
                        <TableCell>{getConceptBadge(inv.concept_type, inv.description)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {formatCOP(inv.total_amount)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-center">
                          {hasVoucher ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setViewingVoucherData({
                                  url: meta.voucher_url,
                                  client: inv.client_name,
                                  invNum: inv.invoice_number,
                                  ref: meta.payment_ref,
                                  date: inv.payment_date,
                                  amount: inv.total_amount
                                });
                                setIsVoucherViewerOpen(true);
                              }}
                              className="h-7 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            >
                              <Paperclip className="w-3.5 h-3.5 mr-1" /> Ver Volante
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Sin adjunto</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'PAID' && (
                              <Button 
                                size="sm" 
                                variant="default" 
                                onClick={() => {
                                  setInvoiceToPay(inv);
                                  setPayModalDate(new Date().toISOString().split('T')[0]);
                                  setPayModalRef(meta.payment_ref || "");
                                  setPayModalVoucherData(null);
                                  setIsPaymentModalOpen(true);
                                }} 
                                className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Registrar Pago
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInvoiceForReceipt(inv)} className="h-7 text-xs font-medium text-blue-600 hover:bg-blue-50" title="Ver Factura Oficial">
                              <FileText className="w-3.5 h-3.5 mr-1" /> Factura
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={async () => {
                                if (confirm(`¿Eliminar factura ${inv.invoice_number}?`)) {
                                  await deleteInvoiceMutation.mutateAsync(inv.id);
                                  toast.success("Factura eliminada");
                                }
                              }} 
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TABLA DE CLIENTES Y CONTRATOS */}
        <TabsContent value="clients" className="m-0 w-full min-w-0 max-w-full">
          <Card className="rounded-xl shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-full min-w-0 max-w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[750px]">
                <TableHeader className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Empresa / Razón Social & NIT</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600">Representante / Contacto</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Fase Implementación</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Mensualidad</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-center">Día Cobro</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-slate-600 text-right">Generar Cobro / Cuota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingClients ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                  ) : filteredClients.map((client) => {
                    const clientInvoices = invoices?.filter(inv => inv.client_name.toLowerCase() === client.name.toLowerCase() || inv.client_id === client.id) || [];
                    const paidImpl = clientInvoices.filter(i => i.status === 'PAID' && (i.concept_type === 'IMPLEMENTATION' || i.description.toLowerCase().includes('implementación'))).reduce((s, x) => s + Number(x.total_amount || 0), 0);
                    const pendingImpl = Math.max(0, (client.implementation_fee || 700000) - paidImpl);

                    return (
                      <TableRow key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-semibold text-sm">
                          <div className="text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {client.name}
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Activo</Badge>
                          </div>
                          <div className="text-xs font-mono text-slate-500 font-normal">NIT: {client.document_id}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{client.service_description}</div>
                        </TableCell>
                        
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{client.contact_person || 'Contacto Oficial'}</div>
                          <div className="text-slate-400">{client.email}</div>
                          <div className="text-slate-400">{client.phone}</div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="font-mono font-bold text-sm text-purple-700 dark:text-purple-400">
                            {formatCOP(client.implementation_fee || 700000)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Abonado: <span className="font-semibold text-emerald-600">{formatCOP(paidImpl)}</span>
                          </div>
                          {pendingImpl > 0 && (
                            <div className="text-[10px] text-amber-600 font-semibold">
                              Saldo por cobrar: {formatCOP(pendingImpl)}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-sm text-blue-600">
                          {formatCOP(client.monthly_fee || 600000)}/mes
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono text-xs">Día {client.billing_day || 5}</Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEmit(client, 'CUOTA_1')} 
                              className="h-7 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200"
                              title="Emitir Cuota 1 (Anticipo 50%)"
                            >
                              ⚡ Cuota 1 ($350k)
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEmit(client, 'CUOTA_2')} 
                              className="h-7 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                              title="Emitir Cuota 2 (Saldo 50%)"
                            >
                              ⚡ Cuota 2 ($350k)
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEmit(client, 'RECURRING_MONTHLY')} 
                              className="h-7 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
                              title="Emitir Mensualidad Recurrente"
                            >
                              🔄 Mensualidad
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: REGISTRAR PAGO & SUBIR VOLANTE DE TRANSFERENCIA
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleConfirmInvoicePayment}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Registrar Pago de Factura / Volante
              </DialogTitle>
            </DialogHeader>
            {invoiceToPay && (
              <div className="grid gap-3.5 py-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{invoiceToPay.client_name}</p>
                  <p className="text-slate-600 dark:text-slate-400">Factura: <strong className="font-mono">{invoiceToPay.invoice_number}</strong> • {invoiceToPay.description}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-base pt-1">
                    Total a Confirmar: {formatCOP(invoiceToPay.total_amount)}
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Transferencia Bancaria *</Label>
                  <Input type="date" value={payModalDate} onChange={e => setPayModalDate(e.target.value)} required className="h-9 text-xs mt-1 font-mono" />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. de Referencia / Comprobante Bancario *</Label>
                  <Input value={payModalRef} onChange={e => setPayModalRef(e.target.value)} placeholder="Ej: TR-Bancolombia #882910 o Nequi" required className="h-9 text-xs mt-1 font-mono" />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adjuntar Volante de Transferencia (PNG, JPG, PDF)</Label>
                  <Input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const dataUrl = await readFileAsDataUrl(file);
                        setPayModalVoucherData(dataUrl);
                        toast.success("Volante cargado correctamente");
                      }
                    }} 
                    className="h-9 text-xs py-1 mt-1 cursor-pointer file:bg-emerald-100 file:text-emerald-800 file:border-0 file:rounded file:px-2 file:mr-2"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">El soporte quedará guardado para auditoría y consulta permanente.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={updateInvoiceMutation.isPending}>
                {updateInvoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                Confirmar y Aplicar Recaudo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: VISOR DE VOLANTE DE TRANSFERENCIA
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={isVoucherViewerOpen} onOpenChange={setIsVoucherViewerOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>Volante de Transferencia Bancaria</span>
              {viewingVoucherData && (
                <span className="text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  {viewingVoucherData.invNum}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingVoucherData && (
            <div className="py-3 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{viewingVoucherData.client}</p>
                  <p className="text-slate-500 font-mono">Ref: {viewingVoucherData.ref || 'Transferencia Bancaria'}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">{formatCOP(viewingVoucherData.amount || 0)}</p>
                  <p className="text-[11px] text-slate-500">{viewingVoucherData.date || 'Fecha confirmada'}</p>
                </div>
              </div>

              <div className="p-2 border rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[300px] overflow-hidden">
                {viewingVoucherData.url.startsWith('data:application/pdf') ? (
                  <iframe src={viewingVoucherData.url} className="w-full h-[400px] rounded-lg" title="Volante PDF" />
                ) : (
                  <img src={viewingVoucherData.url} alt="Comprobante Bancario" className="max-h-[450px] w-auto object-contain rounded-lg shadow-sm" />
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsVoucherViewerOpen(false)}>Cerrar</Button>
            {viewingVoucherData && (
              <a href={viewingVoucherData.url} download={`Volante_${viewingVoucherData.invNum}.png`}>
                <Button size="sm" className="bg-slate-900 text-white font-semibold">
                  <Download className="w-4 h-4 mr-1.5" /> Descargar Soporte
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: VISTA E IMPRESIÓN DE FACTURA / CUENTA DE COBRO OFICIAL
      ══════════════════════════════════════════════════════════════ */}
      {selectedInvoiceForReceipt && (() => {
        const meta = parseInvoiceClientMeta(selectedInvoiceForReceipt);
        return (
          <Dialog open={!!selectedInvoiceForReceipt} onOpenChange={() => setSelectedInvoiceForReceipt(null)}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center justify-between">
                  <span>Factura de Cobro Oficial</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4 space-y-4 text-xs border-t border-b text-slate-800 dark:text-slate-200">
                {/* Encabezado Emisor */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">NEUROLABS TECH SOLUTIONS S.A.S.</h3>
                    <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">NIT: 901.882.253-1</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Representante Legal: Jesús David Cantillo Parejo</p>
                    <p className="text-slate-500 text-[11px]">Sitionuevo, Magdalena, Colombia • contabilidad@neurolabs.com.co</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-slate-900 text-white rounded font-mono font-bold text-xs">
                      {selectedInvoiceForReceipt.invoice_number}
                    </span>
                    <p className="text-slate-500 text-[11px] mt-1.5 font-mono">Emisión: {selectedInvoiceForReceipt.issue_date}</p>
                    <p className="text-slate-500 text-[11px] font-mono">Vence: {selectedInvoiceForReceipt.due_date}</p>
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cliente Adquirente / Facturado A:</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedInvoiceForReceipt.client_name}</p>
                  {meta.doc && <p className="font-mono text-slate-600 dark:text-slate-400">NIT / Identificación: <strong>{meta.doc}</strong></p>}
                  {meta.contact && <p className="text-slate-600 dark:text-slate-400">Representante / Contacto: <strong>{meta.contact}</strong></p>}
                  {meta.email && <p className="text-slate-500">Correo: {meta.email}</p>}
                </div>

                {/* Detalle del Cobro */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
                    <span>CONCEPTO / DESCRIPCIÓN DEL SERVICIO</span>
                    <span>VALOR</span>
                  </div>
                  <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedInvoiceForReceipt.description || 'Servicios Tecnológicos de IA'}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Concepto: {selectedInvoiceForReceipt.concept_type}</p>
                      {meta.payment_ref && <p className="text-emerald-600 text-[11px] font-mono mt-0.5">Referencia de Pago: {meta.payment_ref}</p>}
                    </div>
                    <p className="font-mono font-bold text-sm">{formatCOP(selectedInvoiceForReceipt.total_amount)}</p>
                  </div>
                  
                  {/* Desglose Tributario si aplica Retención */}
                  {(meta.rete_fuente > 0 || meta.rete_ica > 0) && (
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-850 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Valor Bruto Facturado:</span>
                        <span className="font-mono">{formatCOP(selectedInvoiceForReceipt.total_amount)}</span>
                      </div>
                      {meta.rete_fuente > 0 && (
                        <div className="flex justify-between text-amber-700 dark:text-amber-400">
                          <span>(-) Retención en la Fuente Practicada:</span>
                          <span className="font-mono">-{formatCOP(meta.rete_fuente)}</span>
                        </div>
                      )}
                      {meta.rete_ica > 0 && (
                        <div className="flex justify-between text-amber-700 dark:text-amber-400">
                          <span>(-) Retención de ICA (ReteICA):</span>
                          <span className="font-mono">-{formatCOP(meta.rete_ica)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">TOTAL NETO A RECIBIR (COP)</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Estado: {selectedInvoiceForReceipt.status === 'PAID' ? 'PAGADA / CONFIRMADA' : 'PENDIENTE DE PAGO'}</p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatCOP(Math.max(0, Number(selectedInvoiceForReceipt.total_amount) - Number(meta.rete_fuente || 0) - Number(meta.rete_ica || 0)))}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceForReceipt(null)}>Cerrar</Button>
                <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold" size="sm">
                  <Printer className="w-4 h-4 mr-1.5" /> Imprimir Factura
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
