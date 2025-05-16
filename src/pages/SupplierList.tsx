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
// Import fungsi CRUD dari useInventory
import { useInventory } from '@/context/InventoryContext';

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
}

const SupplierListPage = () => {
  // Gunakan fungsi CRUD dari useInventory
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [formState, setFormState] = useState({ name: '', contact: '', address: '' });
  const { toast } = useToast();

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Open dialog for adding or editing
  const openDialog = (supplier?: Supplier) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setFormState({ name: supplier.name, contact: supplier.contact || '', address: supplier.address || '' }); // Handle null values
    } else {
      setCurrentSupplier(null);
      setFormState({ name: '', contact: '', address: '' });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentSupplier(null);
    setFormState({ name: '', contact: '', address: '' });
  };

  // Save supplier (Add or Edit) - Sekarang memanggil fungsi Supabase
  const saveSupplier = async () => { // Make function async
    if (!formState.name) { // Only name is NOT NULL in DB
      toast({
        title: "Gagal",
        description: "Nama suplier harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (currentSupplier) {
      // Edit existing supplier
      const updatedSupplier = { ...currentSupplier, ...formState };
      // Panggil fungsi updateSupplier dari context
      await updateSupplier(updatedSupplier);
    } else {
      // Add new supplier
      const newSupplier = { // Omit id
        name: formState.name,
        contact: formState.contact || null, // Send null if empty string
        address: formState.address || null, // Send null if empty string
      };
      // Panggil fungsi addSupplier dari context
      await addSupplier(newSupplier);
    }
    closeDialog();
  };

  // Delete supplier - Sekarang memanggil fungsi Supabase
  const handleDeleteSupplier = async (id: string) => { // Make function async
    if (window.confirm("Apakah Anda yakin ingin menghapus suplier ini?")) {
      // Panggil fungsi deleteSupplier dari context
      await deleteSupplier(id);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Suplier</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Suplier
        </Button>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Suplier</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Belum ada data suplier.</TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.address}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => openDialog(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)} // Call new delete handler
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


      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSupplier ? 'Edit Suplier' : 'Tambah Suplier'}</DialogTitle>
            <DialogDescription>
              {currentSupplier ? 'Edit data suplier.' : 'Tambahkan suplier baru.'}
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
              <Label htmlFor="contact" className="text-right">
                Kontak
              </Label>
              <Input
                id="contact"
                value={formState.contact}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Alamat
              </Label>
              <Input
                id="address"
                value={formState.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Batal</Button>
            <Button onClick={saveSupplier}>{currentSupplier ? 'Simpan Perubahan' : 'Tambah Suplier'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierListPage;