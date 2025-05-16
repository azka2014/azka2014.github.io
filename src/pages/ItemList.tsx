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
  // Tambahkan initialStock ke formState
  const [formState, setFormState] = useState({ name: '', unit: '', initialStock: '' });
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
     // Handle initialStock input specifically to ensure it's a number or empty
    if (id === 'initialStock') {
        // Allow empty string initially, but validate as number later
        setFormState((prev) => ({ ...prev, [id]: value }));
    } else {
        setFormState((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Open dialog for adding or editing
  const openDialog = (item?: Item) => {
    if (item) {
      setCurrentItem(item);
      // Saat edit, set formState hanya untuk nama dan satuan, stok awal tidak diedit
      setFormState({ name: item.name, unit: item.unit, initialStock: '' }); // Reset initialStock for edit
    } else {
      setCurrentItem(null);
      // Reset formState termasuk initialStock saat menambah baru
      setFormState({ name: '', unit: '', initialStock: '' });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
    // Reset form state
    setFormState({ name: '', unit: '', initialStock: '' });
  };

  // Save item (Add or Edit)
  const saveItem = async () => {
    const { name, unit, initialStock } = formState;
    const initialStockNumber = Number(initialStock);

    if (!name || !unit) {
      toast({
        title: "Gagal",
        description: "Nama barang dan satuan harus diisi.",
        variant: "destructive",
      });
      return;
    }

    // Validasi stok awal hanya saat menambah barang baru
    if (!currentItem) {
        if (initialStock === '' || isNaN(initialStockNumber) || initialStockNumber < 0) {
             toast({
                title: "Gagal",
                description: "Stok awal harus berupa angka non-negatif.",
                variant: "destructive",
             });
             return;
        }
    }


    if (currentItem) {
      // Edit existing item - JANGAN update stok di sini
      const updatedItem = {
        id: currentItem.id,
        name: name,
        unit: unit,
        // stock TIDAK disertakan di sini karena dikelola oleh transaksi
      };
      await updateItem(updatedItem);
    } else {
      // Add new item - sertakan stok awal
      const newItem = {
        name: name,
        unit: unit,
        initialStock: initialStockNumber, // Kirim stok awal
      };
      await addItem(newItem); // Fungsi addItem di context perlu diupdate
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
          // raw: false keeps numbers as numbers, dates as date objects
          const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

          if (json.length <= 1) {
             toast({
                title: "Gagal Import",
                description: "File Excel kosong atau hanya berisi header.",
                variant: "destructive",
             });
             return;
          }

          // Assuming the first row is header: [Nama Barang, Satuan, Stok Awal (Opsional)]
          // And data starts from the second row
          const header = json[0];
          const expectedHeader = ["Nama Barang", "Satuan"]; // Minimum required headers
          const optionalHeader = "Stok Awal"; // Optional header for initial stock

          // Basic header validation
          if (header.length < expectedHeader.length || !expectedHeader.every((col, index) => header[index] === col)) {
               toast({
                  title: "Gagal Import",
                  description: `Format header tidak sesuai. Harap gunakan format minimal: ${expectedHeader.join(', ')} (Opsional: ${optionalHeader})`,
                  variant: "destructive",
               });
               return;
          }

          // Find column indices
          const nameIndex = header.indexOf("Nama Barang");
          const unitIndex = header.indexOf("Satuan");
          const stockIndex = header.indexOf(optionalHeader); // Find index of optional stock column


          const itemsToImport = json.slice(1).map(row => {
             // Map columns based on found indices
             const name = row[nameIndex];
             const unit = row[unitIndex];
             // Get stock if the column exists and the value is a valid number
             const stock = stockIndex !== -1 && typeof row[stockIndex] === 'number' && !isNaN(row[stockIndex]) ? Math.max(0, Math.floor(row[stockIndex])) : 0; // Ensure non-negative integer

             return { name, unit, initialStock: stock }; // Pass stock as initialStock
          }).filter(item => item.name && item.unit); // Filter out rows with missing required data (name, unit)

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
  const handleImport = async (itemsToImport: { name: string; unit: string; initialStock: number }[]) => {
      let successCount = 0;
      let errorCount = 0;
      const importToastId = toast({
          title: "Import Data",
          description: "Memulai proses import...",
          duration: 0, // Keep toast open
      });

      for (const item of itemsToImport) {
          try {
              // Use the existing addItem function from context
              // Pass the initialStock from the parsed data
              await addItem({ name: item.name, unit: item.unit, initialStock: item.initialStock }); // Pass initialStock
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
            {/* Tampilkan input Stok Awal HANYA saat menambah barang baru */}
            {!currentItem && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="initialStock" className="text-right">
                    Stok Awal
                  </Label>
                  <Input
                    id="initialStock"
                    type="number"
                    value={formState.initialStock}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min="0"
                  />
                </div>
            )}
             {/* Tampilkan Stok Saat Ini saat mengedit (tidak bisa diedit) */}
             {currentItem && (
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="currentStock" className="text-right">
                     Stok Saat Ini
                   </Label>
                   <Input
                     id="currentStock"
                     type="number"
                     value={currentItem.stock} // Tampilkan stok saat ini
                     className="col-span-3"
                     disabled // Nonaktifkan input
                   />
                 </div>
             )}
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