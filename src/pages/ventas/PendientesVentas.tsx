import { Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import { useVentas, ETIQUETAS_TIPO, COLORES_TIPO } from '@/context/VentasContext';
import { useState } from 'react';

function formatCOP(v: number) {
  return `$${v.toLocaleString('es-CO')}`;
}

export default function PendientesVentas() {
  const { ventasPendientes, marcarPagado, eliminarVenta, totalPendiente } = useVentas();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
        <div className="pt-page-header">
          <div>
            <h1 className="pt-page-title">Cobros Pendientes</h1>
            <p className="pt-page-desc">
              {ventasPendientes.length} venta{ventasPendientes.length !== 1 ? 's' : ''} por cobrar
            </p>
          </div>
          {ventasPendientes.length > 0 && (
            <div className="pt-pending-total">
              <Clock size={15} />
              Por cobrar: <strong>{formatCOP(totalPendiente)}</strong>
            </div>
          )}
        </div>

        <div className="pt-card">
          {ventasPendientes.length === 0 ? (
            <div className="pt-empty">
              <CheckCircle2 size={48} style={{ color: '#16a34a' }} />
              <p style={{ color: '#16a34a', fontWeight: 600 }}>¡Todo cobrado! Sin pendientes.</p>
            </div>
          ) : (
            <div className="pt-table-wrap">
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Cant.</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPendientes.map((v) => (
                    <tr key={v.id} className="pt-row-pending">
                      <td className="pt-cliente-cell">
                        <strong>{v.cliente || 'Sin nombre'}</strong>
                      </td>
                      <td>
                        <span
                          className="pt-tipo-badge"
                          style={{ background: `${COLORES_TIPO[v.tipo]}18`, color: COLORES_TIPO[v.tipo] }}
                        >
                          {ETIQUETAS_TIPO[v.tipo]}
                        </span>
                      </td>
                      <td>{v.cantidad}</td>
                      <td className="pt-total-cell">{formatCOP(v.total)}</td>
                      <td className="pt-fecha-cell">
                        {new Date(v.fecha).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="pt-notas-cell">{v.notas || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => marcarPagado(v.id)}
                            className="pt-btn-pagado"
                            title="Marcar como pagado"
                          >
                            <CheckCircle2 size={14} /> Cobrado
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className={`pt-delete-btn ${deleteConfirm === v.id ? 'pt-delete-btn--confirm' : ''}`}
                            title={deleteConfirm === v.id ? 'Confirmar eliminación' : 'Eliminar'}
                          >
                            {deleteConfirm === v.id ? '¿Borrar?' : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-tfoot-label">Total pendiente</td>
                    <td className="pt-total-cell pt-tfoot-total">{formatCOP(totalPendiente)}</td>
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
