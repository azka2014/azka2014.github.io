import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Link, useNavigate } from 'react-router-dom';
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
import { useInventory } from '@/context/InventoryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Calendar } from '@/components/ui/calendar'; // Import Calendar
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { format } from 'date-fns'; // Import format for date display
import { cn } from '@/lib/utils'; // Import cn for classnames
import { CalendarIcon } from 'lucide-react'; // Import CalendarIcon

const ReportsPage = () => {
  const {
    incomingTransactions,
    outgoingTransactions,
    items,
    suppliers,
    departments,
    getItemById,
    getSupplierById,
    getDepartmentById,
    loading
  } = useInventory();

  const navigate = useNavigate();

  // State untuk filter
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // State untuk tanggal filter

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Logika pemfilteran menggunakan useMemo
  const filteredIncomingTransactions = useMemo(() => {
    let filtered = incomingTransactions;

    if (selectedItemId) {
      filtered = filtered.filter(tx => tx.item_id === selectedItemId);
    }

    if (selectedDate) {
      // Filter transaksi pada atau setelah tanggal yang dipilih
      const filterDateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(tx => tx.date >= filterDateString);
    }

    // Filter berdasarkan supplier tidak diminta, jadi tidak perlu ditambahkan di sini

    return filtered;
  }, [incomingTransactions, selectedItemId, selectedDate]); // Dependencies useMemo

  const filteredOutgoingTransactions = useMemo(() => {
    let filtered = outgoingTransactions;

    if (selectedItemId) {
      filtered = filtered.filter(tx => tx.item_id === selectedItemId);
    }

    if (selectedDepartmentId) {
      filtered = filtered.filter(tx => tx.department_id === selectedDepartmentId);
    }

     if (selectedDate) {
      // Filter transaksi pada atau setelah tanggal yang dipilih
      const filterDateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(tx => tx.date >= filterDateString);
    }

    return filtered;
  }, [outgoingTransactions, selectedItemId, selectedDepartmentId, selectedDate]); // Dependencies useMemo


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Laporan Persediaan</h1>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter Barang */}
            <div>
              <Label htmlFor="filterItem" className="mb-1 block">Nama Barang</Label>
              <Select onValueChange={(value) => setSelectedItemId(value === '' ? null : value)} value={selectedItemId || ''}>
                <SelectTrigger id="filterItem">
                  <SelectValue placeholder="Semua Barang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Barang</SelectItem> {/* Option to show all */}
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Departemen (hanya relevan untuk Barang Keluar) */}
             <div>
              <Label htmlFor="filterDepartment" className="mb-1 block">Departemen</Label>
              <Select onValueChange={(value) => setSelectedDepartmentId(value === '' ? null : value)} value={selectedDepartmentId || ''}>
                <SelectTrigger id="filterDepartment">
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Departemen</SelectItem> {/* Option to show all */}
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Tanggal */}
            <div>
              <Label htmlFor="filterDate" className="mb-1 block">Tanggal (Pada atau Setelah)</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pilih Tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>


      {loading ? (
        <p>Memuat data laporan...</p>
      ) : (
        <>
          {/* Laporan Barang Masuk */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Laporan Barang Masuk ({filteredIncomingTransactions.length} Transaksi)</CardTitle> {/* Tampilkan jumlah hasil filter */}
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
                  {filteredIncomingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Tidak ada data barang masuk sesuai filter.</TableCell> {/* Pesan jika tidak ada data */}
                    </TableRow>
                  ) : (
                    filteredIncomingTransactions.map((transaction) => {
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
              <CardTitle>Laporan Barang Keluar ({filteredOutgoingTransactions.length} Transaksi)</CardTitle> {/* Tampilkan jumlah hasil filter */}
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
                  {filteredOutgoingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Tidak ada data barang keluar sesuai filter.</TableCell> {/* Pesan jika tidak ada data */}
                    </TableRow>
                  ) : (
                    filteredOutgoingTransactions.map((transaction) => {
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

       <Button variant="outline" className="mt-8" onClick={handleBackToDashboard}>
        Kembali ke Dashboard
      </Button>
    </div>
  );
};

export default ReportsPage;