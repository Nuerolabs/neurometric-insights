import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, PlusCircle, ChevronDown } from 'lucide-react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import {
  useVentas,
  TipoVenta,
  PRECIOS_SUGERIDOS,
  ETIQUETAS_TIPO,
  COLORES_TIPO,
} from '@/context/VentasContext';

const TIPOS_LISTA: TipoVenta[] = [
  'impresion_bn',
  'impresion_color',
  'copia',
  'copia_cantidad',
  'escaneado',
  'encuadernado',
  'otro',
];

const NOTAS_TIPO: Partial<Record<TipoVenta, string>> = {
  impresion_bn: 'Precio estándar $700 por hoja',
  impresion_color: 'Precio estándar $1.300 por hoja',
  copia: 'Precio estándar $400 por copia',
  copia_cantidad: 'Por cantidad — mín. $400. Ajusta el precio según el volumen.',
};

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

export default function NuevaVenta() {
  const { agregarVenta } = useVentas();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<TipoVenta>('impresion_bn');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(PRECIOS_SUGERIDOS['impresion_bn']);
  const [notas, setNotas] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-set suggested price when type changes
  useEffect(() => {
    setPrecioUnitario(PRECIOS_SUGERIDOS[tipo]);
  }, [tipo]);

  const total = cantidad * precioUnitario;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad <= 0 || precioUnitario < 0) return;
    agregarVenta({ tipo, cantidad, precioUnitario, notas });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      // Reset form
      setTipo('impresion_bn');
      setCantidad(1);
      setNotas('');
    }, 1800);
  };

  const handleNuevaOtra = () => {
    setSuccess(false);
    setTipo('impresion_bn');
    setCantidad(1);
    setNotas('');
  };

  if (success) {
    return (
      <VentasLayout>
        <div className="ventas-page">
          <div className="ventas-success-card">
            <div className="ventas-success-icon">
              <CheckCircle size={56} />
            </div>
            <h2 className="ventas-success-title">¡Venta Registrada!</h2>
            <p className="ventas-success-amount">{formatCOP(total)}</p>
            <p className="ventas-success-sub">
              {cantidad} × {ETIQUETAS_TIPO[tipo]} &rarr; {formatCOP(precioUnitario)} c/u
            </p>
            <div className="ventas-success-actions">
              <button onClick={handleNuevaOtra} className="ventas-cta-btn">
                <PlusCircle size={16} /> Registrar otra
              </button>
              <button
                onClick={() => navigate('/ventas')}
                className="ventas-cta-btn ventas-cta-btn--ghost"
              >
                Ver Dashboard
              </button>
            </div>
          </div>
        </div>
      </VentasLayout>
    );
  }

  return (
    <VentasLayout>
      <div className="ventas-page">
        <div className="ventas-page-header">
          <div>
            <h1 className="ventas-page-title">Nueva Venta</h1>
            <p className="ventas-page-desc">Registra un ingreso por servicio de impresora</p>
          </div>
        </div>

        <div className="ventas-form-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} className="ventas-form-card">
            {/* Tipo de servicio */}
            <div className="ventas-form-group">
              <label htmlFor="venta-tipo" className="ventas-label">
                Tipo de Servicio
              </label>
              <div className="ventas-select-wrap">
                <select
                  id="venta-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoVenta)}
                  className="ventas-select"
                >
                  {TIPOS_LISTA.map((t) => (
                    <option key={t} value={t}>
                      {ETIQUETAS_TIPO[t]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="ventas-select-icon" />
              </div>
              {NOTAS_TIPO[tipo] && (
                <p className="ventas-hint">{NOTAS_TIPO[tipo]}</p>
              )}
            </div>

            {/* Cantidad */}
            <div className="ventas-form-group">
              <label htmlFor="venta-cantidad" className="ventas-label">
                Cantidad
              </label>
              <input
                id="venta-cantidad"
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="ventas-input ventas-input--standalone"
              />
            </div>

            {/* Precio unitario */}
            <div className="ventas-form-group">
              <label htmlFor="venta-precio" className="ventas-label">
                Precio Unitario (COP)
              </label>
              <div className="ventas-price-input-wrap">
                <span className="ventas-price-prefix">$</span>
                <input
                  id="venta-precio"
                  type="number"
                  min={0}
                  step={50}
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(Math.max(0, parseInt(e.target.value) || 0))}
                  className="ventas-input ventas-input--price"
                />
              </div>
              {tipo === 'copia_cantidad' && (
                <div className="ventas-price-chips">
                  {[400, 500, 600].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrecioUnitario(p)}
                      className={`ventas-chip ${precioUnitario === p ? 'ventas-chip--active' : ''}`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="ventas-form-group">
              <label htmlFor="venta-notas" className="ventas-label">
                Notas (opcional)
              </label>
              <textarea
                id="venta-notas"
                rows={2}
                placeholder="Ej: cliente habitual, tesis, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="ventas-textarea"
              />
            </div>

            <button type="submit" className="ventas-submit-btn">
              <PlusCircle size={18} />
              Registrar Venta
            </button>
          </form>

          {/* Live preview */}
          <div className="ventas-preview-card">
            <h3 className="ventas-preview-title">Resumen</h3>

            <div
              className="ventas-preview-badge"
              style={{
                background: `${COLORES_TIPO[tipo]}22`,
                color: COLORES_TIPO[tipo],
                borderColor: `${COLORES_TIPO[tipo]}44`,
              }}
            >
              {ETIQUETAS_TIPO[tipo]}
            </div>

            <div className="ventas-preview-rows">
              <div className="ventas-preview-row">
                <span>Cantidad</span>
                <strong>{cantidad}</strong>
              </div>
              <div className="ventas-preview-row">
                <span>Precio unitario</span>
                <strong>{formatCOP(precioUnitario)}</strong>
              </div>
              <div className="ventas-preview-divider" />
              <div className="ventas-preview-row ventas-preview-row--total">
                <span>TOTAL</span>
                <strong>{formatCOP(total)}</strong>
              </div>
            </div>

            {notas && (
              <p className="ventas-preview-notes">
                <em>📝 {notas}</em>
              </p>
            )}
          </div>
        </div>
      </div>
    </VentasLayout>
  );
}
