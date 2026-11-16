import React, { useState } from 'react';
import { ContabilidadLayout } from '@/components/contabilidad/ContabilidadLayout';
import { calculateFxDifference } from '@/services/contabilidad/fxDifferenceService';
import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function TesoreriaPage() {
  // Simulator state for USD Foreign Exchange difference
  const [invoiceType, setInvoiceType] = useState<'PROVEEDOR' | 'CLIENTE'>('PROVEEDOR');
  const [amountUsd, setAmountUsd] = useState(3450);
  const [trmCausacion, setTrmCausacion] = useState(4120.0);
  const [trmPago, setTrmPago] = useState(4205.5);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-OPENAI-2026-11');

  const fxResult = calculateFxDifference({
    invoiceType,
    amountUsd,
    trmCausacion,
    trmPago,
    invoiceNumber,
    thirdPartyId: 'tp-openai',
    thirdPartyName: invoiceType === 'PROVEEDOR' ? 'OpenAI LLC (APIs Cloud)' : 'Tech Corp USA (Exportación IA)',
    bankAccountId: 'puc-111005',
    bankAccountCode: '111005',
  });

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <ContabilidadLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Tesorería Multimoneda & Diferencia en Cambio (NIC 21)
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Liquidación y cruce automático de facturas en USD (APIs de IA, servidores y exportación de software).
            </p>
          </div>
        </div>

        {/* Foreign Exchange Calculator Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Calculadora Automática de Diferencia en Cambio (TRM)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Genera las líneas de diario en las cuentas 421005 (Ingreso) o 530505 (Gasto) al cruzar el pago.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              TRM Oficial COP/USD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Tipo de Flujo
              </label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="PROVEEDOR">Egreso Proveedor USD (Gasto Cloud)</option>
                <option value="CLIENTE">Recaudo Cliente USD (Exportación)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Valor Factura (USD)
              </label>
              <input
                type="number"
                value={amountUsd}
                onChange={(e) => setAmountUsd(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                TRM Causación (Factura)
              </label>
              <input
                type="number"
                step="0.01"
                value={trmCausacion}
                onChange={(e) => setTrmCausacion(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                TRM Pago (Desembolso)
              </label>
              <input
                type="number"
                step="0.01"
                value={trmPago}
                onChange={(e) => setTrmPago(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Referencia Factura
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                1. Causación Original (NIIF)
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {formatCOP(fxResult.amountCopCausacion)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatUSD(amountUsd)} @ ${trmCausacion.toLocaleString('es-CO')} TRM
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                2. Pago Tesorería Real
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {formatCOP(fxResult.amountCopPago)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatUSD(amountUsd)} @ ${trmPago.toLocaleString('es-CO')} TRM
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                fxResult.nature === 'GANANCIA'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <span className="text-[11px] font-bold uppercase flex items-center gap-1.5">
                {fxResult.nature === 'GANANCIA' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                )}
                {fxResult.nature === 'GANANCIA' ? 'Ganancia Cambiaria' : 'Pérdida Cambiaria'}
              </span>
              <p className="text-lg font-bold mt-1 font-mono">
                {formatCOP(fxResult.differenceCop)}
              </p>
              <p className="text-[11px] font-mono opacity-80 mt-0.5">
                Imputación: Cuenta {fxResult.fxAccountCode} ({fxResult.fxAccountName})
              </p>
            </div>
          </div>

          {/* Generated Journal Lines */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Asiento Contable Generado Automáticamente por el Motor de Tesorería
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4">Cuenta PUC</th>
                    <th className="py-2.5 px-4">Tercero</th>
                    <th className="py-2.5 px-4">Concepto</th>
                    <th className="py-2.5 px-4 text-right">Débito (COP)</th>
                    <th className="py-2.5 px-4 text-right">Crédito (COP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fxResult.generatedLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                        {line.account_code}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {line.account_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">{line.third_party_name || 'Bancolombia'}</td>
                      <td className="py-2.5 px-4 text-slate-600">{line.concept}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {line.debit > 0 ? formatCOP(line.debit) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {line.credit > 0 ? formatCOP(line.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ContabilidadLayout>
  );
}
