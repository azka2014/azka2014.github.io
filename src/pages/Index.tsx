import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Building, Users } from 'lucide-react'; // Icons

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Sistem Manajemen Persediaan</h1>

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
      </div>
       {/* You can add more sections here later, e.g., Transactions */}
    </div>
  );
};

export default Index;