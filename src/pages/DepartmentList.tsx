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

interface Department {
  id: string;
  name: string;
}

const DepartmentListPage = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment, loading: inventoryLoading } = useInventory();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formState, setFormState] = useState({ name: '' });
  const { toast } = useToast();

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cek sesi saat komponen dimuat
  useEffect(() => {
    console.log("DepartmentList.tsx: useEffect running");
    const checkSession = async () => {
      console.log("DepartmentList.tsx: checkSession running");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("DepartmentList.tsx: getSession result", { session, error });

        if (error) {
          console.error("DepartmentList.tsx: Error getting session", error);
          navigate('/login', { replace: true });
        } else if (!session) {
          console.log("DepartmentList.tsx: No session found, navigating to /login");
          navigate('/login', { replace: true });
        } else {
          console.log("DepartmentList.tsx: Session found, setting authLoading to false");
          setAuthLoading(false);
        }
      } catch (e) {
        console.error("DepartmentList.tsx: Exception during getSession", e);
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
  const openDialog = (department?: Department) => {
    if (department) {
      setCurrentDepartment(department);
      setFormState({ name: department.name });
    } else {
      setCurrentDepartment(null);
      setFormState({ name: '' });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentDepartment(null);
    setFormState({ name: '' });
  };

  // Save department (Add or Edit)
  const saveDepartment = async () => {
    if (!formState.name) {
      toast({
        title: "Gagal",
        description: "Nama departemen harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (currentDepartment) {
      // Edit existing department
      const updatedDepartment: Department = {
        id: currentDepartment.id,
        name: formState.name,
      };
      await updateDepartment(updatedDepartment);
    } else {
      // Add new department
      const newDepartment = {
        name: formState.name,
      };
      await addDepartment(newDepartment);
    }
    closeDialog();
  };

  // Delete department
  const deleteDepartmentHandler = async (id: string) => {
     if (window.confirm("Apakah Anda yakin ingin menghapus departemen ini?")) {
        await deleteDepartment(id);
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

          // Assuming the first row is header: [Nama Departemen]
          // And data starts from the second row
          const header = json[0];
          const expectedHeader = ["Nama Departemen"]; // Define expected headers

          // Basic header validation
          if (header.length < expectedHeader.length || !expectedHeader.every((col, index) => header[index] === col)) {
               toast({
                  title: "Gagal Import",
                  description: `Format header tidak sesuai. Harap gunakan format: ${expectedHeader.join(', ')}`,
                  variant: "destructive",
               });
               return;
          }


          const departmentsToImport = json.slice(1).map(row => {
             // Map columns based on expected header position
             const name = row[header.indexOf("Nama Departemen")];
             return { name };
          }).filter(department => department.name); // Filter out rows with missing name (required field)

          if (departmentsToImport.length === 0) {
               toast({
                  title: "Gagal Import",
                  description: "Tidak ada data departemen yang valid ditemukan di file.",
                  variant: "destructive",
               });
               return;
          }

          handleImport(departmentsToImport);

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
  const handleImport = async (departmentsToImport: { name: string }[]) => {
      let successCount = 0;
      let errorCount = 0;
      const importToastId = toast({
          title: "Import Data",
          description: "Memulai proses import...",
          duration: 0, // Keep toast open
      });

      for (const department of departmentsToImport) {
          try {
              // Use the existing addDepartment function from context
              await addDepartment(department); // This will trigger fetchInventory internally
              successCount++;
          } catch (e) {
              console.error("Error importing department:", department, e);
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
      console.log("DepartmentList.tsx: Displaying loading state");
      return <div>Memuat data...</div>;
  }

  console.log("DepartmentList.tsx: Displaying content");
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Departemen</h1>
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
             Tambah Departemen
           </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Departemen</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">Belum ada data departemen.</TableCell>
            </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => openDialog(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDepartmentHandler(department.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>


      {/* Add/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentDepartment ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle>
            <DialogDescription>
              {currentDepartment ? 'Edit data departemen.' : 'Tambahkan departemen baru.'}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Batal</Button>
            <Button onClick={saveDepartment}>{currentDepartment ? 'Simpan Perubahan' : 'Tambah Departemen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentListPage;