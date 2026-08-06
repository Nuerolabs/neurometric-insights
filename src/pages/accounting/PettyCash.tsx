import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, CheckCircle2, Clock, XCircle, Filter, Loader2, ArrowDownToLine, FileText, Paperclip, ExternalLink } from "lucide-react";
import { usePettyCashVouchers, useCreatePettyCashVoucher, useUpdateVoucherStatus, PettyCashVoucher } from "@/hooks/accounting/usePettyCash";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function PettyCash() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);
  
  // File evidence state
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Form state para Gasto
  const [voucher, setVoucher] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Transporte");

  // Form state para Fondeo
  const [fundingDate, setFundingDate] = useState(new Date().toISOString().split('T')[0]);
  const [fundingReference, setFundingReference] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingBeneficiary, setFundingBeneficiary] = useState("");

  const { data: vouchers, isLoading, isError, error } = usePettyCashVouchers();
  const createMutation = useCreatePettyCashVoucher();
  const updateMutation = useUpdateVoucherStatus();

  const getStatusBadge = (status: string, cat: string) => {
    if (cat === 'INGRESO DE FONDOS') {
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1"/> Fondeado</Badge>;
    }
    switch(status) {
      case "REIMBURSED": return <Badge variant="default" className="bg-slate-800 text-slate-100 hover:bg-slate-900 border-none font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1"/> Reembolsado</Badge>;
      case "APPROVED": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1"/> Aprobado</Badge>;
      case "PENDING": return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-none font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
      case "REJECTED": return <Badge variant="destructive" className="font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5"><XCircle className="w-3 h-3 mr-1"/> Rechazado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const uploadEvidence = async () => {
      if (!evidenceFile) return undefined;
      toast.loading("Subiendo evidencia segura a la nube...", { id: "upload" });
      const fileExt = evidenceFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, evidenceFile);
      if (uploadError) {
          toast.dismiss("upload");
          throw new Error("Error al subir archivo: " + uploadError.message);
      }
      
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      toast.dismiss("upload");
      return publicUrlData.publicUrl;
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucher || !beneficiary || !description || !amount) {
        toast.error("Por favor completa todos los campos requeridos.");
        return;
    }
    try {
        const receiptUrl = await uploadEvidence();

        await createMutation.mutateAsync({
            voucher_number: voucher,
            beneficiary,
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString().split('T')[0],
            receipt_url: receiptUrl
        });
        toast.success("Vale registrado exitosamente");
        setIsExpenseDialogOpen(false);
        setVoucher(""); setBeneficiary(""); setDescription(""); setAmount(""); setEvidenceFile(null);
    } catch (err: any) {
        toast.dismiss("upload");
        toast.error("Error al registrar: " + err.message);
    }
  };

  const handleCreateFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingReference || !fundingAmount || !fundingBeneficiary) {
        toast.error("Comprobante, Monto y Socio/Aportante son obligatorios.");
        return;
    }
    if (!evidenceFile) {
        toast.error("Debes adjuntar la evidencia (captura de transferencia) para ingresos de capital.");
        return;
    }
    try {
        const receiptUrl = await uploadEvidence();

        await createMutation.mutateAsync({
            voucher_number: `FND-${fundingReference}`,
            beneficiary: fundingBeneficiary,
            description: "Aporte de Capital / Ingreso a Caja Menor",
            amount: parseFloat(fundingAmount),
            category: "INGRESO DE FONDOS",
            date: fundingDate,
            receipt_url: receiptUrl
        });
        toast.success("Fondos ingresados y evidencia guardada.");
        setIsFundingDialogOpen(false);
        setFundingReference(""); setFundingAmount(""); setFundingBeneficiary(""); setEvidenceFile(null);
    } catch (err: any) {
        toast.dismiss("upload");
        toast.error("Error al ingresar fondos: " + err.message);
    }
  };

  const filteredVouchers = vouchers?.filter(v => 
    v.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Cálculos dinámicos reales basados en la base de datos
  const fondoFijo = vouchers?.filter(v => v.category === 'INGRESO DE FONDOS').reduce((sum, v) => sum + Number(v.amount), 0) || 0;
  const ejecutado = vouchers?.filter(v => v.category !== 'INGRESO DE FONDOS' && v.status !== 'REJECTED').reduce((sum, v) => sum + Number(v.amount), 0) || 0;
  const saldoDisponible = fondoFijo - ejecutado;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Caja Menor e Inversiones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de inyecciones de capital y legalización de gastos operativos.</p>
        </div>
        <div className="flex items-center gap-2">
            
            {/* Modal para Ingresar Fondos */}
            <Dialog open={isFundingDialogOpen} onOpenChange={setIsFundingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                    <ArrowDownToLine className="h-3.5 w-3.5 mr-2" />
                    Ingresar Fondos (Inversión)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreateFunding}>
                  <DialogHeader>
                    <DialogTitle>Aporte de Capital / Fondeo</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <p className="text-xs text-slate-500 mb-2">Registra aquí las transferencias de los socios para alimentar el fondo, adjuntando la captura como evidencia.</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fundingDate" className="text-right text-xs">Fecha</Label>
                      <Input id="fundingDate" type="date" value={fundingDate} onChange={e=>setFundingDate(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_bene" className="text-right text-xs">Socio / Origen</Label>
                      <Input id="f_bene" value={fundingBeneficiary} onChange={e=>setFundingBeneficiary(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Nombre de quien transfiere" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_ref" className="text-right text-xs font-semibold leading-tight">Ref. / Concepto<br/><span className="text-[10px] text-slate-400 font-normal">(Especie/Efectivo)</span></Label>
                      <Input id="f_ref" value={fundingReference} onChange={e=>setFundingReference(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Ej: TR-Bancolombia o '2 Computadores Asus'" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_amount" className="text-right text-xs">Monto ($)</Label>
                      <Input id="f_amount" type="number" step="0.01" value={fundingAmount} onChange={e=>setFundingAmount(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mt-2">
                      <Label htmlFor="f_file" className="text-right text-xs">Evidencia</Label>
                      <Input id="f_file" type="file" accept="image/*,.pdf" onChange={e=>setEvidenceFile(e.target.files?.[0] || null)} className="col-span-3 h-9 text-xs py-1.5 cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:mr-2 hover:file:bg-blue-100" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsFundingDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Registrar Inversión
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal para Registrar Vale */}
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Registrar Gasto (Vale)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreateVoucher}>
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Vale de Salida</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="voucher" className="text-right text-xs">No. Vale</Label>
                      <Input id="voucher" value={voucher} onChange={e=>setVoucher(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="CM-005" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="beneficiary" className="text-right text-xs">Beneficiario</Label>
                      <Input id="beneficiary" value={beneficiary} onChange={e=>setBeneficiary(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Nombre de quien recibe" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right text-xs">Importe ($)</Label>
                      <Input id="amount" type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right text-xs">Categoría</Label>
                      <select id="category" value={category} onChange={e=>setCategory(e.target.value)} className="col-span-3 h-8 text-sm rounded-md border border-slate-200 bg-transparent px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300">
                          <option value="Transporte">Transporte</option>
                          <option value="Papelería">Papelería</option>
                          <option value="Alimentación">Alimentación</option>
                          <option value="Notariales">Gastos Notariales</option>
                          <option value="Mensajería">Mensajería</option>
                          <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="desc" className="text-right text-xs">Concepto</Label>
                      <Input id="desc" value={description} onChange={e=>setDescription(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Motivo del gasto" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mt-2">
                      <Label htmlFor="v_file" className="text-right text-xs">Soporte</Label>
                      <Input id="v_file" type="file" accept="image/*,.pdf" onChange={e=>setEvidenceFile(e.target.files?.[0] || null)} className="col-span-3 h-9 text-xs py-1.5 cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:mr-2 hover:file:bg-blue-100" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsExpenseDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-rose-600 text-white hover:bg-rose-700" disabled={createMutation.isPending || saldoDisponible < Number(amount)}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Registrar Gasto
                    </Button>
                  </DialogFooter>
                  {saldoDisponible < Number(amount) && amount && (
                      <p className="text-xs text-rose-500 font-semibold text-center mt-2">Fondos insuficientes para registrar este vale.</p>
                  )}
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* KPI Cards Reales */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Ingresos de Capital</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">${fondoFijo.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Gastos (Vales)</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold text-rose-600">${ejecutado.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Saldo Disponible</CardTitle>
            <div className={`h-2 w-2 rounded-full ${saldoDisponible > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className={`text-2xl font-bold ${saldoDisponible > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${saldoDisponible.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 pt-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Historial de Inversiones y Gastos</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                  type="search"
                  placeholder="Buscar socio, comprobante..."
                  className="h-8 w-64 pl-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 text-slate-600">
                <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center p-12">
                 <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                 <p className="text-sm text-slate-500">Cargando movimientos de caja menor...</p>
             </div>
          ) : isError ? (
             <div className="flex flex-col items-center justify-center p-12">
                 <XCircle className="h-8 w-8 text-red-500 mb-4" />
                 <p className="text-sm font-semibold text-slate-800">Error al cargar datos</p>
                 <p className="text-xs text-slate-500">{error?.message}</p>
             </div>
          ) : filteredVouchers.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12">
                 <FileText className="h-10 w-10 text-slate-300 mb-4" />
                 <p className="text-sm font-semibold text-slate-800">No hay movimientos registrados</p>
                 <p className="text-xs text-slate-500">Haz clic en "Ingresar Fondos" para registrar el capital de los socios.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="w-[90px] text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Fecha</TableHead>
                    <TableHead className="w-[100px] text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Referencia</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Socio / Beneficiario</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Concepto</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Clasificación</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Ingreso (+)</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Egreso (-)</TableHead>
                    <TableHead className="text-center w-[120px] text-xs font-semibold text-slate-500 h-9 whitespace-nowrap">Estado</TableHead>
                    <TableHead className="w-[40px] h-9 whitespace-nowrap"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher) => {
                    const isFunding = voucher.category === 'INGRESO DE FONDOS';
                    return (
                    <TableRow key={voucher.id} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell className="text-xs font-medium text-slate-700 py-3 whitespace-nowrap">{voucher.date}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-700 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                              {voucher.receipt_url ? (
                                  <a href={voucher.receipt_url} target="_blank" rel="noreferrer" title="Ver Comprobante">
                                      <Paperclip className="w-3.5 h-3.5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                                  </a>
                              ) : null}
                              {voucher.voucher_number}
                          </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-800 py-3 whitespace-nowrap">{voucher.beneficiary}</TableCell>
                      <TableCell className="text-xs text-slate-600 py-3 max-w-[150px] truncate" title={voucher.description}>{voucher.description}</TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded ${isFunding ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-100'}`}>
                            {voucher.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-600 py-3 whitespace-nowrap">
                          {isFunding ? `$${Number(voucher.amount).toLocaleString('en-US',{minimumFractionDigits:2})}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-rose-600 py-3 whitespace-nowrap">
                          {!isFunding ? `$${Number(voucher.amount).toLocaleString('en-US',{minimumFractionDigits:2})}` : '-'}
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap">
                        {getStatusBadge(voucher.status, voucher.category)}
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4 whitespace-nowrap">
                        {!isFunding && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-400 hover:text-emerald-600"
                              title="Marcar como Aprobado"
                              onClick={() => updateMutation.mutate({ id: voucher.id, status: 'APPROVED' })}
                              disabled={voucher.status === 'APPROVED' || updateMutation.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
