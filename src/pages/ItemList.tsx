import React, { useState, useEffect, useRef } from 'react'; // Import useRef
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
import { Pencil, Trash2, PlusCircle, Upload } from 'lucide-react'; // Import Upload icon
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx'; // Import xlsx library

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

const ItemListPage = () => {
  const { items, addItem, updateItem, deleteItem, loading: inventoryLoading } = useInventory();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [formState, setFormState] = useState({ name: '', unit: '' });
  const { toast } = useToast();

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cek sesi saat komponen dimuat
  useEffect(() => {
    console.log("ItemList.tsx: useEffect running");
    const checkSession = async () => {
      console.log("ItemList.tsx: checkSession running");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("ItemList.tsx: getSession result", { session, error });

        if (error) {
          console.error("ItemList.tsx: Error getting session", error);
          navigate('/login', { replace: true });
        } else if (!session) {
          console.log("ItemList.tsx: No session found, navigating to /login");
          navigate('/login', { replace: true });
        } else {
          console.log("ItemList.tsx: Session found, setting authLoading to false");
          setAuthLoading(false);
        }
      } catch (e) {
        console.error("ItemList.tsx: Exception during getSession", e);
        navigate('/login', { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

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
  const saveItem = async () => {
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
      const updatedItem = {
        id: currentItem.id,
        name: formState.name,
        unit: formState.unit,
      };
      await updateItem(updatedItem);
    } else {
      // Add new item
      const newItem = {
        name: formState.name,
        unit: formState.unit,
      };
      await addItem(newItem);
    }
    closeDialog();
  };

  // Delete item
  const deleteItemHandler = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      await deleteItem(id);
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          // Convert sheet to array of objects, skipping header row
          const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

          if (json.length <= 1) {
             toast({
                title: "Gagal Import",
                description: "File Excel kosong atau hanya berisi header.",
                variant: "destructive",
             });
             return;
          }

          // Assuming the first row is header: [Nama Barang, Satuan]
          // And data starts from the second row
          const header = json[0];
          const expectedHeader = ["Nama Barang", "Satuan"]; // Define expected headers

          // Basic header validation
          if (header.length < expectedHeader.length || !expectedHeader.every((col, index) => header[index] === col)) {
               toast({
                  title: "Gagal Import",
                  description: `Format header tidak sesuai. Harap gunakan format: ${expectedHeader.join(', ')}`,
                  variant: "destructive",
               });
               return;
          }


          const itemsToImport = json.slice(1).map(row => {
             // Map columns based on expected header position
             const name = row[header.indexOf("Nama Barang")];
             const unit = row[header.indexOf("Satuan")];
             return { name, unit };
          }).filter(item => item.name && item.unit); // Filter out rows with missing data

          if (itemsToImport.length === 0) {
               toast({
                  title: "Gagal Import",
                  description: "Tidak ada data barang yang valid ditemukan di file.",
                  variant: "destructive",
               });
               return;
          }

          handleImport(itemsToImport);

        } catch (error: any) {
          console.error("Error reading Excel file:", error);
          toast({
            title: "Gagal Import",
            description: `Terjadi kesalahan saat membaca file: ${error.message}`,
            variant: "destructive",
          });
        }
      };

      reader.readAsBinaryString(file);
    }
     // Reset file input value to allow selecting the same file again
     if (fileInputRef.current) {
        fileInputRef.current.value = '';
     }
  };

  // Process imported data and add to Supabase
  const handleImport = async (itemsToImport: { name: string; unit: string }[]) => {
      let successCount = 0;
      let errorCount = 0;
      const importToastId = toast({
          title: "Import Data",
          description: "Memulai proses import...",
          duration: 0, // Keep toast open
      });

      for (const item of itemsToImport) {
          // Check if item with same name and unit already exists (optional, depends on desired behavior)
          // const existingItem = items.find(i => i.name === item.name && i.unit === item.unit);
          // if (existingItem) {
          //     console.warn(`Item '${item.name} (${item.unit})' already exists, skipping.`);
          //     errorCount++; // Or handle as a skipped item
          //     continue;
          // }

          // Use the existing addItem function from context
          // Note: addItem already handles Supabase insertion and local state update/refetch
          try {
              // addItem is async and handles its own toast/error logging
              // We just need to count success/failure here
              await addItem(item); // This will trigger fetchInventory internally
              successCount++;
          } catch (e) {
              console.error("Error importing item:", item, e);
              errorCount++;
              // addItem already shows a toast for individual errors, maybe update the main toast?
          }
      }

      // Update the main import toast with summary
      toast({
          id: importToastId.id,
          title: "Import Selesai",
          description: `Import selesai. Berhasil: ${successCount}, Gagal: ${errorCount}.`,
          duration: 5000, // Close after 5 seconds
          variant: errorCount > 0 ? "destructive" : "default",
      });

      // fetchInventory is called by addItem, so the list should update automatically
  };


  // Tampilkan loading jika autentikasi atau data inventory sedang dimuat
  if (authLoading || inventoryLoading) {
      console.log("ItemList.tsx: Displaying loading state");
      return <div>Memuat data...</div>; // Atau spinner, dll.
  }

  console.log("ItemList.tsx: Displaying content");
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang</h1>
        <div className="flex space-x-2"> {/* Container for buttons */}
           {/* Hidden file input */}
           <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
           />
           {/* Import Button */}
           <Button variant="outline" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
           </Button>
           {/* Add New Button */}
           <Button onClick={() => openDialog()}>
             <PlusCircle className="mr-2 h-4 w-4" />
             Tambah Barang
           </Button>
        </div>
      </div>

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
                    onClick={() => deleteItemHandler(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>


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