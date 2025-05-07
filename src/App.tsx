
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/layout/AppNavbar";
import Dashboard from "./pages/Dashboard";
import Weight from "./pages/Weight";
import Food from "./pages/Food";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-offwhite">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weight" element={<Weight />} />
            <Route path="/food" element={<Food />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AppNavbar />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
