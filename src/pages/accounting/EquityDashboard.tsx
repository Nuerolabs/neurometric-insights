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
import { 
  Users, 
  Briefcase, 
  FileSignature, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Loader2, 
  UserPlus, 
  ShieldCheck, 
  Pencil, 
  Trash2,
  Settings2,
  Printer,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  useEquityData, 
  useCreateContribution, 
  useCreateShareholder, 
  useUpdateShareholder, 
  useDeleteShareholder, 
  useUpdateAuthorizedCapital, 
  Shareholder 
} from "@/hooks/accounting/useEquity";

export default function EquityDashboard() {
  const { data, isLoading, isError } = useEquityData();
  const createContributionMutation = useCreateContribution();
  const createShareholderMutation = useCreateShareholder();
  const updateShareholderMutation = useUpdateShareholder();
  const deleteShareholderMutation = useDeleteShareholder();
  const updateCapitalMutation = useUpdateAuthorizedCapital();

  // Modals
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShareholderDialogOpen, setIsShareholderDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCapitalDialogOpen, setIsCapitalDialogOpen] = useState(false);
  
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  
  // Capital Autorizado Form State
  const [newAuthorizedCapital, setNewAuthorizedCapital] = useState("");

  // New Shareholder Form State
  const [shName, setShName] = useState("");
  const [shDocument, setShDocument] = useState("");
  const [shSharesA, setShSharesA] = useState("");
  const [shSharesB, setShSharesB] = useState("");
  const [shSubscribed, setShSubscribed] = useState("");
  const [shPaid, setShPaid] = useState("");
  const [shContributionType, setShContributionType] = useState("Capital & Tecnología");
  const [shIsFounder, setShIsFounder] = useState(true);

  // Edit Shareholder Form State
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDocument, setEditDocument] = useState("");
  const [editSharesA, setEditSharesA] = useState("");
  const [editSharesB, setEditSharesB] = useState("");
  const [editSubscribed, setEditSubscribed] = useState("");
  const [editContributionType, setEditContributionType] = useState("");
  const [editIsFounder, setEditIsFounder] = useState(true);

  // Payment Form State
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });

  const colors = ["#2563eb", "#e11d48", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  const openPaymentDialog = (sh: Shareholder) => {
      setSelectedShareholder(sh);
      setIsPaymentDialogOpen(true);
      setAmount("");
      setReference("");
      setEvidenceFile(null);
  };

  const openEditDialog = (sh: Shareholder) => {
    setEditId(sh.id);
    setEditName(sh.name);
    setEditDocument(sh.document_id);
    setEditSubscribed(sh.subscribed_value.toString());
    setEditContributionType(sh.contribution_type);
    setEditIsFounder(sh.is_founder);

    // Parse Class A and B if formatted
    const totalShares = sh.shares_owned || Math.round(Number(sh.subscribed_value) / 1000);
    const rawClass = sh.share_class || "";
    const matchA = rawClass.match(/Clase A\s*\(?(\d[\d\.\,]*)\)?/i);
    const matchB = rawClass.match(/Clase B\s*\(?(\d[\d\.\,]*)\)?/i);

    if (matchA || matchB) {
      setEditSharesA(matchA ? matchA[1].replace(/\./g, '') : "0");
      setEditSharesB(matchB ? matchB[1].replace(/\./g, '') : "0");
    } else {
      setEditSharesA(totalShares.toString());
      setEditSharesB("0");
    }

    setIsEditDialogOpen(true);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAuthorizedCapital);
    if (!val || val <= 0) {
      toast.error("Ingresa un monto válido para el capital autorizado.");
      return;
    }
    try {
      await updateCapitalMutation.mutateAsync(val);
      toast.success("Capital autorizado actualizado exitosamente.");
      setIsCapitalDialogOpen(false);
    } catch (err: any) {
      toast.error("Error al actualizar capital: " + err.message);
    }
  };

  const handleCreateShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shName || !shDocument || !shSubscribed) {
      toast.error("Por favor completa el nombre, documento y capital suscrito.");
      return;
    }

    const subscribedNum = parseFloat(shSubscribed) || 0;
    const paidNum = parseFloat(shPaid) || 0;
    const sharesANum = parseInt(shSharesA) || 0;
    const sharesBNum = parseInt(shSharesB) || 0;
    const totalShares = (sharesANum + sharesBNum) > 0 ? (sharesANum + sharesBNum) : Math.round(subscribedNum / 1000);

    if (paidNum > subscribedNum) {
      toast.error("El capital pagado no puede superar el capital suscrito.");
      return;
    }

    // Determine share class description
    let computedClass = "Ordinarias Clase A";
    if (sharesANum > 0 && sharesBNum > 0) {
      computedClass = `Clase A (${sharesANum.toLocaleString()}) + Clase B (${sharesBNum.toLocaleString()})`;
    } else if (sharesBNum > 0) {
      computedClass = `Preferenciales Clase B (${sharesBNum.toLocaleString()})`;
    } else if (sharesANum > 0) {
      computedClass = `Ordinarias Clase A (${sharesANum.toLocaleString()})`;
    }

    try {
      const created = await createShareholderMutation.mutateAsync({
        name: shName,
        document_id: shDocument,
        shares_owned: totalShares,
        subscribed_value: subscribedNum,
        share_class: computedClass,
        contribution_type: shContributionType,
        is_founder: shIsFounder
      });

      // Si el socio pagó una parte o la totalidad al constituir, se registra su aporte inicial
      if (paidNum > 0 && created?.id) {
        await createContributionMutation.mutateAsync({
          shareholder_id: created.id,
          amount: paidNum,
          payment_date: new Date().toISOString().split('T')[0],
          reference: "APORTE-INICIAL-CONSTITUCION"
        });
      }

      toast.success(`Socio ${shName} registrado. ${totalShares.toLocaleString()} Acciones (${formatter.format(subscribedNum)}).`);
      setIsShareholderDialogOpen(false);
      setShName("");
      setShDocument("");
      setShSubscribed("");
      setShPaid("");
      setShSharesA("");
      setShSharesB("");
    } catch (err: any) {
      toast.error("Error al registrar socio: " + err.message);
    }
  };

  const handleUpdateShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editDocument || !editSubscribed) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    const subscribedNum = parseFloat(editSubscribed) || 0;
    const sharesANum = parseInt(editSharesA) || 0;
    const sharesBNum = parseInt(editSharesB) || 0;
    const totalShares = (sharesANum + sharesBNum) > 0 ? (sharesANum + sharesBNum) : Math.round(subscribedNum / 1000);

    let computedClass = "Ordinarias Clase A";
    if (sharesANum > 0 && sharesBNum > 0) {
      computedClass = `Clase A (${sharesANum.toLocaleString()}) + Clase B (${sharesBNum.toLocaleString()})`;
    } else if (sharesBNum > 0) {
      computedClass = `Preferenciales Clase B (${sharesBNum.toLocaleString()})`;
    } else if (sharesANum > 0) {
      computedClass = `Ordinarias Clase A (${sharesANum.toLocaleString()})`;
    }

    try {
      await updateShareholderMutation.mutateAsync({
        id: editId,
        name: editName,
        document_id: editDocument,
        shares_owned: totalShares,
        subscribed_value: subscribedNum,
        share_class: computedClass,
        contribution_type: editContributionType,
        is_founder: editIsFounder
      });

      toast.success(`Datos del socio actualizados exitosamente.`);
      setIsEditDialogOpen(false);
    } catch (err: any) {
      toast.error("Error al actualizar socio: " + err.message);
    }
  };

  const handleDeleteShareholder = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar al socio ${name}?`)) {
      try {
        await deleteShareholderMutation.mutateAsync(id);
        toast.success(`Socio ${name} eliminado.`);
      } catch (err: any) {
        toast.error("Error al eliminar: " + err.message);
      }
    }
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
          toast.loading("Procesando evidencia del aporte...", { id: "equity_upload" });
          let receiptUrl = "";

          try {
            const fileExt = evidenceFile.name.split('.').pop();
            const fileName = `${Date.now()}-equity-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, evidenceFile);
            
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
              receiptUrl = publicUrlData.publicUrl;
            } else {
              receiptUrl = await readFileAsDataUrl(evidenceFile);
            }
          } catch {
            receiptUrl = await readFileAsDataUrl(evidenceFile);
          }
          
          await createContributionMutation.mutateAsync({
              shareholder_id: selectedShareholder.id,
              amount: parseFloat(amount),
              payment_date: paymentDate,
              reference,
              receipt_url: receiptUrl
          });

          toast.success("Aporte de capital registrado exitosamente.");
          setIsPaymentDialogOpen(false);
      } catch (err: any) {
          toast.error("Error al registrar: " + err.message);
      } finally {
          toast.dismiss("equity_upload");
      }
  };

  if (isLoading) {
      return (
          <div className="flex flex-col justify-center items-center h-96 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-500">Cargando libro de socios y patrimonio...</p>
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
    name: s.name,
    value: summary.totalSubscribed > 0 ? Number(((Number(s.subscribed_value) / summary.totalSubscribed) * 100).toFixed(1)) : 0,
    color: colors[idx % colors.length]
  }));

  const percentSubscribed = summary.authorizedCapital > 0 ? (summary.totalSubscribed / summary.authorizedCapital) * 100 : 0;
  const percentPaid = summary.totalSubscribed > 0 ? (summary.totalPaid / summary.totalSubscribed) * 100 : 0;

  // Real-time calculations for new shareholder form
  const curSubscribed = parseFloat(shSubscribed) || 0;
  const curPaid = parseFloat(shPaid) || 0;
  const curSharesA = parseInt(shSharesA) || 0;
  const curSharesB = parseInt(shSharesB) || 0;
  const curTotalShares = (curSharesA + curSharesB) > 0 ? (curSharesA + curSharesB) : Math.round(curSubscribed / 1000);

  // Real-time calculations for edit shareholder form
  const curEditSubscribed = parseFloat(editSubscribed) || 0;
  const curEditSharesA = parseInt(editSharesA) || 0;
  const curEditSharesB = parseInt(editSharesB) || 0;
  const curEditTotalShares = (curEditSharesA + curEditSharesB) > 0 ? (curEditSharesA + curEditSharesB) : Math.round(curEditSubscribed / 1000);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Estructura Corporativa & Societaria
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Patrimonio y Composición Accionaria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de capital suscrito, acciones Clase A / B, capital pagado y saldos pendientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Modal Modificar Capital Autorizado */}
          <Dialog open={isCapitalDialogOpen} onOpenChange={setIsCapitalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs font-medium text-slate-700 dark:text-slate-200" onClick={() => setNewAuthorizedCapital(summary.authorizedCapital.toString())}>
                <Settings2 className="h-4 w-4 mr-1.5 text-slate-500" />
                Modificar Capital Autorizado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <form onSubmit={handleUpdateCapital}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Modificar Capital Autorizado</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <p className="text-xs text-slate-500">
                    Establece el valor total del capital autorizado según los estatutos de constitución de la empresa.
                  </p>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Nuevo Capital Autorizado (COP) *</Label>
                    <Input 
                      type="number" 
                      value={newAuthorizedCapital} 
                      onChange={e=>setNewAuthorizedCapital(e.target.value)} 
                      className="h-9 text-sm font-mono mt-1" 
                      placeholder="500000000" 
                      required 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold w-full dark:bg-blue-600">
                    Guardar Nuevo Capital
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Registrar Socio */}
          <Dialog open={isShareholderDialogOpen} onOpenChange={setIsShareholderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Registrar Socio / Accionista
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px]">
              <form onSubmit={handleCreateShareholder}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Registrar Accionista & Aportes</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3.5 py-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Nombre Completo y Rol *</Label>
                    <Input value={shName} onChange={e=>setShName(e.target.value)} className="h-9 text-sm mt-1" placeholder="Ej: Jesús Cantillo (Representante Legal)" required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Cédula / NIT *</Label>
                    <Input value={shDocument} onChange={e=>setShDocument(e.target.value)} className="h-9 text-sm mt-1 font-mono" placeholder="1.080.822.532" required />
                  </div>

                  {/* Desglose de Acciones Clase A y B */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Composición de Acciones (Nominal $1.000 COP c/u)</Label>
                      <Badge variant="outline" className="text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border-blue-200">
                        Total: {curTotalShares.toLocaleString()} Acciones
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <Label className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Acciones Ordinarias Clase A</Label>
                        <Input 
                          type="number" 
                          value={shSharesA} 
                          onChange={e=>{
                            const valA = e.target.value;
                            setShSharesA(valA);
                            const numA = parseInt(valA) || 0;
                            const numB = parseInt(shSharesB) || 0;
                            const tot = numA + numB;
                            if (tot > 0) {
                              setShSubscribed((tot * 1000).toString());
                            }
                          }} 
                          className="h-9 text-sm font-mono mt-1 font-semibold" 
                          placeholder="Ej: 7200" 
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">Acciones Clase B (Preferenciales)</Label>
                        <Input 
                          type="number" 
                          value={shSharesB} 
                          onChange={e=>{
                            const valB = e.target.value;
                            setShSharesB(valB);
                            const numB = parseInt(valB) || 0;
                            const numA = parseInt(shSharesA) || 0;
                            const tot = numA + numB;
                            if (tot > 0) {
                              setShSubscribed((tot * 1000).toString());
                            }
                          }} 
                          className="h-9 text-sm font-mono mt-1 font-semibold" 
                          placeholder="Ej: 4800" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Capital Suscrito Total (COP) *</Label>
                      <Input 
                        type="number" 
                        value={shSubscribed} 
                        onChange={e=>{
                          const val = e.target.value;
                          setShSubscribed(val);
                          const num = parseFloat(val) || 0;
                          const calculatedShares = Math.round(num / 1000);
                          if (!shSharesA && !shSharesB) {
                            setShSharesA(calculatedShares.toString());
                          }
                        }} 
                        className="h-9 text-sm font-mono mt-1 font-semibold" 
                        placeholder="Ej: 12000000" 
                        required 
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Capital Pagado Inicial (COP)</Label>
                      <Input 
                        type="number" 
                        value={shPaid} 
                        onChange={e=>setShPaid(e.target.value)} 
                        className="h-9 text-sm font-mono mt-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" 
                        placeholder="Ej: 12000000" 
                      />
                    </div>
                  </div>

                  {/* Resumen dinámico en vivo */}
                  {curSubscribed > 0 && (
                    <div className="p-3 bg-blue-50/60 dark:bg-slate-850 rounded-lg border border-blue-100 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Acciones Calculadas:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {curTotalShares.toLocaleString()} Acciones {curSharesA > 0 && curSharesB > 0 ? `(${curSharesA.toLocaleString()} Clase A + ${curSharesB.toLocaleString()} Clase B)` : ''}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Total Suscrito (Compromiso):</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{formatter.format(curSubscribed)}</strong>
                      </div>
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                        <span>Abono Pagado en Caja:</span>
                        <strong className="font-mono">{formatter.format(curPaid)}</strong>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Saldo Pendiente por Pagar:</span>
                        <span className="font-mono">{formatter.format(Math.max(0, curSubscribed - curPaid))}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Naturaleza / Tipo de Aporte</Label>
                    <select 
                      value={shContributionType} 
                      onChange={e=>setShContributionType(e.target.value)} 
                      className="w-full h-9 text-xs mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="Dinero en Efectivo / Banco">💵 Dinero en Efectivo / Cuenta Bancaria (Liquidez Real)</option>
                      <option value="Capital & Tecnología">🤝 Capital & Tecnología (Mixto)</option>
                      <option value="En Especie (Equipos / Computadores)">💻 En Especie (Equipos de Cómputo / Hardware)</option>
                      <option value="En Especie (Software / Propiedad Intelectual)">🧠 En Especie (Software / Propiedad Intelectual)</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full" disabled={createShareholderMutation.isPending}>
                    {createShareholderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Guardar Socio y Registrar Aportes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen de Capital Social */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-blue-600" />
                    Estructura del Capital Social
                </h2>
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => window.print()}>
                    <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir Libro de Socios / PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 font-semibold" onClick={() => { setNewAuthorizedCapital(summary.authorizedCapital.toString()); setIsCapitalDialogOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Modificar Capital
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Capital Autorizado */}
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Capital Autorizado</p>
                      <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{formatter.format(summary.authorizedCapital)}</p>
                      <p className="text-xs text-slate-500">Límite estatutario societario</p>
                  </div>
                  
                  {/* Capital Suscrito */}
                  <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Capital Suscrito</p>
                      <p className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400">{formatter.format(summary.totalSubscribed)}</p>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>{shareholders.reduce((sum, s) => sum + (s.shares_owned || 0), 0).toLocaleString()} Acciones</span>
                        <span className="font-bold">{percentSubscribed.toFixed(1)}% del Autorizado</span>
                      </div>
                      <Progress value={percentSubscribed} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
                  </div>

                  {/* Capital Pagado */}
                  <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Capital Social Pagado</p>
                        <Badge variant="outline" className="text-[10px] font-bold bg-emerald-100/50 text-emerald-800 border-emerald-300">
                          {percentPaid.toFixed(1)}% Pagado
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatter.format(summary.totalPaid)}</p>
                      
                      {/* Desglose Dinero Real vs Especie */}
                      <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-1 text-[11px]">
                        <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
                            💵 Dinero Real Bancos:
                          </span>
                          <strong className="font-mono text-blue-700 dark:text-blue-400">{formatter.format(summary.totalCashPaid)}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            💻 Bienes & Especie:
                          </span>
                          <strong className="font-mono">{formatter.format(summary.totalSpeciesPaid)}</strong>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-12">
          
        {/* Distribución de Accionistas */}
        <div className="md:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Libro de Registro de Accionistas & Socios ({shareholders.length})
              </h3>
            </div>
            
            {shareholders.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay socios registrados en el libro</h4>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                      Registra a los socios fundadores, representante legal e inversionistas para calcular automáticamente la composición accionaria y sus aportes.
                    </p>
                    <Button onClick={() => setIsShareholderDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                      <UserPlus className="w-4 h-4 mr-1.5" /> Registrar Primer Socio
                    </Button>
                </div>
            ) : null}

            {shareholders.map((socio: any, idx: number) => {
                const color = colors[idx % colors.length];
                const participacion = summary.totalSubscribed > 0 
                  ? ((Number(socio.subscribed_value || 0) / summary.totalSubscribed) * 100).toFixed(2)
                  : "0.00";
                
                return (
                <Card key={socio.id} className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-slate-300 transition-colors">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            {/* Panel Izquierdo: Info Socio */}
                            <div className="p-5 sm:w-2/5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0" style={{ backgroundColor: color }}>
                                        {socio.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight truncate" title={socio.name}>{socio.name}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">CC / NIT: {socio.document_id}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1.5 mt-2">
                                    <Badge variant="outline" className="text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {socio.share_class || 'Ordinarias'}
                                    </Badge>
                                    <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Aporte:</strong> {socio.contribution_type || 'Capital'}</p>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                                  <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400" onClick={() => openEditDialog(socio)}>
                                    <Pencil className="w-3 h-3 mr-1" /> Editar
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={() => handleDeleteShareholder(socio.id, socio.name)}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                  </Button>
                                </div>
                            </div>
                            
                            {/* Panel Derecho: Estado Financiero */}
                            <div className="p-5 sm:w-3/5 flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-500">Participación</p>
                                        <p className="text-2xl font-bold font-mono" style={{ color: color }}>{participacion}%</p>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{(socio.shares_owned || 0).toLocaleString()} Acciones</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase text-slate-500">Capital Suscrito</p>
                                        <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">{formatter.format(socio.subscribed_value || 0)}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Pagado: {formatter.format(socio.paidValue || 0)}
                                        </span>
                                        {socio.pendingValue > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 font-semibold text-rose-500">
                                                    <AlertCircle className="h-3.5 w-3.5" /> Pendiente: {formatter.format(socio.pendingValue)}
                                                </span>
                                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40" onClick={() => openPaymentDialog(socio)}>
                                                    + Aportar
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Pagado</span>
                                        )}
                                    </div>
                                    <Progress 
                                        value={(socio.paidValue / (Number(socio.subscribed_value) || 1)) * 100} 
                                        className="h-2"
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
            <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
                <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Distribución Societaria</CardTitle>
                    <CardDescription className="text-xs">Distribución del capital suscrito total.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-6 min-h-[300px]">
                    {shareholders.length > 0 && summary.totalSubscribed > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Participación']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 w-full space-y-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Control Estatutario
                                </p>
                                <p>El porcentaje se recalcula en tiempo real según los aportes suscritos de cada socio.</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8 text-slate-400 text-xs">
                          Registra socios para visualizar el gráfico de distribución societaria.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>

      {/* Modal para Editar Socio */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleUpdateShareholder}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Editar Accionista / Socio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3.5 py-4">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Nombre Completo y Cargo *</Label>
                <Input value={editName} onChange={e=>setEditName(e.target.value)} className="h-9 text-sm mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Cédula / Documento *</Label>
                <Input value={editDocument} onChange={e=>setEditDocument(e.target.value)} className="h-9 text-sm mt-1 font-mono" required />
              </div>

              {/* Desglose de Acciones Clase A y B al Editar */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Composición de Acciones (Nominal $1.000 COP c/u)</Label>
                  <Badge variant="outline" className="text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border-blue-200">
                    Total: {curEditTotalShares.toLocaleString()} Acciones
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Acciones Ordinarias Clase A</Label>
                    <Input 
                      type="number" 
                      value={editSharesA} 
                      onChange={e=>{
                        const valA = e.target.value;
                        setEditSharesA(valA);
                        const numA = parseInt(valA) || 0;
                        const numB = parseInt(editSharesB) || 0;
                        const tot = numA + numB;
                        if (tot > 0) {
                          setEditSubscribed((tot * 1000).toString());
                        }
                      }} 
                      className="h-9 text-sm font-mono mt-1 font-semibold" 
                      placeholder="Ej: 7200" 
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">Acciones Clase B (Preferenciales)</Label>
                    <Input 
                      type="number" 
                      value={editSharesB} 
                      onChange={e=>{
                        const valB = e.target.value;
                        setEditSharesB(valB);
                        const numB = parseInt(valB) || 0;
                        const numA = parseInt(editSharesA) || 0;
                        const tot = numA + numB;
                        if (tot > 0) {
                          setEditSubscribed((tot * 1000).toString());
                        }
                      }} 
                      className="h-9 text-sm font-mono mt-1 font-semibold" 
                      placeholder="Ej: 4800" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Capital Suscrito (COP) *</Label>
                <Input 
                  type="number" 
                  value={editSubscribed} 
                  onChange={e=>{
                    const val = e.target.value;
                    setEditSubscribed(val);
                    const num = parseFloat(val) || 0;
                    const calculatedShares = Math.round(num / 1000);
                    if (!editSharesA && !editSharesB) {
                      setEditSharesA(calculatedShares.toString());
                    }
                  }} 
                  className="h-9 text-sm font-mono mt-1 font-semibold" 
                  required 
                />
              </div>

              {/* Resumen dinámico al editar */}
              {curEditSubscribed > 0 && (
                <div className="p-3 bg-blue-50/60 dark:bg-slate-850 rounded-lg border border-blue-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Acciones Totales Calculadas:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {curEditTotalShares.toLocaleString()} Acciones {curEditSharesA > 0 && curEditSharesB > 0 ? `(${curEditSharesA.toLocaleString()} Clase A + ${curEditSharesB.toLocaleString()} Clase B)` : ''}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Capital Suscrito:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{formatter.format(curEditSubscribed)}</strong>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold text-slate-600">Naturaleza / Tipo de Aporte</Label>
                <select 
                  value={editContributionType} 
                  onChange={e=>setEditContributionType(e.target.value)} 
                  className="w-full h-9 text-xs mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="Dinero en Efectivo / Banco">💵 Dinero en Efectivo / Cuenta Bancaria (Liquidez Real)</option>
                  <option value="Capital & Tecnología">🤝 Capital & Tecnología (Mixto)</option>
                  <option value="En Especie (Equipos / Computadores)">💻 En Especie (Equipos de Cómputo / Hardware)</option>
                  <option value="En Especie (Software / Propiedad Intelectual)">🧠 En Especie (Software / Propiedad Intelectual)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full" disabled={updateShareholderMutation.isPending}>
                {updateShareholderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Registrar Pago / Aporte de Socio */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleRegisterPayment}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Registrar Aporte de Capital</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3.5 py-4">
              <p className="text-xs text-slate-500">
                Registra el comprobante de aporte para el socio <strong>{selectedShareholder?.name}</strong>.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Saldo Pendiente por Pagar: <strong className="text-rose-600 text-sm font-mono">{formatter.format((selectedShareholder as any)?.pendingValue || 0)}</strong>
                  </p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Fecha de Transferencia / Aporte</Label>
                <Input type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} className="h-9 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Monto del Aporte (COP) *</Label>
                <Input type="number" max={(selectedShareholder as any)?.pendingValue} value={amount} onChange={e=>setAmount(e.target.value)} className="h-9 text-sm font-mono mt-1" placeholder="Ej: 10000000" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Referencia / Comprobante / Concepto *</Label>
                <Input value={reference} onChange={e=>setReference(e.target.value)} className="h-9 text-sm mt-1 font-mono" placeholder="Ej: TR-Bancolombia #88192 o Acta #001" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Comprobante de Transferencia (Evidencia) *</Label>
                <Input type="file" accept="image/*,.pdf" onChange={e=>setEvidenceFile(e.target.files?.[0] || null)} className="h-9 text-xs py-1.5 mt-1 cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:mr-2 hover:file:bg-blue-100" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={createContributionMutation.isPending}>
                  {createContributionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirmar Aporte
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN OFICIAL DE IMPRESIÓN DEL LIBRO DE ACCIONISTAS
      ══════════════════════════════════════════════════════════════ */}
      <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 print:border-none print:p-0 print:m-0">
        
        {/* Membrete Oficial visible en impresión */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">NEUROLABS TECH SOLUTIONS S.A.S.</h1>
              <p className="text-xs font-semibold text-slate-700">NIT: 901.882.253-1 • Sitionuevo, Magdalena, Colombia</p>
              <p className="text-[11px] text-slate-600">Libro Oficial de Accionistas • Normas de Código de Comercio y NIIF</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-900">CERTIFICADO ACCIONARIO OFICIAL</p>
              <p className="text-slate-600">Fecha de Expedición: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-slate-600">Moneda: Pesos Colombianos (COP)</p>
            </div>
          </div>
        </div>

        {/* Certificación */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            Certificación de Composición de Capital y Derechos Societarios
          </div>
          <p className="leading-relaxed">
            El suscrito <strong>Representante Legal</strong> de <strong>NEUROLABS TECH SOLUTIONS S.A.S.</strong> certifica que a la fecha de expedición, el capital de la sociedad se encuentra compuesto por un Capital Autorizado de <strong>{formatter.format(summary.authorizedCapital)}</strong>, un Capital Suscrito de <strong>{formatter.format(summary.totalSubscribed)}</strong> y un Capital Social Pagado de <strong>{formatter.format(summary.totalPaid)}</strong> (desglosado en Dinero Real Líquido: <strong>{formatter.format(summary.totalCashPaid)}</strong> y Bienes/Activos en Especie: <strong>{formatter.format(summary.totalSpeciesPaid)}</strong>), debidamente asentado en los libros estatutarios de la compañía.
          </p>
        </div>

        {/* Bloque de Firmas Oficiales */}
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
              <p className="font-bold text-slate-900 dark:text-white">SECRETARÍA GENERAL / REVISORÍA</p>
              <p className="text-slate-500">Certificación y Asentamiento en Libro</p>
              <p className="text-slate-500 text-[11px]">Cámara de Comercio de Santa Marta para el Magdalena</p>
              <p className="text-slate-400 text-[10px]">Libro de Registro de Accionistas</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
