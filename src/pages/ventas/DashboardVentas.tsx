import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Printer,
  Calendar,
  PlusCircle,
  ShoppingCart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import {
  useVentas,
  ETIQUETAS_TIPO,
  COLORES_TIPO,
  TipoVenta,
} from '@/context/VentasContext';

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="ventas-stat-card">
      <div className="ventas-stat-icon" style={{ background: `${color}22`, color }}>
        <Icon size={20} />
      </div>
      <div className="ventas-stat-body">
        <p className="ventas-stat-label">{label}</p>
        <p className="ventas-stat-value">{value}</p>
        {sub && <p className="ventas-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

// Build last 7 days bar chart data
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
  const { ventas, totalHoy, totalSemana, totalMes, ventasHoy, ventasPorTipo } = useVentas();

  const barData = useLast7Days(ventas);

  // Pie data
  const pieData = Object.entries(ventasPorTipo).map(([tipo, total]) => ({
    name: ETIQUETAS_TIPO[tipo as TipoVenta] ?? tipo,
    value: total,
    color: COLORES_TIPO[tipo as TipoVenta] ?? '#999',
  }));

  const recentSales = ventas.slice(0, 5);

  return (
    <VentasLayout>
      <div className="ventas-page">
        {/* Page Header */}
        <div className="ventas-page-header">
          <div>
            <h1 className="ventas-page-title">Dashboard</h1>
            <p className="ventas-page-desc">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Link to="/ventas/nueva" className="ventas-cta-btn">
            <PlusCircle size={18} />
            Nueva Venta
          </Link>
        </div>

        {/* Stat cards */}
        <div className="ventas-stats-grid">
          <StatCard
            icon={DollarSign}
            label="Ingresos Hoy"
            value={formatCOP(totalHoy)}
            color="#10b981"
            sub={`${ventasHoy.length} transacción${ventasHoy.length !== 1 ? 'es' : ''}`}
          />
          <StatCard
            icon={TrendingUp}
            label="Esta Semana"
            value={formatCOP(totalSemana)}
            color="#6366f1"
          />
          <StatCard
            icon={Calendar}
            label="Este Mes"
            value={formatCOP(totalMes)}
            color="#f59e0b"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Ventas"
            value={`${ventas.length}`}
            color="#ec4899"
            sub="en total"
          />
        </div>

        {/* Charts row */}
        <div className="ventas-charts-grid">
          {/* Bar chart */}
          <div className="ventas-chart-card">
            <h2 className="ventas-chart-title">
              <Printer size={16} /> Ingresos — Últimos 7 días
            </h2>
            {ventas.length === 0 ? (
              <div className="ventas-empty-chart">Sin datos aún</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCOP(v), 'Ingresos']}
                    contentStyle={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="ventas-chart-card">
            <h2 className="ventas-chart-title">
              <TrendingUp size={16} /> Por Tipo de Servicio
            </h2>
            {pieData.length === 0 ? (
              <div className="ventas-empty-chart">Sin datos aún</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCOP(v), '']}
                    contentStyle={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent sales */}
        <div className="ventas-chart-card">
          <div className="ventas-section-header">
            <h2 className="ventas-chart-title">
              <ShoppingCart size={16} /> Ventas Recientes
            </h2>
            <Link to="/ventas/historial" className="ventas-link">
              Ver todo →
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="ventas-empty">
              <Printer size={40} />
              <p>No hay ventas registradas aún</p>
              <Link to="/ventas/nueva" className="ventas-cta-btn" style={{ marginTop: '0.75rem' }}>
                <PlusCircle size={16} /> Registrar primera venta
              </Link>
            </div>
          ) : (
            <div className="ventas-table-wrap">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>P. Unitario</th>
                    <th>Total</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((v) => (
                    <tr key={v.id}>
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
                      <td>
                        {new Date(v.fecha).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
