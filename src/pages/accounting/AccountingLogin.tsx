import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ShieldCheck, Activity, BarChart3, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AccountingLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa correo y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Acceso autorizado");
      navigate("/contabilidad");
    } catch (error: any) {
      toast.error(error.message === "Invalid login credentials" ? "Credenciales incorrectas" : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans">
      
      {/* Panel Izquierdo: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
        
        {/* Logo Superior */}
        <div className="absolute top-10 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-3">
            <div className="h-10 w-10">
                <img src="/logo.png" alt="NeuroLabs Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">NeuroLabs</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto mt-16">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Acceso Restringido
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                    Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Financiero</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ingresa tus credenciales corporativas para acceder al módulo contable y ERP de NeuroLabs.
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Correo Corporativo</Label>
                <div className="relative">
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="gerencia@neurolabs.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-12 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600"
                    />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Contraseña</Label>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                    <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required 
                        className="h-12 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600"
                    />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg transition-all" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <>Ingresar de forma segura <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
                <LockKeyhole className="w-3 h-3" />
                Conexión cifrada de extremo a extremo
            </div>
        </div>
      </div>

      {/* Panel Derecho: Visual / Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#020817] relative overflow-hidden items-center justify-center animate-in fade-in duration-1000">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
            <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
            <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[80px]" />
        </div>

        {/* Floating Dashboard Elements */}
        <div className="relative z-10 w-full max-w-lg">
            
            <div className="mb-8">
                <h2 className="text-3xl font-light text-white tracking-tight mb-2">Operaciones Financieras</h2>
                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Inteligentes y Precisas</h3>
            </div>

            <div className="grid gap-4">
                {/* Floating Card 1 */}
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-slate-200 font-semibold text-sm">Flujo de Caja YTD</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded">+12.5%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">$402,000.00</div>
                </div>

                {/* Floating Card 2 */}
                <div className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-2xl transform translate-x-8 transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-slate-300 font-semibold text-sm">Margen Operativo</span>
                        </div>
                        <span className="text-indigo-400 text-xs font-bold">Objetivo: 30%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">29.5%</div>
                    
                    {/* Progress Bar Fake */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 w-[85%] rounded-full" />
                    </div>
                </div>
            </div>
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgoJCTxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNejAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KCTwvc3ZnPg==')] opacity-50 mix-blend-overlay" />
      </div>

    </div>
  );
}
