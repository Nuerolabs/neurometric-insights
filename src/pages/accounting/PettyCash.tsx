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

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const uploadEvidence = async () => {
      if (!evidenceFile) return undefined;
      try {
        const fileExt = evidenceFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, evidenceFile);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
          return publicUrlData.publicUrl;
        }
      } catch {}
      
      // Fallback base64 local URL
      return await readFileAsDataUrl(evidenceFile);
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

  const fondoFijo = vouchers?.filter(v => v.category === 'INGRESO DE FONDOS').reduce((sum, v) => sum + Number(v.amount), 0) || 0;
  const ejecutado = vouchers?.filter(v => v.category !== 'INGRESO DE FONDOS' && v.status !== 'REJECTED').reduce((sum, v) => sum + Number(v.amount), 0) || 0;
  const saldoDisponible = fondoFijo - ejecutado;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs w-full min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Caja Menor e Inversiones</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Gestión de inyecciones de capital y legalización de gastos operativos.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={isFundingDialogOpen} onOpenChange={setIsFundingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs font-medium border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                    <ArrowDownToLine className="h-3.5 w-3.5 mr-1.5" />
                    Ingresar Fondos (Inversión)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreateFunding}>
                  <DialogHeader>
                    <DialogTitle>Aporte de Capital / Fondeo</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_ref" className="text-right text-xs font-semibold leading-tight">Ref. / Concepto<br/><span className="text-[10px] text-slate-400 font-normal">(Especie/Efectivo)</span></Label>
                      <Input id="f_ref" value={fundingReference} onChange={e=>setFundingReference(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Ej: TR-Bancolombia o '2 Computadores Asus'" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_amount" className="text-right text-xs">Monto Total</Label>
                      <Input id="f_amount" type="number" step="any" value={fundingAmount} onChange={e=>setFundingAmount(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="f_voucher" className="text-right text-xs">Comprobante</Label>
                      <Input 
                        id="f_voucher" 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={e => setFundingFile(e.target.files ? e.target.files[0] : null)}
                        className="col-span-3 h-8 text-xs file:py-0 file:px-2 file:h-6 file:text-xs"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Guardar Ingreso</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Legalizar Gasto (Vale)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreateExpense}>
                  <DialogHeader>
                    <DialogTitle>Comprobante de Egreso (Caja Menor)</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expenseDate" className="text-right text-xs">Fecha</Label>
                      <Input id="expenseDate" type="date" value={expenseDate} onChange={e=>setExpenseDate(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bene" className="text-right text-xs">Beneficiario</Label>
                      <Input id="bene" value={expenseBeneficiary} onChange={e=>setExpenseBeneficiary(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="A quién se le paga" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="concept" className="text-right text-xs">Concepto</Label>
                      <Input id="concept" value={expenseConcept} onChange={e=>setExpenseConcept(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Motivo del gasto" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cat" className="text-right text-xs">Categoría</Label>
                      <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                        <SelectTrigger className="col-span-3 h-8 text-sm">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRANSPORTE Y LOGISTICA">Transporte & Logística</SelectItem>
                          <SelectItem value="PAPELERIA Y FOTOCOPIAS">Papelería</SelectItem>
                          <SelectItem value="SERVICIOS Y MANTENIMIENTO">Mantenimiento</SelectItem>
                          <SelectItem value="ALIMENTACION Y REFRIGERIOS">Alimentación</SelectItem>
                          <SelectItem value="SERVICIOS PUBLICOS">Servicios Públicos</SelectItem>
                          <SelectItem value="EQUIPOS Y HARDWARE (ESPECIE)">Equipos & Hardware (Especie)</SelectItem>
                          <SelectItem value="SOFTWARE Y LICENCIAS (ESPECIE)">Software & Licencias (Especie)</SelectItem>
                          <SelectItem value="OTROS GASTOS MENORES">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right text-xs">Monto</Label>
                      <Input id="amount" type="number" step="any" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="voucher" className="text-right text-xs">Soporte/Factura</Label>
                      <Input 
                        id="voucher" 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={e => setExpenseFile(e.target.files ? e.target.files[0] : null)}
                        className="col-span-3 h-8 text-xs file:py-0 file:px-2 file:h-6 file:text-xs"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">Guardar Gasto</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 py-2 px-1 w-full min-w-0">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Fondo Asignado</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">${fondoFijo.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          <span className="text-[11px] text-slate-400 block truncate">Inyecciones socios</span>
        </div>
        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Gastos (Vales)</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-rose-600 truncate">${ejecutado.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          <span className="text-[11px] text-slate-400 block truncate">Legalizado</span>
        </div>
        <div className="space-y-0.5 col-span-2 sm:col-span-1 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Saldo Disponible</span>
          <div className={`text-base sm:text-2xl font-bold font-mono truncate ${saldoDisponible > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${saldoDisponible.toLocaleString('en-US', {minimumFractionDigits:2})}
          </div>
          <span className="text-[11px] text-slate-400 block truncate">En caja</span>
        </div>
      </div>

      <Card className="rounded-xl shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-full min-w-0 max-w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3.5 px-4 sm:px-6 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">Historial de Inversiones y Gastos</CardTitle>
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
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[650px]">
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
