import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ClipboardList, LogOut, Clock, Receipt } from 'lucide-react';
import { useVentas } from '@/context/VentasContext';

interface VentasLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/ventas', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ventas/nueva', label: 'Nueva Venta', icon: PlusCircle, end: false },
  { to: '/ventas/gastos', label: 'Gastos', icon: Receipt, end: false },
  { to: '/ventas/pendientes', label: 'Pendientes', icon: Clock, end: false },
  { to: '/ventas/historial', label: 'Historial', icon: ClipboardList, end: false },
];

export function VentasLayout({ children }: VentasLayoutProps) {
  const { logout, ventasPendientes } = useVentas();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/ventas/login');
  };

  return (
    <div className="pt-shell">
      {/* Sidebar */}
      <aside className="pt-sidebar">
        {/* Logo */}
        <div className="pt-brand">
          <img src="/logo.png" alt="Logo empresa" className="pt-brand-logo" />
        </div>

        <nav className="pt-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `pt-nav-item ${isActive ? 'pt-nav-item--active' : ''}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Pendientes' && ventasPendientes.length > 0 && (
                <span className="pt-badge-count">{ventasPendientes.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="pt-logout">
          <LogOut size={15} />
          <span>Salir</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="pt-main">{children}</main>
    </div>
  );
}
