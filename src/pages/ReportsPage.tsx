import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/context/InventoryContext'; // Import context

const ReportsPage = () => {
  // Ambil data transaksi dan helper dari context
  const {
    incomingTransactions,
    outgoingTransactions,
    items, // Perlu items untuk menampilkan nama barang
    suppliers, // Perlu suppliers untuk menampilkan nama suplier
    departments, // Perlu departments untuk menampilkan nama departemen
    getItemById,
    getSupplierById,
    getDepartmentById,
    loading // Gunakan loading state dari context
  } = useInventory();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Laporan Persediaan</h1>

      {loading ? (
        <p>Memuat data laporan...</p>
      ) : (
        <>
          {/* Laporan Barang Masuk */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Laporan Barang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Suplier</TableHead>
                    <TableHead>Kuantitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Tidak ada data barang masuk.</TableCell>
                    </TableRow>
                  ) : (
                    incomingTransactions.map((transaction) => {
                      const item = getItemById(transaction.item_id);
                      const supplier = getSupplierById(transaction.supplier_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{item ? item.name : 'Barang Tidak Ditemukan'}</TableCell>
                          <TableCell>{supplier ? supplier.name : 'Suplier Tidak Ditemukan'}</TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Laporan Barang Keluar */}
          <Card>
            <CardHeader>
              <CardTitle>Laporan Barang Keluar</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Kuantitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outgoingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Tidak ada data barang keluar.</TableCell>
                    </TableRow>
                  ) : (
                    outgoingTransactions.map((transaction) => {
                      const item = getItemById(transaction.item_id);
                      const department = getDepartmentById(transaction.department_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{item ? item.name : 'Barang Tidak Ditemukan'}</TableCell>
                          <TableCell>{department ? department.name : 'Departemen Tidak Ditemukan'}</TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}


       <Button variant="outline" asChild className="mt-8"> {/* Added margin top */}
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
};

export default ReportsPage;