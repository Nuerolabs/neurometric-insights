import { JournalEntryLine } from './types';

export interface FxCalculationInput {
  invoiceType: 'CLIENTE' | 'PROVEEDOR';
  amountUsd: number;
  trmCausacion: number; // TRM al momento de emitir/recibir la factura
  trmPago: number;      // TRM oficial al momento del cobro o desembolso
  invoiceNumber: string;
  thirdPartyId: string;
  thirdPartyName: string;
  bankAccountId: string;
  bankAccountCode: string;
}

export interface FxCalculationResult {
  amountCopCausacion: number;
  amountCopPago: number;
  differenceCop: number; // Positivo o negativo
  nature: 'GANANCIA' | 'PERDIDA' | 'NEUTRO';
  fxAccountCode: string; // 421005 o 530505
  fxAccountName: string;
  generatedLines: JournalEntryLine[];
}

/**
 * Motor de Cálculo y Asientos para Diferencia en Cambio (Normativa NIIF NIC 21)
 * Aplica para transacciones en moneda extranjera (USD) vs funcional (COP).
 */
export function calculateFxDifference(input: FxCalculationInput): FxCalculationResult {
  const {
    invoiceType,
    amountUsd,
    trmCausacion,
    trmPago,
    invoiceNumber,
    thirdPartyId,
    thirdPartyName,
    bankAccountId,
    bankAccountCode,
  } = input;

  const amountCopCausacion = Math.round(amountUsd * trmCausacion * 100) / 100;
  const amountCopPago = Math.round(amountUsd * trmPago * 100) / 100;
  const deltaTrm = trmPago - trmCausacion;
  const rawDiff = Math.round(amountUsd * deltaTrm * 100) / 100;

  const lines: JournalEntryLine[] = [];

  if (invoiceType === 'PROVEEDOR') {
    // Ejemplo: Pago de Factura Cloud (AWS, OpenAI, Vercel)
    // Pasivo se cancela a la TRM de causación original
    // Banco desembolsa a la TRM de la fecha de pago
    // Si TRM subió: Pagamos más COP por los mismos USD -> Gasto por Diferencia en Cambio (530505)
    // Si TRM bajó: Pagamos menos COP por los mismos USD -> Ingreso por Diferencia en Cambio (421005)

    if (rawDiff > 0) {
      // Pérdida cambiaria (Gasto 530505)
      // Débito 220505 (Proveedor USD): amountCopCausacion
      // Débito 530505 (Gasto Fx): rawDiff
      // Crédito 111005 (Banco COP): amountCopPago
      lines.push({
        account_id: 'acc-cxp-prov',
        account_code: '220505',
        account_name: 'Proveedores del Exterior',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Cancelación Factura ${invoiceNumber} (${amountUsd} USD @ ${trmCausacion})`,
        debit: amountCopCausacion,
        credit: 0,
        currency: 'USD',
        exchange_rate: trmCausacion,
        debit_foreign: amountUsd,
      });

      lines.push({
        account_id: 'acc-gasto-fx',
        account_code: '530505',
        account_name: 'Gastos Financieros - Diferencia en Cambio',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Ajuste TRM alza ($${trmCausacion} -> $${trmPago}) en Factura ${invoiceNumber}`,
        debit: Math.abs(rawDiff),
        credit: 0,
        currency: 'COP',
        exchange_rate: 1.0,
      });

      lines.push({
        account_id: bankAccountId,
        account_code: bankAccountCode,
        account_name: 'Bancos Moneda Nacional / Tarjeta Corp',
        concept: `Desembolso pago Factura ${invoiceNumber} (${amountUsd} USD @ ${trmPago})`,
        debit: 0,
        credit: amountCopPago,
        currency: 'USD',
        exchange_rate: trmPago,
        credit_foreign: amountUsd,
      });

      return {
        amountCopCausacion,
        amountCopPago,
        differenceCop: Math.abs(rawDiff),
        nature: 'PERDIDA',
        fxAccountCode: '530505',
        fxAccountName: 'Gastos Financieros - Diferencia en Cambio',
        generatedLines: lines,
      };
    } else if (rawDiff < 0) {
      // Ganancia cambiaria (Ingreso 421005)
      const gain = Math.abs(rawDiff);

      lines.push({
        account_id: 'acc-cxp-prov',
        account_code: '220505',
        account_name: 'Proveedores del Exterior',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Cancelación Factura ${invoiceNumber} (${amountUsd} USD @ ${trmCausacion})`,
        debit: amountCopCausacion,
        credit: 0,
        currency: 'USD',
        exchange_rate: trmCausacion,
        debit_foreign: amountUsd,
      });

      lines.push({
        account_id: bankAccountId,
        account_code: bankAccountCode,
        account_name: 'Bancos Moneda Nacional / Tarjeta Corp',
        concept: `Desembolso pago Factura ${invoiceNumber} (${amountUsd} USD @ ${trmPago})`,
        debit: 0,
        credit: amountCopPago,
        currency: 'USD',
        exchange_rate: trmPago,
        credit_foreign: amountUsd,
      });

      lines.push({
        account_id: 'acc-ingreso-fx',
        account_code: '421005',
        account_name: 'Ingresos Financieros - Diferencia en Cambio',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Ajuste TRM baja ($${trmCausacion} -> $${trmPago}) en Factura ${invoiceNumber}`,
        debit: 0,
        credit: gain,
        currency: 'COP',
        exchange_rate: 1.0,
      });

      return {
        amountCopCausacion,
        amountCopPago,
        differenceCop: gain,
        nature: 'GANANCIA',
        fxAccountCode: '421005',
        fxAccountName: 'Ingresos Financieros - Diferencia en Cambio',
        generatedLines: lines,
      };
    }
  } else {
    // CLIENTE: Recaudo de Exportación de Servicios de IA / Software
    if (rawDiff > 0) {
      // TRM subió: Recibimos más COP por los mismos USD -> Ganancia cambiaria (421005)
      lines.push({
        account_id: bankAccountId,
        account_code: bankAccountCode,
        account_name: 'Bancos Cuenta Compensación / Moneda Nacional',
        concept: `Recaudo Factura ${invoiceNumber} (${amountUsd} USD @ ${trmPago})`,
        debit: amountCopPago,
        credit: 0,
        currency: 'USD',
        exchange_rate: trmPago,
        debit_foreign: amountUsd,
      });

      lines.push({
        account_id: 'acc-cxc-clientes',
        account_code: '130510',
        account_name: 'Clientes del Exterior',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Amortización Factura ${invoiceNumber} (${amountUsd} USD @ ${trmCausacion})`,
        debit: 0,
        credit: amountCopCausacion,
        currency: 'USD',
        exchange_rate: trmCausacion,
        credit_foreign: amountUsd,
      });

      lines.push({
        account_id: 'acc-ingreso-fx',
        account_code: '421005',
        account_name: 'Ingresos Financieros - Diferencia en Cambio',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Ajuste TRM alza ($${trmCausacion} -> $${trmPago}) en Recaudo ${invoiceNumber}`,
        debit: 0,
        credit: Math.abs(rawDiff),
        currency: 'COP',
        exchange_rate: 1.0,
      });

      return {
        amountCopCausacion,
        amountCopPago,
        differenceCop: Math.abs(rawDiff),
        nature: 'GANANCIA',
        fxAccountCode: '421005',
        fxAccountName: 'Ingresos Financieros - Diferencia en Cambio',
        generatedLines: lines,
      };
    } else if (rawDiff < 0) {
      // TRM bajó: Recibimos menos COP por los mismos USD -> Pérdida cambiaria (530505)
      const loss = Math.abs(rawDiff);

      lines.push({
        account_id: bankAccountId,
        account_code: bankAccountCode,
        account_name: 'Bancos Cuenta Compensación / Moneda Nacional',
        concept: `Recaudo Factura ${invoiceNumber} (${amountUsd} USD @ ${trmPago})`,
        debit: amountCopPago,
        credit: 0,
        currency: 'USD',
        exchange_rate: trmPago,
        debit_foreign: amountUsd,
      });

      lines.push({
        account_id: 'acc-gasto-fx',
        account_code: '530505',
        account_name: 'Gastos Financieros - Diferencia en Cambio',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Ajuste TRM baja ($${trmCausacion} -> $${trmPago}) en Recaudo ${invoiceNumber}`,
        debit: loss,
        credit: 0,
        currency: 'COP',
        exchange_rate: 1.0,
      });

      lines.push({
        account_id: 'acc-cxc-clientes',
        account_code: '130510',
        account_name: 'Clientes del Exterior',
        third_party_id: thirdPartyId,
        third_party_name: thirdPartyName,
        concept: `Amortización Factura ${invoiceNumber} (${amountUsd} USD @ ${trmCausacion})`,
        debit: 0,
        credit: amountCopCausacion,
        currency: 'USD',
        exchange_rate: trmCausacion,
        credit_foreign: amountUsd,
      });

      return {
        amountCopCausacion,
        amountCopPago,
        differenceCop: loss,
        nature: 'PERDIDA',
        fxAccountCode: '530505',
        fxAccountName: 'Gastos Financieros - Diferencia en Cambio',
        generatedLines: lines,
      };
    }
  }

  // TRM idéntica
  return {
    amountCopCausacion,
    amountCopPago,
    differenceCop: 0,
    nature: 'NEUTRO',
    fxAccountCode: '0',
    fxAccountName: 'Sin diferencia',
    generatedLines: lines,
  };
}
