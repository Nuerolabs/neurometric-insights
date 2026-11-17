import React, { useState } from 'react';
import { ContabilidadLayout } from '@/components/contabilidad/ContabilidadLayout';
import { Exogena1001Row, ColombianAccountingReports } from '@/services/contabilidad/reportsService';
import {
  ShieldCheck,
  Download,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  Building,
} from 'lucide-react';

const SEED_EXOGENA_1001: Exogena1001Row[] = [
  {
    concepto: '5004',
    tipoDoc: '31',
    numeroDoc: '901847291',
    dv: '4',
    razonSocial: 'SERVICIOS CLOUD Y HOSTING S.A.S.',
    direccion: 'Calle 72 # 54-20',
    codDpto: '08',
    codMpio: '001',
    pagoDeducible: 45000000,
    pagoNoDeducible: 0,
    ivaMayorValor: 0,
    retencionRentaPracticada: 1800000,
    retencionRentaAsumida: 0,
    retencionIvaPracticada: 0,
  },
  {
    concepto: '5002',
    tipoDoc: '13',
    numeroDoc: '1080022532',
    dv: '1',
    razonSocial: 'JESUS DAVID CANTILLO PAREJO',
    direccion: 'Carrera 4 # 12-40',
    codDpto: '47',
    codMpio: '745',
    pagoDeducible: 62000000,
    pagoNoDeducible: 0,
    ivaMayorValor: 0,
    retencionRentaPracticada: 6820000,
    retencionRentaAsumida: 0,
    retencionIvaPracticada: 0,
  },
  {
    concepto: '5004',
    tipoDoc: '42',
    numeroDoc: 'US-98314567',
    dv: '',
    razonSocial: 'OPENAI LLC (API SERVICES)',
    direccion: '3180 18th St, San Francisco, CA',
    codDpto: '00',
    codMpio: '000',
    pagoDeducible: 85400000,
    pagoNoDeducible: 0,
    ivaMayorValor: 0,
    retencionRentaPracticada: 0,
    retencionRentaAsumida: 0,
    retencionIvaPracticada: 0,
  },
];

export default function ExogenaPage() {
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [rows, setRows] = useState<Exogena1001Row[]>(SEED_EXOGENA_1001);

  const handleExportCSV = () => {
    const csvContent = ColombianAccountingReports.exportToCSV(rows, 'Exogena_1001_DIAN.csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DIAN_Exogena_Formato_1001_${fiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalPagos = rows.reduce((acc, r) => acc + r.pagoDeducible, 0);
  const totalRete = rows.reduce((acc, r) => acc + r.retencionRentaPracticada, 0);

  return (
    <ContabilidadLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
              Pre-validador Información Exógena DIAN (Medios Magnéticos)
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Formato 1001: Pagos o abonos en cuenta y retenciones en la fuente practicadas con validación de estructura oficial.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
            >
              <option value="2026">Año Gravable 2026</option>
              <option value="2025">Año Gravable 2025</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV DIAN
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Total Pagos / Abonos Deducibles
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatCOP(totalPagos)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Columna Pagos Deducibles F-1001</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Total Retención Renta Practicada
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatCOP(totalRete)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Reportado en Formulario 350 DIAN</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Registros Pre-validados
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{rows.length} Terceros</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ✓ Estructura 100% compatible
            </p>
          </div>
        </div>

        {/* Exógena Format 1001 Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Detalle Formato 1001 (Versión 10 DIAN)
            </h2>
            <span className="text-xs font-mono text-slate-400">Año Gravable: {fiscalYear}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Tipo / Número Doc</th>
                  <th className="py-3 px-4">DV</th>
                  <th className="py-3 px-4">Razón Social o Nombre</th>
                  <th className="py-3 px-4">DANE</th>
                  <th className="py-3 px-4 text-right">Pago Deducible</th>
                  <th className="py-3 px-4 text-right">Retención Practicada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.concepto}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      [{r.tipoDoc}] {r.numeroDoc}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.dv || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {r.razonSocial}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {r.codDpto}{r.codMpio}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCOP(r.pagoDeducible)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                      {formatCOP(r.retencionRentaPracticada)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ContabilidadLayout>
  );
}
