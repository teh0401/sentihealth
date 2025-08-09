import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import Header from "./components/layout/Header";
import Appointments from "./pages/Appointments";
import Navigate from "./pages/Navigate";
import Recovery from "./pages/Recovery";
import VoiceARIntegration from "./components/integrated/VoiceARIntegration";
import FooterNav from "./components/layout/FooterNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccessibilityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/navigate" element={<Navigate />} />
            <Route path="/recovery" element={<Recovery />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FooterNav />
          <VoiceARIntegration />
        </BrowserRouter>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
