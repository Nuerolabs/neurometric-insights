import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderArchive,
  FileText,
  FileCheck2,
  Users,
  Building2,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
  FileSpreadsheet,
  Lock,
  Share2,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Check,
  X,
  FileCode,
  Tag,
  KeyRound,
  FileBadge,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface EnterpriseDocument {
  id: string;
  radicado: string; // ej. SGD-2026-ACT-004
  title: string;
  serie: '100_GOBIERNO' | '200_LEGAL_TRIBUTARIO' | '300_RRHH_LABORAL' | '400_CONTABLE_PILA' | '500_TECH_PROPIEDAD_INT';
  serieName: string;
  holderName: string;
  holderId?: string;
  issueDate: string;
  expirationDate?: string;
  confidentiality: 'PUBLICO' | 'CONFIDENCIAL' | 'ESTRATEGICO_SOCIOS';
  status: 'VIGENTE' | 'POR_RENOVAR' | 'CUSTODIADO' | 'EN_REVISION';
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  sha256Hash: string;
  signedBy: string;
  retentionYears: number; // Tablas de Retención Documental (TRD)
  description?: string;
}

const SEED_CORP_DOCUMENTS: EnterpriseDocument[] = [
  {
    id: 'doc-001',
    radicado: 'SGD-2026-ACT-004',
    title: 'Acta de Asamblea General Extraordinaria de Socios N° 004',
    serie: '100_GOBIERNO',
    serieName: '100 - Gobierno Corporativo & Socios',
    holderName: 'Junta de Socios NeuroLabs Tech Solutions',
    issueDate: '2026-01-15',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signedBy: 'Jesús Cantillo (Presidente) / Juceth Parejo (Secretaria)',
    retentionYears: 20,
    description: 'Aprobación de balances de apertura, ratificación de estatutos corporativos e inyección de activos de cómputo GPU.',
  },
  {
    id: 'doc-002',
    radicado: 'SGD-2026-RUT-001',
    title: 'Registro Único Tributario (RUT) DIAN - NIT 901.847.291-4',
    serie: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Gestión Jurídica & Tributaria',
    holderName: 'NeuroLabs Tech Solutions S.A.S.',
    issueDate: '2026-01-10',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '840 KB',
    sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    signedBy: 'DIAN Sede Electrónica',
    retentionYears: 10,
    description: 'RUT formalizado con actividades 6201 (Edición de programas), 6202 (Consultoría informática) y régimen responsable de IVA.',
  },
  {
    id: 'doc-003',
    radicado: 'SGD-2026-CAM-011',
    title: 'Certificado de Existencia y Representación Legal (Cámara de Comercio)',
    serie: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Gestión Jurídica & Tributaria',
    holderName: 'Cámara de Comercio de Barranquilla',
    issueDate: '2026-11-01',
    expirationDate: '2026-12-01',
    confidentiality: 'PUBLICO',
    status: 'POR_RENOVAR',
    fileType: 'PDF',
    fileSize: '650 KB',
    sha256Hash: 'b45cffe084dd3d20d928bee85e7b0f21',
    signedBy: 'Secretaría General CCB',
    retentionYears: 5,
    description: 'Certificado con código de verificación para licitaciones y aperturas de cuentas corporativas. Vence a los 30 días.',
  },
  {
    id: 'doc-004',
    radicado: 'SGD-2026-CL-089',
    title: 'Certificado Laboral - Ing. Software & Arquitectura de IA',
    serie: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Contratación',
    holderName: 'Jesús David Cantillo Parejo',
    holderId: 'CC 1.080.022.532',
    issueDate: '2026-11-16',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '410 KB',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signedBy: 'Jesús Cantillo (Representante Legal)',
    retentionYears: 10,
    description: 'Certificación de funciones técnicas, fecha de ingreso (01/02/2024), contrato a término indefinido y honorarios ejecutivos.',
  },
  {
    id: 'doc-005',
    radicado: 'SGD-2025-CON-003',
    title: 'Contrato Individual de Trabajo a Término Indefinido',
    serie: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Contratación',
    holderName: 'María Angélica Domínguez',
    holderId: 'CC 1.082.938.472',
    issueDate: '2025-02-01',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    sha256Hash: 'd41d8cd98f00b204e9800998ecf8427e',
    signedBy: 'NeuroLabs S.A.S. / María Domínguez',
    retentionYears: 20,
    description: 'Contrato laboral regido por el Código Sustantivo del Trabajo con cláusulas de confidencialidad y cesión de propiedad de código.',
  },
  {
    id: 'doc-006',
    radicado: 'SGD-2026-PIL-104',
    title: 'Soporte y Planilla PILA Integrada de Seguridad Social (Octubre 2026)',
    serie: '400_CONTABLE_PILA',
    serieName: '400 - Contabilidad & Seguridad Social',
    holderName: 'Aportes en Línea / EPS Sura / ARL Positiva',
    issueDate: '2026-11-05',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '950 KB',
    sha256Hash: '9e107d9d372bb6826bd81d3542a419d6',
    signedBy: 'Operador de Información PILA Aportes en Línea',
    retentionYears: 10,
    description: 'Comprobante bancario de pago de aportes parafiscales y cotizaciones a salud, pensión y riesgos laborales.',
  },
  {
    id: 'doc-007',
    radicado: 'SGD-2026-NDA-021',
    title: 'Acuerdo de Confidencialidad y Protección de Algoritmos (NDA Mutuo)',
    serie: '500_TECH_PROPIEDAD_INT',
    serieName: '500 - Tecnología & Propiedad Intelectual',
    holderName: 'CerebroQuant Enterprise Partners',
    issueDate: '2026-03-12',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b',
    signedBy: 'NeuroLabs Legal / Director Legal Socio',
    retentionYears: 15,
    description: 'Blindaje de propiedad intelectual sobre modelos de scoring de crédito, arquitectura de agentes y pipelines de datos.',
  },
];

