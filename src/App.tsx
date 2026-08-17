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
import UsagePage from "./app/dashboard/usage/page";
import BillingPage from "./app/dashboard/billing/page";
import AutomationsPage from "./app/dashboard/automations/page";
import AnalyticsPage from "./app/dashboard/analytics/page";
import MarketplacePage from "./app/(marketplace)/[domain]/page";
import ProviderRegistrationPage from "./app/(marketplace)/[domain]/proveedores/registro/page";
import { VentasProvider } from "./context/VentasContext";
import { ProtectedRoute } from "./components/ventas/ProtectedRoute";
import LoginVentas from "./pages/ventas/LoginVentas";
import DashboardVentas from "./pages/ventas/DashboardVentas";
import NuevaVenta from "./pages/ventas/NuevaVenta";
import HistorialVentas from "./pages/ventas/HistorialVentas";
import PendientesVentas from "./pages/ventas/PendientesVentas";
import GastosVentas from "./pages/ventas/GastosVentas";
import BusinessDashboard from "./pages/ventas/BusinessDashboard";

// ── Módulo Contable (ERP) ──
import AccountingLayout from "./components/accounting/AccountingLayout";
import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import ChartOfAccounts from "./pages/accounting/ChartOfAccounts";
import PettyCash from "./pages/accounting/PettyCash";
import JournalEntries from "./pages/accounting/JournalEntries";
import EquityDashboard from "./pages/accounting/EquityDashboard";
import Reports from "./pages/accounting/Reports";
import AccountsReceivable from "./pages/accounting/AccountsReceivable";
import AccountsPayable from "./pages/accounting/AccountsPayable";
import Payroll from "./pages/accounting/Payroll";
import AccountingLogin from "./pages/accounting/AccountingLogin";
import { ProtectedAccountingRoute } from "./components/accounting/ProtectedAccountingRoute";

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
                <Route path="/dashboard/usage" element={<UsagePage />} />
                <Route path="/dashboard/billing" element={<BillingPage />} />
                <Route path="/dashboard/automations" element={<AutomationsPage />} />
                <Route path="/automations" element={<AutomationsPage />} />
                <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/marketplace/:domain" element={<MarketplacePage />} />
                <Route path="/admin/core-ai" element={<PersonalAgent />} />
                {/* ── Portal de Proveedores / Marketplace ── */}
                <Route path="/proveedores/registro" element={<ProviderRegistrationPage />} />
                <Route path="/:domain/proveedores/registro" element={<ProviderRegistrationPage />} />
                <Route path="/marketplace/proveedores/registro" element={<ProviderRegistrationPage />} />
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
                  path="/ventas/gastos"
                  element={
                    <ProtectedRoute>
                      <GastosVentas />
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
                <Route
                  path="/ventas/business"
                  element={
                    <ProtectedRoute>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* ── Contabilidad (ERP) ── */}
                <Route path="/contabilidad/login" element={<AccountingLogin />} />
                <Route path="/contabilidad" element={
                    <ProtectedAccountingRoute>
                        <AccountingLayout />
                    </ProtectedAccountingRoute>
                }>
                  <Route index element={<AccountingDashboard />} />
                  <Route path="reportes" element={<Reports />} />
                  <Route path="patrimonio" element={<EquityDashboard />} />
                  <Route path="cuentas" element={<ChartOfAccounts />} />
                  <Route path="asientos" element={<JournalEntries />} />
                  <Route path="facturacion" element={<AccountsReceivable />} />
                  <Route path="cxp" element={<AccountsPayable />} />
                  <Route path="caja-menor" element={<PettyCash />} />
                  <Route path="nomina" element={<Payroll />} />
                </Route>

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
