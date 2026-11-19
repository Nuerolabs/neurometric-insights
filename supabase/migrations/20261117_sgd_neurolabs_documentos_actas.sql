-- ==============================================================================
-- MIGRACIÓN SUPABASE: SISTEMA DE GESTIÓN DOCUMENTAL (SGD / ECM) & ACTAS CORPORATIVAS
-- NeuroLabs Tech Solutions S.A.S. — NIT: 901.847.291 - 4
-- Cumplimiento: Ley 594 de 2000 (AGN), Ley 527 de 1999 (Comercio Electrónico y Firmas)
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA DE SERIES DOCUMENTALES (TRD - TABLAS DE RETENCIÓN DOCUMENTAL)
CREATE TABLE IF NOT EXISTS public.document_series (
    id VARCHAR(50) PRIMARY KEY, -- ej: 100_GOBIERNO, 300_RRHH_LABORAL, 600_MARKETING_COMUNICACIONES
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    retention_years INT NOT NULL DEFAULT 10,
    disposition VARCHAR(50) NOT NULL DEFAULT 'CONSERVACION_TOTAL', -- CONSERVACION_TOTAL, ELIMINACION, MICROFILMACION_DIGITAL
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserción de Series TRD Institucionales de NeuroLabs (Multiuso: Socios, Legal, RRHH, Finanzas, Tech, Marketing, Operaciones)
INSERT INTO public.document_series (id, code, name, description, retention_years, disposition) VALUES
('100_GOBIERNO', '100', '100 - Gobierno Corporativo & Socios', 'Actas de asamblea, juntas directivas, estatutos corporativos y decisiones de socios.', 20, 'CONSERVACION_TOTAL'),
('200_LEGAL_TRIBUTARIO', '200', '200 - Gestión Jurídica, DIAN & RUT', 'Registro Único Tributario (RUT), Cámara de Comercio, poderes y licencias.', 10, 'CONSERVACION_TOTAL'),
('300_RRHH_LABORAL', '300', '300 - Talento Humano & Certificaciones', 'Certificados laborales, contratos de trabajo (CST), hojas de vida, RIT y afiliaciones.', 10, 'CONSERVACION_TOTAL'),
('400_CONTABLE_PILA', '400', '400 - Contabilidad, Facturas & PILA', 'Soportes de pago de parafiscales, comprobantes de egreso, facturas y libros de diario.', 10, 'CONSERVACION_TOTAL'),
('500_TECH_PROPIEDAD_INT', '500', '500 - Tecnología & Propiedad Intelectual', 'Acuerdos de confidencialidad (NDA), cesión de derechos de código, arquitectura de IA y registros DNDA.', 15, 'CONSERVACION_TOTAL'),
('600_MARKETING_COMUNICACIONES', '600', '600 - Marketing, Comunicaciones & Diseños', 'Matrices de responsabilidades de mercadeo, piezas publicitarias, manuales de marca y campañas.', 5, 'CONSERVACION_TOTAL'),
('700_OPERACIONES_ACTAS', '700', '700 - Operaciones, Proyectos & Comités', 'Actas de seguimiento de proyectos, minutas de comités operativos y matrices de compromisos.', 5, 'CONSERVACION_TOTAL')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    retention_years = EXCLUDED.retention_years;

-- 3. SECUENCIA Y FUNCIÓN PARA GENERACIÓN DE RADICADOS OFICIALES
CREATE SEQUENCE IF NOT EXISTS public.radicado_seq START WITH 100;

CREATE OR REPLACE FUNCTION public.generate_document_radicado(serie_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    current_year VARCHAR(4);
    seq_val INT;
    new_radicado VARCHAR(50);
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_val := NEXTVAL('public.radicado_seq');
    new_radicado := 'SGD-' || current_year || '-' || UPPER(SUBSTRING(serie_code, 1, 3)) || '-' || LPAD(seq_val::TEXT, 4, '0');
    RETURN new_radicado;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLA PRINCIPAL DE EXPEDIENTES / DOCUMENTOS (ENTERPRISE DOCUMENTS)
CREATE TABLE IF NOT EXISTS public.enterprise_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radicado VARCHAR(50) UNIQUE NOT NULL,
    serie_id VARCHAR(50) NOT NULL REFERENCES public.document_series(id) ON UPDATE CASCADE,
    title VARCHAR(255) NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    holder_id VARCHAR(50),
    department VARCHAR(100) NOT NULL DEFAULT 'Dirección General',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    confidentiality VARCHAR(30) NOT NULL DEFAULT 'CONFIDENCIAL' CHECK (confidentiality IN ('PUBLICO', 'USO_INTERNO', 'CONFIDENCIAL', 'ESTRATEGICO_SOCIOS')),
    status VARCHAR(30) NOT NULL DEFAULT 'VIGENTE' CHECK (status IN ('VIGENTE', 'POR_RENOVAR', 'CUSTODIADO', 'EN_REVISION', 'ANULADO')),
    file_type VARCHAR(20) NOT NULL DEFAULT 'PDF' CHECK (file_type IN ('PDF', 'PNG', 'JPG', 'WEBP', 'DOCX', 'XLSX', 'SVG')),
    file_size VARCHAR(20) DEFAULT '1.0 MB',
    file_url TEXT,
    sha256_hash VARCHAR(128) NOT NULL,
    signed_by VARCHAR(255) NOT NULL DEFAULT 'Jesús David Cantillo Parejo (Representante Legal)',
    retention_years INT NOT NULL DEFAULT 10,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_docs_radicado ON public.enterprise_documents(radicado);
CREATE INDEX IF NOT EXISTS idx_docs_serie ON public.enterprise_documents(serie_id);
CREATE INDEX IF NOT EXISTS idx_docs_holder ON public.enterprise_documents(holder_name);
CREATE INDEX IF NOT EXISTS idx_docs_department ON public.enterprise_documents(department);
CREATE INDEX IF NOT EXISTS idx_docs_sha256 ON public.enterprise_documents(sha256_hash);

-- 5. TABLA DE ACTAS DE REUNIÓN Y COMITÉS (MEETING MINUTES)
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acta_number VARCHAR(50) UNIQUE NOT NULL, -- ej: ACT-2026-004
    document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    meeting_type VARCHAR(50) NOT NULL DEFAULT 'ASAMBLEA_SOCIOS' 
        CHECK (meeting_type IN ('ASAMBLEA_SOCIOS', 'JUNTA_DIRECTIVA', 'COMITE_MARKETING', 'COMITE_OPERATIVO', 'SEGUIMIENTO_PROYECTOS')),
    department VARCHAR(100) NOT NULL DEFAULT 'Gobierno Corporativo',
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME DEFAULT '10:00:00',
    end_time TIME DEFAULT '12:00:00',
    location VARCHAR(150) DEFAULT 'Sede NeuroLabs / Sala Virtual Meet',
    president_name VARCHAR(150) NOT NULL DEFAULT 'Jesús David Cantillo Parejo',
    secretary_name VARCHAR(150) NOT NULL DEFAULT 'Juceth Parejo Cantillo',
    attendees JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de { name, role, email, department, attended: bool }
    agenda TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    deliberation TEXT NOT NULL, -- Desarrollo detallado de los puntos
    decisions TEXT NOT NULL,    -- Conclusiones y acuerdos formales
    file_url TEXT,
    sha256_hash VARCHAR(128),
    status VARCHAR(30) NOT NULL DEFAULT 'APROBADA' CHECK (status IN ('BORRADOR', 'EN_REVISION', 'APROBADA', 'FIRMADA')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_acta ON public.meeting_minutes(acta_number);
CREATE INDEX IF NOT EXISTS idx_meeting_date ON public.meeting_minutes(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_type ON public.meeting_minutes(meeting_type);

-- 6. TABLA DE COMPROMISOS Y RESPONSABILIDADES DERIVADAS DE ACTAS
CREATE TABLE IF NOT EXISTS public.meeting_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acta_id UUID NOT NULL REFERENCES public.meeting_minutes(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    assigned_to VARCHAR(150) NOT NULL, -- Nombre de la persona o cargo
    department VARCHAR(100) NOT NULL,  -- ej: Marketing, Tecnología, Operaciones, Legal
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'BLOQUEADO')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitments_acta ON public.meeting_commitments(acta_id);
CREATE INDEX IF NOT EXISTS idx_commitments_assigned ON public.meeting_commitments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_commitments_dept ON public.meeting_commitments(department);

-- 7. CONFIGURACIÓN DEL STORAGE BUCKET PARA DOCUMENTOS EN SUPABASE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'corporate-documents',
    'corporate-documents',
    true,
    52428800, -- 50 MB límite por archivo
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas públicas de lectura para documentos custodiados con hash
CREATE POLICY "Permitir lectura publica de documentos" ON storage.objects
FOR SELECT USING (bucket_id = 'corporate-documents');

CREATE POLICY "Permitir subida autenticada o anon de documentos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'corporate-documents');

-- 8. POLÍTICAS RLS EN LAS TABLAS DEL SGD
ALTER TABLE public.document_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura libre series TRD" ON public.document_series FOR SELECT USING (true);
CREATE POLICY "Lectura libre documentos corporativos" ON public.enterprise_documents FOR SELECT USING (true);
CREATE POLICY "Insertar documentos corporativos" ON public.enterprise_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar documentos corporativos" ON public.enterprise_documents FOR UPDATE USING (true);

CREATE POLICY "Lectura libre actas de reunion" ON public.meeting_minutes FOR SELECT USING (true);
CREATE POLICY "Insertar actas de reunion" ON public.meeting_minutes FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar actas de reunion" ON public.meeting_minutes FOR UPDATE USING (true);

CREATE POLICY "Lectura libre compromisos de actas" ON public.meeting_commitments FOR SELECT USING (true);
CREATE POLICY "Insertar compromisos de actas" ON public.meeting_commitments FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar compromisos de actas" ON public.meeting_commitments FOR UPDATE USING (true);

-- 9. DATOS SEMILLA INICIALES (EXPEDIENTES REALES NEUROLABS S.A.S. - TODAS LAS ÁREAS)
INSERT INTO public.enterprise_documents (
    radicado, serie_id, title, holder_name, holder_id, department, issue_date, confidentiality, status, file_type, file_size, sha256_hash, signed_by, retention_years, description, metadata
) VALUES
-- RRHH
(
    'SGD-2026-CL-089',
    '300_RRHH_LABORAL',
    'Certificado Laboral Institucional - Lead AI Architect & CEO',
    'Jesús David Cantillo Parejo',
    'CC 1.080.022.532',
    'Talento Humano',
    '2026-11-16',
    'CONFIDENCIAL',
    'VIGENTE',
    'PDF',
    '410 KB',
    'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    'Jesús David Cantillo Parejo (Representante Legal)',
    10,
    'Certificación oficial de funciones técnicas, contrato a término indefinido y asignación salarial de $4.500.000 COP.',
    '{"employeeName": "Jesús David Cantillo Parejo", "docType": "Cédula de Ciudadanía", "docNumber": "1.080.022.532", "docExpedition": "Sitionuevo (Magdalena)", "position": "Director General & Lead AI Architect", "contractType": "Término Indefinido", "startDate": "01 de Febrero de 2024", "salary": "4.500.000", "salaryText": "CUATRO MILLONES QUINIENTOS MIL", "addressee": "A QUIEN PUEDA INTERESAR"}'::jsonb
),
(
    'SGD-2026-CL-092',
    '300_RRHH_LABORAL',
    'Certificado Laboral Institucional - Directora de Operaciones & RRHH',
    'Juceth Parejo Cantillo',
    'CC 32.871.942',
    'Talento Humano',
    '2026-11-15',
    'CONFIDENCIAL',
    'VIGENTE',
    'PDF',
    '420 KB',
    '9f82d1c4481b369a21b3842f132e4857bca142d7189ef947519385b018471283',
    'Jesús David Cantillo Parejo (Representante Legal)',
    10,
    'Certificación oficial de vinculación laboral como Directora de Operaciones y Talento Humano.',
    '{"employeeName": "Juceth Parejo Cantillo", "docType": "Cédula de Ciudadanía", "docNumber": "32.871.942", "docExpedition": "Barranquilla (Atlántico)", "position": "Directora de Operaciones & Gestión Humana", "contractType": "Término Indefinido", "startDate": "15 de Marzo de 2024", "salary": "3.800.000", "salaryText": "TRES MILLONES OCHOCIENTOS MIL", "addressee": "A QUIEN PUEDA INTERESAR"}'::jsonb
),
(
    'SGD-2026-CON-015',
    '300_RRHH_LABORAL',
    'Contrato Individual de Trabajo a Término Indefinido (CST Art. 47)',
    'María Angélica Domínguez',
    'CC 1.082.938.472',
    'Talento Humano',
    '2025-02-01',
    'CONFIDENCIAL',
    'VIGENTE',
    'PDF',
    '1.9 MB',
    'd41d8cd98f00b204e9800998ecf8427e9821a0033c4fd8920183471928471928',
    'NeuroLabs S.A.S. / María Angélica Domínguez',
    20,
    'Contrato laboral regido por el Código Sustantivo del Trabajo colombiano con cláusulas de cesión patrimonial de software.',
    '{"position": "Senior Frontend Engineer", "salary": "3.500.000"}'::jsonb
),
-- GOBIERNO & ASOCIADOS
(
    'SGD-2026-ACT-001',
    '100_GOBIERNO',
    'Acta N° 001 - Asamblea Constitutiva de NeuroLabs Tech Solutions S.A.S.',
    'Socios Fundadores NeuroLabs S.A.S.',
    'NIT 901.847.291-4',
    'Gobierno Corporativo',
    '2024-01-20',
    'ESTRATEGICO_SOCIOS',
    'CUSTODIADO',
    'PDF',
    '3.4 MB',
    '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    'Jesús David Cantillo Parejo / Socios Fundadores',
    20,
    'Documento constitutivo privado según Ley 1258 de 2008, adopción de estatutos iniciales y designación de administrador único.',
    '{"quorum": "100%"}'::jsonb
),
(
    'SGD-2026-ACT-004',
    '100_GOBIERNO',
    'Acta N° 004 - Asamblea General Extraordinaria de Accionistas',
    'Junta de Accionistas NeuroLabs Tech Solutions',
    'NIT 901.847.291-4',
    'Gobierno Corporativo',
    '2026-01-15',
    'ESTRATEGICO_SOCIOS',
    'CUSTODIADO',
    'PDF',
    '2.4 MB',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Jesús Cantillo (Presidente) / Juceth Parejo (Secretaria)',
    20,
    'Aprobación unánime de estados financieros de apertura, reforma estatutaria e inyección de activos de cómputo GPU.',
    '{"quorum": "100%", "voting": "Unánime"}'::jsonb
),
-- MARKETING
(
    'SGD-2026-MKT-001',
    '600_MARKETING_COMUNICACIONES',
    'Infografía Oficial de Responsabilidades del Área de Marketing & Ventas B2B',
    'Equipo de Marketing & Crecimiento NeuroLabs',
    'DEP-MKT-01',
    'Marketing & Comunicaciones',
    '2026-11-01',
    'PUBLICO',
    'VIGENTE',
    'PNG',
    '1.8 MB',
    '3a7b1c9e8f42a0d5e6f7b8c9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    'Dirección de Marketing & Comunicaciones',
    5,
    'Infografía y manual visual de responsabilidades del área de marketing: generación de demanda B2B, branding corporativo y pauta digital.',
    '{"channel": "B2B / Omnicanal"}'::jsonb
),
-- LEGAL & TRIBUTARIO
(
    'SGD-2026-RUT-001',
    '200_LEGAL_TRIBUTARIO',
    'Registro Único Tributario (RUT) DIAN - NIT 901.847.291-4',
    'NeuroLabs Tech Solutions S.A.S.',
    'NIT 901.847.291-4',
    'Gestión Jurídica',
    '2026-01-10',
    'PUBLICO',
    'VIGENTE',
    'PDF',
    '840 KB',
    '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    'DIAN Sede Electrónica',
    10,
    'RUT formalizado con actividades económicas 6201 (Edición de programas) y 6202 (Consultoría informática).',
    '{}'::jsonb
),
(
    'SGD-2026-PIL-104',
    '400_CONTABLE_PILA',
    'Comprobante de Planilla Integrada PILA (Octubre 2026)',
    'Aportes en Línea / EPS Sura / ARL Positiva',
    'NIT 800.197.268',
    'Contabilidad & Finanzas',
    '2026-11-05',
    'CONFIDENCIAL',
    'VIGENTE',
    'PDF',
    '950 KB',
    '9e107d9d372bb6826bd81d3542a419d67184a123bfde78219485710293847561',
    'Operador PILA Aportes en Línea',
    10,
    'Soporte bancario oficial de pago de aportes a salud, pensión, riesgos laborales y parafiscales.',
    '{"period": "2026-10"}'::jsonb
),
-- TECNOLOGÍA
(
    'SGD-2026-NDA-021',
    '500_TECH_PROPIEDAD_INT',
    'Acuerdo Bilateral de Confidencialidad y Custodia de Algoritmos (NDA Mutuo)',
    'CerebroQuant Enterprise Partners & NeuroLabs S.A.S.',
    'DEP-TECH-01',
    'Tecnología & IA',
    '2026-03-12',
    'ESTRATEGICO_SOCIOS',
    'CUSTODIADO',
    'PDF',
    '1.2 MB',
    'c4ca4238a0b923820dcc509a6f75849b284759321eab92837461928374619283',
    'Jesús Cantillo (CEO NeuroLabs) / Socio Estratégico',
    15,
    'Blindaje jurídico sobre modelos predictivos de scoring de crédito, arquitectura de agentes e inmutabilidad de datos.',
    '{}'::jsonb
)
ON CONFLICT (radicado) DO UPDATE SET
    title = EXCLUDED.title,
    confidentiality = EXCLUDED.confidentiality,
    description = EXCLUDED.description;

-- 10. INSERCIÓN DE ACTA DE REUNIÓN SEMILLA CON COMPROMISOS
DO $$
DECLARE
    v_acta_id UUID;
    v_doc_id UUID;
BEGIN
    SELECT id INTO v_doc_id FROM public.enterprise_documents WHERE radicado = 'SGD-2026-ACT-004' LIMIT 1;

    INSERT INTO public.meeting_minutes (
        acta_number, document_id, title, meeting_type, department, meeting_date, start_time, end_time, location, president_name, secretary_name, attendees, agenda, deliberation, decisions, status
    ) VALUES (
        'ACT-2026-004',
        v_doc_id,
        'Acta N° 004 - Comité Ejecutivo de Dirección & Lanzamiento de Marketing',
        'JUNTA_DIRECTIVA',
        'Dirección General',
        '2026-11-10',
        '09:00:00',
        '11:30:00',
        'Sede Central NeuroLabs / Google Meet',
        'Jesús David Cantillo Parejo',
        'Juceth Parejo Cantillo',
        '[
            {"name": "Jesús David Cantillo Parejo", "role": "Presidente / Lead Architect", "email": "jesus@neurolabs.com.co", "department": "Dirección", "attended": true},
            {"name": "Juceth Parejo Cantillo", "role": "Secretaria General & Operaciones", "email": "operaciones@neurolabs.com.co", "department": "Operaciones", "attended": true},
            {"name": "Líder de Marketing Digital", "role": "Head of Growth & Branding", "email": "marketing@neurolabs.com.co", "department": "Marketing", "attended": true},
            {"name": "Asesor Jurídico Corporativo", "role": "Consultor Legal Externo", "email": "legal@neurolabs.com.co", "department": "Jurídica", "attended": true}
        ]'::jsonb,
        ARRAY[
            '1. Verificación del quórum reglamentario',
            '2. Presentación del plan de responsabilidades del Área de Marketing Q4-2026',
            '3. Aprobación de la política de custodia digital y firmas de actas',
            '4. Asignación de compromisos y plazos de entrega'
        ],
        'Se dio inicio a la sesión verificando quórum del 100%. El área de marketing presentó la matriz de roles y responsabilidades para la prospección de clientes empresariales para la suite ERP y agentes de IA. Se definió la estrategia de contenidos y piezas visuales.',
        'Se aprueba por unanimidad la hoja de ruta de marketing y se ratifica la responsabilidad del equipo de diseño para la publicación de infografías y materiales de ventas antes del 30 de noviembre.',
        'APROBADA'
    )
    ON CONFLICT (acta_number) DO UPDATE SET title = EXCLUDED.title
    RETURNING id INTO v_acta_id;

    IF v_acta_id IS NOT NULL THEN
        DELETE FROM public.meeting_commitments WHERE acta_id = v_acta_id;
        INSERT INTO public.meeting_commitments (acta_id, task_description, assigned_to, department, due_date, status, notes)
        VALUES
        (v_acta_id, 'Publicar infografía oficial de responsabilidades de marketing y manual de identidad visual B2B', 'Líder de Marketing Digital', 'Marketing & Comunicaciones', '2026-11-25', 'EN_PROGRESO', 'Incluye lineamientos de piezas para LinkedIn y sitio web.'),
        (v_acta_id, 'Finalizar integración del pre-validador DIAN Formato 1001 en el ERP Contable', 'Jesús David Cantillo Parejo', 'Tecnología & IA', '2026-11-20', 'COMPLETADO', 'Módulo probado y compatible con especificación DIAN.'),
        (v_acta_id, 'Radicar actas físicas firmadas en el libro oficial de la Cámara de Comercio de Barranquilla', 'Juceth Parejo Cantillo', 'Operaciones & Jurídica', '2026-12-05', 'PENDIENTE', 'Pendiente de turno de registro notarial.');
    END IF;
END $$;
