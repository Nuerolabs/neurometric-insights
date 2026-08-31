-- ══════════════════════════════════════════════════════════════════════════
-- NEUROLABS TECH SOLUTIONS S.A.S. - NIT 901.882.253-1
-- Sitionuevo, Magdalena, Colombia
-- ESTRUCTURA LIMPIA DE BASE DE DATOS SUPABASE / POSTGRESQL (SIN DATOS SIMULADOS)
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
    implementation_fee NUMERIC(15,2) DEFAULT 0.00,
    monthly_fee NUMERIC(15,2) DEFAULT 0.00,
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
    notes TEXT, -- Guarda JSON con: voucher_url, payment_ref, rete_fuente, rete_ica
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
    responsible VARCHAR(255) NOT NULL,
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
    accumulated_months INT DEFAULT 0,
    accumulated_depreciation NUMERIC(15,2) NOT NULL DEFAULT 0,
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
        EXECUTE format('DROP POLICY IF EXISTS "Permitir_Todo_ERP_%s" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Permitir_Todo_ERP_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    END LOOP;
END $$;
