import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, PlusCircle, ChevronDown, User as UserIcon } from 'lucide-react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import { useVentas, TipoVenta, PRECIOS_SUGERIDOS, ETIQUETAS_TIPO, EstadoPago } from '@/context/VentasContext';

const TIPOS_LISTA: TipoVenta[] = [
  'impresion_bn', 'impresion_color', 'copia', 'copia_cantidad',
  'escaneado', 'encuadernado', 'trabajo_especial', 'otro',
];

const HINTS: Partial<Record<TipoVenta, string>> = {
  impresion_bn: 'Precio estándar $700 por hoja',
  impresion_color: 'Precio estándar $1.300 por hoja',
  copia: 'Precio estándar $400 por copia',
  copia_cantidad: 'Por cantidad — chips rápidos abajo o escribe el precio',
  trabajo_especial: 'Escribe manualmente el valor cobrado (ej. $18.000)',
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
  const [cliente, setCliente] = useState('');
  const [estadoPago, setEstadoPago] = useState<EstadoPago>('pagado');
  const [success, setSuccess] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);

  useEffect(() => {
    setPrecioUnitario(PRECIOS_SUGERIDOS[tipo]);
  }, [tipo]);

  const total = cantidad * precioUnitario;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad <= 0 || precioUnitario < 0) return;
    agregarVenta({ tipo, cantidad, precioUnitario, notas, cliente, estadoPago });
    setLastTotal(total);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCliente('');
      setNotas('');
      setCantidad(1);
      setEstadoPago('pagado');
    }, 2000);
  };

  if (success) {
    return (
      <VentasLayout>
        <div className="pt-page">
          <div className="pt-success-card">
            <CheckCircle2 size={52} className="pt-success-icon" />
            <h2 className="pt-success-title">
              {estadoPago === 'pagado' ? '¡Venta Registrada!' : '¡Registrado como Pendiente!'}
            </h2>
            <p className="pt-success-amount">{formatCOP(lastTotal)}</p>
            <p className="pt-success-sub">
              {cliente && <><strong>{cliente}</strong> · </>}
              {cantidad} × {ETIQUETAS_TIPO[tipo]}
              {estadoPago === 'pendiente' && <span className="pt-success-pending"> · Por cobrar</span>}
            </p>
            <div className="pt-success-actions">
              <button onClick={() => setSuccess(false)} className="pt-cta-btn">
                <PlusCircle size={15} /> Registrar otra
              </button>
              <button onClick={() => navigate('/ventas')} className="pt-cta-btn pt-cta-btn--outline">
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
      <div className="pt-page">
        <div className="pt-page-header">
          <div>
            <h1 className="pt-page-title">Registrar Venta</h1>
            <p className="pt-page-desc">Ingresa los datos del servicio prestado</p>
          </div>
        </div>

        <div className="pt-form-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} className="pt-form-card">

            {/* Cliente */}
            <div className="pt-form-group">
              <label htmlFor="venta-cliente" className="pt-label">Nombre del cliente (opcional)</label>
              <div className="pt-input-wrap">
                <UserIcon size={15} className="pt-input-icon" />
                <input
                  id="venta-cliente"
                  type="text"
                  placeholder="Ej: María López"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="pt-input"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="pt-form-group">
              <label htmlFor="venta-tipo" className="pt-label">Tipo de servicio</label>
              <div className="pt-select-wrap">
                <select
                  id="venta-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoVenta)}
                  className="pt-select"
                >
                  {TIPOS_LISTA.map((t) => (
                    <option key={t} value={t}>{ETIQUETAS_TIPO[t]}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="pt-select-icon" />
              </div>
              {HINTS[tipo] && <p className="pt-hint">{HINTS[tipo]}</p>}
            </div>

            {/* Cantidad + precio row */}
            <div className="pt-form-row">
              <div className="pt-form-group">
                <label htmlFor="venta-cantidad" className="pt-label">Cantidad</label>
                <input
                  id="venta-cantidad"
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="pt-input pt-input--bare"
                />
              </div>
              <div className="pt-form-group">
                <label htmlFor="venta-precio" className="pt-label">Precio unitario</label>
                <div className="pt-price-wrap">
                  <span className="pt-price-prefix">$</span>
                  <input
                    id="venta-precio"
                    type="number"
                    min={0}
                    step={50}
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(Math.max(0, parseInt(e.target.value) || 0))}
                    className="pt-input pt-input--price"
                  />
                </div>
                {tipo === 'copia_cantidad' && (
                  <div className="pt-chips-row">
                    {[400, 500, 600].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrecioUnitario(p)}
                        className={`pt-chip ${precioUnitario === p ? 'pt-chip--active' : ''}`}
                      >
                        ${p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estado de pago */}
            <div className="pt-form-group">
              <label className="pt-label">Estado del pago</label>
              <div className="pt-pago-options">
                <label className={`pt-pago-opt ${estadoPago === 'pagado' ? 'pt-pago-opt--active' : ''}`}>
                  <input
                    type="radio"
                    name="estadoPago"
                    value="pagado"
                    checked={estadoPago === 'pagado'}
                    onChange={() => setEstadoPago('pagado')}
                  />
                  <CheckCircle2 size={16} />
                  <span>Pagado</span>
                </label>
                <label className={`pt-pago-opt pt-pago-opt--pending ${estadoPago === 'pendiente' ? 'pt-pago-opt--active-pending' : ''}`}>
                  <input
                    type="radio"
                    name="estadoPago"
                    value="pendiente"
                    checked={estadoPago === 'pendiente'}
                    onChange={() => setEstadoPago('pendiente')}
                  />
                  <span>⏳</span>
                  <span>Queda pendiente (fía)</span>
                </label>
              </div>
            </div>

            {/* Notas */}
            <div className="pt-form-group">
              <label htmlFor="venta-notas" className="pt-label">Notas (opcional)</label>
              <textarea
                id="venta-notas"
                rows={2}
                placeholder="Ej: tesis doble cara, trae USB..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="pt-textarea"
              />
            </div>

            <button type="submit" className="pt-submit-btn">
              <PlusCircle size={17} /> Registrar Venta
            </button>
          </form>

          {/* Live preview */}
          <div className="pt-preview-card">
            <p className="pt-preview-label">Vista previa</p>
            <div className="pt-preview-rows">
              <div className="pt-preview-row">
                <span>Cliente</span>
                <strong>{cliente || '—'}</strong>
              </div>
              <div className="pt-preview-row">
                <span>Servicio</span>
                <strong>{ETIQUETAS_TIPO[tipo]}</strong>
              </div>
              <div className="pt-preview-row">
                <span>Cantidad</span>
                <strong>{cantidad}</strong>
              </div>
              <div className="pt-preview-row">
                <span>Precio c/u</span>
                <strong>{formatCOP(precioUnitario)}</strong>
              </div>
              <div className="pt-preview-divider" />
              <div className="pt-preview-row pt-preview-total">
                <span>TOTAL</span>
                <strong>{formatCOP(total)}</strong>
              </div>
              <div className="pt-preview-row">
                <span>Estado</span>
                <strong style={{ color: estadoPago === 'pagado' ? '#16a34a' : '#dc2626' }}>
                  {estadoPago === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                </strong>
              </div>
            </div>
            {notas && <p className="pt-preview-notes">📝 {notas}</p>}
          </div>
        </div>
      </div>
    </VentasLayout>
  );
}
