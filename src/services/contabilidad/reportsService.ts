import { JournalEntry, JournalEntryLine, ThirdParty } from './types';

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  thirdPartyDocument?: string;
  thirdPartyName?: string;
  initialBalance: number;
  totalDebits: number;
  totalCredits: number;
  finalBalance: number;
}

export interface Exogena1001Row {
  concepto: string; // ej: 5002, 5004
  tipoDoc: string;
  numeroDoc: string;
  dv: string;
  razonSocial: string;
  direccion: string;
  codDpto: string;
  codMpio: string;
  pagoDeducible: number;
  pagoNoDeducible: number;
  ivaMayorValor: number;
  retencionRentaPracticada: number;
  retencionRentaAsumida: number;
  retencionIvaPracticada: number;
}

/**
 * Generador de Reportes NIIF y Libros Oficiales para Colombia
 */
export class ColombianAccountingReports {
  /**
   * Generar Balance de Prueba por Tercero
   */
  static generateTrialBalanceByThirdParty(
    entries: JournalEntry[],
    accountFilter?: string
  ): TrialBalanceItem[] {
    const map = new Map<string, TrialBalanceItem>();

    entries
      .filter((e) => e.status === 'POSTED')
      .forEach((entry) => {
        entry.lines.forEach((line) => {
          const code = line.account_code || 'SIN_CUENTA';
          if (accountFilter && !code.startsWith(accountFilter)) return;

          const key = `${code}-${line.third_party_id || 'SIN_TERCERO'}`;

          if (!map.has(key)) {
            map.set(key, {
              accountCode: code,
              accountName: line.account_name || 'Cuenta General',
              thirdPartyDocument: line.document_reference || '',
              thirdPartyName: line.third_party_name || 'Varios / General',
              initialBalance: 0,
              totalDebits: 0,
              totalCredits: 0,
              finalBalance: 0,
            });
          }

          const item = map.get(key)!;
          item.totalDebits += Number(line.debit) || 0;
          item.totalCredits += Number(line.credit) || 0;

          // Naturaleza según primer dígito del PUC:
          // 1 (Activo), 5 (Gasto), 6 (Costo): Débito aumenta, Crédito disminuye
          // 2 (Pasivo), 3 (Patrimonio), 4 (Ingreso): Crédito aumenta, Débito disminuye
          const classDigit = code.charAt(0);
          if (['1', '5', '6', '7'].includes(classDigit)) {
            item.finalBalance = item.initialBalance + item.totalDebits - item.totalCredits;
          } else {
            item.finalBalance = item.initialBalance + item.totalCredits - item.totalDebits;
          }
        });
      });

    return Array.from(map.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }

  /**
   * Pre-validador DIAN: Formato 1001 (Pagos o Abonos en Cuenta y Retenciones Practicadas)
   */
  static generateExogena1001(
    lines: JournalEntryLine[],
    thirdParties: Map<string, ThirdParty>
  ): Exogena1001Row[] {
    const rowsMap = new Map<string, Exogena1001Row>();

    lines.forEach((line) => {
      // Filtrar líneas de cuentas de gastos o costos (Clase 5 o 6)
      const code = line.account_code || '';
      if (!code.startsWith('5') && !code.startsWith('6')) return;

      const third = line.third_party_id ? thirdParties.get(line.third_party_id) : undefined;
      if (!third) return;

      // Mapear a concepto DIAN según subcuenta PUC
      let concepto = '5016'; // Demás costos y deducciones por defecto
      if (code.startsWith('5110') || code.startsWith('5210')) concepto = '5002'; // Honorarios
      if (code.startsWith('5115') || code.startsWith('5215')) concepto = '5003'; // Comisiones
      if (code.startsWith('5135') || code.startsWith('5235')) concepto = '5004'; // Servicios
      if (code.startsWith('5120') || code.startsWith('5220')) concepto = '5005'; // Arrendamientos
      if (code.startsWith('14') || code.startsWith('61')) concepto = '5007'; // Compras

      const key = `${concepto}-${third.document_number}`;

      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          concepto,
          tipoDoc: third.document_type === 'NIT' ? '31' : '13',
          numeroDoc: third.document_number,
          dv: third.verification_digit !== undefined ? String(third.verification_digit) : '',
          razonSocial: third.legal_name,
          direccion: third.address,
          codDpto: third.department_code || '08',
          codMpio: third.municipality_code || '001',
          pagoDeducible: 0,
          pagoNoDeducible: 0,
          ivaMayorValor: 0,
          retencionRentaPracticada: 0,
          retencionRentaAsumida: 0,
          retencionIvaPracticada: 0,
        });
      }

      const row = rowsMap.get(key)!;
      row.pagoDeducible += Number(line.debit) || 0;
    });

    return Array.from(rowsMap.values());
  }

  /**
   * Exportar a formato CSV para Excel o Prevalidador DIAN
   */
  static exportToCSV(data: any[], filename: string): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(';');
    const rows = data.map((obj) => Object.values(obj).join(';')).join('\n');
    return `${headers}\n${rows}`;
  }
}
