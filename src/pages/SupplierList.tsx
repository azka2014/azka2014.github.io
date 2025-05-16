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

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
}

const SupplierListPage = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading: inventoryLoading } = useInventory();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [formState, setFormState] = useState({ name: '', contact: '', address: '' });
  const { toast } = useToast();

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cek sesi saat komponen dimuat
  useEffect(() => {
    console.log("SupplierList.tsx: useEffect running");
    const checkSession = async () => {
      console.log("SupplierList.tsx: checkSession running");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("SupplierList.tsx: getSession result", { session, error });

        if (error) {
          console.error("SupplierList.tsx: Error getting session", error);
          navigate('/login', { replace: true });
        } else if (!session) {
          console.log("SupplierList.tsx: No session found, navigating to /login");
          navigate('/login', { replace: true });
        } else {
          console.log("SupplierList.tsx: Session found, setting authLoading to false");
          setAuthLoading(false);
        }
      } catch (e) {
        console.error("SupplierList.tsx: Exception during getSession", e);
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
  const openDialog = (supplier?: Supplier) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setFormState({ name: supplier.name, contact: supplier.contact || '', address: supplier.address || '' });
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

  // Save supplier (Add or Edit)
  const saveSupplier = async () => {
    if (!formState.name) {
      toast({
        title: "Gagal",
        description: "Nama suplier harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (currentSupplier) {
      // Edit existing supplier
      const updatedSupplier: Supplier = {
        id: currentSupplier.id,
        name: formState.name,
        contact: formState.contact || null,
        address: formState.address || null,
      };
      await updateSupplier(updatedSupplier);
    } else {
      // Add new supplier
      const newSupplier = {
        name: formState.name,
        contact: formState.contact || null,
        address: formState.address || null,
      };
      await addSupplier(newSupplier);
    }
    closeDialog();
  };

  // Delete supplier
  const deleteSupplierHandler = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus suplier ini?")) {
       await deleteSupplier(id);
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

          // Assuming the first row is header: [Nama Suplier, Kontak, Alamat]
          // And data starts from the second row
          const header = json[0];
          const expectedHeader = ["Nama Suplier", "Kontak", "Alamat"]; // Define expected headers

          // Basic header validation
          if (header.length < expectedHeader.length || !expectedHeader.every((col, index) => header[index] === col)) {
               toast({
                  title: "Gagal Import",
                  description: `Format header tidak sesuai. Harap gunakan format: ${expectedHeader.join(', ')}`,
                  variant: "destructive",
               });
               return;
          }


          const suppliersToImport = json.slice(1).map(row => {
             // Map columns based on expected header position
             const name = row[header.indexOf("Nama Suplier")];
             const contact = row[header.indexOf("Kontak")];
             const address = row[header.indexOf("Alamat")];
             return { name, contact, address };
          }).filter(supplier => supplier.name); // Filter out rows with missing name (required field)

          if (suppliersToImport.length === 0) {
               toast({
                  title: "Gagal Import",
                  description: "Tidak ada data suplier yang valid ditemukan di file.",
                  variant: "destructive",
               });
               return;
          }

          handleImport(suppliersToImport);

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
  const handleImport = async (suppliersToImport: { name: string; contact: string | null; address: string | null }[]) => {
      let successCount = 0;
      let errorCount = 0;
      const importToastId = toast({
          title: "Import Data",
          description: "Memulai proses import...",
          duration: 0, // Keep toast open
      });

      for (const supplier of suppliersToImport) {
          try {
              // Use the existing addSupplier function from context
              await addSupplier(supplier); // This will trigger fetchInventory internally
              successCount++;
          } catch (e) {
              console.error("Error importing supplier:", supplier, e);
              errorCount++;
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
  };


  // Tampilkan loading jika autentikasi atau data inventory sedang dimuat
  if (authLoading || inventoryLoading) {
      console.log("SupplierList.tsx: Displaying loading state");
      return <div>Memuat data...</div>;
  }

  console.log("SupplierList.tsx: Displaying content");
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Suplier</h1>
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
             Tambah Suplier
           </Button>
        </div>
      </div>

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
                    onClick={() => deleteSupplierHandler(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>


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