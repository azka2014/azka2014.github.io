import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, PlusCircle, CalendarIcon } from 'lucide-react'; // Import Pencil, Trash2, CalendarIcon
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/context/InventoryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IncomingTransaction {
  id: string;
  date: string;
  itemId: string;
  supplierId: string;
  quantity: number;
}

const IncomingTransactionListPage = () => {
  const { incomingTransactions, items, suppliers, dispatch, getItemById, getSupplierById } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<IncomingTransaction | null>(null); // State to hold transaction being edited
  const [formState, setFormState] = useState({
    date: new Date(),
    itemId: '',
    supplierId: '',
    quantity: '',
  });
  const { toast } = useToast();

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormState((prev) => ({ ...prev, date }));
    }
  };

  // Open dialog for adding or editing
  const openDialog = (transaction?: IncomingTransaction) => {
    if (transaction) {
      setCurrentTransaction(transaction);
      setFormState({
        date: new Date(transaction.date), // Convert string date back to Date object
        itemId: transaction.itemId,
        supplierId: transaction.supplierId,
        quantity: transaction.quantity.toString(), // Convert number back to string for input
      });
    } else {
      setCurrentTransaction(null);
      setFormState({
        date: new Date(),
        itemId: '',
        supplierId: '',
        quantity: '',
      });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentTransaction(null); // Reset current transaction on close
    setFormState({ // Reset form state
      date: new Date(),
      itemId: '',
      supplierId: '',
      quantity: '',
    });
  };

  // Save incoming transaction (Add or Edit)
  const saveTransaction = () => {
    const { date, itemId, supplierId, quantity } = formState;
    const quantityNumber = Number(quantity);

    if (!date || !itemId || !supplierId || !quantity || quantityNumber <= 0) {
      toast({
        title: "Gagal",
        description: "Semua field harus diisi dengan benar.",
        variant: "destructive",
      });
      return;
    }

    if (currentTransaction) {
      // Edit existing transaction
      const updatedTransaction: IncomingTransaction = {
        ...currentTransaction, // Keep the original ID
        date: date.toISOString().split('T')[0],
        itemId,
        supplierId,
        quantity: quantityNumber,
      };
      dispatch({ type: 'UPDATE_INCOMING_TRANSACTION', payload: updatedTransaction });
      toast({
        title: "Berhasil",
        description: "Transaksi barang masuk berhasil diupdate.",
      });
    } else {
      // Add new transaction
      const newTransaction: IncomingTransaction = {
        id: Date.now().toString(), // Simple unique ID
        date: date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        itemId,
        supplierId,
        quantity: quantityNumber,
      };
      dispatch({ type: 'ADD_INCOMING_TRANSACTION', payload: newTransaction });
      toast({
        title: "Berhasil",
        description: "Transaksi barang masuk baru berhasil ditambahkan.",
      });
    }
    closeDialog();
  };

  // Delete incoming transaction
  const deleteTransaction = (id: string) => {
    // Optional: Add a confirmation dialog here before dispatching delete
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
       dispatch({ type: 'DELETE_INCOMING_TRANSACTION', payload: id });
       toast({
         title: "Berhasil",
         description: "Transaksi barang masuk berhasil dihapus.",
       });
    }
  };


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang Masuk</h1>
        <Button onClick={() => openDialog()}> {/* Call openDialog without argument for adding */}
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Barang Masuk
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Barang</TableHead>
            <TableHead>Suplier</TableHead>
            <TableHead>Kuantitas</TableHead>
            <TableHead className="text-right">Aksi</TableHead> {/* Added Aksi header */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomingTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Belum ada data barang masuk.</TableCell> {/* Updated colspan */}
            </TableRow>
          ) : (
            incomingTransactions.map((transaction) => {
              const item = getItemById(transaction.itemId);
              const supplier = getSupplierById(transaction.supplierId);
              return (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{item ? item.name : 'Barang Tidak Ditemukan'}</TableCell>
                  <TableCell>{supplier ? supplier.name : 'Suplier Tidak Ditemukan'}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell className="text-right"> {/* Added Aksi cell */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => openDialog(transaction)} // Pass transaction for editing
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id)} // Call delete function
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Incoming Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTransaction ? 'Edit Transaksi Barang Masuk' : 'Tambah Barang Masuk'}</DialogTitle> {/* Dynamic title */}
            <DialogDescription>
              {currentTransaction ? 'Edit data transaksi barang masuk.' : 'Tambahkan transaksi barang masuk baru.'} {/* Dynamic description */}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Tanggal
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !formState.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.date ? format(formState.date, "PPP") : <span>Pilih Tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemId" className="text-right">
                Barang
              </Label>
              <Select onValueChange={(value) => handleSelectChange('itemId', value)} value={formState.itemId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Barang" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplierId" className="text-right">
                Suplier
              </Label>
              <Select onValueChange={(value) => handleSelectChange('supplierId', value)} value={formState.supplierId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Suplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Kuantitas
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formState.quantity}
                onChange={handleInputChange}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Batal</Button>
            <Button onClick={saveTransaction}>{currentTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}</Button> {/* Dynamic button text */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingTransactionListPage;