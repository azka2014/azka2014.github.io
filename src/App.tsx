import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"; // Import Outlet
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList";
import DepartmentListPage from "./pages/DepartmentList";
import ItemListPage from "./pages/ItemList";
import IncomingTransactionListPage from "./pages/IncomingTransactionList";
import OutgoingTransactionListPage from "./pages/OutgoingTransactionList";
import ReportsPage from "./pages/ReportsPage";
import MainLayout from "./components/MainLayout"; // Import MainLayout


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Use MainLayout for routes that should have the sidebar */}
          <Route path="/" element={<MainLayout />}>
            {/* The index route renders when the path is exactly "/" */}
            <Route index element={<Index />} />
            {/* Nested routes will render inside the Outlet in MainLayout */}
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="departments" element={<DepartmentListPage />} />
            <Route path="items" element={<ItemListPage />} />
            <Route path="incoming" element={<IncomingTransactionListPage />} />
            <Route path="outgoing" element={<OutgoingTransactionListPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Keep the NotFound route outside the layout if it shouldn't have the sidebar */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;