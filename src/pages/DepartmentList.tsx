import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/context/DataContext'; // Import useData

interface Department {
  id: string;
  name: string;
}

const DepartmentListPage = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useData(); // Use data from context
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formState, setFormState] = useState({ name: '' });
  const { toast } = useToast();

  // Effect to update formState when currentDepartment changes (for editing)
  useEffect(() => {
    if (currentDepartment) {
      setFormState({ name: currentDepartment.name });
    } else {
      setFormState({ name: '' });
    }
  }, [currentDepartment]);

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Open dialog for adding or editing
  const openDialog = (department?: Department) => {
    setCurrentDepartment(department || null);
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentDepartment(null);
    setFormState({ name: '' });
  };

  // Save department (Add or Edit)
  const saveDepartment = () => {
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
      updateDepartment({ ...currentDepartment, ...formState });
      toast({
        title: "Berhasil",
        description: "Data departemen berhasil diupdate.",
      });
    } else {
      // Add new department
      addDepartment(formState);
      toast({
        title: "Berhasil",
        description: "Departemen baru berhasil ditambahkan.",
      });
    }
    closeDialog();
  };

  // Delete department
  const handleDeleteDepartment = (id: string) => {
     // TODO: Add confirmation dialog
    deleteDepartment(id);
    toast({
      title: "Berhasil",
      description: "Departemen berhasil dihapus.",
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Departemen</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Departemen
        </Button>
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
                    onClick={() => handleDeleteDepartment(department.id)}
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