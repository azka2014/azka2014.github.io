import React, { useState } from 'react';
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
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/context/InventoryContext'; // Import the context hook

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

const ItemListPage = () => {
  // Gunakan fungsi CRUD Supabase dari useInventory
  const { items, addItem, updateItem, deleteItem, loading } = useInventory(); // Use context
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [formState, setFormState] = useState({ name: '', unit: '' });
  const { toast } = useToast();

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Open dialog for adding or editing
  const openDialog = (item?: Item) => {
    if (item) {
      setCurrentItem(item);
      setFormState({ name: item.name, unit: item.unit });
    } else {
      setCurrentItem(null);
      setFormState({ name: '', unit: '' });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
    setFormState({ name: '', unit: '' });
  };

  // Save item (Add or Edit)
  const saveItem = async () => { // Make function async
    if (!formState.name || !formState.unit) {
      toast({
        title: "Gagal",
        description: "Nama barang dan satuan harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (currentItem) {
      // Edit existing item
      const updatedItem = { // Omit stock as it's managed by transactions
        id: currentItem.id,
        name: formState.name,
        unit: formState.unit,
      };
      await updateItem(updatedItem); // Call Supabase function
    } else {
      // Add new item
      const newItem = { // Omit id and stock for add
        name: formState.name,
        unit: formState.unit,
      };
      await addItem(newItem); // Call Supabase function
    }
    closeDialog();
  };

  // Delete item
  const deleteItemHandler = async (id: string) => { // Make function async
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      await deleteItem(id); // Call Supabase function
      toast({ // Toast is now handled by the context function
        title: "Berhasil",
        description: "Barang berhasil dihapus.",
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Barang
        </Button>
      </div>

      {loading ? (
          <p>Memuat data...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Belum ada data barang.</TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => openDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItemHandler(item.id)} // Use the async handler
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}


      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Edit Barang' : 'Tambah Barang'}</DialogTitle>
            <DialogDescription>
              {currentItem ? 'Edit data barang.' : 'Tambahkan barang baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                value={formState.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Satuan
              </Label>
              <Input
                id="unit"
                value={formState.unit}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Batal</Button>
            <Button onClick={saveItem}>{currentItem ? 'Simpan Perubahan' : 'Tambah Barang'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemListPage;