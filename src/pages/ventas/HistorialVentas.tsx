import { useState, useMemo } from 'react';
import { Trash2, Filter, Search, TrendingUp } from 'lucide-react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import {
  useVentas,
  TipoVenta,
  ETIQUETAS_TIPO,
  COLORES_TIPO,
} from '@/context/VentasContext';

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

const TODOS = 'todos';

export default function HistorialVentas() {
  const { ventas, eliminarVenta } = useVentas();

  const [filtroTipo, setFiltroTipo] = useState<TipoVenta | 'todos'>(TODOS);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchTipo = filtroTipo === TODOS || v.tipo === filtroTipo;
      const matchBusqueda =
        !filtroBusqueda ||
        ETIQUETAS_TIPO[v.tipo].toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        v.notas.toLowerCase().includes(filtroBusqueda.toLowerCase());
      return matchTipo && matchBusqueda;
    });
  }, [ventas, filtroTipo, filtroBusqueda]);

  const totalFiltrado = ventasFiltradas.reduce((s, v) => s + v.total, 0);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      eliminarVenta(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3s
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Unique types present in current ventas
  const tiposPresentantes = Array.from(new Set(ventas.map((v) => v.tipo))) as TipoVenta[];

  return (
    <VentasLayout>
      <div className="ventas-page">
        <div className="ventas-page-header">
          <div>
            <h1 className="ventas-page-title">Historial de Ventas</h1>
            <p className="ventas-page-desc">
              {ventas.length} venta{ventas.length !== 1 ? 's' : ''} registrada
              {ventas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="ventas-total-badge">
            <TrendingUp size={16} />
            Total: {formatCOP(totalFiltrado)}
          </div>
        </div>

        {/* Filters */}
        <div className="ventas-filters">
          <div className="ventas-search-wrap">
            <Search size={15} className="ventas-search-icon" />
            <input
              type="text"
              placeholder="Buscar por tipo o notas…"
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="ventas-search-input"
            />
          </div>

          <div className="ventas-filter-chips">
            <Filter size={14} style={{ color: '#64748b' }} />
            <button
              className={`ventas-chip ${filtroTipo === TODOS ? 'ventas-chip--active' : ''}`}
              onClick={() => setFiltroTipo(TODOS)}
            >
              Todos
            </button>
            {tiposPresentantes.map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`ventas-chip ${filtroTipo === t ? 'ventas-chip--active' : ''}`}
                style={
                  filtroTipo === t
                    ? { background: `${COLORES_TIPO[t]}33`, color: COLORES_TIPO[t] }
                    : {}
                }
              >
                {ETIQUETAS_TIPO[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="ventas-chart-card">
          {ventasFiltradas.length === 0 ? (
            <div className="ventas-empty">
              <Search size={40} />
              <p>No hay ventas que coincidan con el filtro</p>
            </div>
          ) : (
            <div className="ventas-table-wrap">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>P. Unitario</th>
                    <th>Total</th>
                    <th>Fecha y Hora</th>
                    <th>Notas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((v, idx) => (
                    <tr key={v.id}>
                      <td className="ventas-row-num">{ventasFiltradas.length - idx}</td>
                      <td>
                        <span
                          className="ventas-badge"
                          style={{
                            background: `${COLORES_TIPO[v.tipo]}22`,
                            color: COLORES_TIPO[v.tipo],
                          }}
                        >
                          {ETIQUETAS_TIPO[v.tipo]}
                        </span>
                      </td>
                      <td>{v.cantidad}</td>
                      <td>{formatCOP(v.precioUnitario)}</td>
                      <td className="ventas-total-cell">{formatCOP(v.total)}</td>
                      <td className="ventas-date-cell">
                        {new Date(v.fecha).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <br />
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(v.fecha).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="ventas-notes-cell">{v.notas || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className={`ventas-delete-btn ${
                            deleteConfirm === v.id ? 'ventas-delete-btn--confirm' : ''
                          }`}
                          title={
                            deleteConfirm === v.id
                              ? 'Click para confirmar eliminación'
                              : 'Eliminar venta'
                          }
                        >
                          {deleteConfirm === v.id ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>¿Eliminar?</span>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="ventas-tfoot-label">
                      Total ({ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''})
                    </td>
                    <td className="ventas-total-cell ventas-tfoot-total">{formatCOP(totalFiltrado)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </VentasLayout>
  );
}
