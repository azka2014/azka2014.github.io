import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Import the new Layout component
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList"; // Placeholder
import DepartmentListPage from "./pages/DepartmentList"; // Placeholder
import ItemListPage from "./pages/ItemList"; // Placeholder
import IncomingItemsPage from "./pages/IncomingItems"; // Placeholder
import OutgoingItemsPage from "./pages/OutgoingItems"; // Placeholder
import ReportsPage from "./pages/Reports"; // Placeholder

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout> {/* Wrap Routes with Layout */}
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/supliers" element={<SupplierListPage />} />
            <Route path="/departments" element={<DepartmentListPage />} />
            <Route path="/items" element={<ItemListPage />} />
            <Route path="/incoming" element={<IncomingItemsPage />} />
            <Route path="/outgoing" element={<OutgoingItemsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;