import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, ArrowRightLeft, Loader2, XCircle, FileText, Trash2 } from "lucide-react";
import { useJournalEntries, useCreateJournalEntry } from "@/hooks/accounting/useJournalEntries";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State para la Cabecera
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  
  // Form State para las Líneas
  const [lines, setLines] = useState<{account_id: string, debit: number, credit: number, description: string}[]>([
      { account_id: "", debit: 0, credit: 0, description: "" },
      { account_id: "", debit: 0, credit: 0, description: "" }
  ]);

  const { data: entries, isLoading, isError, error } = useJournalEntries();
  const { data: accounts } = useAccounts();
  const createMutation = useCreateJournalEntry();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "POSTED": return <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5">Contabilizado</Badge>;
      case "DRAFT": return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5">Borrador</Badge>;
      case "VOIDED": return <Badge variant="destructive" className="font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5">Anulado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddLine = () => {
      setLines([...lines, { account_id: "", debit: 0, credit: 0, description: "" }]);
  };

  const handleRemoveLine = (index: number) => {
      if (lines.length <= 2) {
          toast.error("Un asiento debe tener al menos 2 líneas.");
          return;
      }
      setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
      const newLines = [...lines];
      (newLines[index] as any)[field] = value;
      
      // Mutual exclusion for debit/credit for UI friendliness
      if (field === 'debit' && value > 0) newLines[index].credit = 0;
      if (field === 'credit' && value > 0) newLines[index].debit = 0;
      
      setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!reference || !description) {
          toast.error("Referencia y concepto son obligatorios.");
          return;
      }

      // Validar que todas las líneas tengan cuenta seleccionada
      if (lines.some(l => !l.account_id)) {
          toast.error("Todas las líneas deben tener una cuenta seleccionada.");
          return;
      }

      try {
          await createMutation.mutateAsync({
              entry: {
                  reference,
                  description,
                  date: new Date().toISOString().split('T')[0]
              },
              lines: lines.map(l => ({
                  ...l,
                  debit: Number(l.debit),
                  credit: Number(l.credit)
              }))
          });
          toast.success("Asiento contabilizado exitosamente.");
          setIsDialogOpen(false);
          // Reset
          setReference("");
          setDescription("");
          setLines([{ account_id: "", debit: 0, credit: 0, description: "" }, { account_id: "", debit: 0, credit: 0, description: "" }]);
      } catch (err: any) {
          toast.error(err.message);
      }
  };

  const filteredEntries = entries?.filter(e => 
    e.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalDebits = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredits = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 mx-auto animate-in fade-in duration-300">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs w-full min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Libro Diario (Asientos)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Registro central de transacciones financieras por partida doble.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9 text-xs font-medium">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Exportar CSV
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nuevo Asiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Asiento Contable</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      {/* Cabecera */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div>
                              <Label className="text-xs mb-1 block">Referencia (Factura, Recibo)</Label>
                              <Input value={reference} onChange={e=>setReference(e.target.value)} className="h-8 text-sm" placeholder="Ej: FAC-1050" />
                          </div>
                          <div>
                              <Label className="text-xs mb-1 block">Concepto General</Label>
                              <Input value={description} onChange={e=>setDescription(e.target.value)} className="h-8 text-sm" placeholder="Ej: Venta de servicios" />
                          </div>
                      </div>

                      {/* Líneas */}
                      <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Líneas del Asiento</Label>
                          {lines.map((line, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                  <div className="w-[40%]">
                                      <select 
                                        value={line.account_id} 
                                        onChange={e => handleLineChange(index, 'account_id', e.target.value)}
                                        className="w-full h-8 text-xs rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950"
                                      >
                                          <option value="">Seleccionar Cuenta...</option>
                                          {accounts?.map(acc => (
                                              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                          ))}
                                      </select>
                                  </div>
                                  <div className="w-[25%]">
                                      <Input type="number" step="0.01" value={line.debit || ""} onChange={e => handleLineChange(index, 'debit', e.target.value)} className="h-8 text-xs text-right" placeholder="Débito" />
                                  </div>
                                  <div className="w-[25%]">
                                      <Input type="number" step="0.01" value={line.credit || ""} onChange={e => handleLineChange(index, 'credit', e.target.value)} className="h-8 text-xs text-right" placeholder="Crédito" />
                                  </div>
                                  <div className="w-[10%] pt-1">
                                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleRemoveLine(index)}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                  </div>
                              </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="h-7 text-xs border-dashed w-full mt-2 text-slate-500">
                              <Plus className="h-3 w-3 mr-1" /> Añadir Línea
                          </Button>
                      </div>

                      {/* Totales y Validación */}
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mt-2">
                          <span className="text-xs font-semibold text-slate-500">Suma Iguales</span>
                          <div className="flex gap-4">
                              <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block uppercase">Total Débitos</span>
                                  <span className={`font-mono text-sm font-bold ${!isBalanced && totalDebits>0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>${totalDebits.toFixed(2)}</span>
                              </div>
                              <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block uppercase">Total Créditos</span>
                                  <span className={`font-mono text-sm font-bold ${!isBalanced && totalCredits>0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>${totalCredits.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                      {!isBalanced && (totalDebits > 0 || totalCredits > 0) && (
                          <p className="text-xs text-rose-500 font-medium text-right">⚠️ El asiento está descuadrado por ${(Math.abs(totalDebits - totalCredits)).toFixed(2)}</p>
                      )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!isBalanced || createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Contabilizar Asiento
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-2">
         <Card className="rounded-lg shadow-sm border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-md">
                <ArrowRightLeft className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Validación Estricta Activa</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    El sistema bloquea la contabilización si sum(Débitos) ≠ sum(Créditos).
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="rounded-xl shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-full min-w-0 max-w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3.5 px-4 sm:px-6 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">Historial de Comprobantes</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                  type="search"
                  placeholder="Buscar referencia o concepto..."
                  className="h-8 w-48 sm:w-64 pl-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
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
                 <p className="text-sm text-slate-500">Cargando asientos contables...</p>
             </div>
          ) : isError ? (
             <div className="flex flex-col items-center justify-center p-12">
                 <XCircle className="h-8 w-8 text-red-500 mb-4" />
                 <p className="text-sm font-semibold text-slate-800">Error al cargar datos</p>
                 <p className="text-xs text-slate-500">{error?.message}</p>
             </div>
          ) : filteredEntries.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12">
                 <FileText className="h-10 w-10 text-slate-300 mb-4" />
                 <p className="text-sm font-semibold text-slate-800">No hay asientos registrados</p>
                 <p className="text-xs text-slate-500">Haz clic en "Nuevo Asiento" para empezar a registrar movimientos.</p>
             </div>
          ) : (
            <div className="overflow-x-auto w-full">
            <Table className="min-w-[650px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="w-[100px] text-xs font-semibold text-slate-500 h-9">Fecha</TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-slate-500 h-9">Referencia</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-9">Concepto del Asiento</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-500 h-9">Total Débitos</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-500 h-9">Total Créditos</TableHead>
                  <TableHead className="text-center w-[120px] text-xs font-semibold text-slate-500 h-9">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <TableCell className="text-xs font-medium text-slate-700 py-3">{entry.date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-600 py-3 cursor-pointer hover:underline">{entry.reference}</TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium py-3 max-w-[300px] truncate" title={entry.description}>{entry.description}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-slate-700 py-3">
                      ${entry.totalDebit?.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-slate-700 py-3">
                      ${entry.totalCredit?.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {getStatusBadge(entry.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
