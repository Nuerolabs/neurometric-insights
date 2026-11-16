export type DocumentType = 'NIT' | 'CC' | 'CE' | 'PASAPORTE' | 'TI' | 'ID_EXTRANJERO';

export type TaxRegime = 
  | 'RESPONSABLE_IVA' 
  | 'NO_RESPONSABLE_IVA' 
  | 'REGIMEN_SIMPLE' 
  | 'GRAN_CONTRIBUYENTE' 
  | 'AUTORRETENEDOR';

export type PartyType = 'CLIENTE' | 'PROVEEDOR' | 'EMPLEADO' | 'SOCIO' | 'ENTIDAD_OFICIAL';

export interface ThirdParty {
  id: string;
  document_type: DocumentType;
  document_number: string;
  verification_digit?: number;
  legal_name: string;
  commercial_name?: string;
  party_types: PartyType[];
  tax_regime: TaxRegime;
  fiscal_responsibilities: string[]; // e.g., ['O-13', 'O-15', 'R-99-PN']
  municipality_code: string; // Código DANE ej: '47745', '08001', '11001'
  department_code: string;
  email_billing: string;
  phone?: string;
  address: string;
  bank_account_number?: string;
  bank_account_type?: 'CORRIENTE' | 'AHORROS';
  bank_name?: string;
  is_active: boolean;
  created_at?: string;
}

export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface AccountingPeriod {
  id: string;
  year: number;
  month: number;
  status: PeriodStatus;
  closed_by?: string;
  closed_at?: string;
  notes?: string;
}

export type AccountType = 
  | 'ACTIVO' 
  | 'PASIVO' 
  | 'PATRIMONIO' 
  | 'INGRESO' 
  | 'GASTO' 
  | 'COSTO_VENTAS' 
  | 'COSTO_PRODUCCION' 
  | 'ORDEN';

export type AccountNature = 'DEBIT' | 'CREDIT';

export interface ChartOfAccount {
  id: string;
  code: string; // e.g. '110505', '130505', '220505', '240801'
  name: string;
  account_type: AccountType;
  nature: AccountNature;
  level: number; // 1, 2, 4, 6, 8, 10
  parent_id?: string;
  requires_third_party: boolean;
  requires_cost_center: boolean;
  is_active: boolean;
}

export interface CostCenter {
  id: string;
  code: string; // e.g. 'CC-INFRA-CLOUD', 'CC-DEV-AI', 'CC-ADMIN'
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
}

export type JournalEntryType = 
  | 'COMPROBANTE_DIARIO'
  | 'FACTURA_VENTA'
  | 'FACTURA_COMPRA'
  | 'RECIBO_CAJA'
  | 'COMPROBANTE_EGRESO'
  | 'NOTA_AJUSTE'
  | 'CIERRE_EJERCICIO';

export type EntryStatus = 'DRAFT' | 'POSTED' | 'ANNULLED';

export interface JournalEntryLine {
  id?: string;
  journal_entry_id?: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  third_party_id?: string;
  third_party_name?: string;
  cost_center_id?: string;
  cost_center_name?: string;
  concept: string;
  debit: number;
  credit: number;
  currency: 'COP' | 'USD';
  exchange_rate: number;
  debit_foreign?: number;
  credit_foreign?: number;
  document_reference?: string;
}

export interface JournalEntry {
  id: string;
  consecutive_number: string;
  entry_type: JournalEntryType;
  entry_date: string; // YYYY-MM-DD
  period_id: string;
  description: string;
  status: EntryStatus;
  total_debit: number;
  total_credit: number;
  source_module?: string;
  source_id?: string;
  lines: JournalEntryLine[];
  created_at?: string;
  posted_at?: string;
}

export type TaxType = 'IVA' | 'RETEFUENTE' | 'RETEICA' | 'RETEIVA' | 'AUTORRETENCION';

export interface TaxConfiguration {
  id: string;
  tax_type: TaxType;
  name: string;
  rate: number; // Percentage or permillage (e.g. 19.0, 4.0, 11.0, 0.966)
  base_min_uvt: number;
  base_min_cop: number;
  dian_concept_code?: string;
  account_sale_id: string;
  account_purchase_id: string;
  municipality_code?: string;
  is_active: boolean;
}

export type InvoiceType = 
  | 'FACTURA_VENTA_NACIONAL'
  | 'FACTURA_VENTA_EXPORTACION'
  | 'FACTURA_COMPRA_PROVEEDOR'
  | 'DOCUMENTO_SOPORTE_NO_OBLIGADOS'
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO';

export type InvoiceStatus = 'DRAFT' | 'POSTED' | 'PARTIALLY_PAID' | 'PAID' | 'ANNULLED';
export type DianElectronicStatus = 'DRAFT' | 'SENT_TO_DIAN' | 'ACCEPTED' | 'REJECTED';

export interface Invoice {
  id: string;
  invoice_type: InvoiceType;
  consecutive_prefix: string;
  consecutive_number: string;
  resolution_number?: string;
  third_party_id: string;
  third_party?: ThirdParty;
  issue_date: string;
  due_date: string;
  currency: 'COP' | 'USD';
  exchange_rate: number;
  subtotal_foreign: number;
  subtotal_cop: number;
  taxes_total_cop: number;
  withholdings_total_cop: number;
  total_foreign: number;
  total_cop: number;
  balance_due_cop: number;
  status: InvoiceStatus;
  cufe_cude?: string;
  electronic_status: DianElectronicStatus;
  xml_url?: string;
  qr_code?: string;
}

export interface PaymentReceipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  third_party_id: string;
  bank_account_id: string;
  currency: 'COP' | 'USD';
  exchange_rate: number;
  amount_foreign: number;
  amount_cop: number;
  notes?: string;
  status: 'DRAFT' | 'POSTED' | 'ANNULLED';
}

export interface DisbursementVoucher {
  id: string;
  voucher_number: string;
  payment_date: string;
  third_party_id: string;
  bank_account_id: string;
  payment_method: 'TRANSFERENCIA' | 'TARJETA_CREDITO_CORP' | 'EFECTIVO' | 'ACH';
  currency: 'COP' | 'USD';
  exchange_rate: number;
  amount_foreign: number;
  amount_cop: number;
  notes?: string;
  status: 'DRAFT' | 'POSTED' | 'ANNULLED';
}

export interface PaymentAllocation {
  id?: string;
  receipt_id?: string;
  voucher_id?: string;
  invoice_id: string;
  amount_applied_foreign: number;
  amount_applied_cop: number;
  trm_causacion: number;
  trm_pago: number;
  exchange_difference_cop: number;
  fx_account_id?: string;
}