export default function GestionDocumentalPage() {
  const [documents, setDocuments] = useState<EnterpriseDocument[]>(SEED_CORP_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<EnterpriseDocument | null>(SEED_CORP_DOCUMENTS[3]);
  const [activeSerie, setActiveSerie] = useState<string>('TODAS');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  // Modales
  const [showCertModal, setShowCertModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Formulario del Generador Laboral
  const [certEmployee, setCertEmployee] = useState('Jesús David Cantillo Parejo');
  const [certDocType, setCertDocType] = useState('Cédula de Ciudadanía');
  const [certDocNumber, setCertDocNumber] = useState('1.080.022.532');
  const [certDocExpedition, setCertDocExpedition] = useState('Sitionuevo (Magdalena)');
  const [certPosition, setCertPosition] = useState('Director General & Lead AI Architect');
  const [certContractType, setCertContractType] = useState('Término Indefinido');
  const [certStartDate, setCertStartDate] = useState('01 de Febrero de 2024');
  const [certSalary, setCertSalary] = useState('4.500.000');
  const [certAddressee, setCertAddressee] = useState('A QUIEN PUEDA INTERESAR');

  // Formulario de Radicación de Nuevo Documento
  const [newTitle, setNewTitle] = useState('');
  const [newSerie, setNewSerie] = useState<'100_GOBIERNO' | '200_LEGAL_TRIBUTARIO' | '300_RRHH_LABORAL' | '400_CONTABLE_PILA' | '500_TECH_PROPIEDAD_INT'>('100_GOBIERNO');
  const [newHolder, setNewHolder] = useState('');
  const [newConfidentiality, setNewConfidentiality] = useState<'PUBLICO' | 'CONFIDENCIAL' | 'ESTRATEGICO_SOCIOS'>('CONFIDENCIAL');
  const [newDescription, setNewDescription] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.holderName.toLowerCase().includes(search.toLowerCase()) ||
      doc.radicado.toLowerCase().includes(search.toLowerCase());

    const matchesSerie = activeSerie === 'TODAS' || doc.serie === activeSerie;
    const matchesStatus = statusFilter === 'TODOS' || doc.status === statusFilter;

    return matchesSearch && matchesSerie && matchesStatus;
  });

  const handleIssueCertificate = () => {
    const radNumber = `SGD-2026-CL-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: EnterpriseDocument = {
      id: `doc-${Date.now()}`,
      radicado: radNumber,
      title: `Certificado Laboral - ${certPosition}`,
      serie: '300_RRHH_LABORAL',
      serieName: '300 - Talento Humano & Contratación',
      holderName: certEmployee,
      holderId: certDocNumber,
      issueDate: new Date().toISOString().split('T')[0],
      confidentiality: 'CONFIDENCIAL',
      status: 'VIGENTE',
      fileType: 'PDF',
      fileSize: '430 KB',
      sha256Hash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signedBy: 'Jesús David Cantillo Parejo (Representante Legal)',
      retentionYears: 10,
      description: `Certificado laboral expedido con destino a ${certAddressee}. Devenga asignación de $${certSalary} COP.`,
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setShowCertModal(false);
    setShowPreviewModal(true);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHolder) return;

    const radNumber = `SGD-2026-RAD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: EnterpriseDocument = {
      id: `doc-${Date.now()}`,
      radicado: radNumber,
      title: newTitle,
      serie: newSerie,
      serieName:
        newSerie === '100_GOBIERNO'
          ? '100 - Gobierno Corporativo & Socios'
          : newSerie === '200_LEGAL_TRIBUTARIO'
          ? '200 - Gestión Jurídica & Tributaria'
          : newSerie === '300_RRHH_LABORAL'
          ? '300 - Talento Humano & Contratación'
          : newSerie === '400_CONTABLE_PILA'
          ? '400 - Contabilidad & Seguridad Social'
          : '500 - Tecnología & Propiedad Intelectual',
      holderName: newHolder,
      issueDate: new Date().toISOString().split('T')[0],
      confidentiality: newConfidentiality,
      status: 'CUSTODIADO',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      sha256Hash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signedBy: 'Representación Legal NeuroLabs S.A.S.',
      retentionYears: 10,
      description: newDescription || 'Documento oficial indexado con metadatos de custodia corporativa.',
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setShowUploadModal(false);
    setNewTitle('');
    setNewHolder('');
    setNewDescription('');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* ── TOP EXECUTIVE BAR ── */}
      <header className="h-16 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white uppercase">NeuroLabs SGD</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise Content Management (ECM)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Custodia Jurídica, Gobierno Corporativo & Certificación Laboral
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCertModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Emitir Certificado Laboral</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Radicar Documento</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          <Link
            to="/contabilidad"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">ERP</span> Contable
          </Link>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT SIDEBAR: EXPEDIENTE TREE & REPOSITORY METRICS ── */}
        <aside className="w-full lg:w-72 bg-[#0d1424] border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-800/80">
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  Bóveda Criptográfica
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-200">12.8 / 100 GB</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[13%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Cifrado SHA-256 + AES</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activo
                </span>
              </div>
            </div>
          </div>

          {/* Series Documentales (TRD) Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Series Documentales (TRD)
            </p>

            <button
              onClick={() => setActiveSerie('TODAS')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === 'TODAS'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-blue-400" />
                <span>Todos los Expedientes</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('100_GOBIERNO')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === '100_GOBIERNO'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="truncate">100 - Gobierno & Socios</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.filter((d) => d.serie === '100_GOBIERNO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('200_LEGAL_TRIBUTARIO')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === '200_LEGAL_TRIBUTARIO'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate">200 - Legal, DIAN & RUT</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.filter((d) => d.serie === '200_LEGAL_TRIBUTARIO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('300_RRHH_LABORAL')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === '300_RRHH_LABORAL'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">300 - Talento Humano / Certificados</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.filter((d) => d.serie === '300_RRHH_LABORAL').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('400_CONTABLE_PILA')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === '400_CONTABLE_PILA'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FileSpreadsheet className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="truncate">400 - Contabilidad & PILA</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.filter((d) => d.serie === '400_CONTABLE_PILA').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('500_TECH_PROPIEDAD_INT')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                activeSerie === '500_TECH_PROPIEDAD_INT'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">500 - Software, NDAs & IP</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {documents.filter((d) => d.serie === '500_TECH_PROPIEDAD_INT').length}
              </span>
            </button>
          </div>

          {/* Quick Legal Guardrail Badge */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Marco Legal Vigente</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Cumplimiento Ley 594/2000 (Archivo General de la Nación) y Ley 527/1999 (Firmas Digitales).
            </p>
          </div>
        </aside>

        {/* ── CENTER: ENTERPRISE DOCUMENT EXPLORER ── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] overflow-hidden">
          {/* Action Bar & Search */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0e1628]/50">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por radicado, título, titular o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-300 font-medium focus:outline-none"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="VIGENTE">Vigente</option>
                <option value="POR_RENOVAR">Por Renovar (&lt; 30d)</option>
                <option value="CUSTODIADO">Custodiado</option>
              </select>

              <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista de Lista Detallada"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'GRID' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista de Cuadrícula / Tarjetas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Content List */}
          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === 'LIST' ? (
              <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f172a] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Radicado Oficial</th>
                        <th className="py-3 px-4">Título del Documento</th>
                        <th className="py-3 px-4">Serie / Área</th>
                        <th className="py-3 px-4">Titular / Empleado</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDocs.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <tr
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-600/15 border-l-2 border-blue-500'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                              {doc.radicado}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-200 line-clamp-1">{doc.title}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.fileSize} · SHA-256 verificado</p>
                            </td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700/60">
                                {doc.serie.split('_')[1]}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              <p className="font-medium truncate max-w-xs">{doc.holderName}</p>
                              {doc.holderId && <p className="text-[10px] text-slate-500 font-mono">{doc.holderId}</p>}
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                              {doc.issueDate}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.status === 'VIGENTE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : doc.status === 'POR_RENOVAR'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {doc.status === 'POR_RENOVAR' && <AlertTriangle className="w-3 h-3" />}
                                {doc.status === 'VIGENTE' && <CheckCircle2 className="w-3 h-3" />}
                                {doc.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDoc(doc);
                                  setShowPreviewModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Previsualizar Expediente"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id
                        ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {doc.radicado}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'VIGENTE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-white mt-2.5 line-clamp-2">
                      {doc.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {doc.holderName}
                    </p>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{doc.fileSize}</span>
                      <span>{doc.issueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANEL: EXECUTIVE DOCUMENT INSPECTOR ── */}
        {selectedDoc && (
          <aside className="w-full lg:w-96 bg-[#0f172a] border-l border-slate-800 flex flex-col p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileBadge className="w-3.5 h-3.5 text-blue-400" />
                Ficha Técnica de Custodia
              </span>
              <button
                onClick={() => setShowPreviewModal(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Completo</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Document Header info */}
            <div>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                {selectedDoc.radicado}
              </span>
              <h2 className="text-sm font-bold text-white mt-2 leading-snug">
                {selectedDoc.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedDoc.description || 'Sin notas descriptivas adicionales.'}
              </p>
            </div>

            {/* Security & Verification Metadata Card */}
            <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Nivel de Acceso:</span>
                <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                  {selectedDoc.confidentiality}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Retención TRD:</span>
                <span className="font-mono text-slate-200">{selectedDoc.retentionYears} Años en Archivo</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Firmado / Avalado por:</span>
                <span className="text-slate-200 text-right truncate max-w-[160px] font-medium">
                  {selectedDoc.signedBy}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                  Hash Criptográfico SHA-256 (Ley 527/1999):
                </span>
                <p className="font-mono text-[10px] text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                  {selectedDoc.sha256Hash}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Exportar Oficial</span>
              </button>

              <button
                onClick={() => alert(`Enlace seguro de descarga generado para ${selectedDoc.radicado}. Válido por 48 horas.`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Enlace Cifrado</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL 1: EMITIR CERTIFICADO LABORAL (RRHH) ── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] rounded-2xl max-w-xl w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Generar Certificado Laboral Institucional</h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nombre Completo del Colaborador</label>
                <input
                  type="text"
                  value={certEmployee}
                  onChange={(e) => setCertEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Documento</label>
                  <select
                    value={certDocType}
                    onChange={(e) => setCertDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número de Cédula</label>
                  <input
                    type="text"
                    value={certDocNumber}
                    onChange={(e) => setCertDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lugar de Expedición</label>
                  <input
                    type="text"
                    value={certDocExpedition}
                    onChange={(e) => setCertDocExpedition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fecha de Ingreso</label>
                  <input
                    type="text"
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cargo Oficial</label>
                <input
                  type="text"
                  value={certPosition}
                  onChange={(e) => setCertPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Contrato</label>
                  <select
                    value={certContractType}
                    onChange={(e) => setCertContractType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Término Indefinido">Término Indefinido</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Asignación Mensual (COP)</label>
                  <input
                    type="text"
                    value={certSalary}
                    onChange={(e) => setCertSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destinatario</label>
                <input
                  type="text"
                  value={certAddressee}
                  onChange={(e) => setCertAddressee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white uppercase"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleIssueCertificate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Radicar & Previsualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RADICAR NUEVO DOCUMENTO (SGD) ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] rounded-2xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Radicar Expediente en Archivo Central
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título del Documento o Acta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Acta N° 005 - Nombramiento de Junta Directiva"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Serie Documental</label>
                  <select
                    value={newSerie}
                    onChange={(e) => setNewSerie(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="100_GOBIERNO">100 - Gobierno & Socios</option>
                    <option value="200_LEGAL_TRIBUTARIO">200 - Legal & DIAN</option>
                    <option value="300_RRHH_LABORAL">300 - Talento Humano</option>
                    <option value="400_CONTABLE_PILA">400 - Contable & PILA</option>
                    <option value="500_TECH_PROPIEDAD_INT">500 - Tecnología & IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nivel de Confidencialidad</label>
                  <select
                    value={newConfidentiality}
                    onChange={(e) => setNewConfidentiality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PUBLICO">Público</option>
                    <option value="CONFIDENCIAL">Confidencial</option>
                    <option value="ESTRATEGICO_SOCIOS">Estratégico Socios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Titular, Empleado o Dependencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Asamblea de Accionistas / Nombre de Colaborador"
                  value={newHolder}
                  onChange={(e) => setNewHolder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Notas / Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción de custodia legal..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Asignar Radicado & Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EXECUTIVE PRINT-READY HIGH-FIDELITY VIEWER ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-3xl w-full my-8 space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-white bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400">
                Visualizador Oficial: {selectedDoc?.radicado}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Paper Document */}
            <div className="bg-white p-12 md:p-16 rounded-2xl shadow-2xl text-slate-900 font-serif space-y-6 leading-relaxed relative print:m-0 print:border-none print:shadow-none">
              {/* Institutional Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="font-sans text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                    NeuroLabs Tech Solutions S.A.S.
                  </h1>
                  <p className="font-sans text-xs text-slate-600 font-medium">NIT: 901.847.291 - 4 | Barranquilla - Colombia</p>
                  <p className="font-sans text-[11px] text-slate-500">Dirección de Talento Humano & Representación Legal</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-sans font-black text-2xl shadow-inner">
                  NL
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-6 space-y-1">
                <h2 className="font-sans text-sm font-extrabold uppercase tracking-widest text-slate-900">
                  La Dirección de Talento Humano
                </h2>
                <p className="font-sans text-xs font-bold uppercase text-slate-600 tracking-wider">
                  Hace Constar:
                </p>
              </div>

              {/* Body */}
              <div className="text-justify text-xs md:text-sm text-slate-800 space-y-4 pt-4 leading-relaxed font-normal">
                <p>
                  Que el (la) señor(a) <strong className="font-sans font-bold text-slate-950 uppercase">{certEmployee}</strong>, 
                  identificado(a) con {certDocType} número <strong className="font-mono font-bold text-slate-950">{certDocNumber}</strong> de {certDocExpedition}, 
                  labora para nuestra compañía desde el día <strong className="font-sans font-semibold text-slate-900">{certStartDate}</strong>, mediante contrato de trabajo a <strong className="font-sans font-semibold text-slate-900">{certContractType}</strong>, 
                  desempeñándose a la fecha en el cargo de:
                </p>

                <div className="py-2.5 px-4 bg-slate-50 border-l-4 border-slate-900 font-sans font-bold text-slate-950 uppercase tracking-wide text-xs">
                  {certPosition}
                </div>

                <p>
                  Para el cumplimiento de sus labores directivas y técnicas, devenga una asignación mensual fija de:
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-sans font-extrabold text-slate-900 text-sm">
                  ${certSalary} PESOS MONEDA CORRIENTE (COP)
                </div>

                <p className="pt-2">
                  La presente constancia se expide a solicitud de la persona interesada con destino a <strong className="font-sans font-bold text-slate-950">{certAddressee}</strong>, en la ciudad de Barranquilla, República de Colombia, a los {new Date().getDate()} días del mes de Noviembre del año 2026.
                </p>
              </div>

              {/* Signature and Verification */}
              <div className="pt-14 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="w-56 border-b-2 border-slate-900 pb-1 mb-2">
                    <p className="font-sans font-bold text-sm tracking-tighter text-slate-900 uppercase">
                      Jesús D. Cantillo Parejo
                    </p>
                  </div>
                  <p className="font-sans text-xs font-bold text-slate-950 uppercase">Jesús David Cantillo Parejo</p>
                  <p className="font-sans text-[11px] text-slate-600 font-semibold">Representante Legal & CEO</p>
                  <p className="font-sans text-[10px] text-slate-500 font-mono">C.C. 1.080.022.532 de Sitionuevo</p>
                  <p className="font-sans text-[10px] text-slate-400">NeuroLabs Tech Solutions S.A.S.</p>
                </div>

                <div className="text-right font-sans space-y-1">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center p-1.5 text-center ml-auto bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-700 leading-tight">SELLO DIGITAL SEGURO</span>
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">NL-VERIFIED</span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 font-bold">Radicado: {selectedDoc?.radicado}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
