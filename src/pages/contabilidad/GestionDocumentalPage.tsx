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
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Eye,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  HardDrive,
  Check,
  X,
  Copy,
  BadgeCheck,
  Scale,
  Award,
  Fingerprint,
  Info,
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
    description: 'Certificación oficial de funciones directivas y técnicas, contrato a término indefinido y asignación salarial.',
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
    holderName: 'Junta de Accionistas NeuroLabs',
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
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
    holderName: 'NeuroLabs Tech Solutions S.A.S.',
    holderId: 'NIT 901.847.291-4',
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
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
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
    description: 'Certificado de existencia con código de verificación para licitaciones y apertura bancaria. Vigencia 30 días.',
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
    title: 'Planilla PILA Integrada de Seguridad Social (Octubre 2026)',
    serie: '400_CONTABLE_PILA',
    serieName: '400 - Contabilidad, Facturas & PILA',
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
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSerie, setActiveSerie] = useState<string>('TODAS');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
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
  const [newHolderId, setNewHolderId] = useState('');
  const [newConfidentiality, setNewConfidentiality] = useState<'PUBLICO' | 'CONFIDENCIAL' | 'ESTRATEGICO_SOCIOS'>('CONFIDENCIAL');
  const [newDescription, setNewDescription] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const term = search.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(term) ||
      doc.holderName.toLowerCase().includes(term) ||
      doc.radicado.toLowerCase().includes(term) ||
      (doc.holderId && doc.holderId.toLowerCase().includes(term));

    const matchesSerie = activeSerie === 'TODAS' || doc.serie === activeSerie;
    const matchesStatus = statusFilter === 'TODOS' || doc.status === statusFilter;

    return matchesSearch && matchesSerie && matchesStatus;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleOpenDetail = (doc: EnterpriseDocument) => {
    setSelectedDoc(doc);
    setIsDrawerOpen(true);
  };

  const handleOpenPreview = (doc: EnterpriseDocument) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
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
      description: `Certificado laboral expedido con destino a ${certAddressee}. Devenga asignación mensual de $${certSalary} COP.`,
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
          ? '200 - Gestión Jurídica, DIAN & RUT'
          : newSerie === '300_RRHH_LABORAL'
          ? '300 - Talento Humano & Certificaciones'
          : newSerie === '400_CONTABLE_PILA'
          ? '400 - Contabilidad, Facturas & PILA'
          : '500 - Tecnología & Propiedad Intelectual',
      holderName: newHolder,
      holderId: newHolderId || undefined,
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
    setNewHolderId('');
    setNewDescription('');
  };

  const renderStatusBadge = (status: EnterpriseDocument['status']) => {
    switch (status) {
      case 'VIGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Vigente
          </span>
        );
      case 'CUSTODIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <Lock className="w-3 h-3 text-slate-600" />
            Custodiado
          </span>
        );
      case 'POR_RENOVAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Por Renovar
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            En Revisión
          </span>
        );
    }
  };

  return (
    <div
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white"
    >
      {/* ── TOP CORPORATE BAR (CLEAN ARIAL BRANDING) ── */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/gestion-documental" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="NeuroLabs Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-950 uppercase">
                  NEUROLABS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  SGD / ECM
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                TECH SOLUTIONS S.A.S. — Sistema de Gestión Documental
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCertModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir Certificado Laboral</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-600" />
            <span>Radicar Expediente</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <Link
            to="/contabilidad"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>ERP Contable</span>
          </Link>
        </div>
      </header>

      {/* ── WORKSPACE LAYOUT (SIDEBAR + FULL-WIDTH EXPEDIENTE TABLE) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT NAVIGATION SIDEBAR (260px) ── */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  <HardDrive className="w-3.5 h-3.5 text-slate-700" />
                  Bóveda Digital
                </span>
                <span className="text-[11px] font-bold text-slate-900">12.8 / 100 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-[13%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Cifrado SHA-256</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Activo
                </span>
              </div>
            </div>
          </div>

          {/* Series Documentales TRD */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Series Documentales (TRD)
            </p>

            <button
              onClick={() => setActiveSerie('TODAS')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === 'TODAS'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderArchive className="w-4 h-4" />
                <span>Todos los Expedientes</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === 'TODAS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('100_GOBIERNO')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === '100_GOBIERNO'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">100 - Gobierno & Socios</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === '100_GOBIERNO' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '100_GOBIERNO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('200_LEGAL_TRIBUTARIO')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === '200_LEGAL_TRIBUTARIO'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">200 - Legal, DIAN & RUT</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === '200_LEGAL_TRIBUTARIO' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '200_LEGAL_TRIBUTARIO').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('300_RRHH_LABORAL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === '300_RRHH_LABORAL'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <FileCheck2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">300 - Talento Humano</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === '300_RRHH_LABORAL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '300_RRHH_LABORAL').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('400_CONTABLE_PILA')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === '400_CONTABLE_PILA'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">400 - Contable & PILA</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === '400_CONTABLE_PILA' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '400_CONTABLE_PILA').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSerie('500_TECH_PROPIEDAD_INT')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                activeSerie === '500_TECH_PROPIEDAD_INT'
                  ? 'bg-slate-950 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">500 - Tecnología & IP</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeSerie === '500_TECH_PROPIEDAD_INT' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {documents.filter((d) => d.serie === '500_TECH_PROPIEDAD_INT').length}
              </span>
            </button>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Scale className="w-3.5 h-3.5" />
              <span>Normativa Archivo Colombia</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Cumplimiento Ley 594 de 2000 y Ley 527 de 1999 (Validez de mensajes de datos y firma digital).
            </p>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE: THE ENTERPRISE DOCUMENT TABLE ── */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#F8FAFC] overflow-y-auto">
          {/* Top Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por radicado, título, titular o documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-500 text-[11px]">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-slate-950"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="VIGENTE">Vigente</option>
                  <option value="CUSTODIADO">Custodiado</option>
                  <option value="POR_RENOVAR">Por Renovar</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {filteredDocs.length} expediente{filteredDocs.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4 sm:p-6 flex-1 min-w-0">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-3 shadow-xs">
                <FolderArchive className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No se encontraron expedientes</h3>
                <p className="text-xs text-slate-500">
                  Prueba cambiando el término de búsqueda o selecciona otra serie documental.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Radicado Oficial</th>
                        <th className="py-3 px-4">Título del Documento</th>
                        <th className="py-3 px-4">Titular / Empleado</th>
                        <th className="py-3 px-4">Serie TRD</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredDocs.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <tr
                            key={doc.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isSelected ? 'bg-slate-50 font-medium' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-950 whitespace-nowrap">
                              {doc.radicado}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate max-w-sm">
                                    {doc.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">
                                    SHA: {doc.sha256Hash.substring(0, 20)}...
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-800">
                              <p className="font-semibold truncate max-w-xs">{doc.holderName}</p>
                              {doc.holderId && (
                                <p className="text-[10px] text-slate-500 font-mono">{doc.holderId}</p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              <span className="text-[11px] font-medium text-slate-600">
                                {doc.serieName.split('-')[1]?.trim() || doc.serieName}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {doc.issueDate}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {renderStatusBadge(doc.status)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenPreview(doc)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-950 hover:bg-slate-800 rounded transition-all cursor-pointer shadow-2xs"
                                  title="Ver documento membretado oficial"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Documento</span>
                                </button>
                                <button
                                  onClick={() => handleOpenDetail(doc)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-all cursor-pointer shadow-2xs"
                                  title="Ver metadatos y custodia"
                                >
                                  <Info className="w-3 h-3" />
                                  <span>Detalles</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── SLIDE-OVER DRAWER FOR DOCUMENT METADATA (DOES NOT BREAK TABLE) ── */}
        {isDrawerOpen && selectedDoc && (
          <aside className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 p-5 space-y-4 overflow-y-auto shadow-xl z-30">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedDoc.radicado}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Attributes */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Titular / Empleado</span>
                <span className="font-bold text-slate-900 text-right">{selectedDoc.holderName}</span>
              </div>
              {selectedDoc.holderId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Documento ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDoc.holderId}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Serie TRD</span>
                <span className="font-medium text-slate-800 text-right">{selectedDoc.serieName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Fecha de Radicación</span>
                <span className="font-mono text-slate-900">{selectedDoc.issueDate}</span>
              </div>
              {selectedDoc.expirationDate && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Fecha de Vencimiento</span>
                  <span className="font-mono font-bold text-amber-700">{selectedDoc.expirationDate}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Custodio / Firmante</span>
                <span className="font-medium text-slate-800 text-right max-w-[170px] truncate">
                  {selectedDoc.signedBy}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Retención TRD</span>
                <span className="font-bold text-slate-900">{selectedDoc.retentionYears} Años</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Formato</span>
                <span className="font-mono text-slate-800">{selectedDoc.fileType} ({selectedDoc.fileSize})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Estado Actual</span>
                <span>{renderStatusBadge(selectedDoc.status)}</span>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-700" />
                  Huella SHA-256 (Ley 527)
                </span>
                <button
                  onClick={() => handleCopyHash(selectedDoc.sha256Hash)}
                  className="text-[10px] text-slate-700 hover:text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedHash ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-slate-700 break-all select-all">
                {selectedDoc.sha256Hash}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setShowPreviewModal(true);
                }}
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
                className="w-full py-2 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir / Exportar PDF</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL 1: EMITIR CERTIFICADO LABORAL (ARIAL CLEAN DESIGN) ── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase">
                  Generar Certificado Laboral Institucional
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  NeuroLabs Tech Solutions S.A.S. — NIT 901.847.291 - 4
                </p>
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
                <label className="block text-slate-700 font-bold mb-1">
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
                  <label className="block text-slate-700 font-bold mb-1">
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
                  <label className="block text-slate-700 font-bold mb-1">
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
                  <label className="block text-slate-700 font-bold mb-1">
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
                  <label className="block text-slate-700 font-bold mb-1">
                    Fecha de Ingreso
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
                <label className="block text-slate-700 font-bold mb-1">
                  Cargo Oficial
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
                  <label className="block text-slate-700 font-bold mb-1">
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
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Asignación Mensual Básica (COP)
                  </label>
                  <input
                    type="text"
                    value={certSalary}
                    onChange={(e) => setCertSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Asignación en Letras
                </label>
                <input
                  type="text"
                  value={certSalaryText}
                  onChange={(e) => setCertSalaryText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium uppercase focus:bg-white focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Destinatario
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
                  className="px-4 py-2 text-slate-600 hover:text-slate-950 font-bold cursor-pointer"
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
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 uppercase flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-slate-900" />
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
                <label className="block text-slate-700 font-bold mb-1">
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
                  <label className="block text-slate-700 font-bold mb-1">
                    Serie Documental (TRD)
                  </label>
                  <select
                    value={newSerie}
                    onChange={(e) => setNewSerie(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  >
                    <option value="100_GOBIERNO">100 - Gobierno & Socios</option>
                    <option value="200_LEGAL_TRIBUTARIO">200 - Legal & DIAN</option>
                    <option value="300_RRHH_LABORAL">300 - Talento Humano</option>
                    <option value="400_CONTABLE_PILA">400 - Contable & PILA</option>
                    <option value="500_TECH_PROPIEDAD_INT">500 - Tecnología & IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Titular o Empleado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jesús Cantillo / Junta de Socios"
                    value={newHolder}
                    onChange={(e) => setNewHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Cédula / NIT (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: CC 1.080.022.532"
                    value={newHolderId}
                    onChange={(e) => setNewHolderId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
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
                  className="px-4 py-2 text-slate-600 hover:text-slate-950 font-bold cursor-pointer"
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

      {/* ── MODAL 3: CERTIFICADO FORMAL EN PAPEL MEMBRETADO (ARIAL PURO) ── */}
      {showPreviewModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="max-w-3xl w-full my-6 space-y-3">
            {/* Top Toolbar (Oculto en Impresión) */}
            <div className="flex items-center justify-between text-slate-900 bg-white p-3 rounded-lg border border-slate-200 shadow-md print:hidden">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-slate-950" />
                <span
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  className="text-xs font-bold text-slate-950"
                >
                  Documento Oficial: {selectedDoc.radicado}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
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

            {/* Official Letterhead Paper Document */}
            <div
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              className="bg-white p-8 sm:p-14 md:p-16 rounded-xl border border-slate-200 shadow-2xl text-slate-900 space-y-6 leading-relaxed relative print:m-0 print:p-8 print:border-none print:shadow-none print:rounded-none"
            >
              {/* Membrete Institucional con Logo Oficial */}
              <div className="flex items-start justify-between border-b-2 border-slate-950 pb-6">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/brand-logo-transparent.png"
                    alt="NeuroLabs Logo"
                    className="h-16 w-auto object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                      NEUROLABS
                    </h1>
                    <p className="text-[11px] font-bold tracking-[0.2em] text-slate-700 uppercase mt-1">
                      TECH SOLUTIONS S.A.S.
                    </p>
                    <p className="text-xs text-slate-600 italic font-semibold mt-0.5">
                      Innovación sin Límites
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <p className="font-bold text-slate-950 text-xs">NIT: 901.847.291 - 4</p>
                  <p>Cámara de Comercio de Barranquilla</p>
                  <p>Barranquilla, Atlántico — Colombia</p>
                  <p className="text-[10px] text-slate-500">contacto@neurolabs.com.co</p>
                  <p className="text-[10px] font-bold text-slate-950 pt-1">
                    RADICADO: {selectedDoc.radicado}
                  </p>
                </div>
              </div>

              {/* Contenido del Documento */}
              {selectedDoc.serie === '300_RRHH_LABORAL' ? (
                <>
                  <div className="text-center pt-4 space-y-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                      EL SUSCRITO REPRESENTANTE LEGAL DE
                    </h2>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-950">
                      NEUROLABS TECH SOLUTIONS S.A.S.
                    </h3>
                    <div className="py-2">
                      <span className="text-base font-black uppercase tracking-[0.25em] text-slate-950 border-y-2 border-slate-950 py-1 px-8 inline-block">
                        CERTIFICA:
                      </span>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-justify text-xs md:text-sm text-slate-800 space-y-4 pt-2 leading-relaxed">
                    <p>
                      Que el (la) señor(a){' '}
                      <strong className="font-bold text-slate-950 uppercase">
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
                      <table className="w-full text-left text-xs border-collapse">
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Cargo desempeñado:</td>
                            <td className="py-2.5 px-4 font-bold text-slate-950 uppercase">
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
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
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
                              Activo / En Cumplimiento Normal de Funciones
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p>
                      Se hace constar que el colaborador se encuentra debidamente afiliado y al día en el pago integral de aportes al Sistema de Seguridad Social Integral en Colombia (Salud en EPS, Pensión en Administradora de Fondos, Riesgos Laborales en ARL Positiva y Parafiscales).
                    </p>

                    <p className="pt-1">
                      Para constancia de lo anterior y a solicitud de la parte interesada, se expide la presente certificación con destino a{' '}
                      <strong className="font-bold text-slate-950">
                        {selectedDoc.certData?.addressee || 'A QUIEN PUEDA INTERESAR'}
                      </strong>
                      , en la ciudad de Barranquilla, República de Colombia, a los{' '}
                      {new Date().getDate()} días del mes de Noviembre del año 2026.
                    </p>
                  </div>
                </>
              ) : (
                /* Vista de Actas o Documentos Legales */
                <div className="space-y-4 pt-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {selectedDoc.serieName}
                    </span>
                    <h2 className="text-base font-bold uppercase text-slate-950 tracking-wide">
                      {selectedDoc.title}
                    </h2>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <p className="font-bold text-slate-800">Descripción & Alcance Notarial:</p>
                    <p className="text-slate-600 leading-relaxed">{selectedDoc.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Titular Registrado</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedDoc.holderName}</p>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Firmante Responsable</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedDoc.signedBy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature and Verification Seal */}
              <div className="pt-10 border-t border-slate-300 flex items-end justify-between">
                <div>
                  <div className="w-64 pb-1 mb-1">
                    <p className="text-lg font-bold text-slate-950 tracking-wide uppercase">
                      Jesús D. Cantillo Parejo
                    </p>
                    <div className="border-b-2 border-slate-950 w-full mt-1" />
                  </div>
                  <p className="text-xs font-bold text-slate-950 uppercase">
                    Jesús David Cantillo Parejo
                  </p>
                  <p className="text-[11px] text-slate-700 font-bold">
                    Representante Legal & Gerente General
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    C.C. 1.080.022.532 de Sitionuevo (Magdalena)
                  </p>
                  <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                    NEUROLABS TECH SOLUTIONS S.A.S.
                  </p>
                </div>

                <div className="text-right space-y-1.5 flex flex-col items-end">
                  {/* Sello Notarial Digital */}
                  <div className="w-24 h-24 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center p-1 text-center bg-white shadow-2xs">
                    <Award className="w-4 h-4 text-slate-900 mb-0.5" />
                    <span className="text-[7.5px] font-bold uppercase tracking-tight text-slate-950 leading-none">
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
                      Hash: {selectedDoc.sha256Hash.substring(0, 24)}...
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
