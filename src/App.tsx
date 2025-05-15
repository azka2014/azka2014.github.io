import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList"; // Import SupplierListPage
import DepartmentListPage from "./pages/DepartmentList"; // Import DepartmentListPage
import ItemListPage from "./pages/ItemList"; // Import ItemListPage


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/suppliers" element={<SupplierListPage />} /> {/* Add Supplier Route */}
          <Route path="/departments" element={<DepartmentListPage />} /> {/* Add Department Route */}
          <Route path="/items" element={<ItemListPage />} /> {/* Add Item Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;