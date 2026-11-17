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
  Copy,
  BadgeCheck,
  Scale,
  Award,
  Fingerprint,
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
  // Campos opcionales para certificaciones laborales dinámicas
  certData?: {
    employeeName: string;
    docType: string;
    docNumber: string;
    docExpedition: string;
    position: string;
    contractType: string;
    startDate: string;
    salary: string;
    salaryText: string;
    addressee: string;
  };
}

const SEED_CORP_DOCUMENTS: EnterpriseDocument[] = [
  {
    id: 'doc-004',
    radicado: 'SGD-2026-CL-089',
    title: 'Certificado Laboral Institucional - Lead AI Architect & CEO',
    serie: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    holderName: 'Jesús David Cantillo Parejo',
    holderId: 'CC 1.080.022.532',
    issueDate: '2026-11-16',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '410 KB',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signedBy: 'Jesús David Cantillo Parejo (Representante Legal)',
    retentionYears: 10,
    description: 'Certificación oficial de funciones técnicas, contrato a término indefinido y asignación mensual.',
    certData: {
      employeeName: 'Jesús David Cantillo Parejo',
      docType: 'Cédula de Ciudadanía',
      docNumber: '1.080.022.532',
      docExpedition: 'Sitionuevo (Magdalena)',
      position: 'Director General & Lead AI Architect',
      contractType: 'Término Indefinido',
      startDate: '01 de Febrero de 2024',
      salary: '4.500.000',
      salaryText: 'CUATRO MILLONES QUINIENTOS MIL',
      addressee: 'A QUIEN PUEDA INTERESAR',
    },
  },
  {
    id: 'doc-001',
    radicado: 'SGD-2026-ACT-004',
    title: 'Acta de Asamblea General Extraordinaria de Accionistas N° 004',
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
    serieName: '200 - Jurídica, DIAN & RUT',
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
    serieName: '200 - Jurídica, DIAN & RUT',
    holderName: 'Cámara de Comercio de Barranquilla',
    issueDate: '2026-11-01',
    expirationDate: '2026-12-01',
    confidentiality: 'PUBLICO',
    status: 'POR_RENOVAR',
    fileType: 'PDF',
    fileSize: '650 KB',
    sha256Hash: 'b45cffe084dd3d20d928bee85e7b0f2122b51cb93d84',
    signedBy: 'Secretaría General CCB',
    retentionYears: 5,
    description: 'Certificado con código de verificación para licitaciones y aperturas bancarias. Vigencia legal de 30 días.',
  },
  {
    id: 'doc-005',
    radicado: 'SGD-2025-CON-003',
    title: 'Contrato Individual de Trabajo a Término Indefinido (CST)',
    serie: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    holderName: 'María Angélica Domínguez',
    holderId: 'CC 1.082.938.472',
    issueDate: '2025-02-01',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    sha256Hash: 'd41d8cd98f00b204e9800998ecf8427e9821a0033c4f',
    signedBy: 'NeuroLabs S.A.S. / María Domínguez',
    retentionYears: 20,
    description: 'Contrato laboral regido por el Código Sustantivo del Trabajo con cláusulas de confidencialidad y cesión de propiedad de código.',
  },
  {
    id: 'doc-006',
    radicado: 'SGD-2026-PIL-104',
    title: 'Soporte y Planilla PILA Integrada de Seguridad Social (Octubre 2026)',
    serie: '400_CONTABLE_PILA',
    serieName: '400 - Contabilidad, Facturación & PILA',
    holderName: 'Aportes en Línea / EPS Sura / ARL Positiva',
    issueDate: '2026-11-05',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '950 KB',
    sha256Hash: '9e107d9d372bb6826bd81d3542a419d67184a123bfde',
    signedBy: 'Operador de Información PILA Aportes en Línea',
    retentionYears: 10,
    description: 'Comprobante bancario de pago de aportes parafiscales y cotizaciones a salud, pensión y riesgos laborales.',
  },
  {
    id: 'doc-007',
    radicado: 'SGD-2026-NDA-021',
    title: 'Acuerdo de Confidencialidad & Protección de Algoritmos (NDA Mutuo)',
    serie: '500_TECH_PROPIEDAD_INT',
    serieName: '500 - Tecnología & Propiedad Intelectual',
    holderName: 'CerebroQuant Enterprise Partners',
    issueDate: '2026-03-12',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b284759321eab',
    signedBy: 'NeuroLabs Legal / Director Legal Socio',
    retentionYears: 15,
    description: 'Blindaje de propiedad intelectual sobre modelos de scoring de crédito, arquitectura de agentes y pipelines de datos.',
  },
  {
    id: 'doc-008',
    radicado: 'SGD-2026-POL-002',
    title: 'Manual de Políticas de Protección de Datos Personales (Habeas Data)',
    serie: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Jurídica, DIAN & RUT',
    holderName: 'Superintendencia de Industria y Comercio (SIC)',
    issueDate: '2026-02-20',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    sha256Hash: '8f4321bca981249fae019234857bdf231458923a1029',
    signedBy: 'Oficial de Cumplimiento NeuroLabs',
    retentionYears: 10,
    description: 'Manual institucional de cumplimiento Ley 1581 de 2012 y Decreto 1377 de 2013 para tratamiento de información.',
  },
];

