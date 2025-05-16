import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Hapus useNavigate yang tidak terpakai di sini
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/SupplierList";
import DepartmentListPage from "./pages/DepartmentList";
import ItemListPage from "./pages/ItemList";
import IncomingTransactionListPage from "./pages/IncomingTransactionList";
import OutgoingTransactionListPage from "./pages/OutgoingTransactionList";
import ReportsPage from "./pages/ReportsPage";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import { useAuth } from './context/AuthContext';
import React from "react";

const queryClient = new QueryClient();

// Komponen ProtectedRoute
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
      return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Bungkus konten dengan React Fragment */}
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rute Login (tidak dilindungi) */}
            <Route path="/login" element={<Login />} />

            {/* Rute yang dilindungi, dibungkus dengan ProtectedRoute */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
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
      </>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;