import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building, 
  Landmark, 
  Printer, 
  BadgePercent,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TaxObligation {
  id: string;
  name: string;
  entity: "DIAN" | "ALCALDIA_SITIONUEVO" | "CAMARA_COMERCIO";
  form: string;
  periodicity: "MENSUAL" | "BIMESTRAL" | "ANUAL";
  periodDescription: string;
  dueDate: string;
  estimatedAmount: number;
  status: "PENDING" | "PAID" | "UPCOMING";
  nitRule: string;
  description: string;
  paymentReference?: string;
  paidDate?: string;
}

const initialObligations: TaxObligation[] = [
  {
    id: "TAX-001",
    name: "Declaración Mensual de Retención en la Fuente",
    entity: "DIAN",
    form: "Formulario 350",
    periodicity: "MENSUAL",
    periodDescription: "Agosto 2025 (Periodo 08)",
    dueDate: "2025-09-12",
    estimatedAmount: 140000,
    status: "UPCOMING",
    nitRule: "Último dígito NIT: 3 (Plazo general del 8 al 22 de cada mes)",
    description: "Retenciones practicadas por compras, honorarios y servicios tecnológicos en el mes."
  },
  {
    id: "TAX-002",
    name: "Impuesto de Industria y Comercio (ICA)",
    entity: "ALCALDIA_SITIONUEVO",
    form: "Formulario Único ICA Municipal",
    periodicity: "ANUAL",
    periodDescription: "Año Gravable 2025",
    dueDate: "2026-03-31",
    estimatedAmount: 180000,
    status: "PENDING",
    nitRule: "Municipio de Sitionuevo, Magdalena (Tarifa servicios de software ~10x1000)",
    description: "Impuesto distrital sobre los ingresos brutos operacionales generados por actividades comerciales y de software."
  },
  {
    id: "TAX-003",
    name: "Retención de ICA (ReteICA)",
    entity: "ALCALDIA_SITIONUEVO",
    form: "Declaración Bimestral ReteICA",
    periodicity: "BIMESTRAL",
    periodDescription: "Bimestre 4 (Julio - Agosto 2025)",
    dueDate: "2025-09-20",
    estimatedAmount: 35000,
    status: "UPCOMING",
    nitRule: "Alcaldía Municipal de Sitionuevo, Magdalena",
    description: "Retenciones de ICA aplicadas a proveedores en la jurisdicción de Sitionuevo."
  },
  {
    id: "TAX-004",
    name: "Declaración de Renta Personas Jurídicas (S.A.S.)",
    entity: "DIAN",
    form: "Formulario 110",
    periodicity: "ANUAL",
    periodDescription: "Año Gravable 2025 (Declaración 2026)",
    dueDate: "2026-04-18",
    estimatedAmount: 450000,
    status: "PENDING",
    nitRule: "NIT 901.882.253-1 (Último dígito 3)",
    description: "Impuesto sobre la renta y complementarios a la tarifa corporativa general del 35% sobre la utilidad fiscal neta."
  },
  {
    id: "TAX-005",
    name: "Renovación Matrícula Mercantil S.A.S.",
    entity: "CAMARA_COMERCIO",
    form: "RUES - Registro Único Empresarial",
    periodicity: "ANUAL",
    periodDescription: "Ejercicio 2026",
    dueDate: "2026-03-31",
    estimatedAmount: 195000,
    status: "PENDING",
    nitRule: "Cámara de Comercio de Santa Marta para el Magdalena",
    description: "Renovación obligatoria de la sociedad comercial y establecimiento de comercio (Plazo máximo legal: 31 de Marzo)."
  },
  {
    id: "TAX-006",
    name: "Información Exógena / Medios Magnéticos",
    entity: "DIAN",
    form: "Formatos 1001, 1007, 1008, 1009",
    periodicity: "ANUAL",
    periodDescription: "Año Fiscal 2025",
    dueDate: "2026-05-15",
    estimatedAmount: 0,
    status: "PENDING",
    nitRule: "Personas Jurídicas obligadas a reportar a la DIAN",
    description: "Reporte detallado de pagos, retenciones, ingresos y cuentas por cobrar a terceros durante el año gravable."
  }
];

