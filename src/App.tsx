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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/docs" element={<ApiDocs />} />
              <Route path="/admin/core-ai" element={<PersonalAgent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
