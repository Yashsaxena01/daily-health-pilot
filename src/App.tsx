
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import WeightPage from "./pages/WeightPage";
import FoodPage from "./pages/FoodPage";
import SchedulePage from "./pages/SchedulePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weight" element={<WeightPage />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
            </Routes>
          </div>
          <Navigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
