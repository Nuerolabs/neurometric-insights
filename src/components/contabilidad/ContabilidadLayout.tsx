import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  CalendarCheck2,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileCheck2,
  Users2,
  Network,
  LogOut,
  Building2,
  Menu,
  X,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

interface ContabilidadLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: 'Contabilidad Central',
    items: [
      { to: '/contabilidad', label: 'Dashboard Financiero', icon: LayoutDashboard, end: true },
      { to: '/contabilidad/cuentas', label: 'Catálogo PUC Colombia', icon: BookOpen },
      { to: '/contabilidad/asientos', label: 'Libro Diario & Asientos', icon: FileSpreadsheet },
      { to: '/contabilidad/reportes', label: 'Balance de Prueba x Tercero', icon: FileSpreadsheet },
      { to: '/contabilidad/periodos', label: 'Control de Periodos DIAN', icon: CalendarCheck2 },
    ],
  },
  {
    group: 'Tesorería & Multimoneda (COP/USD)',
    items: [
      { to: '/contabilidad/recibos', label: 'Recibos de Caja (Cartera)', icon: ArrowDownLeft },
      { to: '/contabilidad/egresos', label: 'Comprobantes de Egreso', icon: ArrowUpRight },
      { to: '/contabilidad/conciliacion', label: 'Cruce CxC / CxP & Fx TRM', icon: DollarSign },
    ],
  },
  {
    group: 'Impuestos & DIAN',
    items: [
      { to: '/contabilidad/impuestos', label: 'Retenciones & Motor Fiscal', icon: Receipt },
      { to: '/contabilidad/certificados', label: 'Certificados de Retención', icon: FileCheck2 },
      { to: '/contabilidad/exogena', label: 'Pre-validador Exógena', icon: ShieldCheck },
      { to: '/contabilidad/facturacion', label: 'Facturación & Doc. Soporte', icon: Globe2 },
    ],
  },
  {
    group: 'Maestras Corporativas',
    items: [
      { to: '/contabilidad/terceros', label: 'Directorio de Terceros (DV)', icon: Users2 },
      { to: '/contabilidad/centros-costos', label: 'Centros de Costos', icon: Network },
    ],
  },
];

export function ContabilidadLayout({ children }: ContabilidadLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('neurolabs_accounting_auth');
    localStorage.removeItem('neurolabs_accounting_user');
    navigate('/contabilidad/login');
  };

  const currentUser = localStorage.getItem('neurolabs_accounting_user') || 'gerencia@neurolabs.com';

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200 bg-white flex-shrink-0 z-40 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NeuroLabs" className="h-6 w-6 object-contain" />
          <span className="font-bold text-sm tracking-tight text-slate-900">NeuroLabs ERP</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900">ERP NeuroLabs</h1>
            <p className="text-[11px] text-slate-500 font-medium">NIIF & Normativa DIAN</p>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{currentUser}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-500">Sesión Corporativa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <h2 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </h2>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.end
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión Segura</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-14 md:pt-0 bg-[#f8fafc]">
        {children}
      </main>
    </div>
  );
}
