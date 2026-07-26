import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Portfolio from "./pages/Portfolio";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";
import PersonalAgent from "./pages/admin/PersonalAgent";
import { VentasProvider } from "./context/VentasContext";
import { ProtectedRoute } from "./components/ventas/ProtectedRoute";
import LoginVentas from "./pages/ventas/LoginVentas";
import DashboardVentas from "./pages/ventas/DashboardVentas";
import NuevaVenta from "./pages/ventas/NuevaVenta";
import HistorialVentas from "./pages/ventas/HistorialVentas";
import PendientesVentas from "./pages/ventas/PendientesVentas";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VentasProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/docs" element={<ApiDocs />} />
                <Route path="/admin/core-ai" element={<PersonalAgent />} />
                {/* ── Ventas ── */}
                <Route path="/ventas/login" element={<LoginVentas />} />
                <Route
                  path="/ventas"
                  element={
                    <ProtectedRoute>
                      <DashboardVentas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventas/nueva"
                  element={
                    <ProtectedRoute>
                      <NuevaVenta />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventas/pendientes"
                  element={
                    <ProtectedRoute>
                      <PendientesVentas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventas/historial"
                  element={
                    <ProtectedRoute>
                      <HistorialVentas />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </VentasProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
