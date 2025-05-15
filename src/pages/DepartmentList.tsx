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
import { useToast } from '@/components/ui/use-toast'; // Using shadcn's useToast

interface Department {
  id: string;
  name: string;
  // Add other department fields if needed
}

const DepartmentListPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formState, setFormState] = useState({ name: '' });
  const { toast } = useToast();

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
      setDepartments(departments.map(dep =>
        dep.id === currentDepartment.id ? { ...dep, ...formState } : dep
      ));
      toast({
        title: "Berhasil",
        description: "Data departemen berhasil diupdate.",
      });
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Date.now().toString(), // Simple unique ID
        ...formState,
      };
      setDepartments([...departments, newDepartment]);
      toast({
        title: "Berhasil",
        description: "Departemen baru berhasil ditambahkan.",
      });
    }
    closeDialog();
  };

  // Delete department
  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(dep => dep.id !== id));
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
                    onClick={() => deleteDepartment(department.id)}
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