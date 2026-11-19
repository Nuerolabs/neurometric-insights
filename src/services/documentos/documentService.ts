import { supabase } from '@/lib/supabase';

// ── ROLES DE SEGURIDAD Y PERFILES POR ÁREA ADMINISTRATIVA ──
export type SecurityRole =
  | 'DIRECCION_GENERAL'
  | 'TALENTO_HUMANO'
  | 'ADMINISTRATIVO_OPERACIONES'
  | 'CONTABILIDAD_FINANZAS'
  | 'MARKETING_DISENOS'
  | 'COLABORADOR_GENERAL';

export interface RoleDefinition {
  id: SecurityRole;
  name: string;
  department: string;
  badgeLabel: string;
  clearanceLevel: number; // 4: Acceso Total, 3: Área/Confidencial, 2: Operativo, 1: Público/Consulta
  description: string;
  allowedSeries: string[]; // códigos de serie TRD permitidos o ['*']
  canUpload: boolean;
  canIssueCertificates: boolean;
  canManageActas: boolean;
}

export const SECURITY_ROLES: Record<SecurityRole, RoleDefinition> = {
  DIRECCION_GENERAL: {
    id: 'DIRECCION_GENERAL',
    name: 'Dirección General & Junta de Socios',
    department: 'Dirección General',
    badgeLabel: 'Nivel 1 - Acceso Total (Master)',
    clearanceLevel: 4,
    description: 'Acceso irrestricto a todos los expedientes, actas de socios, estatutos, finanzas y auditoría global.',
    allowedSeries: ['*'],
    canUpload: true,
    canIssueCertificates: true,
    canManageActas: true,
  },
  TALENTO_HUMANO: {
    id: 'TALENTO_HUMANO',
    name: 'Gestión Humana & Recursos Humanos (RRHH)',
    department: 'Talento Humano',
    badgeLabel: 'Nivel 2 - Recursos Humanos',
    clearanceLevel: 3,
    description: 'Gestión integral de contratos laborales, certificaciones, nómina, afiliaciones ARL/EPS y manual de funciones.',
    allowedSeries: ['300_RRHH_LABORAL', '700_OPERACIONES_ACTAS', 'PUBLICO'],
    canUpload: true,
    canIssueCertificates: true,
    canManageActas: true,
  },
  ADMINISTRATIVO_OPERACIONES: {
    id: 'ADMINISTRATIVO_OPERACIONES',
    name: 'Administración & Operaciones Corporativas',
    department: 'Operaciones & Jurídica',
    badgeLabel: 'Nivel 2 - Administrativo',
    clearanceLevel: 3,
    description: 'Custodia de trámites administrativos, actas operativas, entregas de equipos, contratos de proveedores y trámites CCB.',
    allowedSeries: ['100_GOBIERNO', '200_LEGAL_TRIBUTARIO', '700_OPERACIONES_ACTAS', 'PUBLICO'],
    canUpload: true,
    canIssueCertificates: false,
    canManageActas: true,
  },
  CONTABILIDAD_FINANZAS: {
    id: 'CONTABILIDAD_FINANZAS',
    name: 'Contabilidad, Tributario & Finanzas',
    department: 'Contabilidad & Finanzas',
    badgeLabel: 'Nivel 2 - Financiero & DIAN',
    clearanceLevel: 3,
    description: 'Control de soportes contables, RUT, PILA, declaraciones de impuestos, balances certificados y exógena.',
    allowedSeries: ['400_CONTABLE_PILA', '200_LEGAL_TRIBUTARIO', 'PUBLICO'],
    canUpload: true,
    canIssueCertificates: false,
    canManageActas: false,
  },
  MARKETING_DISENOS: {
    id: 'MARKETING_DISENOS',
    name: 'Marketing, Comunicaciones & Diseños',
    department: 'Marketing & Comunicaciones',
    badgeLabel: 'Nivel 3 - Marketing B2B',
    clearanceLevel: 2,
    description: 'Gestión de matrices de responsabilidades, manual de marca, material comercial, infografías y actas de marketing.',
    allowedSeries: ['600_MARKETING_COMUNICACIONES', '700_OPERACIONES_ACTAS', 'PUBLICO'],
    canUpload: true,
    canIssueCertificates: false,
    canManageActas: true,
  },
  COLABORADOR_GENERAL: {
    id: 'COLABORADOR_GENERAL',
    name: 'Colaborador / Consulta Institucional',
    department: 'Toda la Organización',
    badgeLabel: 'Nivel 4 - Consulta General',
    clearanceLevel: 1,
    description: 'Consulta de políticas internas, reglamento laboral, circulares informativas y solicitud de certificación laboral.',
    allowedSeries: ['PUBLICO'],
    canUpload: false,
    canIssueCertificates: false,
    canManageActas: false,
  },
};

export interface DocumentSerie {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
  retention_years: number;
  disposition: string;
}

