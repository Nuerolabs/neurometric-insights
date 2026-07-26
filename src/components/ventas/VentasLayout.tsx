import { NavLink, useNavigate } from 'react-router-dom';
import { Printer, LayoutDashboard, PlusCircle, ClipboardList, LogOut } from 'lucide-react';
import { useVentas } from '@/context/VentasContext';

interface VentasLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/ventas', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ventas/nueva', label: 'Nueva Venta', icon: PlusCircle, end: false },
  { to: '/ventas/historial', label: 'Historial', icon: ClipboardList, end: false },
];

export function VentasLayout({ children }: VentasLayoutProps) {
  const { logout } = useVentas();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/ventas/login');
  };

  return (
    <div className="ventas-shell">
      {/* Sidebar */}
      <aside className="ventas-sidebar">
        <div className="ventas-brand">
          <div className="ventas-brand-icon">
            <Printer size={22} />
          </div>
          <div>
            <p className="ventas-brand-title">PrintTrack</p>
            <p className="ventas-brand-sub">Sistema de Ventas</p>
          </div>
        </div>

        <nav className="ventas-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `ventas-nav-item ${isActive ? 'ventas-nav-item--active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="ventas-logout">
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="ventas-main">{children}</main>
    </div>
  );
}
