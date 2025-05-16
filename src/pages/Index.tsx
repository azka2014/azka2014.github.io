import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building, Users, ArrowDownToLine, ArrowUpFromLine, FileText } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import TransactionChart from '@/components/TransactionChart';
import LowStockItems from '@/components/LowStockItems';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react'; // Import useEffect dan useState
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

const Index = () => {
  const { items, incomingTransactions, outgoingTransactions, loading: inventoryLoading } = useInventory(); // Gunakan loading dari context
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true); // State loading untuk autentikasi

  // Cek sesi saat komponen dimuat
  useEffect(() => {
    console.log("Index.tsx: useEffect running");
    const checkSession = async () => {
      console.log("Index.tsx: checkSession running");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Index.tsx: getSession result", { session, error });

        if (error) {
          console.error("Index.tsx: Error getting session", error);
          // Optionally handle error, maybe redirect to login or show error message
          navigate('/login', { replace: true });
        } else if (!session) {
          console.log("Index.tsx: No session found, navigating to /login");
          navigate('/login', { replace: true });
        } else {
          console.log("Index.tsx: Session found, setting authLoading to false");
          setAuthLoading(false);
        }
      } catch (e) {
        console.error("Index.tsx: Exception during getSession", e);
        // Handle unexpected errors during session check
        navigate('/login', { replace: true });
      }
    };

    checkSession();

    // Optional: Listen for auth state changes if needed for real-time updates
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    //   console.log("Index.tsx: Auth state change", _event, session);
    //   if (!session) {
    //     console.log("Index.tsx: Auth state change - No session, navigating to /login");
    //     navigate('/login', { replace: true });
    //   } else {
    //      console.log("Index.tsx: Auth state change - Session found, setting authLoading to false");
    //      setAuthLoading(false); // Ensure loading is false on sign in
    //   }
    // });
    // return () => subscription.unsubscribe();

  }, [navigate]); // Tambahkan navigate sebagai dependency

  console.log("Index.tsx: Render - authLoading:", authLoading, "inventoryLoading:", inventoryLoading);

  if (authLoading || inventoryLoading) {
      console.log("Index.tsx: Displaying loading state");
      return <div>Loading...</div>;
  }

  console.log("Index.tsx: Displaying content");
  const totalIncoming = incomingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
  const totalOutgoing = outgoingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  return (
    <>
      <h1 className="text-4xl font-extrabold text-center mb-4">RSUD KABUPATEN KARO</h1>
      <h1 className="text-3xl font-bold text-center mb-8">Sistem Manajemen Persediaan</h1>

      {/* Transaction Summary Chart */}
      <div className="mb-8">
        <TransactionChart incomingTotal={totalIncoming} outgoingTotal={totalOutgoing} /> {/* Perbaiki typo totalTotalOutgoing menjadi totalOutgoing */}
      </div>

      {/* Low Stock Items List */}
       <div className="mb-8">
        <LowStockItems items={items} lowStockThreshold={5} />
      </div>
    </>
  );
};

export default Index;