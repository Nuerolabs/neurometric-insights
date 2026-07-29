import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { PRECIOS_SUGERIDOS } from '../../context/VentasContext';

export default function ProyeccionResma() {
  const [costoResma, setCostoResma] = useState<number>(18000); // Default 18k
  const [costoTintaEstimado, setCostoTintaEstimado] = useState<number>(5000); // Parte de la botella asignada a una resma
  const [hojasUtiles, setHojasUtiles] = useState<number>(480); // Restando 20 por daños/pruebas

  // Distribución de probabilidad de ventas
  const [pctColor, setPctColor] = useState<number>(10);
  const [pctBn, setPctBn] = useState<number>(50);
  const [pctCopias, setPctCopias] = useState<number>(40);

  // Totales de hojas por tipo
  const hojasColor = Math.round(hojasUtiles * (pctColor / 100));
  const hojasBn = Math.round(hojasUtiles * (pctBn / 100));
  const hojasCopias = Math.round(hojasUtiles * (pctCopias / 100));

  // Ingresos brutos estimados
  const ingresoColor = hojasColor * PRECIOS_SUGERIDOS.impresion_color;
  const ingresoBn = hojasBn * PRECIOS_SUGERIDOS.impresion_bn;
  const ingresoCopias = hojasCopias * PRECIOS_SUGERIDOS.copia;
  
  const ingresoTotal = ingresoColor + ingresoBn + ingresoCopias;
  const costosTotales = costoResma + costoTintaEstimado;
  const gananciaNeta = ingresoTotal - costosTotales;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="pt-card">
      <div className="pt-card-header">
        <Calculator className="pt-card-icon" style={{ color: '#2563eb' }} />
        <h3>Proyección por Resma (500 Hojas)</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '1rem' }}>
        {/* Costos e Insumos */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px', color: '#334155' }}>Costos de Insumos</h4>
          <div className="pt-form-group">
            <label>Costo de la Resma (COP)</label>
            <input 
              type="number" 
              className="pt-input"
              value={costoResma}
              onChange={(e) => setCostoResma(Number(e.target.value))}
            />
          </div>
          <div className="pt-form-group">
            <label>Costo de Tinta por Resma (Estimado COP)</label>
            <input 
              type="number" 
              className="pt-input"
              value={costoTintaEstimado}
              onChange={(e) => setCostoTintaEstimado(Number(e.target.value))}
            />
          </div>
          <div className="pt-form-group">
            <label>Hojas Útiles (descontando daños)</label>
            <input 
              type="number" 
              className="pt-input"
              value={hojasUtiles}
              onChange={(e) => setHojasUtiles(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Probabilidad de Venta */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px', color: '#334155' }}>Distribución de Ventas (%)</h4>
          <div className="pt-form-group">
            <label>Color (Baja prob. - {formatMoney(PRECIOS_SUGERIDOS.impresion_color)} c/u)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={pctColor}
              onChange={(e) => setPctColor(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{pctColor}% ({hojasColor} hojas)</span>
          </div>
          <div className="pt-form-group">
            <label>B/N ({formatMoney(PRECIOS_SUGERIDOS.impresion_bn)} c/u)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={pctBn}
              onChange={(e) => setPctBn(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{pctBn}% ({hojasBn} hojas)</span>
          </div>
          <div className="pt-form-group">
            <label>Copias ({formatMoney(PRECIOS_SUGERIDOS.copia)} c/u)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={pctCopias}
              onChange={(e) => setPctCopias(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{pctCopias}% ({hojasCopias} hojas)</span>
          </div>
          {pctColor + pctBn + pctCopias !== 100 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>La suma debe dar 100% (Actual: {pctColor + pctBn + pctCopias}%)</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ color: '#1e3a8a', marginBottom: '15px', textAlign: 'center' }}>Resultados Esperados por Resma</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '4px' }}>Ingreso Bruto</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatMoney(ingresoTotal)}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '4px' }}>Costo (Resma + Tinta)</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>-{formatMoney(costosTotales)}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '4px' }}>Utilidad Neta</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{formatMoney(gananciaNeta)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
