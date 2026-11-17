import React from 'react';
import { ContabilidadLayout } from '@/components/contabilidad/ContabilidadLayout';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
  Calendar,
  AlertCircle,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardContable() {
  const formatMoney = (val: number, currency: 'COP' | 'USD' = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(val);
  };

  return (
    <ContabilidadLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Panel Financiero & Contable NIIF
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Moneda funcional: <span className="font-semibold text-slate-700">COP</span> | Moneda de transacción operativa: <span className="font-semibold text-slate-700">USD (Cloud & APIs)</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/contabilidad/asientos"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              Nuevo Asiento Partida Doble
            </Link>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-900 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-800">
            <span className="font-bold">Periodo Contable Activo: Noviembre 2026 (Abierto)</span>
            <p className="mt-0.5 text-slate-600">
              Reglas de inmutabilidad y partida doble activas. Validación automática de Módulo 11 para NITs y causación NIIF habilitada.
            </p>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Flujo de Caja YTD</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">{formatMoney(402000000)}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +12.5% vs año anterior
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Margen Operativo</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">29.5%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Objetivo DIAN / NIIF: 30.0%
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Gasto Cloud USD (Mes)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">{formatMoney(3450, 'USD')}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                TRM Cierre: $4,180.50 COP
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Retenciones x Pagar</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">{formatMoney(8640000)}</p>
              <p className="text-xs text-amber-700 font-medium mt-1">
                Formulario 350 DIAN próximo
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-900" />
              Contabilidad Central
            </h3>
            <p className="text-xs text-slate-500">
              Gestión de comprobantes diarios con validación matemática de partida doble y catálogo estructurado del PUC.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/contabilidad/asientos"
                className="text-xs font-semibold text-slate-900 hover:text-slate-950 flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>Crear Comprobante Diario</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/contabilidad/reportes"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Balance de Prueba por Tercero</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-900" />
              Tesorería & Multimoneda
            </h3>
            <p className="text-xs text-slate-500">
              Control de recaudos de cartera, egresos de proveedores y liquidación automática de Diferencia en Cambio en USD.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/contabilidad/conciliacion"
                className="text-xs font-semibold text-slate-900 hover:text-slate-950 flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>Cruce de Facturas & Cálculo TRM</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/contabilidad/egresos"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Comprobantes de Egreso (Cloud/APIs)</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              Impuestos & DIAN
            </h3>
            <p className="text-xs text-slate-500">
              Motor tributario para Retefuente, ReteICA, certificados anuales y pre-validador oficial de Información Exógena.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/contabilidad/exogena"
                className="text-xs font-semibold text-slate-900 hover:text-slate-950 flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>Pre-validador Exógena (Formato 1001)</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/contabilidad/certificados"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Generar Certificados de Retención</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ContabilidadLayout>
  );
}
