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
        <h1 className="text-3xl font-bold text-center mb-8">Sistem Manajemen Persediaan</h1>

        {/* Transaction Summary Chart */}
        <div className="mb-8">
          <TransactionChart incomingTotal={totalIncoming} outgoingTotal={totalOutgoing} />
        </div>

        {/* Low Stock Items List */}
         <div className="mb-8">
          <LowStockItems items={items} lowStockThreshold={5} />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card for Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Barang
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kelola daftar semua barang yang ada di persediaan.
              </p>
              <Button asChild>
                <Link to="/items">Lihat Barang</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card for Suppliers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Suplier
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kelola informasi kontak dan alamat suplier.
              </p>
              <Button asChild>
                <Link to="/suppliers">Lihat Suplier</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card for Departments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Departemen
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kelola daftar departemen yang menggunakan barang.
              </p>
              <Button asChild>
                <Link to="/departments">Lihat Departemen</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card for Incoming Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Barang Masuk
              </CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Catat transaksi barang masuk dari suplier.
              </p>
              <Button asChild>
                <Link to="/incoming">Catat Barang Masuk</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card for Outgoing Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Barang Keluar
              </CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Catat transaksi barang keluar ke departemen.
              </p>
              <Button asChild>
                <Link to="/outgoing">Catat Barang Keluar</Link>
              </Button>
            </CardContent>
          </Card>

           {/* Card for Reports */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Laporan
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lihat laporan persediaan dan transaksi.
              </p>
              <Button asChild>
                <Link to="/reports">Lihat Laporan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;