export interface EnterpriseDocument {
  id: string;
  radicado: string;
  serie_id: string;
  serieName?: string;
  title: string;
  holder_name: string;
  holder_id?: string;
  department: string;
  issue_date: string;
  expiration_date?: string;
  confidentiality: 'PUBLICO' | 'USO_INTERNO' | 'CONFIDENCIAL' | 'ESTRATEGICO_SOCIOS';
  status: 'VIGENTE' | 'POR_RENOVAR' | 'CUSTODIADO' | 'EN_REVISION' | 'ANULADO';
  file_type: 'PDF' | 'PNG' | 'JPG' | 'WEBP' | 'DOCX' | 'XLSX' | 'SVG';
  file_size?: string;
  file_url?: string;
  sha256_hash: string;
  signed_by: string;
  retention_years: number;
  description?: string;
  metadata?: Record<string, any>;
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
  contractData?: {
    employeeName: string;
    identification: string;
    address: string;
    position: string;
    salaryCOP: string;
    startDate: string;
    city: string;
    term: string;
  };
}

export interface MeetingCommitment {
  id?: string;
  acta_id?: string;
  task_description: string;
  assigned_to: string;
  department: string;
  due_date?: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'BLOQUEADO';
  notes?: string;
}

export interface MeetingMinute {
  id: string;
  acta_number: string;
  document_id?: string;
  title: string;
  meeting_type: 'ASAMBLEA_SOCIOS' | 'JUNTA_DIRECTIVA' | 'COMITE_MARKETING' | 'COMITE_OPERATIVO' | 'SEGUIMIENTO_PROYECTOS';
  department: string;
  meeting_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  president_name: string;
  secretary_name: string;
  attendees: Array<{
    name: string;
    role: string;
    email?: string;
    department?: string;
    attended: boolean;
  }>;
  agenda: string[];
  deliberation: string;
  decisions: string;
  file_url?: string;
  sha256_hash?: string;
  status: 'BORRADOR' | 'EN_REVISION' | 'APROBADA' | 'FIRMADA';
  commitments?: MeetingCommitment[];
  created_at?: string;
}