export default function TaxCalendar() {
  const [obligations, setObligations] = useState<TaxObligation[]>(() => {
    const saved = localStorage.getItem("neurolabs_tax_obligations");
    return saved ? JSON.parse(saved) : initialObligations;
  });

  const [selectedEntity, setSelectedEntity] = useState<"ALL" | "DIAN" | "ALCALDIA_SITIONUEVO" | "CAMARA_COMERCIO">("ALL");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedTaxToPay, setSelectedTaxToPay] = useState<TaxObligation | null>(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState("");

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleMarkAsPaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaxToPay) return;

    const updated = obligations.map(o => {
      if (o.id === selectedTaxToPay.id) {
        return {
          ...o,
          status: "PAID" as const,
          paidDate: payDate,
          paymentReference: payRef || `REC-${Date.now().toString().slice(-6)}`
        };
      }
      return o;
    });

    setObligations(updated);
    localStorage.setItem("neurolabs_tax_obligations", JSON.stringify(updated));
    toast.success(`Obligación "${selectedTaxToPay.name}" marcada como PAGADA`);
    setIsPayModalOpen(false);
    setSelectedTaxToPay(null);
    setPayRef("");
  };

  const filteredObligations = obligations.filter(o => {
    if (selectedEntity === "ALL") return true;
    return o.entity === selectedEntity;
  });

  const totalPendiente = obligations
    .filter(o => o.status !== "PAID")
    .reduce((sum, o) => sum + o.estimatedAmount, 0);

  const totalPagado = obligations
    .filter(o => o.status === "PAID")
    .reduce((sum, o) => sum + o.estimatedAmount, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Calendario Tributario 2025 - 2026
            </span>
            <span className="text-xs text-slate-500 font-mono">NIT: 901.882.253-1 • Sitionuevo, Magdalena</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Obligaciones Tributarias y Fiscales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de vencimientos DIAN, ICA Municipal de Sitionuevo (Magdalena) y Cámara de Comercio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" /> Imprimir Calendario
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Jurisdicción Principal</span>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Sitionuevo, Magdalena</div>
            <p className="text-xs text-slate-500 mt-1">Alcaldía Municipal & DIAN</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Provisión Tributaria Estimada</span>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-md">
                <BadgePercent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono">{formatCOP(totalPendiente)}</div>
            <p className="text-xs text-slate-500 mt-1">Obligaciones por liquidar</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Impuestos Pagados</span>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">{formatCOP(totalPagado)}</div>
            <p className="text-xs text-slate-500 mt-1">Con soporte y recibo oficial</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Cámara de Comercio</span>
              <div className="p-1.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-md">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Santa Marta / Magdalena</div>
            <p className="text-xs text-slate-500 mt-1">Renovación anual RUES</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Entidad */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        <Button 
          variant={selectedEntity === "ALL" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setSelectedEntity("ALL")}
          className="text-xs"
        >
          Todas las Obligaciones ({obligations.length})
        </Button>
        <Button 
          variant={selectedEntity === "DIAN" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setSelectedEntity("DIAN")}
          className="text-xs"
        >
          DIAN (Nacional)
        </Button>
        <Button 
          variant={selectedEntity === "ALCALDIA_SITIONUEVO" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setSelectedEntity("ALCALDIA_SITIONUEVO")}
          className="text-xs"
        >
          Alcaldía de Sitionuevo (ICA)
        </Button>
        <Button 
          variant={selectedEntity === "CAMARA_COMERCIO" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setSelectedEntity("CAMARA_COMERCIO")}
          className="text-xs"
        >
          Cámara de Comercio
        </Button>
      </div>

      {/* Tabla Principal de Calendario */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-blue-600" /> Cronograma de Vencimientos y Declaraciones
          </CardTitle>
          <CardDescription className="text-xs">
            Calendario tributario oficial ajustado al último dígito del NIT (3) de NeuroLabs Tech Solutions S.A.S.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-600">OBLIGACIÓN / FORMULARIO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">ENTIDAD</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">PERÍODO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">VENCIMIENTO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">VALOR ESTIMADO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-center">ESTADO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObligations.map((tax) => {
                const isPaid = tax.status === "PAID";
                const isUpcoming = tax.status === "UPCOMING";

                return (
                  <TableRow key={tax.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{tax.name}</div>
                      <div className="text-xs text-blue-600 font-mono">{tax.form}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-md">{tax.description}</div>
                    </TableCell>
                    <TableCell>
                      {tax.entity === "DIAN" && (
                        <Badge className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300 text-[10px]">
                          DIAN Nacional
                        </Badge>
                      )}
                      {tax.entity === "ALCALDIA_SITIONUEVO" && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 text-[10px]">
                          Sitionuevo, Magdalena
                        </Badge>
                      )}
                      {tax.entity === "CAMARA_COMERCIO" && (
                        <Badge className="bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-300 text-[10px]">
                          Cámara Sta. Marta
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {tax.periodDescription}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {tax.dueDate}
                      </div>
                      <div className="text-[10px] text-slate-500">{tax.nitRule}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {formatCOP(tax.estimatedAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {isPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 text-[11px] font-semibold">
                          <Check className="w-3 h-3 mr-1" /> Pagado
                        </Badge>
                      ) : isUpcoming ? (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 text-[11px] font-semibold">
                          Próximo a Vencer
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 text-[11px]">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isPaid ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedTaxToPay(tax);
                            setIsPayModalOpen(true);
                          }}
                          className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marcar Pago
                        </Button>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {tax.paymentReference || 'OK'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para Registrar Pago de Impuesto */}
      {selectedTaxToPay && (
        <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleMarkAsPaid}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Registrar Pago de Obligación</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3.5 py-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedTaxToPay.name}</div>
                  <div className="text-slate-500 font-mono">{selectedTaxToPay.form} • {selectedTaxToPay.periodDescription}</div>
                  <div className="font-mono font-bold text-emerald-600 text-base mt-1">Valor: {formatCOP(selectedTaxToPay.estimatedAmount)}</div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600">Fecha de Pago en Banco / DIAN *</Label>
                  <Input 
                    type="date" 
                    value={payDate} 
                    onChange={e => setPayDate(e.target.value)} 
                    required 
                    className="h-9 text-xs mt-1 font-mono" 
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600">No. Recibo / Referencia de Pago (Sticker Bancario / DIAN) *</Label>
                  <Input 
                    value={payRef} 
                    onChange={e => setPayRef(e.target.value)} 
                    placeholder="Ej: REC-DIAN-9801239" 
                    required 
                    className="h-9 text-xs mt-1 font-mono" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsPayModalOpen(false)}>Cancelar</Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Confirmar Pago y Asentar en ERP
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
