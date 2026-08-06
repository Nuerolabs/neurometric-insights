import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Folder, FolderOpen, FileText, Settings2, Download, CheckCircle2, ChevronRight, ChevronDown, Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAccounts, useCreateAccount, Account } from "@/hooks/accounting/useAccounts";

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({"ACTIVO": true, "PASIVO": true, "PATRIMONIO": true});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESOS' | 'GASTOS' | 'COSTOS'>('ACTIVO');
  const [description, setDescription] = useState("");

  const { data: accounts, isLoading, isError, error } = useAccounts();
  const createMutation = useCreateAccount();

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error("El código y nombre son obligatorios.");
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        code,
        name,
        type,
        description,
        is_active: true,
        parent_id: null // Por simplicidad, este form básico crea cuentas de nivel superior (clases/grupos).
      });
      toast.success("Cuenta contable creada correctamente.");
      setIsDialogOpen(false);
      setCode(""); setName(""); setDescription("");
    } catch (err: any) {
      toast.error("Error al crear cuenta: " + err.message);
    }
  };

  // Helper para agrupar las cuentas por tipo para visualizarlas como árbol (simplificado)
  const renderAccountTree = (type: string, title: string, colorClass: string) => {
    const isExpanded = expandedNodes[type];
    const typeAccounts = accounts?.filter(a => a.type === type) || [];
    
    // Filtrar por término de búsqueda si existe
    const displayAccounts = searchTerm 
      ? typeAccounts.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.includes(searchTerm))
      : typeAccounts;

    if (displayAccounts.length === 0 && !searchTerm) return null;

    return (
      <div className="mb-4">
        <div 
          className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors"
          onClick={() => toggleNode(type)}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          {isExpanded ? <FolderOpen className={`w-5 h-5 ${colorClass}`} /> : <Folder className={`w-5 h-5 ${colorClass}`} />}
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">{title}</span>
          <Badge variant="secondary" className="ml-2 text-[10px]">{typeAccounts.length}</Badge>
        </div>
        
        {isExpanded && (
          <div className="ml-6 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1 mt-1">
            {displayAccounts.map(account => (
              <div key={account.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-16">{account.code}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{account.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="text-[9px] bg-white dark:bg-transparent">Nivel Auxiliar</Badge>
                </div>
              </div>
            ))}
            {displayAccounts.length === 0 && searchTerm && (
                <div className="p-2 text-xs text-slate-500 italic">No se encontraron cuentas que coincidan con la búsqueda.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Plan Único de Cuentas (PUC)</h1>
          <p className="text-sm text-slate-500 mt-1">Catálogo maestro para la codificación y clasificación de hechos económicos.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Download className="h-3.5 w-3.5 mr-2" />
                Exportar
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Nueva Cuenta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateAccount}>
                  <DialogHeader>
                    <DialogTitle>Crear Cuenta Contable</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right text-xs">Código</Label>
                      <Input id="code" value={code} onChange={e=>setCode(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Ej: 110505" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right text-xs">Nombre</Label>
                      <Input id="name" value={name} onChange={e=>setName(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Ej: Caja General" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right text-xs">Naturaleza</Label>
                      <select id="type" value={type} onChange={e=>setType(e.target.value as any)} className="col-span-3 h-8 text-sm rounded-md border border-slate-200 bg-transparent px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300">
                          <option value="ACTIVO">1 - ACTIVO</option>
                          <option value="PASIVO">2 - PASIVO</option>
                          <option value="PATRIMONIO">3 - PATRIMONIO</option>
                          <option value="INGRESOS">4 - INGRESOS</option>
                          <option value="GASTOS">5 - GASTOS</option>
                          <option value="COSTOS">6 - COSTOS</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="desc" className="text-right text-xs">Descripción</Label>
                      <Input id="desc" value={description} onChange={e=>setDescription(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Opcional" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Crear Cuenta
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree View */}
        <Card className="lg:col-span-2 rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 pt-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Estructura Jerárquica</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                  type="search"
                  placeholder="Buscar cuenta..."
                  className="h-8 w-64 pl-8 text-xs bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : isError ? (
               <div className="flex flex-col items-center p-8 text-red-500"><XCircle className="w-8 h-8 mb-2" /> <p>Error al cargar el PUC</p></div>
            ) : accounts?.length === 0 ? (
               <div className="flex flex-col items-center p-8">
                   <p className="text-sm font-semibold text-slate-800">El catálogo está vacío</p>
                   <p className="text-xs text-slate-500 mb-4">Empieza creando las cuentas básicas de tu empresa.</p>
               </div>
            ) : (
                <div className="select-none">
                  {renderAccountTree('ACTIVO', '1. ACTIVOS', 'text-blue-500')}
                  {renderAccountTree('PASIVO', '2. PASIVOS', 'text-rose-500')}
                  {renderAccountTree('PATRIMONIO', '3. PATRIMONIO', 'text-emerald-500')}
                  {renderAccountTree('INGRESOS', '4. INGRESOS', 'text-amber-500')}
                  {renderAccountTree('GASTOS', '5. GASTOS', 'text-purple-500')}
                  {renderAccountTree('COSTOS', '6. COSTOS', 'text-cyan-500')}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card className="rounded-lg shadow-sm border-slate-200 bg-slate-50/50 dark:bg-[#0f172a] dark:border-slate-800">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                Reglas de Clasificación
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p><span className="font-bold text-slate-800 dark:text-slate-200">1 (Clase)</span>: El primer dígito indica la naturaleza (Ej: 1 = Activo).</p>
                <p><span className="font-bold text-slate-800 dark:text-slate-200">11 (Grupo)</span>: Los dos primeros dígitos categorizan (Ej: 11 = Disponible).</p>
                <p><span className="font-bold text-slate-800 dark:text-slate-200">1105 (Cuenta)</span>: Cuatro dígitos indican la cuenta mayor (Ej: Caja).</p>
                <p><span className="font-bold text-slate-800 dark:text-slate-200">110505 (Subcuenta)</span>: Seis dígitos para el nivel auxiliar transaccional.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
