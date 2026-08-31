import { useState } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  ShieldCheck, 
  Search, 
  Eye, 
  CheckCircle2, 
  Landmark,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useClients, useInvoices, useBills } from "@/hooks/accounting/useErp";

interface CertificateRecord {
  id: string;
  type: "RETEFUENTE" | "RETEICA";
  year: number;
  recipientName: string;
  recipientDoc: string;
  recipientCity: string;
  baseAmount: number;
  rate: number;
  withheldAmount: number;
  concept: string;
}

export default function TaxCertificates() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedType, setSelectedType] = useState<"ALL" | "RETEFUENTE" | "RETEICA">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCertificate, setViewingCertificate] = useState<CertificateRecord | null>(null);

  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();
  const { data: bills } = useBills();

  // Lista de certificados generados
  const certificates: CertificateRecord[] = [
    {
      id: "CERT-2025-001",
      type: "RETEFUENTE",
      year: 2025,
      recipientName: "TRINOVA S.A.S.",
      recipientDoc: "902.895.222-8",
      recipientCity: "Barranquilla / Sitionuevo",
      baseAmount: 1300000,
      rate: 4.0,
      withheldAmount: 52000,
      concept: "Servicios Tecnológicos de Inteligencia Artificial y Consultoría"
    },
    {
      id: "CERT-2025-002",
      type: "RETEICA",
      year: 2025,
      recipientName: "TRINOVA S.A.S.",
      recipientDoc: "902.895.222-8",
      recipientCity: "Sitionuevo, Magdalena",
      baseAmount: 1300000,
      rate: 0.966,
      withheldAmount: 12558,
      concept: "Retención ICA sobre Servicios Informáticos - Municipio de Sitionuevo"
    },
    {
      id: "CERT-2025-003",
      type: "RETEFUENTE",
      year: 2025,
      recipientName: "AMAZON WEB SERVICES COLOMBIA S.A.S.",
      recipientDoc: "901.234.567-1",
      recipientCity: "Bogotá D.C. / Sitionuevo",
      baseAmount: 700000,
      rate: 3.5,
      withheldAmount: 24500,
      concept: "Servicios de Procesamiento Cloud y Hospedaje Web"
    }
  ];

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const filtered = certificates.filter(c => {
    const matchesType = selectedType === "ALL" || c.type === selectedType;
    const matchesSearch = c.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.recipientDoc.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Art. 381 Estatuto Tributario • NIIF
            </span>
            <span className="text-xs text-slate-400 font-mono">Sitionuevo, Magdalena</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Certificados de Retención Tributaria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Emisión y descarga oficial de certificados de Retención en la Fuente (Renta) y ReteICA para clientes y terceros.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" /> Imprimir Listado
          </Button>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant={selectedType === "ALL" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedType("ALL")}
            className="text-xs"
          >
            Todos ({certificates.length})
          </Button>
          <Button 
            variant={selectedType === "RETEFUENTE" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedType("RETEFUENTE")}
            className="text-xs"
          >
            ReteFuente (Renta)
          </Button>
          <Button 
            variant={selectedType === "RETEICA" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedType("RETEICA")}
            className="text-xs"
          >
            ReteICA (Sitionuevo)
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente o NIT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Tabla de Certificados */}
      <Card className="rounded-xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <FileCheck className="w-4 h-4 text-blue-600" /> Certificados Expedidos • Año Gravable {selectedYear}
            </CardTitle>
            <CardDescription className="text-xs">
              Soportes de retenciones a favor y practicadas para presentación ante la DIAN y Alcaldía de Sitionuevo.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-600">ID CERTIFICADO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">TIPO DE RETENCIÓN</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">BENEFICIARIO / CLIENTE</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">NIT / DOCUMENTO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">BASE GRAVABLE</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">TASA</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-right">VALOR RETENIDO</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 text-center">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    {c.id}
                  </TableCell>
                  <TableCell>
                    {c.type === "RETEFUENTE" ? (
                      <Badge className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300 text-[10px]">
                        ReteFuente (Renta)
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 text-[10px]">
                        ReteICA (Sitionuevo)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                    {c.recipientName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {c.recipientDoc}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCOP(c.baseAmount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {c.rate}%
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-amber-600">
                    {formatCOP(c.withheldAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setViewingCertificate(c)}
                      className="h-8 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver Certificado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: VISTA E IMPRESIÓN DEL CERTIFICADO OFICIAL
      ══════════════════════════════════════════════════════════════ */}
      {viewingCertificate && (
        <Dialog open={!!viewingCertificate} onOpenChange={() => setViewingCertificate(null)}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Certificado Tributario Oficial</span>
                <span className="font-mono text-xs text-slate-500">{viewingCertificate.id}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs border-t border-b text-slate-800 dark:text-slate-200">
              
              {/* Encabezado del Agente Retenedor */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase">NEUROLABS TECH SOLUTIONS S.A.S.</h2>
                  <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">NIT: 901.882.253-1</p>
                  <p className="text-slate-500 text-[11px]">Sitionuevo, Magdalena, Colombia</p>
                  <p className="text-slate-500 text-[11px]">contabilidad@neurolabs.com.co</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-slate-900 text-white font-mono text-xs">
                    Año Gravable {viewingCertificate.year}
                  </Badge>
                  <p className="text-slate-500 text-[10px] mt-1">Expedición: {new Date().toLocaleDateString('es-CO')}</p>
                </div>
              </div>

              {/* Título Oficial */}
              <div className="text-center py-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40">
                <h3 className="font-bold text-xs uppercase text-blue-900 dark:text-blue-300">
                  {viewingCertificate.type === "RETEFUENTE" 
                    ? "CERTIFICADO DE RETENCIÓN EN LA FUENTE POR RENTA (ART. 381 E.T.)" 
                    : "CERTIFICADO DE RETENCIÓN DE INDUSTRIA Y COMERCIO (RETEICA)"}
                </h3>
                <p className="text-[10px] text-slate-500">Jurisdicción: {viewingCertificate.type === "RETEFUENTE" ? "DIAN Nacional" : "Alcaldía Municipal de Sitionuevo, Magdalena"}</p>
              </div>

              {/* Datos del Sujeto Pasivo / Beneficiario */}
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Certifica que a favor de:</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{viewingCertificate.recipientName}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-xs mt-1">
                  <p>NIT / Identificación: <strong className="font-mono">{viewingCertificate.recipientDoc}</strong></p>
                  <p>Ciudad / Municipio: <strong>{viewingCertificate.recipientCity}</strong></p>
                </div>
              </div>

              {/* Detalle de Valores y Retenciones */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-[11px] text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>CONCEPTO SUJETO A RETENCIÓN</span>
                  <span>BASE GRAVABLE</span>
                  <span>TARIFA</span>
                  <span>TOTAL RETENIDO</span>
                </div>
                <div className="p-4 flex justify-between items-center text-xs">
                  <div className="max-w-[240px]">
                    <p className="font-semibold text-slate-900 dark:text-white">{viewingCertificate.concept}</p>
                  </div>
                  <div className="font-mono">{formatCOP(viewingCertificate.baseAmount)}</div>
                  <div className="font-mono font-bold text-amber-600">{viewingCertificate.rate}%</div>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">{formatCOP(viewingCertificate.withheldAmount)}</div>
                </div>
              </div>

              {/* Total Retenido */}
              <div className="flex justify-between items-center p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300">TOTAL VALOR RETENIDO Y CONSIGNADO</p>
                  <p className="text-[10px] text-slate-500">Declarado y pagado oportunamente ante la autoridad tributaria</p>
                </div>
                <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
                  {formatCOP(viewingCertificate.withheldAmount)}
                </p>
              </div>

              {/* Firmas Oficiales */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-400 dark:border-slate-600 w-full h-10"></div>
                  <p className="font-bold text-slate-900 dark:text-white text-[11px]">JESÚS DAVID CANTILLO PAREJO</p>
                  <p className="text-slate-500 text-[10px]">Representante Legal Principal</p>
                  <p className="text-slate-400 text-[9px]">C.C. 1.080.822.532 • Sitionuevo, Magdalena</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-400 dark:border-slate-600 w-full h-10"></div>
                  <p className="font-bold text-slate-900 dark:text-white text-[11px]">CONTADOR PÚBLICO TITULADO</p>
                  <p className="text-slate-500 text-[10px]">Certificación Tributaria NIIF</p>
                  <p className="text-slate-400 text-[9px]">T.P. N° ___________________</p>
                </div>
              </div>

            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setViewingCertificate(null)}>Cerrar</Button>
              <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold" size="sm">
                <Printer className="w-4 h-4 mr-1.5" /> Imprimir Certificado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
