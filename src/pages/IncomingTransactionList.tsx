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
import { Pencil, Trash2, PlusCircle, CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/context/InventoryContext'; // Import the context hook
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define types for your data (should match Supabase table structure and context)
interface IncomingTransaction {
  id: string;
  date: string; // YYYY-MM-DD format from Supabase DATE type
  item_id: string; // Use item_id to match Supabase column name
  supplier_id: string; // Use supplier_id to match Supabase column name
  quantity: number;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
}


const IncomingTransactionListPage = () => {
  // Gunakan fungsi CRUD Supabase dan data dari useInventory
  const {
    incomingTransactions,
    items,
    suppliers,
    addIncomingTransaction,
    updateIncomingTransaction,
    deleteIncomingTransaction,
    getItemById, // Helper from context
    getSupplierById, // Helper from context
    loading // Loading state from context
  } = useInventory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<IncomingTransaction | null>(null); // State to hold transaction being edited
  const [formState, setFormState] = useState({
    date: new Date(),
    item_id: '', // Use item_id to match context/DB
    supplier_id: '', // Use supplier_id to match context/DB
    quantity: '',
  });
  const { toast } = useToast();

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle select changes
  const handleSelectChange = (id: 'item_id' | 'supplier_id', value: string) => { // Specify possible IDs
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
        item_id: transaction.item_id, // Use item_id
        supplier_id: transaction.supplier_id, // Use supplier_id
        quantity: transaction.quantity.toString(), // Convert number back to string for input
      });
    } else {
      setCurrentTransaction(null);
      setFormState({
        date: new Date(),
        item_id: '',
        supplier_id: '',
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
      item_id: '',
      supplier_id: '',
      quantity: '',
    });
  };

  // Save incoming transaction (Add or Edit)
  const saveTransaction = async () => { // Make async
    const { date, item_id, supplier_id, quantity } = formState; // Use item_id, supplier_id
    const quantityNumber = Number(quantity);

    if (!date || !item_id || !supplier_id || !quantity || quantityNumber <= 0) {
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
        date: format(date, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD for Supabase
        item_id,
        supplier_id,
        quantity: quantityNumber,
      };
      await updateIncomingTransaction(updatedTransaction); // Call Supabase function
    } else {
      // Add new transaction
      const newTransaction = { // Omit id for add
        date: format(date, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD for Supabase
        item_id,
        supplier_id,
        quantity: quantityNumber,
      };
      await addIncomingTransaction(newTransaction); // Call Supabase function
    }
    closeDialog();
  };

  // Delete incoming transaction
  const deleteTransactionHandler = async (id: string) => { // Make async
    // Optional: Add a confirmation dialog here before dispatching delete
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
       await deleteIncomingTransaction(id); // Call Supabase function
    }
  };

  // Get the selected item to display its stock
  const selectedItem = getItemById(formState.item_id); // Use item_id

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang Masuk</h1>
        <Button onClick={() => openDialog()}> {/* Call openDialog without argument for adding */}
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Barang Masuk
        </Button>
      </div>

      {loading ? (
          <p>Memuat data...</p>
      ) : (
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
                // Use item_id and supplier_id from transaction object
                const item = getItemById(transaction.item_id);
                const supplier = getSupplierById(transaction.supplier_id);
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
                        onClick={() => deleteTransactionHandler(transaction.id)} // Call delete function
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
      )}


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
              <Label htmlFor="item_id" className="text-right"> {/* Use item_id */}
                Barang
              </Label>
              <div className="col-span-3 flex items-center gap-2"> {/* Use flex to align select and stock */}
                <Select onValueChange={(value) => handleSelectChange('item_id', value)} value={formState.item_id}> {/* Use item_id */}
                  <SelectTrigger className="flex-1"> {/* Allow select to take available space */}
                    <SelectValue placeholder="Pilih Barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Display current stock */}
                {selectedItem && (
                  <span className="text-sm text-muted-foreground">
                    Stok: {selectedItem.stock}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier_id" className="text-right"> {/* Use supplier_id */}
                Suplier
              </Label>
              <Select onValueChange={(value) => handleSelectChange('supplier_id', value)} value={formState.supplier_id}> {/* Use supplier_id */}
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