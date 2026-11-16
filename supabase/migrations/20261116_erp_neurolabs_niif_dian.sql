-- ============================================================================
-- ERP NEUROLABS: ARQUITECTURA FINANCIERA, CONTABLE (NIIF) Y TRIBUTARIA (DIAN)
-- Script de Migración DDL - PostgreSQL / Supabase
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 0. TABLA DE AUDITORÍA INMUTABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'POST', 'ANNUL', 'REVERSE', 'DELETE_ATTEMPT')),
    user_id UUID,
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 1. MAESTRA CENTRALIZADA DE TERCEROS (third_parties)
-- ============================================================================
CREATE TABLE IF NOT EXISTS third_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(15) NOT NULL CHECK (document_type IN ('NIT', 'CC', 'CE', 'PASAPORTE', 'TI', 'ID_EXTRANJERO')),
    document_number VARCHAR(25) NOT NULL,
    verification_digit SMALLINT CHECK (verification_digit BETWEEN 0 AND 9),
    legal_name VARCHAR(255) NOT NULL, -- Razón social o Nombre completo
    commercial_name VARCHAR(255),
    party_types TEXT[] NOT NULL DEFAULT '{"PROVEEDOR"}', -- CLIENTE, PROVEEDOR, EMPLEADO, SOCIO, ENTIDAD_OFICIAL
    tax_regime VARCHAR(50) NOT NULL DEFAULT 'RESPONSABLE_IVA' CHECK (
        tax_regime IN ('RESPONSABLE_IVA', 'NO_RESPONSABLE_IVA', 'REGIMEN_SIMPLE', 'GRAN_CONTRIBUYENTE', 'AUTORRETENEDOR')
    ),
    fiscal_responsibilities TEXT[] NOT NULL DEFAULT '{"R-99-PN"}', -- Códigos DIAN: O-13, O-15, O-23, O-47, R-99-PN
    municipality_code VARCHAR(10) NOT NULL, -- Código DANE Municipio (ej: '47745' Sitionuevo, '08001' Barranquilla, '11001' Bogotá)
    department_code VARCHAR(5) NOT NULL,
    email_billing VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT NOT NULL,
    bank_account_number VARCHAR(50),
    bank_account_type VARCHAR(20) CHECK (bank_account_type IN ('CORRIENTE', 'AHORROS')),
    bank_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_third_parties_doc UNIQUE (document_type, document_number)
);

CREATE INDEX IF NOT EXISTS idx_third_parties_document ON third_parties(document_number);

-- Función DIAN: Cálculo de Dígito de Verificación (Módulo 11)
CREATE OR REPLACE FUNCTION fn_calculate_dian_dv(p_nit TEXT)
RETURNS SMALLINT AS $$
DECLARE
    v_clean_nit TEXT;
    v_factors INT[] := ARRAY[71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
    v_total BIGINT := 0;
    v_len INT;
    v_digit INT;
    v_remainder INT;
    v_pos INT;
    v_offset INT;
BEGIN
    v_clean_nit := regexp_replace(p_nit, '\D', '', 'g');
    v_len := length(v_clean_nit);
    
    IF v_len = 0 OR v_len > 15 THEN
        RETURN NULL;
    END IF;

    v_offset := 15 - v_len;
    FOR i IN 1..v_len LOOP
        v_digit := substring(v_clean_nit FROM i FOR 1)::INT;
        v_pos := v_offset + i;
        v_total := v_total + (v_digit * v_factors[v_pos]);
    END LOOP;

    v_remainder := v_total % 11;
    IF v_remainder = 0 OR v_remainder = 1 THEN
        RETURN v_remainder;
    ELSE
        RETURN 11 - v_remainder;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para autocomputar DV si el tipo de documento es NIT
CREATE OR REPLACE FUNCTION trg_compute_third_party_dv()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.document_type = 'NIT' THEN
        NEW.verification_digit := fn_calculate_dian_dv(NEW.document_number);
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_third_party_save ON third_parties;
CREATE TRIGGER trg_before_third_party_save
BEFORE INSERT OR UPDATE ON third_parties
FOR EACH ROW EXECUTE FUNCTION trg_compute_third_party_dv();

-- ============================================================================
-- 2. CONTROL DE PERIODOS CONTABLES (accounting_periods)
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL CHECK (year BETWEEN 2020 AND 2100),
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    status VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'LOCKED')),
    closed_by UUID,
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_accounting_period_year_month UNIQUE (year, month)
);

