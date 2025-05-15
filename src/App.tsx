import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList";
import DepartmentListPage from "./pages/DepartmentList";
import ItemListPage from "./pages/ItemList";
import IncomingTransactionListPage from "./pages/IncomingTransactionList"; // Import IncomingTransactionListPage
import OutgoingTransactionListPage from "./pages/OutgoingTransactionList"; // Import OutgoingTransactionListPage
import ReportsPage from "./pages/ReportsPage"; // Import ReportsPage


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
          <Route path="/suppliers" element={<SupplierListPage />} />
          <Route path="/departments" element={<DepartmentListPage />} />
          <Route path="/items" element={<ItemListPage />} />
          <Route path="/incoming" element={<IncomingTransactionListPage />} /> {/* Add Incoming Route */}
          <Route path="/outgoing" element={<OutgoingTransactionListPage />} /> {/* Add Outgoing Route */}
          <Route path="/reports" element={<ReportsPage />} /> {/* Add Reports Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;