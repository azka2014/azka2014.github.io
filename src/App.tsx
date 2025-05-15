import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList";
import DepartmentListPage from "./pages/DepartmentList";
import ItemListPage from "./pages/ItemList";
import IncomingItemsPage from "./pages/IncomingItems";
import OutgoingItemsPage from "./pages/OutgoingItems";
import ReportsPage from "./pages/Reports";
import { InventoryProvider } from "./context/InventoryContext"; // Import InventoryProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InventoryProvider> {/* Wrap with InventoryProvider */}
          <Layout>
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
        </InventoryProvider> {/* Close InventoryProvider */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;