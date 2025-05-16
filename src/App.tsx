import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom"; // Import Navigate and useNavigate
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
import { useSession } from '@supabase/auth-ui-react'; // Import useSession

const queryClient = new QueryClient();

// Component untuk melindungi rute
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const session = useSession(); // Dapatkan sesi dari context

  // Jika sesi belum ada, arahkan ke halaman login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Jika sesi ada, render children (konten rute yang dilindungi)
  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rute Login */}
          <Route path="/login" element={<Login />} />

          {/* Rute yang dilindungi, menggunakan ProtectedRoute */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Rute nested di dalam MainLayout */}
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