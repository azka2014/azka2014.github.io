import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
      {/* TooltipProvider sekarang hanya memiliki BrowserRouter sebagai anak langsung */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Index />} />
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="departments" element={<DepartmentListPage />} />
            <Route path="items" element={<ItemListPage />} />
            <Route path="incoming" element={<IncomingTransactionListPage />} />
            <Route path="outgoing" element={<OutgoingTransactionListPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    {/* Toaster dan Sonner dipindahkan ke luar TooltipProvider */}
    <Toaster />
    <Sonner />
  </QueryClientProvider>
);

export default App;