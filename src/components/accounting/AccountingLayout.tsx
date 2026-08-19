import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    BookOpen, 
    FileText, 
    Wallet, 
    Settings,
    ArrowLeft,
    Building2,
    PieChart,
    Users,
    Receipt,
    Banknote,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const sidebarNavItems = [
  {
    title: "Dashboard Financiero",
    href: "/contabilidad",
    icon: <LayoutDashboard className="h-4 w-4" />,
    exact: true,
    group: "Análisis"
  },
  {
    title: "Reportes Gerenciales",
    href: "/contabilidad/reportes",
    icon: <PieChart className="h-4 w-4" />,
    group: "Análisis"
  },
  {
    title: "Patrimonio y Socios",
    href: "/contabilidad/patrimonio",
    icon: <Users className="h-4 w-4" />,
    group: "Análisis"
  },
  {
    title: "Catálogo de Cuentas (PUC)",
    href: "/contabilidad/cuentas",
    icon: <BookOpen className="h-4 w-4" />,
    group: "Contabilidad Central"
  },
  {
    title: "Libro Diario (Asientos)",
    href: "/contabilidad/asientos",
    icon: <FileText className="h-4 w-4" />,
    group: "Contabilidad Central"
  },
  {
    title: "Facturación & Clientes",
    href: "/contabilidad/facturacion",
    icon: <Receipt className="h-4 w-4" />,
    group: "Tesorería"
  },
  {
    title: "Cuentas por Pagar (CxP)",
    href: "/contabilidad/cxp",
    icon: <Banknote className="h-4 w-4" />,
    group: "Tesorería"
  },
  {
    title: "Caja Menor",
    href: "/contabilidad/caja-menor",
    icon: <Wallet className="h-4 w-4" />,
    group: "Tesorería"
  },
  {
    title: "Nómina",
    href: "/contabilidad/nomina",
    icon: <Users className="h-4 w-4" />,
    group: "Gestión"
  }
];

export default function AccountingLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const groups = Array.from(new Set(sidebarNavItems.map(item => item.group)));
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("neurolabs_accounting_auth");
      localStorage.removeItem("neurolabs_accounting_user");
      await supabase.auth.signOut();
      toast.success("Sesión cerrada");
      navigate("/contabilidad/login");
    } catch (error) {
      localStorage.removeItem("neurolabs_accounting_auth");
      localStorage.removeItem("neurolabs_accounting_user");
      navigate("/contabilidad/login");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#020817] flex-col overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex-shrink-0 z-40 relative">
        <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NeuroLabs" className="h-6 w-6 object-contain" />
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">NeuroLabs ERP</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Enterprise Sidebar */}
        <aside className={cn(
            "absolute md:relative inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] flex-shrink-0 flex flex-col shadow-2xl md:shadow-none z-40 transform transition-transform duration-200 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="h-16 hidden md:flex items-center px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329]">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <img src="/logo.png" alt="NeuroLabs Logo" className="w-5 h-5 object-contain filter invert brightness-0 dark:invert-0" />
               </div>
               <div className="flex flex-col">
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    NeuroLabs ERP
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
                    Sistema Contable
                  </span>
               </div>
            </div>
          </div>
        
          <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
            {groups.map((group) => (
              <div key={group} className="space-y-1">
                <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group}
                </h3>
                <nav className="space-y-0.5 pt-1">
                  {sidebarNavItems.filter(item => item.group === group).map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.exact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors",
                          isActive 
                            ? "bg-slate-900 text-white shadow-sm dark:bg-blue-600 dark:text-white" 
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                        )
                      }
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1329] space-y-1.5">
             <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 transition-colors"
             >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar Sesión
             </button>
             <NavLink 
                to="/" 
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md transition-colors"
             >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a la Web
             </NavLink>
          </div>
        </aside>

      {/* Main Content Area - Enterprise Data Dense */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#020817]">
        <div className="h-full p-4 md:p-8">
            <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}