// ── VERIFICACIÓN DE ACCESO SEGÚN EL ROL Y EL DOCUMENTO ──
export function checkDocumentAccess(
  role: SecurityRole,
  doc: EnterpriseDocument
): { allowed: boolean; reason?: string } {
  // 1. Si el rol es Dirección General, tiene pase maestro
  if (role === 'DIRECCION_GENERAL') {
    return { allowed: true };
  }

  // 2. Si el documento es de acceso PÚBLICO o USO INTERNO general
  if (doc.confidentiality === 'PUBLICO') {
    return { allowed: true };
  }

  // 3. Documentos ESTRATÉGICOS DE SOCIOS (Solo Dirección General / Socios)
  if (doc.confidentiality === 'ESTRATEGICO_SOCIOS') {
    return {
      allowed: false,
      reason: 'Expediente clasificado de Alta Seguridad (Junta de Socios / Dirección General). Requiere credenciales de Representación Legal.',
    };
  }

  // 4. Si el rol es Colaborador General, solo ve documentos públicos o sus certificados
  if (role === 'COLABORADOR_GENERAL') {
    if (doc.serie_id === '300_RRHH_LABORAL' && doc.certData) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'El perfil de Colaborador General solo tiene autorización para circulares públicas y certificaciones laborales individuales.',
    };
  }

  // 5. Validación por Serie TRD permitida
  const roleDef = SECURITY_ROLES[role];
  const isSerieAllowed =
    roleDef.allowedSeries.includes('*') ||
    roleDef.allowedSeries.includes(doc.serie_id);

  if (isSerieAllowed) {
    return { allowed: true };
  }

  // 6. Validación por Departamento Propietario
  if (doc.department.toLowerCase().includes(roleDef.department.toLowerCase())) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Documento asignado al área de ${doc.department}. El rol activo (${roleDef.name}) no tiene privilegios asignados para este departamento.`,
  };
}

// ── CALCULAR HASH CRIPTOGRÁFICO SHA-256 EN EL NAVEGADOR (WEB CRYPTO API) ──
export async function computeFileSHA256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ── GENERADOR DE HASH ALEATORIO PARA REGISTROS DIGITALES SIN ARCHIVO FÍSICO ──
export function generateRandomSHA256(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── SUBIR ARCHIVO A SUPABASE STORAGE (BUCKET 'corporate-documents') ──
export async function uploadDocumentFile(
  file: File,
  folder: string = 'general'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const cleanFileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { data, error } = await supabase.storage
      .from('corporate-documents')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback a Object URL local para visualización y descarga inmediata
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl, error: null };
    }

    const { data: publicUrlData } = supabase.storage
      .from('corporate-documents')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.warn('Storage upload exception, fallback to local blob:', err);
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, error: null };
  }
}

// ── CATÁLOGO REAL DE EXPEDIENTES CORPORATIVOS NEUROLABS S.A.S. (TODAS LAS ÁREAS) ──
export const FALLBACK_DOCUMENTS: EnterpriseDocument[] = [
  // ── ÁREA: RECURSOS HUMANOS & TALENTO HUMANO ──
  {
    id: 'doc-rrhh-001',
    radicado: 'SGD-2026-CL-089',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Certificado Laboral Institucional - Lead AI Architect & CEO',
    holder_name: 'Jesús David Cantillo Parejo',
    holder_id: 'CC 1.080.022.532',
    department: 'Talento Humano',
    issue_date: '2026-11-16',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '410 KB',
    sha256_hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signed_by: 'Jesús David Cantillo Parejo (Representante Legal)',
    retention_years: 10,
    description: 'Certificación oficial de funciones técnicas y directivas, contrato a término indefinido y asignación salarial de $4.500.000 COP.',
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
    id: 'doc-rrhh-002',
    radicado: 'SGD-2026-CL-092',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Certificado Laboral Institucional - Directora de Operaciones & RRHH',
    holder_name: 'Juceth Parejo Cantillo',
    holder_id: 'CC 32.871.942',
    department: 'Talento Humano',
    issue_date: '2026-11-15',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '420 KB',
    sha256_hash: '9f82d1c4481b369a21b3842f132e4857bca142d7189ef947519385b018471283',
    signed_by: 'Jesús David Cantillo Parejo (Representante Legal)',
    retention_years: 10,
    description: 'Certificación oficial de vinculación laboral como Directora de Operaciones, Talento Humano y Gestión Administrativa.',
    certData: {
      employeeName: 'Juceth Parejo Cantillo',
      docType: 'Cédula de Ciudadanía',
      docNumber: '32.871.942',
      docExpedition: 'Barranquilla (Atlántico)',
      position: 'Directora de Operaciones & Gestión Humana',
      contractType: 'Término Indefinido',
      startDate: '15 de Marzo de 2024',
      salary: '3.800.000',
      salaryText: 'TRES MILLONES OCHOCIENTOS MIL',
      addressee: 'A QUIEN PUEDA INTERESAR',
    },
  },
  {
    id: 'doc-rrhh-003',
    radicado: 'SGD-2026-CON-015',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Contrato Individual de Trabajo a Término Indefinido (CST Art. 47)',
    holder_name: 'María Angélica Domínguez',
    holder_id: 'CC 1.082.938.472',
    department: 'Talento Humano',
    issue_date: '2025-02-01',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '1.9 MB',
    sha256_hash: 'd41d8cd98f00b204e9800998ecf8427e9821a0033c4fd8920183471928471928',
    signed_by: 'NeuroLabs S.A.S. / María Angélica Domínguez',
    retention_years: 20,
    description: 'Contrato laboral regido por el Código Sustantivo del Trabajo colombiano con cláusulas de cesión patrimonial de software y no divulgación.',
    contractData: {
      employeeName: 'María Angélica Domínguez',
      identification: 'CC 1.082.938.472 de Barranquilla',
      address: 'Cra 53 # 82-120, Barranquilla',
      position: 'Senior Frontend & UX Software Engineer',
      salaryCOP: '3.500.000',
      startDate: '01 de Febrero de 2025',
      city: 'Barranquilla',
      term: 'Indefinido',
    },
  },
  {
    id: 'doc-rrhh-004',
    radicado: 'SGD-2026-MAN-002',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Manual Específico de Funciones y Competencias Laborales NeuroLabs',
    holder_name: 'Equipo General de NeuroLabs S.A.S.',
    department: 'Talento Humano',
    issue_date: '2026-01-15',
    confidentiality: 'USO_INTERNO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '2.8 MB',
    sha256_hash: '8b1a9953c4611296a827abf8c47804d7c8845e2a6d4829103847192837461928',
    signed_by: 'Comité de Dirección y Gestión Humana',
    retention_years: 10,
    description: 'Catálogo de descriptores de cargo: Lead AI Architect, Fullstack Developer, Growth Lead, Consultor Contable y soporte técnico.',
  },
  {
    id: 'doc-rrhh-005',
    radicado: 'SGD-2026-RIT-001',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Reglamento Interno de Trabajo (RIT) Homologado ante MinTrabajo',
    holder_name: 'Personal Planta & Remoto NeuroLabs S.A.S.',
    department: 'Talento Humano',
    issue_date: '2026-02-10',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '3.1 MB',
    sha256_hash: '7c8b2d1e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    signed_by: 'Gerencia General & Comité Paritario',
    retention_years: 20,
    description: 'Marco normativo laboral interno, horarios de trabajo flexible, política de teletrabajo y Comité de Convivencia Laboral.',
  },
  {
    id: 'doc-rrhh-006',
    radicado: 'SGD-2026-ARL-044',
    serie_id: '300_RRHH_LABORAL',
    serieName: '300 - Talento Humano & Certificaciones',
    title: 'Afiliación Institucional ARL Positiva Compañía de Seguros (Riesgo I)',
    holder_name: 'Planta de Personal NeuroLabs Tech Solutions',
    department: 'Talento Humano',
    issue_date: '2026-02-01',
    confidentiality: 'USO_INTERNO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '780 KB',
    sha256_hash: '5d41402abc4b2a76b9719d911017c5925e01f28b492b18471928471928374619',
    signed_by: 'Positiva Compañía de Seguros S.A.',
    retention_years: 10,
    description: 'Póliza colectiva de riesgos laborales para desarrollo de software y consultoría informática (Clase de Riesgo I).',
  },

  // ── ÁREA: GOBIERNO CORPORATIVO, ADMINISTRATIVO & ASOCIADOS ──
  {
    id: 'doc-adm-001',
    radicado: 'SGD-2026-ACT-001',
    serie_id: '100_GOBIERNO',
    serieName: '100 - Gobierno Corporativo & Socios',
    title: 'Acta N° 001 - Asamblea Constitutiva de NeuroLabs Tech Solutions S.A.S.',
    holder_name: 'Socios Fundadores NeuroLabs S.A.S.',
    holder_id: 'NIT 901.847.291-4',
    department: 'Gobierno Corporativo',
    issue_date: '2024-01-20',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    file_type: 'PDF',
    file_size: '3.4 MB',
    sha256_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    signed_by: 'Jesús David Cantillo Parejo / Socios Fundadores',
    retention_years: 20,
    description: 'Documento constitutivo privado según Ley 1258 de 2008, adopción de estatutos iniciales y designación de administrador único.',
  },
  {
    id: 'doc-adm-002',
    radicado: 'SGD-2026-ACT-004',
    serie_id: '100_GOBIERNO',
    serieName: '100 - Gobierno Corporativo & Socios',
    title: 'Acta N° 004 - Asamblea Extraordinaria de Accionistas (Balances & GPU)',
    holder_name: 'Junta de Accionistas NeuroLabs Tech Solutions',
    holder_id: 'NIT 901.847.291-4',
    department: 'Gobierno Corporativo',
    issue_date: '2026-01-15',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    file_type: 'PDF',
    file_size: '2.4 MB',
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signed_by: 'Jesús Cantillo (Presidente) / Juceth Parejo (Secretaria)',
    retention_years: 20,
    description: 'Aprobación unánime de balances de apertura, ratificación de estatutos corporativos e inyección de activos de cómputo GPU.',
  },
  {
    id: 'doc-adm-003',
    radicado: 'SGD-2026-EST-001',
    serie_id: '100_GOBIERNO',
    serieName: '100 - Gobierno Corporativo & Socios',
    title: 'Estatutos Sociales de NeuroLabs Tech Solutions S.A.S. (18 Capítulos)',
    holder_name: 'NeuroLabs Tech Solutions S.A.S.',
    department: 'Gobierno Corporativo',
    issue_date: '2024-01-22',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    file_type: 'PDF',
    file_size: '4.2 MB',
    sha256_hash: '3f4e5d6c7b8a901234567890abcdef1234567890abcdef1234567890abcdef12',
    signed_by: 'Cámara de Comercio de Barranquilla / Notaría',
    retention_years: 20,
    description: 'Estatutos con objeto social amplio en desarrollo de inteligencia artificial, procesamiento analítico, fintech y gobernanza.',
  },
  {
    id: 'doc-adm-004',
    radicado: 'SGD-2026-POD-003',
    serie_id: '100_GOBIERNO',
    serieName: '100 - Gobierno Corporativo & Socios',
    title: 'Poder Especial Notarial de Representación Administrativa y Bancaria',
    holder_name: 'Jesús David Cantillo Parejo',
    holder_id: 'CC 1.080.022.532',
    department: 'Operaciones & Jurídica',
    issue_date: '2026-02-14',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '980 KB',
    sha256_hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    signed_by: 'Notaría Primera del Círculo de Barranquilla',
    retention_years: 10,
    description: 'Facultades amplias para suscribir contratos mercantiles, convenios bancarios y licitaciones gubernamentales.',
  },
  {
    id: 'doc-adm-005',
    radicado: 'SGD-2026-ENT-028',
    serie_id: '700_OPERACIONES_ACTAS',
    serieName: '700 - Operaciones, Proyectos & Comités',
    title: 'Acta de Asignación y Entrega de Equipos de Cómputo (MacBook Pro & GPU)',
    holder_name: 'Área de Ingeniería y Desarrollo de IA',
    department: 'Operaciones & Jurídica',
    issue_date: '2026-03-01',
    confidentiality: 'USO_INTERNO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '1.1 MB',
    sha256_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    signed_by: 'Coordinación de Operaciones / Personal Técnico Asignado',
    retention_years: 5,
    description: 'Inventario físico y seriales de workstations portátiles de alto rendimiento para entrenamiento de modelos de machine learning.',
  },
  {
    id: 'doc-adm-006',
    radicado: 'SGD-2026-HAB-001',
    serie_id: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
    title: 'Política Institucional de Protección de Datos Personales (Ley 1581 / RNBD)',
    holder_name: 'Clientes, Usuarios & Colaboradores NeuroLabs',
    department: 'Operaciones & Jurídica',
    issue_date: '2026-01-10',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '1.4 MB',
    sha256_hash: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    signed_by: 'Oficial de Cumplimiento de Datos Personales',
    retention_years: 10,
    description: 'Manual de procedimientos de Habeas Data registrado ante la Superintendencia de Industria y Comercio (SIC).',
  },

  // ── ÁREA: CONTABILIDAD, TRIBUTARIO & FINANCIERO ──
  {
    id: 'doc-cont-001',
    radicado: 'SGD-2026-RUT-001',
    serie_id: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
    title: 'Registro Único Tributario (RUT) DIAN - NIT 901.847.291-4',
    holder_name: 'NeuroLabs Tech Solutions S.A.S.',
    holder_id: 'NIT 901.847.291-4',
    department: 'Contabilidad & Finanzas',
    issue_date: '2026-01-10',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '840 KB',
    sha256_hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    signed_by: 'DIAN Sede Electrónica',
    retention_years: 10,
    description: 'RUT formalizado con actividades económicas 6201 (Edición de programas) y 6202 (Consultoría informática). Responsable de IVA.',
  },
  {
    id: 'doc-cont-002',
    radicado: 'SGD-2026-CAM-011',
    serie_id: '200_LEGAL_TRIBUTARIO',
    serieName: '200 - Gestión Jurídica, DIAN & RUT',
    title: 'Certificado de Existencia y Representación Legal (Cámara de Comercio)',
    holder_name: 'Cámara de Comercio de Barranquilla',
    issue_date: '2026-11-01',
    expiration_date: '2026-12-01',
    department: 'Contabilidad & Finanzas',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '650 KB',
    sha256_hash: 'b45cffe084dd3d20d928bee85e7b0f2122b51cb93d84a9284719284719283746',
    signed_by: 'Secretaría General CCB',
    retention_years: 5,
    description: 'Certificado mercantil oficial con código de verificación para licitaciones y apertura bancaria. Domicilio principal en Barranquilla.',
  },
  {
    id: 'doc-cont-003',
    radicado: 'SGD-2026-PIL-104',
    serie_id: '400_CONTABLE_PILA',
    serieName: '400 - Contabilidad, Facturas & PILA',
    title: 'Planilla Integrada de Liquidación de Aportes PILA (Octubre 2026)',
    holder_name: 'Aportes en Línea / EPS Sura / ARL Positiva',
    department: 'Contabilidad & Finanzas',
    issue_date: '2026-11-05',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '950 KB',
    sha256_hash: '9e107d9d372bb6826bd81d3542a419d67184a123bfde78219485710293847561',
    signed_by: 'Operador de Información PILA Aportes en Línea',
    retention_years: 10,
    description: 'Comprobante bancario de pago de aportes parafiscales y cotizaciones obligatorias a salud, pensión y riesgos laborales.',
  },
  {
    id: 'doc-cont-004',
    radicado: 'SGD-2026-BAL-003',
    serie_id: '400_CONTABLE_PILA',
    serieName: '400 - Contabilidad, Facturas & PILA',
    title: 'Balance de Situación Financiera & Estado de Resultados Certificado',
    holder_name: 'NeuroLabs Tech Solutions S.A.S.',
    department: 'Contabilidad & Finanzas',
    issue_date: '2026-06-30',
    confidentiality: 'CONFIDENCIAL',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '1.6 MB',
    sha256_hash: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    signed_by: 'Jesús Cantillo (Rep. Legal) / Contador Público (T.P. 184920-T)',
    retention_years: 10,
    description: 'Estados financieros intermedios dictaminados bajo NIIF para Pymes con corte al primer semestre.',
  },

  // ── ÁREA: MARKETING, COMUNICACIONES & DISEÑOS ──
  {
    id: 'doc-mkt-001',
    radicado: 'SGD-2026-MKT-001',
    serie_id: '600_MARKETING_COMUNICACIONES',
    serieName: '600 - Marketing, Comunicaciones & Diseños',
    title: 'Infografía Oficial de Responsabilidades del Área de Marketing & Ventas B2B',
    holder_name: 'Equipo de Marketing & Crecimiento NeuroLabs',
    holder_id: 'DEP-MKT-01',
    department: 'Marketing & Comunicaciones',
    issue_date: '2026-11-01',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PNG',
    file_size: '1.8 MB',
    file_url: '/brand-logo-full.png',
    sha256_hash: '3a7b1c9e8f42a0d5e6f7b8c9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    signed_by: 'Dirección de Marketing & Comunicaciones',
    retention_years: 5,
    description: 'Matriz visual y mapa de responsabilidades: captación de clientes corporativos, inbound marketing, diseño de piezas y pauta digital.',
  },
  {
    id: 'doc-mkt-002',
    radicado: 'SGD-2026-MAN-005',
    serie_id: '600_MARKETING_COMUNICACIONES',
    serieName: '600 - Marketing, Comunicaciones & Diseños',
    title: 'Manual de Identidad Visual Corporativa & Brand Guidelines NeuroLabs',
    holder_name: 'Dirección Creativa NeuroLabs',
    department: 'Marketing & Comunicaciones',
    issue_date: '2026-02-15',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '5.2 MB',
    sha256_hash: '5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    signed_by: 'Líder de Marca & Diseño UI/UX',
    retention_years: 5,
    description: 'Manual de normas gráficas: tipografía institucional Arial, cromática sobria, zonas de protección y aplicaciones digitales.',
  },
  {
    id: 'doc-mkt-003',
    radicado: 'SGD-2026-LOG-001',
    serie_id: '600_MARKETING_COMUNICACIONES',
    serieName: '600 - Marketing, Comunicaciones & Diseños',
    title: 'Kit Maestro de Logotipos Oficiales Vectoriales (PNG / SVG / Fondo Transparente)',
    holder_name: 'Departamento de Marketing & Prensa',
    department: 'Marketing & Comunicaciones',
    issue_date: '2026-01-05',
    confidentiality: 'PUBLICO',
    status: 'VIGENTE',
    file_type: 'PNG',
    file_size: '2.1 MB',
    file_url: '/brand-logo-transparent.png',
    sha256_hash: '6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    signed_by: 'Dirección de Marketing',
    retention_years: 5,
    description: 'Paquete de activos visuales en alta definición para membretes, presentaciones ejecutivas y medios de comunicación.',
  },

  // ── ÁREA: TECNOLOGÍA & PROPIEDAD INTELECTUAL ──
  {
    id: 'doc-tech-001',
    radicado: 'SGD-2026-NDA-021',
    serie_id: '500_TECH_PROPIEDAD_INT',
    serieName: '500 - Tecnología & Propiedad Intelectual',
    title: 'Acuerdo Bilateral de Confidencialidad y Custodia de Algoritmos (NDA Mutuo)',
    holder_name: 'CerebroQuant Enterprise Partners & NeuroLabs S.A.S.',
    department: 'Tecnología & IA',
    issue_date: '2026-03-12',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'CUSTODIADO',
    file_type: 'PDF',
    file_size: '1.2 MB',
    sha256_hash: 'c4ca4238a0b923820dcc509a6f75849b284759321eab92837461928374619283',
    signed_by: 'Jesús Cantillo (CEO NeuroLabs) / Socio Estratégico',
    retention_years: 15,
    description: 'Blindaje jurídico sobre algoritmos de machine learning, pipelines de datos financieros y propiedad exclusiva de código fuente.',
  },
  {
    id: 'doc-tech-002',
    radicado: 'SGD-2026-DND-007',
    serie_id: '500_TECH_PROPIEDAD_INT',
    serieName: '500 - Tecnología & Propiedad Intelectual',
    title: 'Registro de Soporte Lógico de Software ante la DNDA (CerebroQuant ERP)',
    holder_name: 'Dirección Nacional de Derecho de Autor',
    department: 'Tecnología & IA',
    issue_date: '2026-04-18',
    confidentiality: 'ESTRATEGICO_SOCIOS',
    status: 'VIGENTE',
    file_type: 'PDF',
    file_size: '890 KB',
    sha256_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    signed_by: 'Unidad de Registro DNDA Colombia',
    retention_years: 25,
    description: 'Certificado de registro de software informático para la plataforma ERP Contable Inteligente de NeuroLabs.',
  },
];

export const FALLBACK_MEETING_MINUTES: MeetingMinute[] = [
  {
    id: 'act-004',
    acta_number: 'ACT-2026-004',
    title: 'Acta N° 004 - Comité de Dirección & Lanzamiento de Responsabilidades de Marketing',
    meeting_type: 'JUNTA_DIRECTIVA',
    department: 'Dirección General',
    meeting_date: '2026-11-10',
    start_time: '09:00',
    end_time: '11:30',
    location: 'Sede Central NeuroLabs / Google Meet',
    president_name: 'Jesús David Cantillo Parejo',
    secretary_name: 'Juceth Parejo Cantillo',
    attendees: [
      { name: 'Jesús David Cantillo Parejo', role: 'Presidente / Lead Architect', department: 'Dirección', attended: true },
      { name: 'Juceth Parejo Cantillo', role: 'Secretaria General & Operaciones', department: 'Operaciones', attended: true },
      { name: 'Líder de Marketing Digital', role: 'Head of Growth & Branding', department: 'Marketing', attended: true },
      { name: 'Asesor Jurídico Corporativo', role: 'Consultor Legal Externo', department: 'Jurídica', attended: true },
    ],
    agenda: [
      '1. Verificación del quórum reglamentario',
      '2. Presentación del plan de responsabilidades del Área de Marketing Q4-2026',
      '3. Aprobación de la política de custodia digital y firmas de actas',
      '4. Asignación de compromisos y plazos de entrega obligatorios',
    ],
    deliberation:
      'Se inició la sesión con quórum del 100%. El área de marketing expuso la matriz de responsabilidades para adquisición de clientes corporativos, pauta y diseño de piezas institucionales. Se ratificó el uso del logotipo oficial y la sobriedad en la comunicación corporativa.',
    decisions:
      'Se aprueba por unanimidad el plan de trabajo de marketing y se fijan los compromisos con fechas de entrega obligatorias en la matriz de seguimiento.',
    status: 'APROBADA',
    commitments: [
      {
        task_description: 'Publicar infografía oficial de responsabilidades de marketing y manual de marca B2B',
        assigned_to: 'Líder de Marketing Digital',
        department: 'Marketing & Comunicaciones',
        due_date: '2026-11-25',
        status: 'EN_PROGRESO',
        notes: 'Incluye lineamientos de piezas para LinkedIn y sitio web.',
      },
      {
        task_description: 'Finalizar integración del pre-validador DIAN Formato 1001 en el ERP Contable',
        assigned_to: 'Jesús David Cantillo Parejo',
        department: 'Tecnología & IA',
        due_date: '2026-11-20',
        status: 'COMPLETADO',
        notes: 'Módulo probado y compatible con especificación DIAN.',
      },
      {
        task_description: 'Radicar actas físicas firmadas en el libro oficial de la Cámara de Comercio de Barranquilla',
        assigned_to: 'Juceth Parejo Cantillo',
        department: 'Operaciones & Jurídica',
        due_date: '2026-12-05',
        status: 'PENDIENTE',
        notes: 'Pendiente de turno de registro notarial.',
      },
    ],
  },
  {
    id: 'act-003',
    acta_number: 'ACT-2026-003',
    title: 'Acta N° 003 - Comité de Recursos Humanos & Aprobación de Reglamento de Trabajo',
    meeting_type: 'COMITE_OPERATIVO',
    department: 'Talento Humano',
    meeting_date: '2026-10-18',
    start_time: '14:00',
    end_time: '16:00',
    location: 'Sala de Juntas NeuroLabs',
    president_name: 'Jesús David Cantillo Parejo',
    secretary_name: 'Juceth Parejo Cantillo',
    attendees: [
      { name: 'Jesús David Cantillo Parejo', role: 'Gerente General', department: 'Dirección', attended: true },
      { name: 'Juceth Parejo Cantillo', role: 'Directora de RRHH', department: 'Talento Humano', attended: true },
      { name: 'Representante de los Trabajadores', role: 'Delegado de Convivencia', department: 'Desarrollo', attended: true },
    ],
    agenda: [
      '1. Verificación de asistencia',
      '2. Revisión del Reglamento Interno de Trabajo (RIT)',
      '3. Protocolo de emisión de certificaciones laborales automatizadas',
      '4. Plan de bienestar y dotación tecnológica',
    ],
    deliberation:
      'Se evaluaron las cláusulas del nuevo Reglamento Interno de Trabajo para contemplar modalidades híbridas de trabajo y teletrabajo. Se estableció el estándar oficial para certificados laborales en formato formal Arial.',
    decisions:
      'Se adopta el RIT de forma definitiva y se autoriza a la Dirección de Operaciones para su socialización a todo el personal de la empresa.',
    status: 'APROBADA',
    commitments: [
      {
        task_description: 'Publicar el RIT en la intranet corporativa y notificar a los colaboradores',
        assigned_to: 'Juceth Parejo Cantillo',
        department: 'Talento Humano',
        due_date: '2026-10-30',
        status: 'COMPLETADO',
        notes: 'Copia enviada por correo electrónico con acuse de recibo.',
      },
    ],
  },
];

const LOCAL_STORAGE_DOCS_KEY = 'neurolabs_corporate_docs_v3';
const LOCAL_STORAGE_MINUTES_KEY = 'neurolabs_meeting_minutes_v3';

// ── SERVICIO DE ACCESO A BASE DE DATOS Y PERSISTENCIA RESILIENTE ──
export const documentService = {
  // Cargar documentos desde Supabase o almacenamiento local resiliente
  async getDocuments(): Promise<EnterpriseDocument[]> {
    try {
      const { data, error } = await supabase
        .from('enterprise_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          radicado: d.radicado,
          serie_id: d.serie_id,
          serieName: d.serie_id.replace(/_/g, ' '),
          title: d.title,
          holder_name: d.holder_name,
          holder_id: d.holder_id,
          department: d.department || 'Dirección General',
          issue_date: d.issue_date,
          expiration_date: d.expiration_date,
          confidentiality: d.confidentiality,
          status: d.status,
          file_type: d.file_type || 'PDF',
          file_size: d.file_size || '1.0 MB',
          file_url: d.file_url,
          sha256_hash: d.sha256_hash,
          signed_by: d.signed_by,
          retention_years: d.retention_years,
          description: d.description,
          metadata: d.metadata,
          certData: d.metadata?.certData,
          contractData: d.metadata?.contractData,
        }));

        // Combinar con los fallbacks para asegurar que nunca falten los expedientes clave
        const existingRadicados = new Set(mapped.map((m: any) => m.radicado));
        const missingFallbacks = FALLBACK_DOCUMENTS.filter((f) => !existingRadicados.has(f.radicado));
        return [...mapped, ...missingFallbacks];
      }

      // Si Supabase aún no tiene datos o está offline, consultar localStorage
      const local = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingRadicados = new Set(parsed.map((p: any) => p.radicado));
            const missingFallbacks = FALLBACK_DOCUMENTS.filter((f) => !existingRadicados.has(f.radicado));
            return [...parsed, ...missingFallbacks];
          }
        } catch {
          // Si hay error de parseo, usar fallbacks
        }
      }

      return FALLBACK_DOCUMENTS;
    } catch (err) {
      console.warn('Error fetching documents from Supabase, using local fallback:', err);
      return FALLBACK_DOCUMENTS;
    }
  },

  // Guardar nuevo documento en Supabase y persistir localmente
  async createDocument(doc: Omit<EnterpriseDocument, 'id'>): Promise<EnterpriseDocument> {
    const newId = `doc-${Date.now()}`;
    const docWithId: EnterpriseDocument = {
      id: newId,
      ...doc,
    };

    // 1. Guardar en localStorage para disponibilidad instantánea
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify([docWithId, ...list]));
    } catch (e) {
      console.warn('Could not cache document locally:', e);
    }

    // 2. Intentar guardar en Supabase
    try {
      const payload = {
        radicado: doc.radicado,
        serie_id: doc.serie_id,
        title: doc.title,
        holder_name: doc.holder_name,
        holder_id: doc.holder_id,
        department: doc.department || 'Dirección General',
        issue_date: doc.issue_date,
        expiration_date: doc.expiration_date,
        confidentiality: doc.confidentiality,
        status: doc.status,
        file_type: doc.file_type,
        file_size: doc.file_size,
        file_url: doc.file_url,
        sha256_hash: doc.sha256_hash,
        signed_by: doc.signed_by,
        retention_years: doc.retention_years,
        description: doc.description,
        metadata: {
          certData: doc.certData,
          contractData: doc.contractData,
          ...doc.metadata,
        },
      };

      const { data, error } = await supabase
        .from('enterprise_documents')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          ...doc,
        };
      }
    } catch (err) {
      console.warn('Exception creating document in Supabase:', err);
    }

    return docWithId;
  },

  // Cargar actas de reunión con sus compromisos
  async getMeetingMinutes(): Promise<MeetingMinute[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select(`
          *,
          meeting_commitments (*)
        `)
        .order('meeting_date', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((m: any) => ({
          id: m.id,
          acta_number: m.acta_number,
          document_id: m.document_id,
          title: m.title,
          meeting_type: m.meeting_type,
          department: m.department,
          meeting_date: m.meeting_date,
          start_time: m.start_time,
          end_time: m.end_time,
          location: m.location,
          president_name: m.president_name,
          secretary_name: m.secretary_name,
          attendees: m.attendees || [],
          agenda: m.agenda || [],
          deliberation: m.deliberation,
          decisions: m.decisions,
          file_url: m.file_url,
          sha256_hash: m.sha256_hash,
          status: m.status,
          commitments: m.meeting_commitments || [],
          created_at: m.created_at,
        }));

        const existingNumbers = new Set(mapped.map((m: any) => m.acta_number));
        const missingFallbacks = FALLBACK_MEETING_MINUTES.filter((f) => !existingNumbers.has(f.acta_number));
        return [...mapped, ...missingFallbacks];
      }

      const local = localStorage.getItem(LOCAL_STORAGE_MINUTES_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingNumbers = new Set(parsed.map((p: any) => p.acta_number));
            const missingFallbacks = FALLBACK_MEETING_MINUTES.filter((f) => !existingNumbers.has(f.acta_number));
            return [...parsed, ...missingFallbacks];
          }
        } catch {
          // Fallback
        }
      }

      return FALLBACK_MEETING_MINUTES;
    } catch (err) {
      console.warn('Error fetching meeting minutes from Supabase, using fallback:', err);
      return FALLBACK_MEETING_MINUTES;
    }
  },

  // Guardar acta de reunión con compromisos en Supabase y persistir localmente
  async createMeetingMinute(
    acta: Omit<MeetingMinute, 'id'>,
    commitments: MeetingCommitment[] = []
  ): Promise<MeetingMinute> {
    const newId = `act-${Date.now()}`;
    const minuteWithId: MeetingMinute = {
      id: newId,
      ...acta,
      commitments,
    };

    // Guardar en localStorage
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_MINUTES_KEY);
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem(LOCAL_STORAGE_MINUTES_KEY, JSON.stringify([minuteWithId, ...list]));
    } catch (e) {
      console.warn('Could not cache minute locally:', e);
    }

    try {
      const actaPayload = {
        acta_number: acta.acta_number,
        title: acta.title,
        meeting_type: acta.meeting_type,
        department: acta.department || 'Gobierno Corporativo',
        meeting_date: acta.meeting_date,
        start_time: acta.start_time,
        end_time: acta.end_time,
        location: acta.location,
        president_name: acta.president_name,
        secretary_name: acta.secretary_name,
        attendees: acta.attendees,
        agenda: acta.agenda,
        deliberation: acta.deliberation,
        decisions: acta.decisions,
        file_url: acta.file_url,
        sha256_hash: acta.sha256_hash,
        status: acta.status,
      };

      const { data: actaData, error: actaError } = await supabase
        .from('meeting_minutes')
        .insert([actaPayload])
        .select()
        .single();

      if (!actaError && actaData) {
        let savedCommitments: MeetingCommitment[] = [];
        if (commitments.length > 0) {
          const commitmentsPayload = commitments.map((c) => ({
            acta_id: actaData.id,
            task_description: c.task_description,
            assigned_to: c.assigned_to,
            department: c.department,
            due_date: c.due_date,
            status: c.status,
            notes: c.notes,
          }));

          const { data: commData } = await supabase
            .from('meeting_commitments')
            .insert(commitmentsPayload)
            .select();

          savedCommitments = commData || commitments;
        }

        return {
          id: actaData.id,
          ...acta,
          commitments: savedCommitments,
        };
      }
    } catch (err) {
      console.warn('Exception creating meeting minute in Supabase:', err);
    }

    return minuteWithId;
  },
};
