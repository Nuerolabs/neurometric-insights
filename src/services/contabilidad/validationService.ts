import { JournalEntryLine, AccountingPeriod, ChartOfAccount } from './types';

/**
 * Algoritmo Oficial de la DIAN para el Cálculo del Dígito de Verificación (DV)
 * Basado en Módulo 11 con los 15 factores primos estándar en Colombia:
 * [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
 */
export function calculateDianDV(nit: string): number | null {
  const cleanNit = nit.replace(/\D/g, '');
  if (!cleanNit || cleanNit.length > 15) return null;

  const factors = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const len = cleanNit.length;
  const offset = 15 - len;

  let total = 0;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(cleanNit.charAt(i), 10);
    const factor = factors[offset + i];
    total += digit * factor;
  }

  const remainder = total % 11;
  if (remainder === 0 || remainder === 1) {
    return remainder;
  }
  return 11 - remainder;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
}

/**
 * Regla de Partida Doble Innegociable (NIIF Colombia):
 * SUM(debit) == SUM(credit)
 */
export function validateDoubleEntry(lines: JournalEntryLine[]): ValidationResult {
  const errors: string[] = [];

  if (!lines || lines.length === 0) {
    return {
      isValid: false,
      errors: ['El asiento contable no tiene ninguna línea registrada.'],
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  lines.forEach((line, index) => {
    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;

    if (debit < 0 || credit < 0) {
      errors.push(`Línea ${index + 1}: No se permiten valores negativos en débitos ni créditos.`);
    }

    if (debit > 0 && credit > 0) {
      errors.push(`Línea ${index + 1}: Una línea no puede tener débito y crédito simultáneamente.`);
    }

    if (debit === 0 && credit === 0) {
      errors.push(`Línea ${index + 1}: Debe registrar un valor en débito o crédito.`);
    }

    totalDebit += debit;
    totalCredit += credit;
  });

  // Redondear a 2 decimales para comparación de balance
  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.abs(roundedDebit - roundedCredit);

  if (difference > 0.009) {
    errors.push(
      `Violación de Partida Doble: Débitos ($${roundedDebit.toLocaleString('es-CO')}) no coinciden con Créditos ($${roundedCredit.toLocaleString('es-CO')}). Diferencia de $${difference.toLocaleString('es-CO')}.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    totalDebit: roundedDebit,
    totalCredit: roundedCredit,
    difference,
  };
}

/**
 * Validación de Periodo Contable Bloqueado/Cerrado ante la DIAN
 */
export function validatePeriodNotLocked(
  entryDate: string,
  periods: AccountingPeriod[]
): { isAllowed: boolean; error?: string } {
  const date = new Date(entryDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const period = periods.find((p) => p.year === year && p.month === month);

  if (!period) {
    return {
      isAllowed: false,
      error: `No existe un periodo contable creado para la fecha ${entryDate} (${month}/${year}).`,
    };
  }

  if (period.status === 'CLOSED' || period.status === 'LOCKED') {
    return {
      isAllowed: false,
      error: `Operación bloqueada: El periodo contable ${month}/${year} se encuentra ${period.status} ante la DIAN.`,
    };
  }

  return { isAllowed: true };
}

/**
 * Validar Terceros y Centros de Costos según la naturaleza del PUC
 */
export function validateLinesRequirements(
  lines: JournalEntryLine[],
  pucMap: Map<string, ChartOfAccount>
): string[] {
  const errors: string[] = [];

  lines.forEach((line, idx) => {
    const account = pucMap.get(line.account_id) || pucMap.get(line.account_code || '');
    if (!account) return;

    // Cuentas que exigen tercero (Clase 13 Clientes/Cartera, 22 Proveedores, 23 CxP, 24 Impuestos)
    if (account.requires_third_party && !line.third_party_id) {
      errors.push(
        `Línea ${idx + 1} (${account.code} - ${account.name}): Exige identificación de tercero obligatorio.`
      );
    }

    // Cuentas de resultado que exigen centro de costos (Clases 4 Ingresos, 5 Gastos, 6 Costos)
    if (account.requires_cost_center && !line.cost_center_id) {
      errors.push(
        `Línea ${idx + 1} (${account.code} - ${account.name}): Exige asignación de Centro de Costos para NIIF.`
      );
    }
  });

  return errors;
}