-- Periodos 2026 iniciales abiertos
INSERT INTO accounting_periods (year, month, status)
VALUES 
    (2026, 1, 'OPEN'), (2026, 2, 'OPEN'), (2026, 3, 'OPEN'),
    (2026, 4, 'OPEN'), (2026, 5, 'OPEN'), (2026, 6, 'OPEN'),
    (2026, 7, 'OPEN'), (2026, 8, 'OPEN'), (2026, 9, 'OPEN'),
    (2026, 10, 'OPEN'), (2026, 11, 'OPEN'), (2026, 12, 'OPEN')
ON CONFLICT (year, month) DO NOTHING;

-- ============================================================================
-- 3. PLAN ÚNICO DE CUENTAS - PUC COLOMBIA (chart_of_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- ej: 110505, 130505, 220505, 240801, 413505, 421005, 530505
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (
        account_type IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO', 'COSTO_VENTAS', 'COSTO_PRODUCCION', 'ORDEN')
    ),
    nature VARCHAR(10) NOT NULL CHECK (nature IN ('DEBIT', 'CREDIT')),
    level SMALLINT NOT NULL CHECK (level IN (1, 2, 4, 6, 8, 10)), -- 1:Clase, 2:Grupo, 4:Cuenta, 6:Subcuenta, 8+:Auxiliar
    parent_id UUID REFERENCES chart_of_accounts(id),
    requires_third_party BOOLEAN NOT NULL DEFAULT FALSE, -- Obligatorio para cuentas 13, 22, 23, 24
    requires_cost_center BOOLEAN NOT NULL DEFAULT FALSE, -- Obligatorio para cuentas 4, 5, 6
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puc_code ON chart_of_accounts(code);

-- ============================================================================
-- 4. CENTROS DE COSTOS (cost_centers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE, -- ej: 'CC-INFRA-CLOUD', 'CC-DEV-AI', 'CC-ADMIN', 'CC-COMERCIAL'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES cost_centers(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cost_centers (code, name, description)
VALUES 
    ('CC-INFRA-CLOUD', 'Infraestructura Cloud, Hosting y APIs', 'Costos de servidores, OpenAI, Vercel y Cloud'),
    ('CC-DEV-AI', 'Desarrollo de Software e Inteligencia Artificial', 'Equipo de ingeniería y consultoría tech'),
    ('CC-ADMIN', 'Administración General', 'Operación administrativa y legal'),
    ('CC-COMERCIAL', 'Ventas & Marketing', 'Comercialización y adquisición')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. LIBRO DIARIO Y ASIENTOS CONTABLES (journal_entries & lines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consecutive_number VARCHAR(50) NOT NULL UNIQUE, -- ej: CC-2026-0001, RC-2026-0045, CE-2026-0089
    entry_type VARCHAR(30) NOT NULL CHECK (
        entry_type IN ('COMPROBANTE_DIARIO', 'FACTURA_VENTA', 'FACTURA_COMPRA', 'RECIBO_CAJA', 'COMPROBANTE_EGRESO', 'NOTA_AJUSTE', 'CIERRE_EJERCICIO')
    ),
    entry_date DATE NOT NULL,
    period_id UUID NOT NULL REFERENCES accounting_periods(id),
    description TEXT NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'ANNULLED')),
    total_debit DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    total_credit DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    source_module VARCHAR(50), -- 'FACTURACION', 'TESORERIA', 'NOMINA', 'MANUAL'
    source_id UUID,
    created_by UUID,
    posted_by UUID,
    posted_at TIMESTAMPTZ,
    reversal_entry_id UUID REFERENCES journal_entries(id), -- Apunta al asiento que revierte a este
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    third_party_id UUID REFERENCES third_parties(id),
    cost_center_id UUID REFERENCES cost_centers(id),
    concept TEXT NOT NULL,
    debit DECIMAL(18, 4) NOT NULL DEFAULT 0.0000 CHECK (debit >= 0),
    credit DECIMAL(18, 4) NOT NULL DEFAULT 0.0000 CHECK (credit >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1.000000 CHECK (exchange_rate > 0),
    debit_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    credit_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    document_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_entry_lines_third_party ON journal_entry_lines(third_party_id);
CREATE INDEX IF NOT EXISTS idx_entry_lines_cost_center ON journal_entry_lines(cost_center_id);

-- TRIGGER 1: Partida Doble Innegociable y Requisitos de Cuenta antes de POSTED
CREATE OR REPLACE FUNCTION fn_validate_journal_entry_posted()
RETURNS TRIGGER AS $$
DECLARE
    v_sum_debit DECIMAL(18, 4);
    v_sum_credit DECIMAL(18, 4);
    v_invalid_third_party INT;
    v_invalid_cost_center INT;
BEGIN
    IF NEW.status = 'POSTED' THEN
        -- Validar sumas de líneas
        SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
        INTO v_sum_debit, v_sum_credit
        FROM journal_entry_lines
        WHERE journal_entry_id = NEW.id;

        IF v_sum_debit = 0 AND v_sum_credit = 0 THEN
            RAISE EXCEPTION 'No se puede asentar un comprobante sin líneas contables válidas.';
        END IF;

        IF ROUND(v_sum_debit, 2) <> ROUND(v_sum_credit, 2) THEN
            RAISE EXCEPTION 'Violación de Partida Doble: Débitos (%) <> Créditos (%). Diferencia: %',
                v_sum_debit, v_sum_credit, (v_sum_debit - v_sum_credit);
        END IF;

        NEW.total_debit := v_sum_debit;
        NEW.total_credit := v_sum_credit;

        -- Validar requerimiento de Tercero en cuentas exigidas (ej: 13, 22, 23, 24)
        SELECT COUNT(*)
        INTO v_invalid_third_party
        FROM journal_entry_lines l
        JOIN chart_of_accounts a ON l.account_id = a.id
        WHERE l.journal_entry_id = NEW.id
          AND a.requires_third_party = TRUE
          AND l.third_party_id IS NULL;

        IF v_invalid_third_party > 0 THEN
            RAISE EXCEPTION 'Existen % línea(s) en cuentas de terceros (13/22/23/24) sin tercero asignado.', v_invalid_third_party;
        END IF;

        -- Validar requerimiento de Centro de Costos en cuentas exigidas (ej: 4, 5, 6)
        SELECT COUNT(*)
        INTO v_invalid_cost_center
        FROM journal_entry_lines l
        JOIN chart_of_accounts a ON l.account_id = a.id
        WHERE l.journal_entry_id = NEW.id
          AND a.requires_cost_center = TRUE
          AND l.cost_center_id IS NULL;

        IF v_invalid_cost_center > 0 THEN
            RAISE EXCEPTION 'Existen % línea(s) en cuentas de resultado (4/5/6) sin centro de costos asignado.', v_invalid_cost_center;
        END IF;

        IF OLD.status = 'DRAFT' THEN
            NEW.posted_at := NOW();
        END IF;
    END IF;

    -- Inmutabilidad estricta: No se permite cambiar líneas ni datos de un asiento ya POSTED
    IF OLD.status = 'POSTED' AND NEW.status = 'POSTED' THEN
        IF OLD.total_debit <> NEW.total_debit OR OLD.entry_date <> NEW.entry_date THEN
            RAISE EXCEPTION 'Los asientos en estado POSTED son inmutables según NIIF. Genere una Nota de Ajuste o Reversión.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_double_entry ON journal_entries;
CREATE TRIGGER trg_check_double_entry
BEFORE UPDATE OF status, total_debit, total_credit ON journal_entries
FOR EACH ROW EXECUTE FUNCTION fn_validate_journal_entry_posted();

-- TRIGGER 2: Bloqueo de Periodos Contables
CREATE OR REPLACE FUNCTION fn_check_accounting_period_lock()
RETURNS TRIGGER AS $$
DECLARE
    v_period_status VARCHAR(10);
    v_target_date DATE;
BEGIN
    v_target_date := CASE WHEN TG_OP = 'DELETE' THEN OLD.entry_date ELSE NEW.entry_date END;

    SELECT status INTO v_period_status
    FROM accounting_periods
    WHERE year = EXTRACT(YEAR FROM v_target_date)
      AND month = EXTRACT(MONTH FROM v_target_date);

    IF v_period_status IS NULL THEN
        RAISE EXCEPTION 'No existe un periodo contable creado para la fecha %', v_target_date;
    END IF;

    IF v_period_status IN ('CLOSED', 'LOCKED') THEN
        RAISE EXCEPTION 'Operación denegada: El periodo contable correspondiente a % está % ante la DIAN.',
            v_target_date, v_period_status;
    END IF;

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_accounting_period ON journal_entries;
CREATE TRIGGER trg_guard_accounting_period
BEFORE INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION fn_check_accounting_period_lock();

-- ============================================================================
-- 6. MOTOR DE IMPUESTOS Y RETENCIONES (tax_configurations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('IVA', 'RETEFUENTE', 'RETEICA', 'RETEIVA', 'AUTORRETENCION')),
    name VARCHAR(150) NOT NULL, -- ej: 'Retefuente Servicios Generales 4%', 'IVA General 19%'
    rate DECIMAL(8, 4) NOT NULL, -- ej: 19.0000, 4.0000, 11.0000, 0.9660 (por mil)
    base_min_uvt DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    base_min_cop DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    dian_concept_code VARCHAR(20), -- Concepto de Exógena DIAN (ej: '5002', '5004')
    account_sale_id UUID REFERENCES chart_of_accounts(id), -- Cta venta (ej: 240801 IVA Gen, 135515 Anticipo Retefuente)
    account_purchase_id UUID REFERENCES chart_of_accounts(id), -- Cta compra (ej: 240802 IVA Desc, 236525 Retefuente x Pagar)
    municipality_code VARCHAR(10), -- Para ReteICA local
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. FACTURACIÓN Y DOCUMENTOS ELECTRÓNICOS DIAN (invoices & lines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_type VARCHAR(35) NOT NULL CHECK (
        invoice_type IN (
            'FACTURA_VENTA_NACIONAL',
            'FACTURA_VENTA_EXPORTACION',
            'FACTURA_COMPRA_PROVEEDOR',
            'DOCUMENTO_SOPORTE_NO_OBLIGADOS',
            'NOTA_CREDITO',
            'NOTA_DEBITO'
        )
    ),
    consecutive_prefix VARCHAR(10) NOT NULL, -- 'FE', 'SETT', 'DS', 'NC'
    consecutive_number VARCHAR(30) NOT NULL,
    resolution_number VARCHAR(100), -- Resolución de Facturación DIAN
    third_party_id UUID NOT NULL REFERENCES third_parties(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1.000000, -- TRM del día de emisión
    subtotal_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    subtotal_cop DECIMAL(18, 4) NOT NULL,
    taxes_total_cop DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    withholdings_total_cop DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    total_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    total_cop DECIMAL(18, 4) NOT NULL,
    balance_due_cop DECIMAL(18, 4) NOT NULL, -- Saldo pendiente por amortizar
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'ANNULLED')),
    -- DIAN Electrónica
    cufe_cude VARCHAR(255),
    electronic_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (
        electronic_status IN ('DRAFT', 'SENT_TO_DIAN', 'ACCEPTED', 'REJECTED')
    ),
    xml_url TEXT,
    qr_code TEXT,
    dian_response_message TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_consecutive UNIQUE (consecutive_prefix, consecutive_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_third_party ON invoices(third_party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_balance ON invoices(balance_due_cop) WHERE balance_due_cop > 0;

CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost_center_id UUID REFERENCES cost_centers(id),
    revenue_expense_account_id UUID REFERENCES chart_of_accounts(id), -- Cta 4135 o Cta 51/52
    quantity DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
    unit_price_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    unit_price_cop DECIMAL(18, 4) NOT NULL,
    subtotal_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    subtotal_cop DECIMAL(18, 4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_tax_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tax_configuration_id UUID NOT NULL REFERENCES tax_configurations(id),
    base_cop DECIMAL(18, 4) NOT NULL,
    rate DECIMAL(8, 4) NOT NULL,
    tax_amount_cop DECIMAL(18, 4) NOT NULL,
    is_withholding BOOLEAN NOT NULL DEFAULT FALSE -- TRUE si descuenta (Retención), FALSE si suma (IVA)
);

-- ============================================================================
-- 8. TESORERÍA AVANZADA: RECIBOS, EGRESOS Y MULTIMONEDA
-- ============================================================================
-- Recibos de Caja (Recaudo de Clientes / Cartera)
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE, -- ej: RC-2026-0001
    receipt_date DATE NOT NULL,
    third_party_id UUID NOT NULL REFERENCES third_parties(id),
    bank_account_id UUID REFERENCES chart_of_accounts(id), -- Cta 1110 Bancos
    currency VARCHAR(3) NOT NULL DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1.000000, -- TRM del día de pago
    amount_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    amount_cop DECIMAL(18, 4) NOT NULL,
    notes TEXT,
    status VARCHAR(15) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'ANNULLED')),
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comprobantes de Egreso (Pagos Proveedores, Nómina, Infraestructura Cloud en USD)
CREATE TABLE IF NOT EXISTS disbursement_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number VARCHAR(50) NOT NULL UNIQUE, -- ej: CE-2026-0001
    payment_date DATE NOT NULL,
    third_party_id UUID NOT NULL REFERENCES third_parties(id),
    bank_account_id UUID REFERENCES chart_of_accounts(id), -- Cta 1110 Bancos
    payment_method VARCHAR(30) NOT NULL CHECK (
        payment_method IN ('TRANSFERENCIA', 'TARJETA_CREDITO_CORP', 'EFECTIVO', 'ACH')
    ),
    currency VARCHAR(3) NOT NULL DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1.000000, -- TRM del día de pago
    amount_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    amount_cop DECIMAL(18, 4) NOT NULL,
    notes TEXT,
    status VARCHAR(15) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'ANNULLED')),
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cruce de Cartera / CxP y Cálculo de Diferencia en Cambio Automática
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES payment_receipts(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES disbursement_vouchers(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount_applied_foreign DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    amount_applied_cop DECIMAL(18, 4) NOT NULL,
    trm_causacion DECIMAL(18, 6) NOT NULL, -- TRM de la factura original
    trm_pago DECIMAL(18, 6) NOT NULL,      -- TRM del momento de pago
    exchange_difference_cop DECIMAL(18, 4) NOT NULL DEFAULT 0.0000, -- (trm_pago - trm_causacion) * amount_applied_foreign
    fx_account_id UUID REFERENCES chart_of_accounts(id), -- 421005 (Ganancia Cambiaria) o 530505 (Pérdida Cambiaria)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_receipt_or_voucher CHECK (
        (receipt_id IS NOT NULL AND voucher_id IS NULL) OR
        (voucher_id IS NOT NULL AND receipt_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_allocations_invoice ON payment_allocations(invoice_id);

-- TRIGGER 3: Actualización de Saldo Pendiente de Factura al cruzar pagos
CREATE OR REPLACE FUNCTION trg_apply_payment_allocation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET balance_due_cop = balance_due_cop - NEW.amount_applied_cop,
        status = CASE 
            WHEN (balance_due_cop - NEW.amount_applied_cop) <= 0.0001 THEN 'PAID'
            ELSE 'PARTIALLY_PAID'
        END,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_payment_allocation ON payment_allocations;
CREATE TRIGGER trg_after_payment_allocation
AFTER INSERT ON payment_allocations
FOR EACH ROW EXECUTE FUNCTION trg_apply_payment_allocation();

-- ============================================================================
-- 9. AUDITORÍA AUTOMÁTICA EN TABLAS CORE
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        user_id,
        old_values,
        new_values
    ) VALUES (
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_journal_entries ON journal_entries;
CREATE TRIGGER trg_audit_journal_entries
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_invoices ON invoices;
CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_periods ON accounting_periods;
CREATE TRIGGER trg_audit_periods
AFTER UPDATE ON accounting_periods
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
