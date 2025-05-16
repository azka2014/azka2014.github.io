import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building, Users, ArrowDownToLine, ArrowUpFromLine, FileText } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import TransactionChart from '@/components/TransactionChart';
import LowStockItems from '@/components/LowStockItems';
import Sidebar from '@/components/Sidebar'; // Import Sidebar
import { Button } from '@/components/ui/button'; // Ensure Button is imported

const Index = () => {
  const { items, incomingTransactions, outgoingTransactions } = useInventory();

  const totalIncoming = incomingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
  const totalOutgoing = outgoingTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  return (
    <div className="flex min-h-screen"> {/* Use flex for layout */}
      {/* Sidebar - hidden on small screens, fixed width on medium and larger */}
      <Sidebar className="w-64 hidden md:block flex-shrink-0" />

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Added title here */}
        <h1 className="text-4xl font-extrabold text-center mb-4">RSUD KABUPATEN KARO</h1>
        <h1 className="text-3xl font-bold text-center mb-8">Sistem Manajemen Persediaan</h1>

        {/* Transaction Summary Chart */}
        <div className="mb-8">
          <TransactionChart incomingTotal={totalIncoming} outgoingTotal={totalOutgoing} />
        </div>

        {/* Low Stock Items List */}
         <div className="mb-8">
          <LowStockItems items={items} lowStockThreshold={5} />
        </div>

        {/* Navigation Cards - Removed */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>...</Card>
          <Card>...</Card>
          <Card>...</Card>
          <Card>...</Card>
          <Card>...</Card>
          <Card>...</Card>
        </div>
        */}
      </div>
    </div>
  );
};

export default Index;