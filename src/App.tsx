import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Hapus Navigate dan useNavigate
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList";
import DepartmentListPage from "./pages/DepartmentList";
import ItemListPage from "./pages/ItemList";
import IncomingTransactionListPage from "./pages/IncomingTransactionList";
import OutgoingTransactionListPage from "./pages/OutgoingTransactionList";
import ReportsPage from "./pages/ReportsPage";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login"; // Import Login page
// Hapus import useSessionContext
// import { useSessionContext } from '@supabase/auth-ui-react';

const queryClient = new QueryClient();

// Hapus komponen ProtectedRoute
/*
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useSessionContext();

  if (isLoading) {
      return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
*/

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rute Login */}
          <Route path="/login" element={<Login />} />

          {/* Rute yang sebelumnya dilindungi, sekarang langsung di dalam MainLayout */}
          {/* Logika proteksi akan ditambahkan di dalam komponen halaman itu sendiri */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="departments" element={<DepartmentListPage />} />
            <Route path="items" element={<ItemListPage />} />
            <Route path="incoming" element={<IncomingTransactionListPage />} />
            <Route path="outgoing" element={<OutgoingTransactionListPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Rute Not Found (tidak dilindungi) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;