import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

const OutgoingReportsPage = () => {
  const {
    outgoingTransactions,
    items,
    departments,
    getItemById,
    getDepartmentById,
    loading
  } = useInventory();

  const navigate = useNavigate();

  // State untuk filter (nilai yang dipilih di UI)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  // Mengganti selectedDate dengan startDate dan endDate
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // State untuk memicu pemfilteran saat tombol Proses diklik
  const [applyFiltersTrigger, setApplyFiltersTrigger] = useState(0);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Handler untuk tombol Proses
  const handleProcessReport = () => {
    setApplyFiltersTrigger(prev => prev + 1); // Increment state to trigger useMemo
  };

  // Logika pemfilteran menggunakan useMemo, bergantung pada applyFiltersTrigger
  const filteredOutgoingTransactions = useMemo(() => {
    console.log("Applying filters for Outgoing Reports...");
    let filtered = outgoingTransactions;

    if (selectedItemId) {
      filtered = filtered.filter(tx => tx.item_id === selectedItemId);
    }

    if (selectedDepartmentId) {
      filtered = filtered.filter(tx => tx.department_id === selectedDepartmentId);
    }

    // Filter berdasarkan rentang tanggal
     if (startDate) {
      const startFilterDateString = format(startDate, 'yyyy-MM-dd');
      filtered = filtered.filter(tx => tx.date >= startFilterDateString);
    }
    if (endDate) {
      const endFilterDateString = format(endDate, 'yyyy-MM-dd');
      filtered = filtered.filter(tx => tx.date <= endFilterDateString);
    }


    console.log("Filtered Outgoing Transactions count:", filtered.length);
    return filtered;
  }, [outgoingTransactions, selectedItemId, selectedDepartmentId, startDate, endDate, applyFiltersTrigger]); // Update dependencies


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Laporan Barang Keluar</h1>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Laporan Barang Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filter Barang */}
            <div>
              <Label htmlFor="filterItem" className="mb-1 block">Nama Barang</Label>
              <Select onValueChange={(value) => setSelectedItemId(value)} value={selectedItemId || ''}>
                <SelectTrigger id="filterItem">
                  <SelectValue placeholder="Semua Barang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Semua Barang</SelectItem>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Departemen */}
             <div>
              <Label htmlFor="filterDepartment" className="mb-1 block">Departemen</Label>
              <Select onValueChange={(value) => setSelectedDepartmentId(value)} value={selectedDepartmentId || ''}>
                <SelectTrigger id="filterDepartment">
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Semua Departemen</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Tanggal Awal */}
            <div>
              <Label htmlFor="filterStartDate" className="mb-1 block">Tanggal Awal</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pilih Tanggal Awal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate} // Set startDate
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

             {/* Filter Tanggal Akhir */}
            <div>
              <Label htmlFor="filterEndDate" className="mb-1 block">Tanggal Akhir</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pilih Tanggal Akhir</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate} // Set endDate
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
           {/* Proses Button */}
           <div className="flex justify-end">
              <Button onClick={handleProcessReport}>Proses Laporan</Button>
           </div>
        </CardContent>
      </Card>


      {loading ? (
        <p>Memuat data laporan...</p>
      ) : (
        <>
          {/* Laporan Barang Keluar Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Barang Keluar ({filteredOutgoingTransactions.length} Transaksi)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Kuantitas</TableHead>
                    <TableHead>Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutgoingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Tidak ada data barang keluar sesuai filter.</TableCell>
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
                          <TableCell>{item ? item.unit : '-'}</TableCell>
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

export default OutgoingReportsPage;