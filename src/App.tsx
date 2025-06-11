
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafeAuthProvider } from '@/components/SafeAuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RenderLoopProtection } from '@/components/RenderLoopProtection';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SafeAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SafeAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => (
  <RenderLoopProtection maxRenders={50} timeWindow={3000}>
    <AppContent />
  </RenderLoopProtection>
);

export default App;
