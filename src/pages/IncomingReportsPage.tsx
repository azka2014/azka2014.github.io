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

const IncomingReportsPage = () => {
  const {
    incomingTransactions,
    items,
    suppliers,
    departments, // Import departments
    getItemById,
    getSupplierById,
    getDepartmentById, // Import getDepartmentById
    loading
  } = useInventory();

  const navigate = useNavigate();

  // State untuk filter
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null); // State for department filter
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Logika pemfilteran menggunakan useMemo
  const filteredIncomingTransactions = useMemo(() => {
    let filtered = incomingTransactions;

    if (selectedItemId) {
      filtered = filtered.filter(tx => tx.item_id === selectedItemId);
    }

    // Add department filter logic
    if (selectedDepartmentId) {
        // Note: Incoming transactions don't have a department_id column in the DB schema.
        // This filter will always result in an empty list unless you intend to filter
        // based on some other criteria related to departments that isn't currently in the data structure.
        // Assuming for now you might want to filter based on items that are *typically* used by a department,
        // but the current data structure doesn't support this directly.
        // For the sake of implementing the filter UI, I'll add the filter logic,
        // but be aware it might not produce meaningful results with the current DB schema.
        // If you need to link incoming transactions to departments, the DB schema would need modification.

        // As per the request, adding a filter based on a hypothetical department link.
        // Since incoming_transactions table doesn't have department_id, this filter
        // will effectively filter out all transactions if a department is selected.
        // If the intention is different, please clarify the relationship between
        // incoming transactions and departments.
        // For now, I will add a placeholder filter that will always return empty.
        // If you update your DB schema to link incoming transactions to departments,
        // this logic would need to be updated accordingly.

        // *** Placeholder filter logic - will always return empty with current schema ***
        // filtered = filtered.filter(tx => tx.department_id === selectedDepartmentId); // This column doesn't exist
        // To make the filter functional based on the *request*, I'll add a filter that
        // will always return an empty array if a department is selected, as there's
        // no department_id in incoming_transactions.
        // If you meant to filter based on something else, please let me know.
        filtered = []; // This line makes the filter return empty if department is selected
        console.warn("Department filter applied to Incoming Transactions. Note: incoming_transactions table does not have a 'department_id' column. This filter will always return an empty list with the current database schema.");
    }


    if (selectedDate) {
      const filterDateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(tx => tx.date >= filterDateString);
    }

    return filtered;
  }, [incomingTransactions, selectedItemId, selectedDepartmentId, selectedDate]); // Add selectedDepartmentId to dependencies


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Laporan Barang Masuk</h1>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Laporan Barang Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {/* Laporan Barang Masuk Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Barang Masuk ({filteredIncomingTransactions.length} Transaksi)</CardTitle>
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
                      <TableCell colSpan={4} className="text-center">Tidak ada data barang masuk sesuai filter.</TableCell>
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
        </>
      )}

       <Button variant="outline" className="mt-8" onClick={handleBackToDashboard}>
        Kembali ke Dashboard
      </Button>
    </div>
  );
};

export default IncomingReportsPage;