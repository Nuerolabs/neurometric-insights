import { useState, useMemo } from 'react';
import { Trash2, Search, Filter, Download, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import { useVentas, TipoVenta, ETIQUETAS_TIPO, COLORES_TIPO, Venta } from '@/context/VentasContext';

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

/** Export to CSV that Excel opens perfectly */
function exportToExcel(ventas: Venta[]) {
  const headers = ['#', 'Cliente', 'Tipo', 'Cantidad', 'Precio Unitario', 'Total', 'Estado', 'Fecha', 'Hora', 'Notas'];
  const rows = ventas.map((v, i) => {
    const d = new Date(v.fecha);
    return [
      ventas.length - i,
      v.cliente || '',
      ETIQUETAS_TIPO[v.tipo],
      v.cantidad,
      v.precioUnitario,
      v.total,
      v.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente',
      d.toLocaleDateString('es-CO'),
      d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      v.notas,
    ];
  });

  // BOM for Excel to detect UTF-8
  const BOM = '\uFEFF';
  const csv =
    BOM +
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
      )
      .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
  a.download = `ventas_impresora_${fecha}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const TODOS = 'todos';
const TODO_ESTADO = 'todos';

export default function HistorialVentas() {
  const { ventas, eliminarVenta } = useVentas();

  const [filtroTipo, setFiltroTipo] = useState<TipoVenta | 'todos'>(TODOS);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pagado' | 'pendiente'>(TODO_ESTADO);
  const [busqueda, setBusqueda] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchTipo = filtroTipo === TODOS || v.tipo === filtroTipo;
      const matchEstado = filtroEstado === TODO_ESTADO || v.estadoPago === filtroEstado;
      const matchBusqueda =
        !busqueda ||
        ETIQUETAS_TIPO[v.tipo].toLowerCase().includes(busqueda.toLowerCase()) ||
        v.notas.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.cliente.toLowerCase().includes(busqueda.toLowerCase());
      return matchTipo && matchEstado && matchBusqueda;
    });
  }, [ventas, filtroTipo, filtroEstado, busqueda]);

  const totalFiltrado = ventasFiltradas.reduce((s, v) => s + v.total, 0);
  const totalCobrado = ventasFiltradas.filter(v => v.estadoPago === 'pagado').reduce((s, v) => s + v.total, 0);

  const tiposPresentes = Array.from(new Set(ventas.map((v) => v.tipo))) as TipoVenta[];

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      eliminarVenta(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <VentasLayout>
      <div className="pt-page">
        {/* Header */}
        <div className="pt-page-header">
          <div>
            <h1 className="pt-page-title">Historial de Ventas</h1>
            <p className="pt-page-desc">
              {ventas.length} registros en total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div className="pt-total-badge">
              <TrendingUp size={14} /> Cobrado: {formatCOP(totalCobrado)}
            </div>
            <button
              className="pt-export-btn"
              onClick={() => exportToExcel(ventasFiltradas)}
              title="Descargar como Excel/CSV"
            >
              <Download size={15} /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-filters">
          <div className="pt-search-wrap">
            <Search size={14} className="pt-search-icon" />
            <input
              type="text"
              placeholder="Buscar cliente, tipo, notas…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pt-search-input"
            />
          </div>

          <div className="pt-filter-row">
            <Filter size={13} style={{ color: '#94a3b8' }} />
            {/* Estado filter */}
            <button className={`pt-chip ${filtroEstado === TODO_ESTADO ? 'pt-chip--active' : ''}`} onClick={() => setFiltroEstado(TODO_ESTADO)}>Todos</button>
            <button className={`pt-chip ${filtroEstado === 'pagado' ? 'pt-chip--active' : ''}`} onClick={() => setFiltroEstado('pagado')}>Pagados</button>
            <button className={`pt-chip ${filtroEstado === 'pendiente' ? 'pt-chip--active-pending' : ''}`} onClick={() => setFiltroEstado('pendiente')}>Pendientes</button>
            <span className="pt-filter-divider" />
            {/* Tipo filter */}
            <button className={`pt-chip ${filtroTipo === TODOS ? 'pt-chip--active' : ''}`} onClick={() => setFiltroTipo(TODOS)}>Todos los tipos</button>
            {tiposPresentes.map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`pt-chip ${filtroTipo === t ? 'pt-chip--active' : ''}`}
              >
                {ETIQUETAS_TIPO[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="pt-card">
          {ventasFiltradas.length === 0 ? (
            <div className="pt-empty">
              <Search size={36} />
              <p>No hay ventas con esos filtros</p>
            </div>
          ) : (
            <div className="pt-table-wrap">
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Cant.</th>
                    <th>P. Unit.</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Notas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((v, idx) => (
                    <tr key={v.id} className={v.estadoPago === 'pendiente' ? 'pt-row-pending' : ''}>
                      <td className="pt-row-num">{ventasFiltradas.length - idx}</td>
                      <td className="pt-cliente-cell">{v.cliente || '—'}</td>
                      <td>
                        <span
                          className="pt-tipo-badge"
                          style={{ background: `${COLORES_TIPO[v.tipo]}18`, color: COLORES_TIPO[v.tipo] }}
                        >
                          {ETIQUETAS_TIPO[v.tipo]}
                        </span>
                      </td>
                      <td>{v.cantidad}</td>
                      <td>{formatCOP(v.precioUnitario)}</td>
                      <td className="pt-total-cell">{formatCOP(v.total)}</td>
                      <td>
                        {v.estadoPago === 'pagado' ? (
                          <span className="pt-estado pt-estado--pagado"><CheckCircle2 size={12} /> Pagado</span>
                        ) : (
                          <span className="pt-estado pt-estado--pendiente"><Clock size={12} /> Pendiente</span>
                        )}
                      </td>
                      <td className="pt-fecha-cell">
                        {new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="pt-notas-cell">{v.notas || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className={`pt-delete-btn ${deleteConfirm === v.id ? 'pt-delete-btn--confirm' : ''}`}
                        >
                          {deleteConfirm === v.id ? <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>¿Borrar?</span> : <Trash2 size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="pt-tfoot-label">
                      Total ({ventasFiltradas.length} ventas)
                    </td>
                    <td className="pt-total-cell pt-tfoot-total">{formatCOP(totalFiltrado)}</td>
                    <td colSpan={4} />
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
