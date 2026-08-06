import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    Legend
} from "recharts";
import { Users, Briefcase, FileSignature, CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useEquityData, useCreateContribution, Shareholder } from "@/hooks/accounting/useEquity";

export default function EquityDashboard() {
  const { data, isLoading, isError } = useEquityData();
  const createMutation = useCreateContribution();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  
  // Payment Form State
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });

  // Assign colors to shareholders based on index (to match the previous design)
  const colors = ["#2563eb", "#e11d48", "#10b981", "#f59e0b", "#8b5cf6"];

  const openPaymentDialog = (sh: Shareholder) => {
      setSelectedShareholder(sh);
      setIsPaymentDialogOpen(true);
      setAmount("");
      setReference("");
      setEvidenceFile(null);
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedShareholder || !amount || !reference) {
          toast.error("Todos los campos son obligatorios.");
          return;
      }
      if (!evidenceFile) {
          toast.error("Debes adjuntar el comprobante de transferencia bancaria.");
          return;
      }

      try {
          toast.loading("Subiendo evidencia...", { id: "equity_upload" });
          const fileExt = evidenceFile.name.split('.').pop();
          const fileName = `${Date.now()}-equity-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, evidenceFile);
          if (uploadError) throw new Error("Error al subir archivo: " + uploadError.message);
          
          const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
          
          await createMutation.mutateAsync({
              shareholder_id: selectedShareholder.id,
              amount: parseFloat(amount),
              payment_date: paymentDate,
              reference,
              receipt_url: publicUrlData.publicUrl
          });

          toast.success("Pago de aporte registrado exitosamente.");
          setIsPaymentDialogOpen(false);
      } catch (err: any) {
          toast.error("Error al registrar: " + err.message);
      } finally {
          toast.dismiss("equity_upload");
      }
  };

  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-96">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
      );
  }

  if (isError || !data) {
      return (
          <div className="flex flex-col justify-center items-center h-96 text-red-500">
              <AlertCircle className="w-10 h-10 mb-4" />
              <h2 className="text-xl font-bold">Error al cargar datos del Patrimonio</h2>
              <p>Por favor verifica tu conexión a la base de datos.</p>
          </div>
      );
  }

  const { shareholders, summary } = data;
  const pieData = shareholders.map((s, idx) => ({
    name: s.name.split(" ")[0] + " " + s.name.split(" ")[2], // Nombres cortos
    value: Number((Number(s.subscribed_value) / summary.totalSubscribed) * 100),
    color: colors[idx % colors.length]
  }));

  const percentSubscribed = (summary.totalSubscribed / summary.authorizedCapital) * 100;
  const percentPaid = summary.totalSubscribed > 0 ? (summary.totalPaid / summary.totalSubscribed) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Visual */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
            <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Patrimonio y Composición Accionaria</h1>
            <p className="text-sm text-slate-300 mt-1">
                Capital y Acciones (Datos Dinámicos)
            </p>
            </div>
        </div>
      </div>

      {/* Resumen de Capital (Visual Bar) */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-blue-600" />
                  Estructura del Capital Social
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Capital Autorizado */}
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Capital Autorizado</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white">{formatter.format(summary.authorizedCapital)}</p>
                      <p className="text-xs text-slate-500">500.000 Acciones (Máximo)</p>
                  </div>
                  
                  {/* Capital Suscrito */}
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Capital Suscrito</p>
                      <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{formatter.format(summary.totalSubscribed)}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{shareholders.reduce((sum, s) => sum + s.shares_owned, 0).toLocaleString()} Acciones</span>
                        <span className="font-bold">{percentSubscribed.toFixed(1)}% del Autorizado</span>
                      </div>
                      <Progress value={percentSubscribed} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
                  </div>

                  {/* Capital Pagado */}
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Capital Pagado</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatter.format(summary.totalPaid)}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Saldo Pendiente: {formatter.format(summary.totalPending)}</span>
                        <span className="font-bold">{percentPaid.toFixed(1)}% Suscrito</span>
                      </div>
                      <Progress value={percentPaid} className="h-2 bg-emerald-100 dark:bg-emerald-900/30" />
                  </div>
              </div>
          </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-12">
          
        {/* Distribución de Accionistas */}
        <div className="md:col-span-8 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1">
                <Users className="h-5 w-5 text-slate-500" />
                Libro de Registro de Accionistas
            </h3>
            
            {shareholders.length === 0 ? (
                <div className="text-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500">No hay accionistas registrados en la base de datos.</p>
                </div>
            ) : null}

            {shareholders.map((socio: any, idx: number) => {
                const color = colors[idx % colors.length];
                const participacion = ((Number(socio.subscribed_value) / summary.totalSubscribed) * 100).toFixed(2);
                
                return (
                <Card key={socio.id} className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            {/* Panel Izquierdo: Info Socio */}
                            <div className="p-5 sm:w-2/5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
                                        {socio.name.charAt(0)}{socio.name.split(" ")[2]?.charAt(0) || ''}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{socio.name}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{socio.document_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mt-4">
                                    <Badge variant="outline" className="text-[10px] font-semibold bg-white dark:bg-slate-800">{socio.share_class}</Badge>
                                    <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Aporte:</strong> {socio.contribution_type}</p>
                                </div>
                            </div>
                            
                            {/* Panel Derecho: Estado Financiero */}
                            <div className="p-5 sm:w-3/5 flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-500">Participación</p>
                                        <p className="text-2xl font-black" style={{ color: color }}>{participacion}%</p>
                                        <p className="text-xs font-semibold text-slate-600 mt-0.5">{socio.shares_owned.toLocaleString()} Acciones</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase text-slate-500">Valor Suscrito</p>
                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatter.format(socio.subscribed_value)}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Pagado: {formatter.format(socio.paidValue)}
                                        </span>
                                        {socio.pendingValue > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 font-semibold text-rose-500">
                                                    <AlertCircle className="h-3.5 w-3.5" /> Pendiente: {formatter.format(socio.pendingValue)}
                                                </span>
                                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => openPaymentDialog(socio)}>
                                                    Registrar Pago
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 font-bold text-[10px] uppercase">100% Pagado</span>
                                        )}
                                    </div>
                                    <Progress 
                                        value={(socio.paidValue / (Number(socio.subscribed_value) || 1)) * 100} 
                                        className="h-2"
                                        style={{ '--progress-background': color } as any}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )})}
        </div>

        {/* Gráfica de Participación */}
        <div className="md:col-span-4">
            <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Composición Accionaria</CardTitle>
                    <CardDescription>Distribución porcentual del capital suscrito.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    {shareholders.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Participación']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 w-full">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Nota Legal (Acta 002):</p>
                                <p className="mb-2">El saldo de <strong>R. Acosta</strong> vence en un plazo máx. de 2 años.</p>
                                <p>El saldo de <strong>J. Navarro</strong> vence en 6 meses mediante cuotas.</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm">Sin datos para graficar</p>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>

      {/* Modal para Registrar Pago de Socio */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleRegisterPayment}>
            <DialogHeader>
              <DialogTitle>Registrar Pago de Capital</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-xs text-slate-500 mb-2">Registra el abono del socio {selectedShareholder?.name} para cubrir su capital suscrito pendiente.</p>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                  <p className="text-xs text-slate-600">Saldo Pendiente Actual: <strong className="text-rose-600 text-sm">{formatter.format((selectedShareholder as any)?.pendingValue || 0)}</strong></p>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="p_date" className="text-right text-xs">Fecha</Label>
                <Input id="p_date" type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} className="col-span-3 h-8 text-sm" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="p_amount" className="text-right text-xs">Monto ($)</Label>
                <Input id="p_amount" type="number" step="0.01" max={(selectedShareholder as any)?.pendingValue} value={amount} onChange={e=>setAmount(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Monto abonado" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="p_ref" className="text-right text-xs">Referencia</Label>
                <Input id="p_ref" value={reference} onChange={e=>setReference(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="No. Transferencia / Banco" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="p_file" className="text-right text-xs">Evidencia</Label>
                <Input id="p_file" type="file" accept="image/*,.pdf" onChange={e=>setEvidenceFile(e.target.files?.[0] || null)} className="col-span-3 h-9 text-xs py-1.5 cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:mr-2 hover:file:bg-blue-100" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Registrar Aporte
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
