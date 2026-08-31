import { useState } from "react";
import { 
  Laptop, 
  Server, 
  Cpu, 
  ShieldCheck, 
  TrendingDown, 
  Printer, 
  Plus, 
  FileText, 
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface FixedAsset {
  id: string;
  code: string;
  name: string;
  category: "EQUIPO_COMPUTO" | "SERVIDORES_IA" | "SOFTWARE_INTANGIBLE";
  acquisitionDate: string;
  originalCost: number;
  usefulLifeMonths: number;
  monthlyDepreciation: number;
  accumulatedMonths: number;
  accumulatedDepreciation: number;
  bookValue: number;
  status: "ACTIVE" | "FULLY_DEPRECIATED";
}

const initialAssets: FixedAsset[] = [
  {
    id: "AST-001",
    code: "EQP-SRV-01",
    name: "Servidores de IA, GPUs y Nodos de Cómputo Especializado",
    category: "SERVIDORES_IA",
    acquisitionDate: "2025-08-01",
    originalCost: 8500000,
    usefulLifeMonths: 60, // 5 años
    monthlyDepreciation: 141667,
    accumulatedMonths: 1,
    accumulatedDepreciation: 141667,
    bookValue: 8358333,
    status: "ACTIVE"
  },
  {
    id: "AST-002",
    code: "EQP-DEV-02",
    name: "Estaciones de Trabajo y Laptops de Alta Gama para Desarrollo",
    category: "EQUIPO_COMPUTO",
    acquisitionDate: "2025-08-01",
    originalCost: 6382000,
    usefulLifeMonths: 36, // 3 años
    monthlyDepreciation: 177278,
    accumulatedMonths: 1,
    accumulatedDepreciation: 177278,
    bookValue: 6204722,
    status: "ACTIVE"
  },
  {
    id: "AST-003",
    code: "INT-SFT-03",
    name: "Licencias de Software Propietario, Modelos y Arquitectura ABIA",
    category: "SOFTWARE_INTANGIBLE",
    acquisitionDate: "2025-08-01",
    originalCost: 4000000,
    usefulLifeMonths: 60, // 5 años
    monthlyDepreciation: 66667,
    accumulatedMonths: 1,
    accumulatedDepreciation: 66667,
    bookValue: 3933333,
    status: "ACTIVE"
  }
];

export default function FixedAssetsDepreciation() {
  const [assets, setAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem("neurolabs_fixed_assets");
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<"EQUIPO_COMPUTO" | "SERVIDORES_IA" | "SOFTWARE_INTANGIBLE">("EQUIPO_COMPUTO");
  const [newCost, setNewCost] = useState("");
  const [newMonths, setNewMonths] = useState("36");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalCostoOriginal = assets.reduce((sum, a) => sum + a.originalCost, 0);
  const totalDepreciacionMensual = assets.reduce((sum, a) => sum + a.monthlyDepreciation, 0);
  const totalDepreciacionAcumulada = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalValorNetoLibros = assets.reduce((sum, a) => sum + a.bookValue, 0);

  // Ahorro tributario del 35% en impuesto de renta por gasto de depreciación
  const deduccionFiscalRentaAnual = Math.round((totalDepreciacionMensual * 12) * 0.35);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCost) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const cost = parseFloat(newCost) || 0;
    const months = parseInt(newMonths) || 36;
    const monthlyDep = Math.round(cost / months);

    const newAsset: FixedAsset = {
      id: `AST-${Date.now().toString().slice(-4)}`,
      code: `EQP-${Date.now().toString().slice(-3)}`,
      name: newName,
      category: newCat,
      acquisitionDate: newDate,
      originalCost: cost,
      usefulLifeMonths: months,
      monthlyDepreciation: monthlyDep,
      accumulatedMonths: 1,
      accumulatedDepreciation: monthlyDep,
      bookValue: cost - monthlyDep,
      status: "ACTIVE"
    };

    const updated = [...assets, newAsset];
    setAssets(updated);
    localStorage.setItem("neurolabs_fixed_assets", JSON.stringify(updated));
    toast.success("Activo registrado en el libro de activos fijos NIIF");
    setIsAddOpen(false);
    setNewName("");
    setNewCost("");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs print:border-none print:shadow-none w-full min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              NIIF NIC 16 (Propiedad, Planta y Equipo)
            </span>
            <span className="text-xs text-slate-400 font-mono">Sitionuevo, Magdalena</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Activos en Especie y Depreciación</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control de activos tecnológicos aportados (\$18.882.000 COP), vida útil y deducción fiscal de renta.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddOpen(true)}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Agregar Activo
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={() => window.print()}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 font-medium shadow-sm text-xs"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Imprimir Libro de Activos
          </Button>
        </div>
      </div>

      {/* Alerta de Beneficio Fiscal */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 dark:from-emerald-950/30 dark:via-blue-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden w-full min-w-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              💡 Beneficio Tributario: Gasto Deducible en Declaración de Renta
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              La depreciación mensual de tus equipos aportados en especie ({formatCOP(totalDepreciacionMensual)}/mes) es <strong>100% deducible de impuestos</strong>, ahorrándote aproximadamente <strong>{formatCOP(deduccionFiscalRentaAnual)}</strong> al año en Renta corporativa.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Activos y Depreciación Directo sin Contenedor */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 py-2 px-1 w-full min-w-0">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Costo en Especie</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-purple-700 dark:text-purple-400 truncate">{formatCOP(totalCostoOriginal)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Capital aportado</span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Gasto Deprec. Mensual</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 truncate">{formatCOP(totalDepreciacionMensual)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Gasto deducible</span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Deprec. Acumulada</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-rose-600 truncate">-{formatCOP(totalDepreciacionAcumulada)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Cuenta PUC 1592</span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Valor Neto en Libros</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 truncate">{formatCOP(totalValorNetoLibros)}</div>
          <span className="text-[11px] text-slate-400 block truncate">Balance NIIF</span>
        </div>
      </div>

      {/* Tabla de Activos Fijos */}
      <Card className="rounded-xl shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden w-full min-w-0 max-w-full">
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Cpu className="w-4 h-4 text-purple-600" /> Libro Auxiliar de Activos Fijos y Depreciación
          </CardTitle>
          <CardDescription className="text-xs">
            Inventario valorado de bienes tecnológicos y software con método de depreciación en línea recta NIIF.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-600">CÓDIGO / DESCRIPCIÓN DEL ACTIVO</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">CATEGORÍA</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">FECHA INGRESO</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right">COSTO INICIAL</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-center">VIDA ÚTIL</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right">DEPREC. MENSUAL</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right">VALOR EN LIBROS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((ast) => (
                  <TableRow key={ast.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{ast.name}</div>
                      <div className="font-mono text-[10px] text-purple-600">{ast.code}</div>
                    </TableCell>
                    <TableCell>
                      {ast.category === "SERVIDORES_IA" && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-300 text-[10px]">
                          Servidores & GPUs
                        </Badge>
                      )}
                      {ast.category === "EQUIPO_COMPUTO" && (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-300 text-[10px]">
                          Equipos Cómputo
                        </Badge>
                      )}
                      {ast.category === "SOFTWARE_INTANGIBLE" && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]">
                          Software ABIA
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {ast.acquisitionDate}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatCOP(ast.originalCost)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-600">
                      {ast.usefulLifeMonths} meses ({ast.usefulLifeMonths / 12} años)
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-amber-600 font-semibold">
                      {formatCOP(ast.monthlyDepreciation)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                      {formatCOP(ast.bookValue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Agregar Activo Fijo */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleAddAsset}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Registrar Nuevo Activo Tecnológico</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3.5 py-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Descripción del Activo *</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Laptop MacBook Pro M3 Max" required className="h-9 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Categoría *</Label>
                  <select 
                    value={newCat} 
                    onChange={e => setNewCat(e.target.value as any)}
                    className="w-full h-9 mt-1 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  >
                    <option value="EQUIPO_COMPUTO">💻 Equipos de Cómputo (3 años)</option>
                    <option value="SERVIDORES_IA">🚀 Servidores e Infraestructura (5 años)</option>
                    <option value="SOFTWARE_INTANGIBLE">🧠 Software & Modelos IA (5 años)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Fecha de Adquisición</Label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="h-9 text-xs mt-1 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Costo de Adquisición (COP) *</Label>
                  <Input type="number" value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="5000000" required className="h-9 text-sm font-mono mt-1 font-bold" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Vida Útil (Meses)</Label>
                  <Input type="number" value={newMonths} onChange={e => setNewMonths(e.target.value)} placeholder="36" className="h-9 text-xs font-mono mt-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold dark:bg-blue-600">
                Guardar Activo y Calcular NIIF
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
