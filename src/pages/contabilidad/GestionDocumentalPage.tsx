import React, { useState, useEffect } from 'react';
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
  HardDrive,
  Check,
  X,
  Copy,
  BadgeCheck,
  Scale,
  Award,
  Fingerprint,
  Info,
  Calendar,
  Image as ImageIcon,
  UploadCloud,
  ListTodo,
  AlertCircle,
  Megaphone,
  Briefcase,
  UserCheck,
  ShieldAlert,
  FileLock2,
  ExternalLink,
  ChevronRight,
  Shield,
  FileSignature,
} from 'lucide-react';
import {
  EnterpriseDocument,
  MeetingMinute,
  MeetingCommitment,
  SecurityRole,
  SECURITY_ROLES,
  checkDocumentAccess,
  documentService,
  computeFileSHA256,
  generateRandomSHA256,
  uploadDocumentFile,
  FALLBACK_DOCUMENTS,
  FALLBACK_MEETING_MINUTES,
} from '@/services/documentos/documentService';

export default function GestionDocumentalPage() {
  // ── SEGURIDAD Y PERFILES POR ÁREA ADMINISTRATIVA ──
  const [currentRole, setCurrentRole] = useState<SecurityRole>('DIRECCION_GENERAL');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityDeniedDoc, setSecurityDeniedDoc] = useState<EnterpriseDocument | null>(null);
  const [securityDeniedReason, setSecurityDeniedReason] = useState<string>('');

  // ── ESTADO PRINCIPAL DE NAVEGACIÓN Y DATOS ──
  const [activeTab, setActiveTab] = useState<'DOCUMENTOS' | 'RRHH_ADMIN' | 'ACTAS' | 'MARKETING'>('DOCUMENTOS');
  const [documents, setDocuments] = useState<EnterpriseDocument[]>(FALLBACK_DOCUMENTS);
  const [meetings, setMeetings] = useState<MeetingMinute[]>(FALLBACK_MEETING_MINUTES);
  const [selectedDoc, setSelectedDoc] = useState<EnterpriseDocument | null>(FALLBACK_DOCUMENTS[0]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(FALLBACK_MEETING_MINUTES[0]);
  const [activeSerie, setActiveSerie] = useState<string>('TODAS');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [rrhhSubFilter, setRrhhSubFilter] = useState<string>('TODOS');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── MODALES ──
  const [showCertModal, setShowCertModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showActaModal, setShowActaModal] = useState(false);

  // ── FORMULARIO GENERADOR LABORAL (ARIAL PURO) ──
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

  // ── FORMULARIO DE RADICACIÓN DE DOCUMENTOS / ARCHIVOS ──
  const [newTitle, setNewTitle] = useState('');
  const [newSerie, setNewSerie] = useState('300_RRHH_LABORAL');
  const [newHolder, setNewHolder] = useState('');
  const [newHolderId, setNewHolderId] = useState('');
  const [newDepartment, setNewDepartment] = useState('Talento Humano');
  const [newFileType, setNewFileType] = useState<'PDF' | 'PNG' | 'JPG' | 'DOCX'>('PDF');
  const [newConfidentiality, setNewConfidentiality] = useState<'PUBLICO' | 'USO_INTERNO' | 'CONFIDENCIAL' | 'ESTRATEGICO_SOCIOS'>('CONFIDENCIAL');
  const [newDescription, setNewDescription] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── FORMULARIO DE ACTAS DE REUNIÓN & COMPROMISOS ──
  const [actaNumber, setActaNumber] = useState(`ACT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [actaTitle, setActaTitle] = useState('');
  const [actaType, setActaType] = useState<MeetingMinute['meeting_type']>('ASAMBLEA_SOCIOS');
  const [actaDept, setActaDept] = useState('Gobierno Corporativo');
  const [actaDate, setActaDate] = useState(new Date().toISOString().split('T')[0]);
  const [actaStartTime, setActaStartTime] = useState('09:00');
  const [actaEndTime, setActaEndTime] = useState('11:00');
  const [actaLocation, setActaLocation] = useState('Sede Central NeuroLabs / Google Meet');
  const [actaPresident, setActaPresident] = useState('Jesús David Cantillo Parejo');
  const [actaSecretary, setActaSecretary] = useState('Juceth Parejo Cantillo');
  const [actaAgendaText, setActaAgendaText] = useState('1. Verificación del quórum reglamentario\n2. Informe del área de Talento Humano y Operaciones\n3. Revisión de compromisos y tareas');
  const [actaDeliberation, setActaDeliberation] = useState('');
  const [actaDecisions, setActaDecisions] = useState('');
  const [actaCommitments, setActaCommitments] = useState<MeetingCommitment[]>([
    {
      task_description: 'Validar expedientes de contratación y afiliaciones ARL del nuevo personal técnico',
      assigned_to: 'Juceth Parejo Cantillo',
      department: 'Talento Humano',
      due_date: '2026-11-28',
      status: 'EN_PROGRESO',
      notes: 'Póliza Positiva y reportes de seguridad social.',
    },
  ]);
  const [newCommitmentTask, setNewCommitmentTask] = useState('');
  const [newCommitmentAssigned, setNewCommitmentAssigned] = useState('');
  const [newCommitmentDept, setNewCommitmentDept] = useState('Talento Humano');
  const [newCommitmentDate, setNewCommitmentDate] = useState('2026-11-30');

  // ── CARGA INICIAL DE DATOS DESDE SUPABASE / LOCALSTORAGE ──
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [docsData, meetingsData] = await Promise.all([
        documentService.getDocuments(),
        documentService.getMeetingMinutes(),
      ]);
      setDocuments(docsData);
      setMeetings(meetingsData);
      if (docsData.length > 0) setSelectedDoc(docsData[0]);
      if (meetingsData.length > 0) setSelectedMeeting(meetingsData[0]);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // ── FILTRADO DE DOCUMENTOS CON CONTROL DE SEGURIDAD ──
  const filteredDocs = documents.filter((doc) => {
    const term = search.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(term) ||
      doc.holder_name.toLowerCase().includes(term) ||
      doc.radicado.toLowerCase().includes(term) ||
      (doc.holder_id && doc.holder_id.toLowerCase().includes(term)) ||
      doc.department.toLowerCase().includes(term);

    const matchesSerie = activeSerie === 'TODAS' || doc.serie_id === activeSerie;
    const matchesStatus = statusFilter === 'TODOS' || doc.status === statusFilter;

    // Filtro especial para pestaña de RRHH & Administración
    if (activeTab === 'RRHH_ADMIN') {
      const isRrhhOrAdmin =
        doc.serie_id === '300_RRHH_LABORAL' ||
        doc.department.toLowerCase().includes('humano') ||
        doc.department.toLowerCase().includes('operaciones') ||
        doc.department.toLowerCase().includes('jurídica');

      if (!isRrhhOrAdmin) return false;

      if (rrhhSubFilter === 'CERTIFICADOS') {
        return matchesSearch && doc.serie_id === '300_RRHH_LABORAL' && !!doc.certData;
      }
      if (rrhhSubFilter === 'CONTRATOS') {
        return matchesSearch && (doc.radicado.includes('CON') || doc.title.toLowerCase().includes('contrato'));
      }
      if (rrhhSubFilter === 'ARL_PILA') {
        return matchesSearch && (doc.title.toLowerCase().includes('arl') || doc.title.toLowerCase().includes('pila'));
      }
      if (rrhhSubFilter === 'MANUALES_RIT') {
        return matchesSearch && (doc.title.toLowerCase().includes('manual') || doc.title.toLowerCase().includes('reglamento'));
      }
    }

    return matchesSearch && matchesSerie && matchesStatus;
  });

  // Estadísticas del Área de Recursos Humanos & Administrativo
  const rrhhDocs = documents.filter(
    (d) => d.serie_id === '300_RRHH_LABORAL' || d.department.includes('Humano')
  );

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // ── GESTIÓN DE APERTURA CON VALIDACIÓN DE SEGURIDAD POR ÁREA ──
  const handleOpenDetail = (doc: EnterpriseDocument) => {
    const access = checkDocumentAccess(currentRole, doc);
    if (!access.allowed) {
      setSecurityDeniedDoc(doc);
      setSecurityDeniedReason(access.reason || 'Acceso restringido.');
      setSecurityModalOpen(true);
      return;
    }
    setSelectedDoc(doc);
    setIsDrawerOpen(true);
  };

  const handleOpenPreview = (doc: EnterpriseDocument) => {
    const access = checkDocumentAccess(currentRole, doc);
    if (!access.allowed) {
      setSecurityDeniedDoc(doc);
      setSecurityDeniedReason(access.reason || 'Acceso restringido.');
      setSecurityModalOpen(true);
      return;
    }
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  const handleAddCommitment = () => {
    if (!newCommitmentTask || !newCommitmentAssigned) return;
    setActaCommitments([
      ...actaCommitments,
      {
        task_description: newCommitmentTask,
        assigned_to: newCommitmentAssigned,
        department: newCommitmentDept,
        due_date: newCommitmentDate,
        status: 'PENDIENTE',
      },
    ]);
    setNewCommitmentTask('');
    setNewCommitmentAssigned('');
  };

  const handleRemoveCommitment = (index: number) => {
    setActaCommitments(actaCommitments.filter((_, idx) => idx !== index));
  };

  // ── EMISIÓN FORMAL DE CERTIFICADO LABORAL (ARIAL PURO) ──
  const handleIssueCertificate = async () => {
    const radNumber = `SGD-2026-CL-${Math.floor(100 + Math.random() * 900)}`;
    const hash = generateRandomSHA256();

    const newDoc: Omit<EnterpriseDocument, 'id'> = {
      radicado: radNumber,
      serie_id: '300_RRHH_LABORAL',
      serieName: '300 - Talento Humano & Certificaciones',
      title: `Certificado Laboral Institucional - ${certPosition}`,
      holder_name: certEmployee,
      holder_id: `${certDocType} ${certDocNumber}`,
      department: 'Talento Humano',
      issue_date: new Date().toISOString().split('T')[0],
      confidentiality: 'CONFIDENCIAL',
      status: 'VIGENTE',
      file_type: 'PDF',
      file_size: '430 KB',
      sha256_hash: hash,
      signed_by: 'Jesús David Cantillo Parejo (Representante Legal)',
      retention_years: 10,
      description: `Certificado laboral oficial expedido con destino a ${certAddressee}. Salario mensual de $${certSalary} COP.`,
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

    const saved = await documentService.createDocument(newDoc);
    setDocuments([saved, ...documents]);
    setSelectedDoc(saved);
    setShowCertModal(false);
    setShowPreviewModal(true);
  };

  // ── SUBIDA REAL DE ARCHIVOS / EXPEDIENTES CORPORATIVOS ──
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHolder) return;

    setIsUploading(true);
    let computedHash = generateRandomSHA256();
    let uploadedFileUrl: string | undefined = undefined;
    let fileSizeStr = '1.2 MB';

    if (selectedUploadFile) {
      computedHash = await computeFileSHA256(selectedUploadFile);
      fileSizeStr = `${(selectedUploadFile.size / (1024 * 1024)).toFixed(1)} MB`;
      const uploadRes = await uploadDocumentFile(selectedUploadFile, 'expedientes');
      if (uploadRes.url) {
        uploadedFileUrl = uploadRes.url;
      }
    }

    const seriePrefix = newSerie.substring(0, 3);
    const radNumber = `SGD-2026-${seriePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc: Omit<EnterpriseDocument, 'id'> = {
      radicado: radNumber,
      serie_id: newSerie,
      serieName: newSerie.replace(/_/g, ' '),
      title: newTitle,
      holder_name: newHolder,
      holder_id: newHolderId || undefined,
      department: newDepartment,
      issue_date: new Date().toISOString().split('T')[0],
      confidentiality: newConfidentiality,
      status: 'CUSTODIADO',
      file_type: newFileType,
      file_size: fileSizeStr,
      file_url: uploadedFileUrl,
      sha256_hash: computedHash,
      signed_by: 'Representación Legal & Custodia NeuroLabs S.A.S.',
      retention_years: newSerie.startsWith('100') ? 20 : newSerie.startsWith('600') ? 5 : 10,
      description: newDescription || 'Documento o activo digital indexado en el archivo corporativo.',
    };

    const saved = await documentService.createDocument(newDoc);
    setDocuments([saved, ...documents]);
    setSelectedDoc(saved);
    setIsUploading(false);
    setShowUploadModal(false);
    setNewTitle('');
    setNewHolder('');
    setNewHolderId('');
    setNewDescription('');
    setSelectedUploadFile(null);
  };

  // ── GUARDADO DE ACTA DE REUNIÓN CON COMPROMISOS ──
  const handleSaveActa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actaTitle || !actaDeliberation) return;

    let computedHash = generateRandomSHA256();
    let uploadedFileUrl: string | undefined = undefined;

    if (selectedUploadFile) {
      computedHash = await computeFileSHA256(selectedUploadFile);
      const uploadRes = await uploadDocumentFile(selectedUploadFile, 'actas');
      if (uploadRes.url) {
        uploadedFileUrl = uploadRes.url;
      }
    }

    const agendaArray = actaAgendaText.split('\n').filter((l) => l.trim().length > 0);

    const newActa: Omit<MeetingMinute, 'id'> = {
      acta_number: actaNumber,
      title: actaTitle,
      meeting_type: actaType,
      department: actaDept,
      meeting_date: actaDate,
      start_time: actaStartTime,
      end_time: actaEndTime,
      location: actaLocation,
      president_name: actaPresident,
      secretary_name: actaSecretary,
      attendees: [
        { name: actaPresident, role: 'Presidente / Gerente General', department: 'Dirección', attended: true },
        { name: actaSecretary, role: 'Secretaria / Directora RRHH', department: 'Operaciones', attended: true },
        { name: 'Líder de Área', role: 'Encargado del Comité', department: actaDept, attended: true },
      ],
      agenda: agendaArray,
      deliberation: actaDeliberation,
      decisions: actaDecisions || 'Se aprueban por consenso unánime los puntos tratados.',
      file_url: uploadedFileUrl,
      sha256_hash: computedHash,
      status: 'APROBADA',
    };

    const saved = await documentService.createMeetingMinute(newActa, actaCommitments);
    setMeetings([saved, ...meetings]);
    setSelectedMeeting(saved);
    setShowActaModal(false);
    setSelectedUploadFile(null);

    // Radicar copia en la tabla general de documentos
    const radNumber = `SGD-2026-ACT-${Math.floor(100 + Math.random() * 900)}`;
    const docActa: Omit<EnterpriseDocument, 'id'> = {
      radicado: radNumber,
      serie_id: '100_GOBIERNO',
      serieName: '100 - Gobierno Corporativo & Socios',
      title: actaTitle,
      holder_name: 'Junta de Socios / Comité NeuroLabs',
      department: actaDept,
      issue_date: actaDate,
      confidentiality: 'ESTRATEGICO_SOCIOS',
      status: 'CUSTODIADO',
      file_type: 'PDF',
      file_size: '1.5 MB',
      file_url: uploadedFileUrl,
      sha256_hash: computedHash,
      signed_by: `${actaPresident} / ${actaSecretary}`,
      retention_years: 20,
      description: `Acta formal de ${actaType} con ${actaCommitments.length} compromisos asignados.`,
    };
    const savedDoc = await documentService.createDocument(docActa);
    setDocuments([savedDoc, ...documents]);
  };

  const renderConfidentialityBadge = (level: EnterpriseDocument['confidentiality']) => {
    switch (level) {
      case 'ESTRATEGICO_SOCIOS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300 border border-slate-700">
            <Lock className="w-3 h-3 text-amber-400" />
            Estratégico Socios
          </span>
        );
      case 'CONFIDENCIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-900 border border-slate-300">
            <ShieldCheck className="w-3 h-3 text-slate-700" />
            Confidencial Área
          </span>
        );
      case 'USO_INTERNO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
            Uso Interno
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            Público
          </span>
        );
    }
  };

  const renderStatusBadge = (status: EnterpriseDocument['status']) => {
    switch (status) {
      case 'VIGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Vigente
          </span>
        );
      case 'CUSTODIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Lock className="w-3 h-3 text-slate-600" />
            Custodiado
          </span>
        );
      case 'POR_RENOVAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Por Renovar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white"
    >
      {/* ── HEADER PRINCIPAL CON IDENTIDAD NEUROLABS Y SELECTOR DE SEGURIDAD POR ÁREA ── */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/gestion-documental" className="flex items-center gap-3">
            <img
              src="/brand-logo-transparent.png"
              alt="NeuroLabs Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-950 uppercase">
                  NEUROLABS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  SGD / ECM Cloud
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                TECH SOLUTIONS S.A.S. — Sistema de Gestión Documental & Actas
              </p>
            </div>
          </Link>
        </div>

        {/* ── BARRA DE SEGURIDAD & PERFILES POR ÁREA ADMINISTRATIVA ── */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs">
              <Shield className="w-4 h-4 text-slate-800" />
              <span className="font-bold text-slate-600 text-[11px]">Área de Sesión:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as SecurityRole)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-xs text-slate-900 focus:outline-none focus:border-slate-950 cursor-pointer"
              >
                <option value="DIRECCION_GENERAL">👑 Dirección General (Acceso Total)</option>
                <option value="TALENTO_HUMANO">👥 Recursos Humanos (RRHH)</option>
                <option value="ADMINISTRATIVO_OPERACIONES">🏛️ Administración & Operaciones</option>
                <option value="CONTABILIDAD_FINANZAS">💼 Contabilidad & Finanzas</option>
                <option value="MARKETING_DISENOS">🎨 Marketing & Diseños</option>
                <option value="COLABORADOR_GENERAL">🔒 Colaborador (Consulta General)</option>
              </select>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {SECURITY_ROLES[currentRole].badgeLabel}
            </span>
          </div>

          {/* Botones de Acción Global */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActaModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-200" />
              <span className="hidden sm:inline">Subir / Redactar</span> Acta
            </button>

            <button
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Certificado Laboral</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>Radicar Archivo</span>
            </button>

            <Link
              to="/contabilidad"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ERP</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── PESTAÑAS PRINCIPALES DEL SISTEMA (SECCIÓN RRHH, ACTAS, DOCS, MARKETING) ── */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex space-x-1 py-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('DOCUMENTOS');
              setActiveSerie('TODAS');
            }}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'DOCUMENTOS'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Todos los Expedientes ({documents.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('RRHH_ADMIN');
              setActiveSerie('300_RRHH_LABORAL');
            }}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'RRHH_ADMIN'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión Administrativa & RRHH</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTAS')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ACTAS'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Actas de Reunión & Comités ({meetings.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('MARKETING');
              setActiveSerie('600_MARKETING_COMUNICACIONES');
            }}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'MARKETING'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Marketing, Diseños & Responsabilidades</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500 hidden xl:flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Blindaje Criptográfico SHA-256 (Ley 527)
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-700" />
            Bóveda Cloud: 14.2 / 100 GB
          </span>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL DEL SGD ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ══════════════════════════════════════════════════════════════
           VISTA 1: GESTIÓN ADMINISTRATIVA & RECURSOS HUMANOS (RRHH)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'RRHH_ADMIN' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F8FAFC] min-w-0">
            {/* Panel Superior Informativo de RRHH */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-slate-100 rounded-lg text-slate-900 font-bold">
                      <Users className="w-5 h-5 text-slate-950" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        Departamento de Gestión Humana, Administrativo & Legal
                      </h2>
                      <p className="text-xs text-slate-500">
                        Custodia laboral, contratos CST, certificaciones institucionales y seguridad social de NeuroLabs S.A.S.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Emitir Certificación Laboral</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewSerie('300_RRHH_LABORAL');
                      setNewDepartment('Talento Humano');
                      setShowUploadModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-700" />
                    <span>Radicar Documento RRHH</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de Indicadores Clave de RRHH */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold text-[11px] block">Colaboradores Vinculados</span>
                  <p className="text-xl font-black text-slate-950 mt-1">14 Empleados</p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">100% Contratos CST Vigentes</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold text-[11px] block">Certificaciones Expedidas</span>
                  <p className="text-xl font-black text-slate-950 mt-1">32 Radicados</p>
                  <span className="text-[10px] text-slate-600 font-bold mt-0.5 block">Con firma digital y Hash</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold text-[11px] block">Seguridad Social PILA</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">Al Día (Oct 2026)</p>
                  <span className="text-[10px] text-slate-600 font-bold mt-0.5 block">ARL Positiva & EPS Sura</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold text-[11px] block">Reglamento de Trabajo (RIT)</span>
                  <p className="text-xl font-black text-slate-950 mt-1">Homologado</p>
                  <span className="text-[10px] text-slate-600 font-bold mt-0.5 block">Aprobado MinTrabajo</span>
                </div>
              </div>

              {/* Sub-filtros de Gestión Humana */}
              <div className="flex items-center gap-2 pt-2 overflow-x-auto text-xs">
                <span className="text-slate-500 font-bold text-[11px] mr-1">Filtrar por:</span>
                {[
                  { key: 'TODOS', label: 'Todos los Trámites RRHH' },
                  { key: 'CERTIFICADOS', label: 'Certificaciones Laborales' },
                  { key: 'CONTRATOS', label: 'Contratos de Trabajo (CST)' },
                  { key: 'ARL_PILA', label: 'Seguridad Social & ARL' },
                  { key: 'MANUALES_RIT', label: 'Manual de Funciones & RIT' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRrhhSubFilter(item.key)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      rrhhSubFilter === item.key
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla de Expedientes de RRHH & Administrativo */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por cédula, nombre de colaborador, cargo o radicado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {filteredDocs.length} expediente{filteredDocs.length === 1 ? '' : 's'} disponible{filteredDocs.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Radicado SGD</th>
                      <th className="py-3 px-4">Expediente / Asunto</th>
                      <th className="py-3 px-4">Colaborador / Titular</th>
                      <th className="py-3 px-4">Seguridad</th>
                      <th className="py-3 px-4">Fecha Emisión</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-950 whitespace-nowrap">
                          {doc.radicado}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-700 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-sm">
                                {doc.title}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">
                                Hash SHA-256: {doc.sha256_hash.substring(0, 24)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 truncate">{doc.holder_name}</p>
                          <p className="text-[10px] text-slate-500">{doc.holder_id || doc.department}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderConfidentialityBadge(doc.confidentiality)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {doc.issue_date}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderStatusBadge(doc.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenPreview(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-950 hover:bg-slate-800 rounded transition-all cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver</span>
                            </button>
                            <button
                              onClick={() => handleOpenDetail(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-all cursor-pointer shadow-2xs"
                            >
                              <Info className="w-3 h-3" />
                              <span>Detalle</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'ACTAS' ? (
          /* ══════════════════════════════════════════════════════════════
             VISTA 2: ACTAS DE REUNIÓN & MATRIZ DE COMPROMISOS
             ══════════════════════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
            {/* Lista Lateral de Actas */}
            <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Libro de Actas Corporativas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Asambleas, Juntas y Comités Formales
                  </p>
                </div>
                <button
                  onClick={() => setShowActaModal(true)}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded transition-all cursor-pointer"
                >
                  + Nueva
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                {meetings.map((m) => {
                  const isSelected = selectedMeeting?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {m.acta_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isSelected ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-1.5 leading-snug line-clamp-2">
                        {m.title}
                      </h4>
                      <div
                        className={`pt-2 mt-2 border-t flex items-center justify-between text-[11px] ${
                          isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                        }`}
                      >
                        <span>{m.meeting_date}</span>
                        <span>{m.commitments?.length || 0} compromisos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalle del Acta Seleccionada y Tabla de Responsabilidades */}
            {selectedMeeting ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC] min-w-0">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-950">
                          {selectedMeeting.acta_number}
                        </span>
                        <span className="text-xs font-bold text-slate-600 uppercase">
                          {selectedMeeting.meeting_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-950 mt-2">
                        {selectedMeeting.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir Acta
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Fecha & Horario</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {selectedMeeting.meeting_date} ({selectedMeeting.start_time || '09:00'} - {selectedMeeting.end_time || '11:00'})
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Lugar / Medio</span>
                      <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedMeeting.location}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Presidente</span>
                      <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedMeeting.president_name}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[11px] font-bold">Secretaria</span>
                      <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedMeeting.secretary_name}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                      Orden del Día Tratado:
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs text-slate-700">
                      {selectedMeeting.agenda.map((p, idx) => (
                        <p key={idx} className="font-medium">{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                        Deliberaciones & Desarrollo:
                      </h4>
                      <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-justify">
                        {selectedMeeting.deliberation}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                        Decisiones & Acuerdos Formales:
                      </h4>
                      <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-justify">
                        {selectedMeeting.decisions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── MATRIZ DE COMPROMISOS Y RESPONSABILIDADES POR ÁREA ── */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 uppercase flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-slate-900" />
                        Matriz de Compromisos & Responsabilidades Asignadas
                      </h3>
                      <p className="text-xs text-slate-500">
                        Responsabilidades delegadas para Marketing, Operaciones, Legal, RRHH y Tecnología.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {selectedMeeting.commitments?.length || 0} tareas asignadas
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Tarea / Responsabilidad</th>
                          <th className="py-2.5 px-4">Área / Dependencia</th>
                          <th className="py-2.5 px-4">Responsable</th>
                          <th className="py-2.5 px-4">Fecha Límite</th>
                          <th className="py-2.5 px-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedMeeting.commitments && selectedMeeting.commitments.length > 0 ? (
                          selectedMeeting.commitments.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-900">
                                {c.task_description}
                                {c.notes && (
                                  <p className="text-[10px] text-slate-500 font-normal">{c.notes}</p>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                                  {c.department}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-800">
                                {c.assigned_to}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                {c.due_date || 'Inmediato'}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    c.status === 'COMPLETADO'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : c.status === 'EN_PROGRESO'
                                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-400">
                              No hay compromisos pendientes registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════
             VISTA 3: EXPEDIENTES GENERALES & MARKETING
             ══════════════════════════════════════════════════════════════ */
          <>
            {/* Barra Lateral TRD */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tablas de Retención (TRD)
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '300_RRHH_LABORAL').length}
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '100_GOBIERNO').length}
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
                    <span className="truncate">200 - Legal & DIAN</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '200_LEGAL_TRIBUTARIO').length}
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '400_CONTABLE_PILA').length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveSerie('600_MARKETING_COMUNICACIONES')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                    activeSerie === '600_MARKETING_COMUNICACIONES'
                      ? 'bg-slate-950 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Megaphone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">600 - Marketing & Diseños</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '600_MARKETING_COMUNICACIONES').length}
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {documents.filter((d) => d.serie_id === '500_TECH_PROPIEDAD_INT').length}
                  </span>
                </button>
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Ley 594 de 2000 (AGN)</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Custodia probatoria digital con huellas SHA-256 e inmutabilidad garantizada.
                </p>
              </div>
            </aside>

            {/* Tabla Central */}
            <main className="flex-1 min-w-0 flex flex-col bg-[#F8FAFC] overflow-y-auto">
              <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por radicado, título, titular o departamento..."
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
                      <option value="TODOS">Todos</option>
                      <option value="VIGENTE">Vigente</option>
                      <option value="CUSTODIADO">Custodiado</option>
                      <option value="POR_RENOVAR">Por Renovar</option>
                    </select>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    {filteredDocs.length} archivo{filteredDocs.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Contenido de la Tabla */}
              <div className="p-4 sm:p-6 flex-1 min-w-0">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Radicado Oficial</th>
                          <th className="py-3 px-4">Título del Documento</th>
                          <th className="py-3 px-4">Área / Titular</th>
                          <th className="py-3 px-4">Seguridad</th>
                          <th className="py-3 px-4">Tipo</th>
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
                                  {doc.file_type === 'PNG' || doc.file_type === 'JPG' ? (
                                    <ImageIcon className="w-4 h-4 text-slate-700 flex-shrink-0" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate max-w-sm">
                                      {doc.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                      SHA: {doc.sha256_hash.substring(0, 20)}...
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800">
                                <p className="font-semibold truncate max-w-xs">{doc.holder_name}</p>
                                <p className="text-[10px] text-slate-500">{doc.department}</p>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {renderConfidentialityBadge(doc.confidentiality)}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-700">
                                {doc.file_type}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                                {doc.issue_date}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {renderStatusBadge(doc.status)}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenPreview(doc)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-950 hover:bg-slate-800 rounded transition-all cursor-pointer shadow-2xs"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Ver</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenDetail(doc)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-all cursor-pointer shadow-2xs"
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
              </div>
            </main>

            {/* Drawer Lateral de Metadatos */}
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

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Titular / Empleado</span>
                    <span className="font-bold text-slate-900 text-right">{selectedDoc.holder_name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Área / Departamento</span>
                    <span className="font-bold text-slate-900 text-right">{selectedDoc.department}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Clasificación</span>
                    <span>{renderConfidentialityBadge(selectedDoc.confidentiality)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Fecha de Emisión</span>
                    <span className="font-mono text-slate-900">{selectedDoc.issue_date}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Formato & Tamaño</span>
                    <span className="font-mono text-slate-800">{selectedDoc.file_type} ({selectedDoc.file_size || '1.2 MB'})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Estado de Vigencia</span>
                    <span>{renderStatusBadge(selectedDoc.status)}</span>
                  </div>
                </div>

                {/* Hash Criptográfico Inmutable */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                      <Fingerprint className="w-3.5 h-3.5 text-slate-700" />
                      Huella SHA-256 (Inmutable)
                    </span>
                    <button
                      onClick={() => handleCopyHash(selectedDoc.sha256_hash)}
                      className="text-[10px] text-slate-700 hover:text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-slate-700 break-all select-all">
                    {selectedDoc.sha256_hash}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleOpenPreview(selectedDoc);
                    }}
                    className="w-full py-2.5 px-3 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visualizar Documento</span>
                  </button>
                </div>
              </aside>
            )}
          </>
        )}
      </div>

      {/* ── MODAL 1: ALERTA DE SEGURIDAD Y CONTROL DE ACCESO POR ÁREA ── */}
      {securityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-900">
              <ShieldAlert className="w-6 h-6 text-slate-900" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">
                Acceso Restringido por Política de Seguridad
              </h3>
              <p className="text-xs text-slate-500">
                Sistema de Control de Acceso por Área — NeuroLabs S.A.S.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-left space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Perfil Activo:</span>
                <span className="font-bold text-slate-900">{SECURITY_ROLES[currentRole].name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Documento Solicitado:</span>
                <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]">
                  {securityDeniedDoc?.radicado}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1">
                {securityDeniedReason}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => setSecurityModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Entendido / Cerrar
              </button>
              <button
                onClick={() => {
                  setCurrentRole('DIRECCION_GENERAL');
                  setSecurityModalOpen(false);
                  if (securityDeniedDoc) handleOpenPreview(securityDeniedDoc);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
              >
                Autenticar como Dirección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REDACTAR / SUBIR ACTA DE REUNIÓN DIRECTA ── */}
      {showActaModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-900" />
                  Radicar / Subir Acta de Reunión & Comités
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  NeuroLabs Tech Solutions S.A.S. — Libro de Actas Digital (Ley 594 de 2000)
                </p>
              </div>
              <button
                onClick={() => setShowActaModal(false)}
                className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActa} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Número de Acta</label>
                  <input
                    type="text"
                    required
                    value={actaNumber}
                    onChange={(e) => setActaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Reunión</label>
                  <select
                    value={actaType}
                    onChange={(e) => setActaType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white focus:border-slate-950"
                  >
                    <option value="ASAMBLEA_SOCIOS">Asamblea General de Accionistas</option>
                    <option value="JUNTA_DIRECTIVA">Junta Directiva</option>
                    <option value="COMITE_MARKETING">Comité de Marketing & Comunicaciones</option>
                    <option value="COMITE_OPERATIVO">Comité Operativo & Talento Humano</option>
                    <option value="SEGUIMIENTO_PROYECTOS">Comité de Software & Tecnología</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Acta N° 005 - Comité de Talento Humano y Asignación de Roles de Marketing"
                  value={actaTitle}
                  onChange={(e) => setActaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={actaDate}
                    onChange={(e) => setActaDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={actaStartTime}
                    onChange={(e) => setActaStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={actaEndTime}
                    onChange={(e) => setActaEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Presidente / Gerente</label>
                  <input
                    type="text"
                    required
                    value={actaPresident}
                    onChange={(e) => setActaPresident(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Secretaria / Operaciones</label>
                  <input
                    type="text"
                    required
                    value={actaSecretary}
                    onChange={(e) => setActaSecretary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Orden del Día (un punto por línea)</label>
                <textarea
                  rows={2}
                  value={actaAgendaText}
                  onChange={(e) => setActaAgendaText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deliberación y Temas Tratados</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle de los puntos analizados, propuestas y deliberación..."
                  value={actaDeliberation}
                  onChange={(e) => setActaDeliberation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              {/* Asignación de Compromisos */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-slate-800" />
                    Asignación de Compromisos y Tareas (Marketing, RRHH, Tech, Operaciones)
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {actaCommitments.length} asignados
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Descripción de la tarea..."
                    value={newCommitmentTask}
                    onChange={(e) => setNewCommitmentTask(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Responsable..."
                    value={newCommitmentAssigned}
                    onChange={(e) => setNewCommitmentAssigned(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddCommitment}
                    className="px-2.5 py-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    + Asignar
                  </button>
                </div>

                {actaCommitments.length > 0 && (
                  <div className="space-y-1 pt-1 max-h-32 overflow-y-auto">
                    {actaCommitments.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-[11px]"
                      >
                        <div>
                          <strong className="text-slate-900">{c.task_description}</strong>
                          <span className="text-slate-500 ml-2">→ {c.assigned_to} ({c.department})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommitment(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Adjuntar Documento Firmado o Soporte Físico (PDF o Imagen)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setSelectedUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowActaModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-950 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Guardar Acta en la Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: GENERADOR LABORAL (ARIAL PURO CON MEMBRETE) ── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase">
                  Generar Certificación Laboral Institucional
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

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo del Colaborador</label>
                <input
                  type="text"
                  value={certEmployee}
                  onChange={(e) => setCertEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Documento</label>
                  <select
                    value={certDocType}
                    onChange={(e) => setCertDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  >
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Número de Cédula</label>
                  <input
                    type="text"
                    value={certDocNumber}
                    onChange={(e) => setCertDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lugar de Expedición</label>
                  <input
                    type="text"
                    value={certDocExpedition}
                    onChange={(e) => setCertDocExpedition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha de Ingreso</label>
                  <input
                    type="text"
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cargo Oficial</label>
                <input
                  type="text"
                  value={certPosition}
                  onChange={(e) => setCertPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Contrato</label>
                  <select
                    value={certContractType}
                    onChange={(e) => setCertContractType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  >
                    <option value="Término Indefinido">Término Indefinido (CST)</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Asignación Mensual Básica</label>
                  <input
                    type="text"
                    value={certSalary}
                    onChange={(e) => setCertSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Destinatario</label>
                <input
                  type="text"
                  value={certAddressee}
                  onChange={(e) => setCertAddressee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium uppercase focus:bg-white focus:border-slate-950"
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
                  Generar Certificado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RADICAR ARCHIVO CORPORATIVO REAL (CON PREVIEWS Y HASH) ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 uppercase flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-slate-900" />
                Radicar Expediente o Documento Corporativo
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
                <label className="block text-slate-700 font-bold mb-1">Título Oficial del Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Contrato Laboral CST / RUT DIAN / Infografía Responsabilidades"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Serie TRD</label>
                  <select
                    value={newSerie}
                    onChange={(e) => setNewSerie(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  >
                    <option value="300_RRHH_LABORAL">300 - Talento Humano & Contratos</option>
                    <option value="100_GOBIERNO">100 - Gobierno Corporativo & Socios</option>
                    <option value="200_LEGAL_TRIBUTARIO">200 - Legal, DIAN & RUT</option>
                    <option value="400_CONTABLE_PILA">400 - Contabilidad & PILA</option>
                    <option value="500_TECH_PROPIEDAD_INT">500 - Tecnología & IP</option>
                    <option value="600_MARKETING_COMUNICACIONES">600 - Marketing & Diseños</option>
                    <option value="700_OPERACIONES_ACTAS">700 - Operaciones & Comités</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nivel de Seguridad</label>
                  <select
                    value={newConfidentiality}
                    onChange={(e) => setNewConfidentiality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  >
                    <option value="CONFIDENCIAL">Confidencial por Área</option>
                    <option value="PUBLICO">Público (Toda la Empresa)</option>
                    <option value="USO_INTERNO">Uso Interno de Empleados</option>
                    <option value="ESTRATEGICO_SOCIOS">Estratégico Socios (Máxima Seguridad)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Área Responsable</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  >
                    <option value="Talento Humano">Talento Humano (RRHH)</option>
                    <option value="Operaciones & Jurídica">Operaciones & Jurídica</option>
                    <option value="Dirección General">Dirección General</option>
                    <option value="Contabilidad & Finanzas">Contabilidad & Finanzas</option>
                    <option value="Marketing & Comunicaciones">Marketing & Comunicaciones</option>
                    <option value="Tecnología & IA">Tecnología & IA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Titular o Beneficiario</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jesús Cantillo / Equipo Marketing"
                    value={newHolder}
                    onChange={(e) => setNewHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Adjuntar Archivo Local (PDF, Imágenes, Word, Excel)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    setSelectedUploadFile(file);
                    if (file) {
                      const ext = file.name.split('.').pop()?.toUpperCase();
                      if (ext === 'PNG' || ext === 'JPG' || ext === 'WEBP') {
                        setNewFileType(ext as any);
                      } else {
                        setNewFileType('PDF');
                      }
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
                {selectedUploadFile && (
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Archivo seleccionado: {selectedUploadFile.name} ({(selectedUploadFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el alcance, vigencia o firma del expediente..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-slate-950"
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
                  disabled={isUploading}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Calculando Hash y Subiendo...</span>
                    </>
                  ) : (
                    <span>Radicar en Base de Datos</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: VISOR MULTIMEDIA & DOCUMENTOS (ARIAL PURO + IMÁGENES + CONTRATOS) ── */}
      {showPreviewModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="max-w-3xl w-full my-6 space-y-3">
            {/* Barra Superior del Visor */}
            <div className="flex items-center justify-between text-slate-900 bg-white p-3 rounded-lg border border-slate-200 shadow-md print:hidden">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-slate-950" />
                <span
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  className="text-xs font-bold text-slate-950 truncate max-w-md"
                >
                  {selectedDoc.radicado} — {selectedDoc.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedDoc.file_url && (
                  <a
                    href={selectedDoc.file_url}
                    download={selectedDoc.title}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-lg cursor-pointer transition-all border border-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Archivo
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-500 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CASO A: Imagen de Marketing o Diseño (Infografía, Brand Guidelines, Logotipos) */}
            {(selectedDoc.file_type === 'PNG' || selectedDoc.file_type === 'JPG' || selectedDoc.file_type === 'WEBP') ? (
              <div
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xl text-slate-900 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Activo Digital de {selectedDoc.department}
                    </span>
                    <h2 className="text-base font-bold text-slate-950 mt-0.5">
                      {selectedDoc.title}
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                    {selectedDoc.radicado}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                  <img
                    src={selectedDoc.file_url || '/brand-logo-full.png'}
                    alt={selectedDoc.title}
                    className="max-h-[450px] w-auto object-contain rounded shadow-xs"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">Descripción & Alcance de la Pieza:</p>
                  <p className="text-slate-600 leading-relaxed">{selectedDoc.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Huella SHA-256: {selectedDoc.sha256_hash.substring(0, 32)}...</span>
                  <span>Formato: {selectedDoc.file_type} ({selectedDoc.file_size || '1.8 MB'})</span>
                </div>
              </div>
            ) : selectedDoc.serie_id === '300_RRHH_LABORAL' && selectedDoc.certData ? (
              /* CASO B: Hoja Formal de Certificación Laboral en Arial Puro */
              <div
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className="bg-white p-8 sm:p-14 md:p-16 rounded-xl border border-slate-200 shadow-2xl text-slate-900 space-y-6 leading-relaxed relative print:m-0 print:p-8 print:border-none print:shadow-none print:rounded-none"
              >
                {/* Membrete Oficial */}
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

                <div className="text-justify text-xs md:text-sm text-slate-800 space-y-4 pt-2 leading-relaxed">
                  <p>
                    Que el (la) señor(a){' '}
                    <strong className="font-bold text-slate-950 uppercase">
                      {selectedDoc.certData.employeeName}
                    </strong>
                    , identificado(a) con{' '}
                    {selectedDoc.certData.docType} número{' '}
                    <strong className="font-mono font-bold text-slate-950">
                      {selectedDoc.certData.docNumber}
                    </strong>{' '}
                    expedida en{' '}
                    <strong>
                      {selectedDoc.certData.docExpedition}
                    </strong>
                    , labora para nuestra compañía bajo relación laboral formal y continuada, de acuerdo con las siguientes especificaciones contractuales:
                  </p>

                  <div className="border border-slate-300 rounded-lg overflow-hidden my-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Cargo desempeñado:</td>
                          <td className="py-2.5 px-4 font-bold text-slate-950 uppercase">
                            {selectedDoc.certData.position}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">Tipo de Contrato:</td>
                          <td className="py-2.5 px-4 text-slate-900 font-semibold">
                            {selectedDoc.certData.contractType} (Código Sustantivo del Trabajo)
                          </td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-700">Fecha de Inicio:</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                            {selectedDoc.certData.startDate}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">Asignación Mensual Básica:</td>
                          <td className="py-2.5 px-4 text-slate-950">
                            <span className="font-mono font-bold text-sm">
                              ${selectedDoc.certData.salary} COP
                            </span>{' '}
                            <span className="text-[11px] font-semibold text-slate-600">
                              ({selectedDoc.certData.salaryText} PESOS M/CTE.)
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
                      {selectedDoc.certData.addressee}
                    </strong>
                    , en la ciudad de Barranquilla, República de Colombia, a los{' '}
                    {new Date().getDate()} días del mes de Noviembre del año 2026.
                  </p>
                </div>

                {/* Firma y Sello Digital */}
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
                        Hash: {selectedDoc.sha256_hash.substring(0, 24)}...
                      </p>
                      <p className="text-[8px] text-slate-400 font-mono">
                        Cotejo legal en https://neurolabs.com.co
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedDoc.contractData ? (
              /* CASO C: Vista Formal de Contrato Laboral CST */
              <div
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-2xl text-slate-900 space-y-6 leading-relaxed"
              >
                <div className="border-b-2 border-slate-950 pb-4 text-center">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">
                    CONTRATO INDIVIDUAL DE TRABAJO A TÉRMINO INDEFINIDO
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Regido por el Código Sustantivo del Trabajo (Ley 50 de 1990)
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-900 mt-1">
                    RADICADO: {selectedDoc.radicado}
                  </p>
                </div>

                <div className="border border-slate-300 rounded-lg p-4 space-y-2 text-xs bg-slate-50">
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong className="text-slate-900">EMPLEADOR:</strong> NEUROLABS TECH SOLUTIONS S.A.S. (NIT 901.847.291-4)</p>
                    <p><strong className="text-slate-900">REPRESENTANTE:</strong> Jesús David Cantillo Parejo (C.C. 1.080.022.532)</p>
                    <p><strong className="text-slate-900">TRABAJADOR(A):</strong> {selectedDoc.contractData.employeeName}</p>
                    <p><strong className="text-slate-900">IDENTIFICACIÓN:</strong> {selectedDoc.contractData.identification}</p>
                    <p><strong className="text-slate-900">CARGO:</strong> {selectedDoc.contractData.position}</p>
                    <p><strong className="text-slate-900">SALARIO BÁSICO:</strong> ${selectedDoc.contractData.salaryCOP} COP</p>
                    <p><strong className="text-slate-900">FECHA DE INICIO:</strong> {selectedDoc.contractData.startDate}</p>
                    <p><strong className="text-slate-900">CIUDAD DE EJECUCIÓN:</strong> {selectedDoc.contractData.city}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-800 space-y-3 text-justify leading-relaxed">
                  <p>
                    <strong>CLÁUSULA PRIMERA — OBJETO:</strong> El EMPLEADOR contrata los servicios personales del TRABAJADOR para desempeñar las funciones propias del cargo indicado, así como aquellas conexas y complementarias inherentes a la actividad tecnológica de NeuroLabs S.A.S.
                  </p>
                  <p>
                    <strong>CLÁUSULA SEGUNDA — PROPIEDAD INTELECTUAL:</strong> De conformidad con el artículo 28 de la Ley 1450 de 2011, todos los derechos patrimoniales sobre el software, modelos de IA, código fuente, algoritmos y documentación desarrollados por el TRABAJADOR en ejercicio de sus funciones se presumen transferidos de manera total y exclusiva al EMPLEADOR.
                  </p>
                  <p>
                    <strong>CLÁUSULA TERCERA — CONFIDENCIALIDAD:</strong> El TRABAJADOR se compromete a guardar estricta reserva y secreto profesional sobre las metodologías, bases de datos de clientes y propiedad industrial de NeuroLabs S.A.S.
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="border-b border-slate-900 pb-1 mb-1 font-bold">
                      Jesús David Cantillo Parejo
                    </div>
                    <p className="font-semibold text-slate-900">EL EMPLEADOR (Representante Legal)</p>
                    <p className="text-[10px] text-slate-500">NeuroLabs Tech Solutions S.A.S.</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-900 pb-1 mb-1 font-bold">
                      {selectedDoc.contractData.employeeName}
                    </div>
                    <p className="font-semibold text-slate-900">EL TRABAJADOR</p>
                    <p className="text-[10px] text-slate-500">{selectedDoc.contractData.identification}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* CASO D: Vista Notarial Genérica de Documento */
              <div
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-2xl text-slate-900 space-y-6"
              >
                <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {selectedDoc.serie_id.replace(/_/g, ' ')}
                  </span>
                  <h2 className="text-lg font-bold uppercase text-slate-950">
                    {selectedDoc.title}
                  </h2>
                  <p className="font-mono text-xs font-bold text-slate-600">
                    {selectedDoc.radicado}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <p className="font-bold text-slate-800">Descripción Notarial & Alcance:</p>
                  <p className="text-slate-600 leading-relaxed">{selectedDoc.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[11px] font-bold">Titular / Entidad</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedDoc.holder_name}</p>
                    {selectedDoc.holder_id && <p className="text-[10px] text-slate-500">{selectedDoc.holder_id}</p>}
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[11px] font-bold">Área Custodia</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedDoc.department}</p>
                    <p className="text-[10px] text-slate-500">{selectedDoc.signed_by}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono space-y-1">
                  <p className="font-bold text-slate-700">Integridad Probatoria SHA-256:</p>
                  <p className="text-slate-900 break-all select-all">{selectedDoc.sha256_hash}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
