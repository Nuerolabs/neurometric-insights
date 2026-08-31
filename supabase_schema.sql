-- ══════════════════════════════════════════════════════════════════════════
-- NEUROLABS TECH SOLUTIONS S.A.S. - NIT 901.882.253-1
-- Sitionuevo, Magdalena, Colombia
-- ESQUEMA DE BASE DE DATOS SUPABASE / POSTGRESQL PARA ERP CONTABLE NIIF
-- ══════════════════════════════════════════════════════════════════════════

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────
-- 1. CATÁLOGO DE CUENTAS (PUC COLOMBIANO NIIF)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO', 'COSTO'
    level INT NOT NULL DEFAULT 4,
    parent_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 2. ACCIONISTAS Y CAPITAL SOCIAL
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_shareholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    document_id VARCHAR(50) NOT NULL UNIQUE,
    document_type VARCHAR(20) DEFAULT 'CC',
    email VARCHAR(255),
    phone VARCHAR(50),
    shares_count INT NOT NULL DEFAULT 0,
    nominal_share_value NUMERIC(15,2) DEFAULT 1000.00,
    shares_percentage NUMERIC(5,2) DEFAULT 100.00,
    subscribed_capital NUMERIC(15,2) NOT NULL DEFAULT 0,
    paid_capital NUMERIC(15,2) NOT NULL DEFAULT 0,
    cash_paid NUMERIC(15,2) NOT NULL DEFAULT 0,
    species_paid NUMERIC(15,2) NOT NULL DEFAULT 0,
    role VARCHAR(100) DEFAULT 'ACCIONISTA_UNICO',
    is_legal_representative BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_capital_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shareholder_id UUID REFERENCES public.accounting_shareholders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'DINERO_EFECTIVO', 'ESPECIE_ACTIVOS', 'MIXTO'
    amount NUMERIC(15,2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    shares_issued INT NOT NULL DEFAULT 0,
    voucher_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 3. CLIENTES Y CONTRATOS RECURRENTES
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    document_id VARCHAR(50) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    service_description TEXT,
    implementation_fee NUMERIC(15,2) DEFAULT 700000.00,
    monthly_fee NUMERIC(15,2) DEFAULT 600000.00,
    billing_day INT DEFAULT 5,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'CANCELLED'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 4. FACTURACIÓN Y CUENTAS POR COBRAR (CxC)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES public.accounting_clients(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    concept_type VARCHAR(50) NOT NULL, -- 'IMPLEMENTATION', 'RECURRING_MONTHLY', 'CONSULTING', 'OTHER'
    description TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_date DATE,
    total_amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PAID', 'OVERDUE', 'CANCELLED'
    notes TEXT, -- Contiene JSON con meta: voucher_url, payment_ref, rete_fuente, rete_ica
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 5. CUENTAS POR PAGAR A PROVEEDORES (CxP)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(50),
    bill_number VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'INFRAESTRUCTURA', 'SERVICIOS_CLOUD', 'NOMINA', 'HONORARIOS', 'SUMINISTROS', 'OTRO'
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_date DATE,
    total_amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE'
    notes TEXT,
    voucher_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 6. CAJA MENOR Y FONDOS FIJOS
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_petty_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    responsible VARCHAR(255) NOT NULL DEFAULT 'Jesús David Cantillo Parejo',
    voucher_url TEXT,
    status VARCHAR(50) DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING', 'REJECTED'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 7. LIBRO DIARIO Y ASIENTOS CONTABLES (PARTIDA DOBLE)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(100) NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    total_debit NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'POSTED', -- 'DRAFT', 'POSTED', 'VOID'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_transaction_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.accounting_transactions(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    description TEXT,
    debit NUMERIC(15,2) NOT NULL DEFAULT 0,
    credit NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 8. OBLIGACIONES TRIBUTARIAS (DIAN & SITIONUEVO, MAGDALENA)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_tax_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity VARCHAR(50) NOT NULL, -- 'DIAN', 'ALCALDIA_SITIONUEVO', 'CAMARA_COMERCIO'
    form VARCHAR(100) NOT NULL,
    periodicity VARCHAR(50) NOT NULL, -- 'MENSUAL', 'BIMESTRAL', 'ANUAL'
    period_description VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    estimated_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'UPCOMING'
    nit_rule TEXT,
    description TEXT,
    payment_reference VARCHAR(100),
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 9. CONCILIACIÓN BANCARIA (BANCOLOMBIA S.A.)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_bank_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL'
    amount NUMERIC(15,2) NOT NULL,
    is_matched BOOLEAN DEFAULT true,
    matched_concept TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 10. ACTIVOS EN ESPECIE Y DEPRECIACIÓN NIIF
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_fixed_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'EQUIPO_COMPUTO', 'SERVIDORES_IA', 'SOFTWARE_INTANGIBLE'
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    original_cost NUMERIC(15,2) NOT NULL,
    useful_life_months INT NOT NULL DEFAULT 36,
    monthly_depreciation NUMERIC(15,2) NOT NULL,
    accumulated_months INT DEFAULT 1,
    accumulated_depreciation NUMERIC(15,2) NOT NULL,
    book_value NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 11. COLABORADORES Y NÓMINA
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounting_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    document_id VARCHAR(50) NOT NULL UNIQUE,
    position VARCHAR(255) NOT NULL,
    base_salary NUMERIC(15,2) NOT NULL,
    contract_type VARCHAR(50) DEFAULT 'PRESTACION_SERVICIOS',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- 12. PERMISOS ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_capital_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_petty_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_bank_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_employees ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Completo para el ERP
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'accounting_%'
    LOOP
        EXECUTE format('CREATE POLICY "Permitir_Todo_ERP_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    END LOOP;
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 13. DATOS INICIALES REALES DE NEUROLABS TECH SOLUTIONS S.A.S.
-- ──────────────────────────────────────────────────────────────────────────

-- 13.1 Accionista y Capital
INSERT INTO public.accounting_shareholders (
    name, document_id, email, phone, shares_count, nominal_share_value,
    shares_percentage, subscribed_capital, paid_capital, cash_paid, species_paid,
    role, is_legal_representative
) VALUES (
    'Jesús David Cantillo Parejo', '1080822532', 'contabilidad@neurolabs.com.co',
    '+57 300 000 0000', 20097, 1000.00, 100.00,
    20097000.00, 20097000.00, 1215000.00, 18882000.00,
    'ACCIONISTA_UNICO', true
) ON CONFLICT (document_id) DO NOTHING;

-- 13.2 Cliente Real: TRINOVA S.A.S.
INSERT INTO public.accounting_clients (
    name, document_id, contact_person, email, phone,
    service_description, implementation_fee, monthly_fee, billing_day, status
) VALUES (
    'TRINOVA S.A.S.', '902895222-8', 'YURIS JARAMILLO', 'facturacion@trinova.com.co',
    '+57 300 123 4567', 'Implementación de Plataforma IA de Comercio Electrónico y Consultoría Recurrente',
    700000.00, 600000.00, 5, 'ACTIVE'
) ON CONFLICT (document_id) DO NOTHING;

-- 13.3 Facturas Reales de TRINOVA (Cuota 1 Pagada + Cuota 2 Pendiente)
INSERT INTO public.accounting_invoices (
    client_name, invoice_number, concept_type, description,
    issue_date, due_date, payment_date, total_amount, status, notes
) VALUES 
(
    'TRINOVA S.A.S.', 'FAC-2025-001', 'IMPLEMENTATION',
    'Fase 1: Implementación Inicial & Setup (Cuota 1 de 2 - 50%) - TRINOVA S.A.S.',
    '2025-08-25', '2025-08-25', '2025-08-25', 350000.00, 'PAID',
    '{"client_doc":"902895222-8","contact_person":"YURIS JARAMILLO","phase":"CUOTA_1","payment_ref":"TR-BANCOLOMBIA #35019","rete_fuente":14000,"rete_ica":3381}'
),
(
    'TRINOVA S.A.S.', 'FAC-2025-002', 'IMPLEMENTATION',
    'Fase 2: Despliegue Final & Puesta en Marcha (Cuota 2 de 2 - 50%) - TRINOVA S.A.S.',
    '2025-08-30', '2025-09-15', NULL, 350000.00, 'DRAFT',
    '{"client_doc":"902895222-8","contact_person":"YURIS JARAMILLO","phase":"CUOTA_2","rete_fuente":14000,"rete_ica":3381}'
),
(
    'TRINOVA S.A.S.', 'FAC-2025-003', 'RECURRING_MONTHLY',
    'Mensualidad Recurrente de Servicio Tecnológico IA - TRINOVA S.A.S.',
    '2025-09-01', '2025-09-05', NULL, 600000.00, 'DRAFT',
    '{"client_doc":"902895222-8","contact_person":"YURIS JARAMILLO","rete_fuente":24000,"rete_ica":5796}'
)
ON CONFLICT (invoice_number) DO NOTHING;

-- 13.4 Activos en Especie ($18.882.000 COP)
INSERT INTO public.accounting_fixed_assets (
    code, name, category, acquisition_date, original_cost,
    useful_life_months, monthly_depreciation, accumulated_months,
    accumulated_depreciation, book_value, status
) VALUES 
('EQP-SRV-01', 'Servidores de IA, GPUs y Nodos de Cómputo Especializado', 'SERVIDORES_IA', '2025-08-01', 8500000.00, 60, 141667.00, 1, 141667.00, 8358333.00, 'ACTIVE'),
('EQP-DEV-02', 'Estaciones de Trabajo y Laptops de Alta Gama para Desarrollo', 'EQUIPO_COMPUTO', '2025-08-01', 6382000.00, 36, 177278.00, 1, 177278.00, 6204722.00, 'ACTIVE'),
('INT-SFT-03', 'Licencias de Software Propietario, Modelos y Arquitectura ABIA', 'SOFTWARE_INTANGIBLE', '2025-08-01', 4000000.00, 60, 66667.00, 1, 66667.00, 3933333.00, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 13.5 Caja Menor ($50.000 Fondo Inicial)
INSERT INTO public.accounting_petty_cash (
    date, category, description, amount, responsible, status
) VALUES 
('2025-08-15', 'INGRESO DE FONDOS', 'Apertura de Fondo Fijo de Caja Menor NeuroLabs', 50000.00, 'Jesús David Cantillo Parejo', 'APPROVED');

-- 13.6 Movimientos de Conciliación Bancaria Bancolombia
INSERT INTO public.accounting_bank_movements (
    date, description, reference, type, amount, is_matched, matched_concept
) VALUES 
('2025-08-10', 'APORTE CAPITAL SOCIAL EN DINERO - JESUS DAVID CANTILLO', 'DEP-CAP-001', 'DEPOSIT', 1215000.00, true, 'Aporte Capital Social Inicial Bancolombia'),
('2025-08-15', 'FONDEO DE CAJA MENOR NEUROLABS', 'RET-CAJ-001', 'WITHDRAWAL', 50000.00, true, 'Apertura Fondo Fijo de Caja Menor'),
('2025-08-20', 'PAGO INFRAESTRUCTURA CLOUD & SERVIDORES', 'DB-AWS-8921', 'WITHDRAWAL', 350000.00, true, 'CXP-001 Servicios Cloud AWS'),
('2025-08-25', 'TRANSFERENCIA TRINOVA S.A.S. - CUOTA 1 IMPLEMENTACION', 'TR-BANCOLOMBIA #35019', 'DEPOSIT', 350000.00, true, 'FAC-2025-001 (Cliente TRINOVA S.A.S.)');

-- 13.7 Calendario Tributario Sitionuevo & DIAN
INSERT INTO public.accounting_tax_obligations (
    name, entity, form, periodicity, period_description, due_date,
    estimated_amount, status, nit_rule, description
) VALUES 
('Declaración Mensual de Retención en la Fuente', 'DIAN', 'Formulario 350', 'MENSUAL', 'Agosto 2025 (Periodo 08)', '2025-09-12', 140000.00, 'UPCOMING', 'Último dígito NIT: 3', 'Retenciones practicadas por compras y honorarios.'),
('Impuesto de Industria y Comercio (ICA)', 'ALCALDIA_SITIONUEVO', 'Formulario Único ICA Municipal', 'ANUAL', 'Año Gravable 2025', '2026-03-31', 180000.00, 'PENDING', 'Municipio de Sitionuevo, Magdalena', 'Impuesto distrital sobre los ingresos brutos operacionales.'),
('Retención de ICA (ReteICA)', 'ALCALDIA_SITIONUEVO', 'Declaración Bimestral ReteICA', 'BIMESTRAL', 'Bimestre 4 (Julio - Agosto 2025)', '2025-09-20', 35000.00, 'UPCOMING', 'Alcaldía Municipal de Sitionuevo', 'Retenciones de ICA aplicadas en la jurisdicción de Sitionuevo.'),
('Declaración de Renta Personas Jurídicas (S.A.S.)', 'DIAN', 'Formulario 110', 'ANUAL', 'Año Gravable 2025', '2026-04-18', 450000.00, 'PENDING', 'NIT 901.882.253-1 (Dígito 3)', 'Impuesto sobre la renta corporativa (35% tarifa general).'),
('Renovación Matrícula Mercantil S.A.S.', 'CAMARA_COMERCIO', 'RUES', 'ANUAL', 'Ejercicio 2026', '2026-03-31', 195000.00, 'PENDING', 'Cámara de Comercio de Santa Marta para el Magdalena', 'Renovación mercantil legal.');
