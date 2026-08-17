import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function ProtectedAccountingRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // 1. Check local session
    const hasLocalAuth = localStorage.getItem("neurolabs_accounting_auth") === "true";
    if (hasLocalAuth) {
      setIsAuthenticated(true);
      return;
    }

    // 2. Check Supabase active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        const stillLocal = localStorage.getItem("neurolabs_accounting_auth") === "true";
        setIsAuthenticated(stillLocal);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        const stillLocal = localStorage.getItem("neurolabs_accounting_auth") === "true";
        setIsAuthenticated(stillLocal);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/contabilidad/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
