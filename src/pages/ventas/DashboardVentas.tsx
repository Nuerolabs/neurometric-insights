import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Settings2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import { useVentas, ETIQUETAS_TIPO, COLORES_TIPO, TipoVenta } from '@/context/VentasContext';

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

function StatCard({
  icon: Icon, label, value, color, sub, to,
}: {
  icon: React.ElementType; label: string; value: string; color: string; sub?: string; to?: string;
}) {
  const inner = (
    <div className="pt-stat-card" style={{ borderLeftColor: color }}>
      <div className="pt-stat-icon" style={{ color }}>
        <Icon size={22} />
      </div>
      <div className="pt-stat-body">
        <p className="pt-stat-label">{label}</p>
        <p className="pt-stat-value">{value}</p>
        {sub && <p className="pt-stat-sub">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

function useLast7Days(ventas: ReturnType<typeof useVentas>['ventas']) {
  const days: { name: string; total: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
    const total = ventas
      .filter((v) => {
        const vd = new Date(v.fecha);
        return (
          v.estadoPago === 'pagado' &&
          vd.getFullYear() === d.getFullYear() &&
          vd.getMonth() === d.getMonth() &&
          vd.getDate() === d.getDate()
        );
      })
      .reduce((s, v) => s + v.total, 0);
    days.push({ name: label, total });
  }
  return days;
}

export default function DashboardVentas() {
  const { ventas, totalHoy, totalSemana, totalMes, totalPendiente, ventasHoy, ventasPorTipo, ventasPendientes, totalGastosMes } = useVentas();
  const barData = useLast7Days(ventas);

  const pieData = Object.entries(ventasPorTipo).map(([tipo, total]) => ({
    name: ETIQUETAS_TIPO[tipo as TipoVenta] ?? tipo,
    value: total,
    color: COLORES_TIPO[tipo as TipoVenta] ?? '#999',
  }));

  const recentSales = ventas.slice(0, 6);

  return (
    <VentasLayout>
      <div className="pt-page">
        {/* Header */}
        <div className="pt-page-header">
          <div>
            <h1 className="pt-page-title">Resumen General</h1>
            <p className="pt-page-desc">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/ventas/nueva" className="pt-cta-btn">
            <PlusCircle size={16} /> Nueva Venta
          </Link>
        </div>

        {/* Alertas pendientes */}
        {ventasPendientes.length > 0 && (
          <Link to="/ventas/pendientes" className="pt-alert-banner">
            <AlertTriangle size={16} />
            <span>
              Tienes <strong>{ventasPendientes.length}</strong> venta{ventasPendientes.length > 1 ? 's' : ''} pendiente{ventasPendientes.length > 1 ? 's' : ''} de cobro — Total: <strong>{formatCOP(totalPendiente)}</strong>
            </span>
            <span className="pt-alert-arrow">Ver →</span>
          </Link>
        )}

        {/* Stat cards */}
        <div className="pt-stats-grid">
          <StatCard icon={DollarSign} label="Cobrado Hoy" value={formatCOP(totalHoy)} color="#16a34a"
            sub={`${ventasHoy.filter(v => v.estadoPago === 'pagado').length} transacciones`} />
          <StatCard icon={TrendingUp} label="Esta Semana" value={formatCOP(totalSemana)} color="#2563eb" />
          <StatCard icon={Calendar} label="Ventas Mes" value={formatCOP(totalMes)} color="#7c3aed" />
          <StatCard icon={Receipt} label="Gastos Mes" value={formatCOP(totalGastosMes)} color="#ea580c" to="/ventas/gastos" />
          <StatCard icon={DollarSign} label="Utilidad Neta (Mes)" value={formatCOP(totalMes - totalGastosMes)} color="#0d9488" />
          <StatCard icon={Clock} label="Por Cobrar" value={formatCOP(totalPendiente)} color="#dc2626"
            sub={`${ventasPendientes.length} pendientes`} to="/ventas/pendientes" />
        </div>

        {/* Charts */}
        <div className="pt-charts-grid">
          <div className="pt-card">
            <h2 className="pt-card-title">Ingresos cobrados — últimos 7 días</h2>
            {ventas.length === 0 ? (
              <div className="pt-empty-chart">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCOP(v), 'Cobrado']}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 13 }} />
                  <Bar dataKey="total" fill="#2563eb" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-card">
            <h2 className="pt-card-title">Por tipo de servicio</h2>
            {pieData.length === 0 ? (
              <div className="pt-empty-chart">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>} />
                  <Tooltip formatter={(v: number) => [formatCOP(v), '']}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        </div>

        {/* Recent */}
        <div className="pt-card">
          <div className="pt-card-header">
            <h2 className="pt-card-title">Ventas recientes</h2>
            <Link to="/ventas/historial" className="pt-link">Ver historial completo →</Link>
          </div>
          {recentSales.length === 0 ? (
            <div className="pt-empty">
              <p>No hay ventas registradas aún</p>
              <Link to="/ventas/nueva" className="pt-cta-btn" style={{ marginTop: '0.75rem' }}>
                <PlusCircle size={15} /> Registrar primera venta
              </Link>
            </div>
          ) : (
            <div className="pt-table-wrap">
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Cant.</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((v) => (
                    <tr key={v.id}>
                      <td className="pt-cliente-cell">{v.cliente || '—'}</td>
                      <td>
                        <span className="pt-tipo-badge" style={{ background: `${COLORES_TIPO[v.tipo]}18`, color: COLORES_TIPO[v.tipo] }}>
                          {ETIQUETAS_TIPO[v.tipo]}
                        </span>
                      </td>
                      <td>{v.cantidad}</td>
                      <td className="pt-total-cell">{formatCOP(v.total)}</td>
                      <td>
                        {v.estadoPago === 'pagado' ? (
                          <span className="pt-estado pt-estado--pagado"><CheckCircle2 size={13} /> Pagado</span>
                        ) : (
                          <span className="pt-estado pt-estado--pendiente"><Clock size={13} /> Pendiente</span>
                        )}
                      </td>
                      <td className="pt-fecha-cell">
                        {new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </VentasLayout>
  );
}