export default function GestionDocumentalPage() {
  const [documents, setDocuments] = useState<EnterpriseDocument[]>(SEED_CORP_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<EnterpriseDocument | null>(SEED_CORP_DOCUMENTS[0]);
  const [activeSerie, setActiveSerie] = useState<string>('TODAS');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const [copiedHash, setCopiedHash] = useState(false);

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
  const [certSalaryText, setCertSalaryText] = useState('CUATRO MILLONES QUINIENTOS MIL');
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
      doc.radicado.toLowerCase().includes(search.toLowerCase()) ||
      (doc.holderId && doc.holderId.toLowerCase().includes(search.toLowerCase()));

    const matchesSerie = activeSerie === 'TODAS' || doc.serie === activeSerie;
    const matchesStatus = statusFilter === 'TODOS' || doc.status === statusFilter;

    return matchesSearch && matchesSerie && matchesStatus;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleIssueCertificate = () => {
    const radNumber = `SGD-2026-CL-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: EnterpriseDocument = {
      id: `doc-${Date.now()}`,
      radicado: radNumber,
      title: `Certificado Laboral - ${certPosition}`,
      serie: '300_RRHH_LABORAL',
      serieName: '300 - Talento Humano & Certificaciones',
      holderName: certEmployee,
      holderId: `${certDocType} ${certDocNumber}`,
      issueDate: new Date().toISOString().split('T')[0],
      confidentiality: 'CONFIDENCIAL',
      status: 'VIGENTE',
      fileType: 'PDF',
      fileSize: '430 KB',
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signedBy: 'Jesús David Cantillo Parejo (Representante Legal)',
      retentionYears: 10,
      description: `Certificado laboral expedido con destino a ${certAddressee}. Devenga asignación de $${certSalary} COP.`,
      certData: {
        employeeName: certEmployee,
        docType: certDocType,
        docNumber: certDocNumber,
        docExpedition: certDocExpedition,
        position: certPosition,
        contractType: certContractType,
        startDate: certStartDate,
        salary: certSalary,
        salaryText: certSalaryText,
        addressee: certAddressee,
      },
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
          ? '200 - Jurídica, DIAN & RUT'
          : newSerie === '300_RRHH_LABORAL'
          ? '300 - Talento Humano & Certificaciones'
          : newSerie === '400_CONTABLE_PILA'
          ? '400 - Contabilidad, Facturación & PILA'
          : '500 - Tecnología & Propiedad Intelectual',
      holderName: newHolder,
      issueDate: new Date().toISOString().split('T')[0],
      confidentiality: newConfidentiality,
      status: 'CUSTODIADO',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
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

  const renderStatusBadge = (status: EnterpriseDocument['status']) => {
    switch (status) {
      case 'VIGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Vigente
          </span>
        );
      case 'CUSTODIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <Lock className="w-3 h-3 text-slate-600" />
            Custodiado
          </span>
        );
      case 'POR_RENOVAR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Por Renovar
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-300">
            En Revisión
          </span>
        );
    }
  };

  const renderConfidentialityBadge = (conf: EnterpriseDocument['confidentiality']) => {
    switch (conf) {
      case 'PUBLICO':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
            Público
          </span>
        );
      case 'CONFIDENCIAL':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-white">
            Confidencial
          </span>
        );
      case 'ESTRATEGICO_SOCIOS':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-950 text-amber-300 border border-amber-400/40">
            Socios Exclusivo
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white">
      {/* ── TOP CORPORATE BAR (MONOCHROME EXECUTIVE) ── */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link to="/gestion-documental" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="NeuroLabs Logo"
              className="w-9 h-9 object-contain"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-950 uppercase">
                  NeuroLabs
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 tracking-wider">
                  SGD / ECM
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  TECH SOLUTIONS S.A.S.
                </span>
                <span className="text-[11px] text-slate-600 font-script italic hidden md:inline ml-1 font-medium">
                  — Innovación sin Límites
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCertModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FileBadge className="w-4 h-4 text-slate-200" />
            <span>Emitir Certificado Laboral</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Radicar Expediente</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <Link
            to="/contabilidad"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">ERP</span> Contable
          </Link>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER (3-COLUMN EXECUTIVE LAYOUT) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT COLUMN: SERIES TRD & REPOSITORY STATUS ── */}
        <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60">
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <HardDrive className="w-3.5 h-3.5 text-slate-800" />
                  Bóveda Institucional
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-900">12.8 / 100 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-[13%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Cifrado SHA-256 Notarial</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Activo
                </span>
              </div>
            </div>
          </div>

          {/* Series Documentales (TRD) Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            <div className="px-2.5 py-1.5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tablas de Retención (TRD)
              </p>
              <span className="text-[9px] font-mono font-semibold text-slate-400">Ley 594</span>
            </div>

            <button
              onClick={() => setActiveSerie('TODAS')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === 'TODAS'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderArchive className="w-4 h-4" />
                <span>Todos los Expedientes</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === 'TODAS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('100_GOBIERNO')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === '100_GOBIERNO'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">100 - Gobierno & Socios</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeSerie === '100_GOBIERNO' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '100_GOBIERNO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('200_LEGAL_TRIBUTARIO')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === '200_LEGAL_TRIBUTARIO'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">200 - Jurídica, DIAN & RUT</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeSerie === '200_LEGAL_TRIBUTARIO' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '200_LEGAL_TRIBUTARIO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('300_RRHH_LABORAL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === '300_RRHH_LABORAL'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <FileCheck2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">300 - Talento Humano & Certificados</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeSerie === '300_RRHH_LABORAL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '300_RRHH_LABORAL').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('400_CONTABLE_PILA')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === '400_CONTABLE_PILA'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">400 - Contabilidad, Facturas & PILA</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeSerie === '400_CONTABLE_PILA' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '400_CONTABLE_PILA').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('500_TECH_PROPIEDAD_INT')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                activeSerie === '500_TECH_PROPIEDAD_INT'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">500 - Tecnología & Propiedad Intelectual</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeSerie === '500_TECH_PROPIEDAD_INT' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '500_TECH_PROPIEDAD_INT').length}
              </span>
            </button>
          </div>

          {/* Legal Framework Compliance Tag */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Scale className="w-3.5 h-3.5 text-slate-800" />
              <span>Validez Probatoria Digital</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Acreditación conforme a la Ley 527 de 1999 y Art. 247 del CGP de Colombia.
            </p>
          </div>
        </aside>

        {/* ── CENTER COLUMN: ARCHIVE EXPLORER ── */}
        <main className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
          {/* Action & Filter Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por radicado, titular, asunto o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-950"
                >
                  <option value="TODOS">Todos</option>
                  <option value="VIGENTE">Vigente</option>
                  <option value="CUSTODIADO">Custodiado</option>
                  <option value="POR_RENOVAR">Por Renovar</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'LIST' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'GRID' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Directory View */}
          <div className="p-4 md:p-6 flex-1">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-3 shadow-xs">
                <FolderArchive className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No se encontraron expedientes</h3>
                <p className="text-xs text-slate-500">
                  Modifica los criterios de búsqueda o radica un nuevo documento en la serie correspondiente.
                </p>
              </div>
            ) : viewMode === 'LIST' ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Radicado Oficial</th>
                      <th className="py-3 px-4">Título del Documento</th>
                      <th className="py-3 px-4 hidden md:table-cell">Titular / Dependencia</th>
                      <th className="py-3 px-4 hidden lg:table-cell">Serie TRD</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDocs.map((doc) => {
                      const isSelected = selectedDoc?.id === doc.id;
                      return (
                        <tr
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-slate-100/90 font-medium'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-slate-950 text-[11px]">
                              {doc.radicado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                                  {doc.title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                  SHA: {doc.sha256Hash.substring(0, 16)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell text-slate-600 truncate max-w-[180px]">
                            {doc.holderName}
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="text-[11px] text-slate-500 truncate max-w-[160px] block">
                              {doc.serieName.split('-')[1]?.trim() || doc.serieName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {doc.issueDate}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderStatusBadge(doc.status)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoc(doc);
                                setShowPreviewModal(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-950 rounded border border-slate-300 transition-all cursor-pointer"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`bg-white rounded-xl border p-4 space-y-3 transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-slate-950 ring-1 ring-slate-950'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {doc.radicado}
                        </span>
                        {renderStatusBadge(doc.status)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {doc.holderName}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{doc.issueDate}</span>
                        <span className="font-mono">{doc.fileSize}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT COLUMN: EXPEDIENTE INSPECTOR & LEGAL INTEGRITY ── */}
        {selectedDoc && (
          <aside className="w-full lg:w-84 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 p-5 space-y-5 overflow-y-auto">
            <div className="space-y-1 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-slate-950">
                  {selectedDoc.radicado}
                </span>
                {renderConfidentialityBadge(selectedDoc.confidentiality)}
              </div>
              <h3 className="font-extrabold text-sm text-slate-950 leading-snug pt-1">
                {selectedDoc.title}
              </h3>
              <p className="text-xs text-slate-500">{selectedDoc.serieName}</p>
            </div>

            {/* Document Attributes */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Titular / Empleado</span>
                <span className="font-semibold text-slate-900 text-right">{selectedDoc.holderName}</span>
              </div>
              {selectedDoc.holderId && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Documento ID</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedDoc.holderId}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha de Expedición</span>
                <span className="font-mono text-slate-900">{selectedDoc.issueDate}</span>
              </div>
              {selectedDoc.expirationDate && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Fecha de Vencimiento</span>
                  <span className="font-mono font-semibold text-amber-700">{selectedDoc.expirationDate}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Custodio / Firmante</span>
                <span className="font-medium text-slate-800 text-right max-w-[150px] truncate">
                  {selectedDoc.signedBy}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Retención TRD</span>
                <span className="font-semibold text-slate-900">{selectedDoc.retentionYears} Años</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Formato</span>
                <span className="font-mono text-slate-800">{selectedDoc.fileType} ({selectedDoc.fileSize})</span>
              </div>
            </div>

            {/* Criptografía & Blindaje Probatorio */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-800" />
                  Huella Criptográfica SHA-256
                </span>
                <button
                  onClick={() => handleCopyHash(selectedDoc.sha256Hash)}
                  className="text-[10px] text-slate-600 hover:text-slate-950 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedHash ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-slate-700 break-all leading-tight select-all">
                {selectedDoc.sha256Hash}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Integridad inmutable garantizada bajo el régimen probatorio de mensajes de datos en Colombia.
              </p>
            </div>

            {/* Inspector Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="w-full py-2.5 px-3 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar Documento Oficial</span>
              </button>

              <button
                onClick={() => {
                  setShowPreviewModal(true);
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir / Exportar PDF</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL 1: EMITIR CERTIFICADO LABORAL INSTITUCIONAL ── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <FileBadge className="w-5 h-5 text-slate-900" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase">
                    Generador de Certificado Laboral Institucional
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    NeuroLabs Tech Solutions S.A.S. — NIT 901.847.291 - 4
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre Completo del Colaborador
                </label>
                <input
                  type="text"
                  value={certEmployee}
                  onChange={(e) => setCertEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={certDocType}
                    onChange={(e) => setCertDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  >
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Número de Documento
                  </label>
                  <input
                    type="text"
                    value={certDocNumber}
                    onChange={(e) => setCertDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lugar de Expedición
                  </label>
                  <input
                    type="text"
                    value={certDocExpedition}
                    onChange={(e) => setCertDocExpedition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Fecha de Ingreso a la Empresa
                  </label>
                  <input
                    type="text"
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Cargo Oficial Desempeñado
                </label>
                <input
                  type="text"
                  value={certPosition}
                  onChange={(e) => setCertPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Contrato (C.S.T.)
                  </label>
                  <select
                    value={certContractType}
                    onChange={(e) => setCertContractType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  >
                    <option value="Término Indefinido">Término Indefinido</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                    <option value="Obra o Labor">Obra o Labor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Asignación Mensual Básica (COP)
                  </label>
                  <input
                    type="text"
                    value={certSalary}
                    onChange={(e) => setCertSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Asignación Salarial en Letras
                </label>
                <input
                  type="text"
                  value={certSalaryText}
                  onChange={(e) => setCertSalaryText(e.target.value)}
                  placeholder="Ej: CUATRO MILLONES QUINIENTOS MIL"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium uppercase focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Destinatario de la Certificación
                </label>
                <input
                  type="text"
                  value={certAddressee}
                  onChange={(e) => setCertAddressee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium uppercase focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-950 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleIssueCertificate}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Generar & Visualizar Certificado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RADICAR NUEVO DOCUMENTO (SGD) ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-950 uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-900" />
                Radicar Expediente en Archivo Central
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Título del Documento o Acta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Acta N° 005 - Nombramiento de Junta Directiva"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Serie Documental (TRD)
                  </label>
                  <select
                    value={newSerie}
                    onChange={(e) => setNewSerie(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  >
                    <option value="100_GOBIERNO">100 - Gobierno & Socios</option>
                    <option value="200_LEGAL_TRIBUTARIO">200 - Jurídica & DIAN</option>
                    <option value="300_RRHH_LABORAL">300 - Talento Humano</option>
                    <option value="400_CONTABLE_PILA">400 - Contable & PILA</option>
                    <option value="500_TECH_PROPIEDAD_INT">500 - Tecnología & IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nivel de Confidencialidad
                  </label>
                  <select
                    value={newConfidentiality}
                    onChange={(e) => setNewConfidentiality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  >
                    <option value="PUBLICO">Público</option>
                    <option value="CONFIDENCIAL">Confidencial</option>
                    <option value="ESTRATEGICO_SOCIOS">Socios Exclusivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Titular, Empleado o Dependencia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Asamblea de Accionistas / Nombre del Colaborador"
                  value={newHolder}
                  onChange={(e) => setNewHolder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notas de Custodia / Alcance
                </label>
                <textarea
                  rows={2}
                  placeholder="Descripción de custodia legal o justificación de archivo..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-950 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Asignar Radicado & Radicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EXECUTIVE PRINT-READY HIGH-FIDELITY LEGAL VIEWER ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="max-w-3xl w-full my-6 space-y-3">
            {/* Top Toolbar (Hidden on Print) */}
            <div className="flex items-center justify-between text-slate-900 bg-white p-3 rounded-xl border border-slate-200 shadow-lg print:hidden">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-slate-900" />
                <span className="text-xs font-mono font-bold text-slate-900">
                  Visualizador Notarial: {selectedDoc?.radicado}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-500 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Paper Document (Print Container) */}
            <div className="bg-white p-8 sm:p-14 md:p-16 rounded-xl border border-slate-200 shadow-2xl text-slate-900 font-sans space-y-6 leading-relaxed relative print:m-0 print:p-8 print:border-none print:shadow-none print:rounded-none">
              {/* Membrete Institucional con Logo Oficial */}
              <div className="flex items-start justify-between border-b-2 border-slate-950 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <img
                      src="/brand-logo-transparent.png"
                      alt="NeuroLabs Tech Solutions S.A.S."
                      className="h-16 w-auto object-contain"
                    />
                    <div>
                      <h1 className="font-sans text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                        NEUROLABS
                      </h1>
                      <p className="font-sans text-[11px] font-semibold tracking-[0.22em] text-slate-700 uppercase mt-1">
                        TECH SOLUTIONS S.A.S.
                      </p>
                      <p className="font-script text-base text-slate-800 font-semibold tracking-wide mt-0.5">
                        Innovación sin Límites
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-600 font-sans space-y-0.5 pt-1">
                  <p className="font-mono font-bold text-slate-950 text-xs">NIT: 901.847.291 - 4</p>
                  <p>Registro Mercantil CCB</p>
                  <p>Barranquilla, Atlántico - Colombia</p>
                  <p className="font-mono text-[10px] text-slate-500">contacto@neurolabs.com.co</p>
                  <p className="text-[10px] font-mono font-bold text-slate-950 pt-1">
                    RADICADO: {selectedDoc?.radicado}
                  </p>
                </div>
              </div>

              {/* Document Subtitle / Certification Header */}
              {selectedDoc?.serie === '300_RRHH_LABORAL' ? (
                <>
                  <div className="text-center pt-4 space-y-1.5">
                    <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                      EL SUSCRITO REPRESENTANTE LEGAL DE
                    </h2>
                    <h3 className="font-sans text-sm font-black uppercase tracking-wider text-slate-950">
                      NEUROLABS TECH SOLUTIONS S.A.S.
                    </h3>
                    <div className="py-2">
                      <span className="font-sans text-base font-black uppercase tracking-[0.25em] text-slate-950 border-y-2 border-slate-950 py-1 px-8 inline-block">
                        CERTIFICA:
                      </span>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-justify text-xs md:text-sm text-slate-800 space-y-4 pt-2 leading-relaxed">
                    <p>
                      Que el (la) señor(a){' '}
                      <strong className="font-sans font-bold text-slate-950 uppercase">
                        {selectedDoc.certData?.employeeName || selectedDoc.holderName}
                      </strong>
                      , identificado(a) con{' '}
                      {selectedDoc.certData?.docType || 'Cédula de Ciudadanía'} número{' '}
                      <strong className="font-mono font-bold text-slate-950">
                        {selectedDoc.certData?.docNumber || selectedDoc.holderId || '1.080.022.532'}
                      </strong>{' '}
                      expedida en{' '}
                      <strong>
                        {selectedDoc.certData?.docExpedition || 'Sitionuevo (Magdalena)'}
                      </strong>
                      , labora para nuestra compañía bajo relación laboral formal y continuada, de acuerdo con las siguientes especificaciones contractuales:
                    </p>

                    {/* Contract Details Table */}
                    <div className="border border-slate-300 rounded-lg overflow-hidden my-4">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Cargo desempeñado:</td>
                            <td className="py-2.5 px-4 font-extrabold text-slate-950 uppercase">
                              {selectedDoc.certData?.position || selectedDoc.title}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-slate-700">Tipo de Contrato:</td>
                            <td className="py-2.5 px-4 text-slate-900 font-semibold">
                              {selectedDoc.certData?.contractType || 'Término Indefinido (Código Sustantivo del Trabajo)'}
                            </td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-700">Fecha de Inicio:</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                              {selectedDoc.certData?.startDate || '01 de Febrero de 2024'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-slate-700">Asignación Mensual Básica:</td>
                            <td className="py-2.5 px-4 text-slate-950">
                              <span className="font-mono font-bold text-sm">
                                ${selectedDoc.certData?.salary || '4.500.000'} COP
                              </span>{' '}
                              <span className="text-[11px] font-semibold text-slate-600">
                                ({selectedDoc.certData?.salaryText || 'CUATRO MILLONES QUINIENTOS MIL'} PESOS M/CTE.)
                              </span>
                            </td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-700">Estado de Vinculación:</td>
                            <td className="py-2.5 px-4 text-emerald-800 font-bold">
                              Activo / En Cumplimiento de Funciones
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p>
                      Se hace constar que el colaborador se encuentra debidamente afiliado y al día en el pago integral de aportes al Sistema de Seguridad Social Integral en Colombia (Salud en EPS, Pensión en Administradora de Fondos, Riesgos Laborales en ARL Positiva y Parafiscales).
                    </p>

                    <p className="pt-1">
                      Para constancia de lo anterior y a solicitud escrita de la parte interesada, se expide la presente certificación con destino a{' '}
                      <strong className="font-sans font-bold text-slate-950">
                        {selectedDoc.certData?.addressee || 'A QUIEN PUEDA INTERESAR'}
                      </strong>
                      , en la ciudad de Barranquilla, República de Colombia, a los{' '}
                      {new Date().getDate()} días del mes de Noviembre del año 2026.
                    </p>
                  </div>
                </>
              ) : (
                /* Vista Genérica de Actas o Documentos Legales */
                <div className="space-y-4 pt-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                      {selectedDoc?.serieName}
                    </span>
                    <h2 className="text-base font-extrabold uppercase text-slate-950 tracking-wide">
                      {selectedDoc?.title}
                    </h2>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <p className="font-semibold text-slate-800">Descripción & Alcance Notarial:</p>
                    <p className="text-slate-600 leading-relaxed">{selectedDoc?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 text-[11px]">Titular Registrado</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedDoc?.holderName}</p>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 text-[11px]">Firmante Responsable</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedDoc?.signedBy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature and Verification Seal */}
              <div className="pt-12 border-t border-slate-300 flex items-end justify-between">
                <div>
                  {/* Handwritten Script Signature */}
                  <div className="w-64 pb-1 mb-1">
                    <p className="font-script text-3xl font-bold text-slate-950 select-none tracking-wide">
                      Jesús D. Cantillo Parejo
                    </p>
                    <div className="border-b-2 border-slate-950 w-full mt-1" />
                  </div>
                  <p className="font-sans text-xs font-bold text-slate-950 uppercase">
                    Jesús David Cantillo Parejo
                  </p>
                  <p className="font-sans text-[11px] text-slate-700 font-semibold">
                    Representante Legal & Gerente General
                  </p>
                  <p className="font-sans text-[10px] text-slate-500 font-mono">
                    C.C. 1.080.022.532 de Sitionuevo (Magdalena)
                  </p>
                  <p className="font-sans text-[10px] text-slate-600 font-semibold mt-0.5">
                    NEUROLABS TECH SOLUTIONS S.A.S.
                  </p>
                </div>

                <div className="text-right font-sans space-y-1.5 flex flex-col items-end">
                  {/* Sello Circular Notarial Digital */}
                  <div className="w-24 h-24 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center p-1 text-center bg-white shadow-2xs">
                    <Award className="w-4 h-4 text-slate-900 mb-0.5" />
                    <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-950 leading-none">
                      NEUROLABS S.A.S.
                    </span>
                    <span className="text-[6.5px] font-mono text-slate-600 leading-none mt-0.5">
                      NIT 901.847.291-4
                    </span>
                    <span className="text-[7px] font-bold text-slate-900 mt-0.5 leading-none">
                      SELLO DIGITAL
                    </span>
                    <span className="text-[6.5px] font-mono text-emerald-700 font-bold leading-none mt-0.5">
                      VERIFICADO
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-500 font-semibold">
                      Hash: {selectedDoc?.sha256Hash.substring(0, 24)}...
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono">
                      Cotejo legal en https://neurolabs.com.co
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
