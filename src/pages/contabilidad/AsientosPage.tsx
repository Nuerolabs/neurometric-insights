import React, { useState } from 'react';
import { ContabilidadLayout } from '@/components/contabilidad/ContabilidadLayout';
import { PUC_COLOMBIA_SEED } from '@/services/contabilidad/pucCatalog';
import { JournalEntryLine } from '@/services/contabilidad/types';
import { validateDoubleEntry } from '@/services/contabilidad/validationService';
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Calendar,
  Building,
} from 'lucide-react';

export default function AsientosPage() {
  const [consecutive, setConsecutive] = useState('CC-2026-0012');
  const [entryDate, setEntryDate] = useState('2026-11-16');
  const [description, setDescription] = useState(
    'Causación mensual de suscripción Cloud OpenAI API & Hosting Vercel'
  );

  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      account_id: 'puc-513515',
      account_code: '513515',
      account_name: 'Servicios de Computación en la Nube, Servidores y APIs',
      concept: 'Consumo APIs OpenAI y hosting Vercel',
      debit: 14422725,
      credit: 0,
      currency: 'USD',
      exchange_rate: 4180.5,
      debit_foreign: 3450,
      cost_center_id: 'CC-INFRA-CLOUD',
      cost_center_name: 'Infraestructura Cloud / AI',
      third_party_name: 'OpenAI LLC / Vercel Inc.',
    },
    {
      account_id: 'puc-220510',
      account_code: '220510',
      account_name: 'Proveedores del Exterior (USD - Cloud / APIs / Hosting)',
      concept: 'Cuenta por pagar proveedor exterior OpenAI',
      debit: 0,
      credit: 14422725,
      currency: 'USD',
      exchange_rate: 4180.5,
      credit_foreign: 3450,
      third_party_name: 'OpenAI LLC',
    },
  ]);

  const [newLine, setNewLine] = useState<Partial<JournalEntryLine>>({
    account_code: '111005',
    debit: 0,
    credit: 0,
    currency: 'COP',
    exchange_rate: 1.0,
    concept: '',
  });

  const validation = validateDoubleEntry(lines);

  const handleAddLine = () => {
    if (!newLine.account_code) return;
    const account = PUC_COLOMBIA_SEED.find((a) => a.code === newLine.account_code);

    const line: JournalEntryLine = {
      account_id: account?.id || 'puc-generic',
      account_code: newLine.account_code,
      account_name: account?.name || 'Cuenta General',
      concept: newLine.concept || description,
      debit: Number(newLine.debit) || 0,
      credit: Number(newLine.credit) || 0,
      currency: newLine.currency || 'COP',
      exchange_rate: Number(newLine.exchange_rate) || 1.0,
      third_party_name: newLine.third_party_name || '',
      cost_center_name: newLine.cost_center_name || '',
    };

    setLines([...lines, line]);
    setNewLine({
      account_code: '111005',
      debit: 0,
      credit: 0,
      currency: 'COP',
      exchange_rate: 1.0,
      concept: '',
    });
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handlePostEntry = () => {
    if (!validation.isValid) {
      alert('Error de Partida Doble: No es posible contabilizar.');
      return;
    }
    alert(
      `¡Comprobante ${consecutive} Contabilizado con éxito bajo NIIF! Saldo exacto: $${validation.totalDebit.toLocaleString(
        'es-CO'
      )} COP.`
    );
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <ContabilidadLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-slate-900" />
              Comprobante de Diario & Partida Doble
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Registro inmutable de asientos contables conforme a NIIF. Débitos deben igualar Créditos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePostEntry}
              disabled={!validation.isValid}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
                validation.isValid
                  ? 'bg-slate-950 hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Contabilizar Asiento (POSTED)
            </button>
          </div>
        </div>

        {/* Validation Status Indicator */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            validation.isValid
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {validation.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">
                {validation.isValid
                  ? 'Principio de Partida Doble Cumplido'
                  : 'Desbalance en Partida Doble'}
              </p>
              <p className="text-[11px] opacity-80">
                {validation.isValid
                  ? `Suma Débitos ($${formatCOP(validation.totalDebit)}) = Suma Créditos ($${formatCOP(
                      validation.totalCredit
                    )}). Listo para asentar.`
                  : `Existe una diferencia de ${formatCOP(validation.difference)}. Débitos y Créditos deben ser exactamente iguales.`}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                validation.isValid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {validation.isValid ? 'BALANCEADO' : 'DESCUADRADO'}
            </span>
          </div>
        </div>

        {/* Entry Metadata Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Consecutivo Contable
            </label>
            <input
              type="text"
              value={consecutive}
              onChange={(e) => setConsecutive(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Fecha de Causación (Periodo Abierto)
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Concepto General / Glosa
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
            />
          </div>
        </div>

        {/* Lines Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Líneas del Asiento Contable
            </h2>
            <span className="text-xs text-slate-400">{lines.length} líneas registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Cuenta PUC</th>
                  <th className="py-3 px-4">Tercero / Centro Costos</th>
                  <th className="py-3 px-4">Detalle / Concepto</th>
                  <th className="py-3 px-4 text-right">Débito (COP)</th>
                  <th className="py-3 px-4 text-right">Crédito (COP)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{line.account_code}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{line.account_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{line.third_party_name || '—'}</p>
                      {line.cost_center_name && (
                        <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium mt-0.5">
                          {line.cost_center_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{line.concept}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {line.debit > 0 ? formatCOP(line.debit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {line.credit > 0 ? formatCOP(line.credit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right uppercase text-[11px] text-slate-500">
                    Totales Balanceados:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">
                    {formatCOP(validation.totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">
                    {formatCOP(validation.totalCredit)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add Line Form Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <select
                value={newLine.account_code}
                onChange={(e) => setNewLine({ ...newLine, account_code: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {PUC_COLOMBIA_SEED.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Tercero"
                value={newLine.third_party_name || ''}
                onChange={(e) => setNewLine({ ...newLine, third_party_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Débito"
                value={newLine.debit || ''}
                onChange={(e) => setNewLine({ ...newLine, debit: Number(e.target.value), credit: 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-mono"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Crédito"
                value={newLine.credit || ''}
                onChange={(e) => setNewLine({ ...newLine, credit: Number(e.target.value), debit: 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-mono"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddLine}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                Agregar Línea
              </button>
            </div>
          </div>
        </div>
      </div>
    </ContabilidadLayout>
  );
}
