import { ThirdParty, TaxConfiguration } from './types';

// Valor UVT (Unidad de Valor Tributario) Colombia 2025/2026
export const UVT_COLOMBIA_2026 = 49799;

export interface TaxCalculationParams {
  subtotalCop: number;
  thirdParty: ThirdParty;
  productType: 'SOFTWARE_DEV' | 'CONSULTING_AI' | 'CLOUD_HOSTING' | 'HARDWARE' | 'LICENSING';
  isPurchase: boolean; // true = Factura de Compra, false = Factura de Venta
}

export interface AppliedTaxLine {
  taxType: string;
  name: string;
  rate: number;
  baseCop: number;
  amountCop: number;
  isWithholding: boolean; // Si resta del neto a pagar
  accountCode: string;
  accountName: string;
}

export interface TaxCalculationResult {
  subtotalCop: number;
  totalIvaCop: number;
  totalWithholdingsCop: number;
  netPayableCop: number;
  appliedTaxes: AppliedTaxLine[];
}

/**
 * Motor Tributario Colombiano: IVA, Retefuente, ReteICA y Autorretención
 * Acorde con el Estatuto Tributario Nacional y Normativa Municipal DIAN
 */
export function calculateColombianTaxes(params: TaxCalculationParams): TaxCalculationResult {
  const { subtotalCop, thirdParty, productType, isPurchase } = params;
  const appliedTaxes: AppliedTaxLine[] = [];

  let totalIva = 0;
  let totalWithholdings = 0;

  // 1. CÁLCULO DE IVA (19%)
  // El software como servicio (SaaS) y desarrollo están gravados al 19% en Colombia,
  // salvo servicios de computación en la nube exentos según Art. 476 Numeral 21 ET.
  const isCloudExempt = productType === 'CLOUD_HOSTING';
  if (!isCloudExempt) {
    const ivaRate = 19.0;
    const ivaAmount = Math.round(subtotalCop * (ivaRate / 100) * 100) / 100;
    totalIva += ivaAmount;

    appliedTaxes.push({
      taxType: 'IVA',
      name: 'IVA General 19%',
      rate: ivaRate,
      baseCop: subtotalCop,
      amountCop: ivaAmount,
      isWithholding: false,
      accountCode: isPurchase ? '240802' : '240801',
      accountName: isPurchase ? 'IVA Descontable en Compras' : 'IVA Generado en Ventas',
    });
  }

  // 2. RETENCIÓN EN LA FUENTE (A título de Renta)
  // En compras, si la empresa compra y el proveedor no es Gran Contribuyente ni Régimen Simple
  if (isPurchase) {
    const isSupplierSimple = thirdParty.tax_regime === 'REGIMEN_SIMPLE';
    const isSupplierSelfWithholder = thirdParty.tax_regime === 'AUTORRETENEDOR';

    if (!isSupplierSimple && !isSupplierSelfWithholder) {
      let retefuenteRate = 0;
      let minBaseUvt = 0;
      let taxName = '';

      if (productType === 'SOFTWARE_DEV' || productType === 'CONSULTING_AI') {
        // Honorarios y Consultoría Calificada: 11% (Declarantes) o 10% (No declarantes)
        retefuenteRate = thirdParty.tax_regime === 'RESPONSABLE_IVA' ? 11.0 : 10.0;
        minBaseUvt = 0; // Honorarios aplica desde el primer peso ($0)
        taxName = `Retefuente Honorarios/Servicios Tech ${retefuenteRate}%`;
      } else if (productType === 'HARDWARE') {
        // Compras Generales: 2.5% con base mínima de 27 UVT
        retefuenteRate = 2.5;
        minBaseUvt = 27;
        taxName = 'Retefuente Compras Generales 2.5%';
      } else {
        // Servicios Generales: 4% con base mínima de 4 UVT
        retefuenteRate = 4.0;
        minBaseUvt = 4;
        taxName = 'Retefuente Servicios Generales 4%';
      }

      const minBaseCop = minBaseUvt * UVT_COLOMBIA_2026;

      if (subtotalCop >= minBaseCop) {
        const reteAmount = Math.round(subtotalCop * (retefuenteRate / 100) * 100) / 100;
        totalWithholdings += reteAmount;

        appliedTaxes.push({
          taxType: 'RETEFUENTE',
          name: taxName,
          rate: retefuenteRate,
          baseCop: subtotalCop,
          amountCop: reteAmount,
          isWithholding: true,
          accountCode: '236525',
          accountName: 'Retención en la Fuente x Servicios/Honorarios',
        });
      }
    }
  }

  // 3. RETENCIÓN DE ICA (ReteICA Municipal)
  if (isPurchase) {
    // Tarifa típica para actividades de sistemas/consultoría: 9.66 por mil (0.966%)
    const reteIcaRatePermil = 9.66;
    const reteIcaAmount = Math.round(subtotalCop * (reteIcaRatePermil / 1000) * 100) / 100;
    totalWithholdings += reteIcaAmount;

    appliedTaxes.push({
      taxType: 'RETEICA',
      name: `ReteICA Servicios Municipales (${reteIcaRatePermil}x1000)`,
      rate: reteIcaRatePermil / 10, // en porcentaje
      baseCop: subtotalCop,
      amountCop: reteIcaAmount,
      isWithholding: true,
      accountCode: '236805',
      accountName: 'Impuesto de Industria y Comercio Retenido (ReteICA)',
    });
  }

  // 4. AUTORRETENCIÓN ESPECIAL DE RENTA (En Ventas)
  // Decreto 2201/2016 y Decreto 261/2023: Autorretención a título de renta para personas jurídicas
  if (!isPurchase) {
    const autoRentaRate = 0.55; // 0.55% para actividades de edición y desarrollo de programas informáticos
    const autoRentaAmount = Math.round(subtotalCop * (autoRentaRate / 100) * 100) / 100;

    appliedTaxes.push({
      taxType: 'AUTORRETENCION',
      name: 'Autorretención Especial Renta (0.55%)',
      rate: autoRentaRate,
      baseCop: subtotalCop,
      amountCop: autoRentaAmount,
      isWithholding: false,
      accountCode: '135517',
      accountName: 'Anticipo Autorretención Especial Renta',
    });
  }

  const netPayableCop = Math.round((subtotalCop + totalIva - totalWithholdings) * 100) / 100;

  return {
    subtotalCop,
    totalIvaCop: totalIva,
    totalWithholdingsCop: totalWithholdings,
    netPayableCop,
    appliedTaxes,
  };
}
