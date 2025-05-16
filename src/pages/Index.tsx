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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true }); // Arahkan ke login jika tidak ada sesi
      } else {
        setAuthLoading(false); // Sesi ada, set authLoading false
      }
    };

    checkSession();

    // Optional: Listen for auth state changes if needed for real-time updates
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    //   if (!session) {
    //     navigate('/login', { replace: true });
    //   }
    // });
    // return () => subscription.unsubscribe();

  }, [navigate]); // Tambahkan navigate sebagai dependency

  // Tampilkan loading jika autentikasi atau data inventory sedang dimuat
  if (authLoading || inventoryLoading) {
      return <div>Loading...</div>; // Atau spinner, dll.
  }


  const totalIncoming = incomingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
  const totalOutgoing = outgoingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  return (
    <>
      <h1 className="text-4xl font-extrabold text-center mb-4">RSUD KABUPATEN KARO</h1>
      <h1 className="text-3xl font-bold text-center mb-8">Sistem Manajemen Persediaan</h1>

      {/* Transaction Summary Chart */}
      <div className="mb-8">
        <TransactionChart incomingTotal={totalIncoming} outgoingTotal={totalTotalOutgoing} /> {/* Perbaiki typo totalTotalOutgoing menjadi totalOutgoing */}
      </div>

      {/* Low Stock Items List */}
       <div className="mb-8">
        <LowStockItems items={items} lowStockThreshold={5} />
      </div>
    </>
  );
};

export default Index;