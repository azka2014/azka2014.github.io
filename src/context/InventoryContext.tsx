import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define interfaces for data types
interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

interface Department {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

interface IncomingTransaction {
  id: string;
  date: string; // Using string for simplicity, can use Date object
  itemId: string;
  supplierId: string;
  quantity: number;
}

interface OutgoingTransaction {
  id: string;
  date: string; // Using string for simplicity, can use Date object
  itemId: string;
  departmentId: string;
  quantity: number;
}

// Define the shape of the context state and functions
interface InventoryContextType {
  suppliers: Supplier[];
  departments: Department[];
  items: Item[];
  incomingTransactions: IncomingTransaction[];
  outgoingTransactions: OutgoingTransaction[];

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (department: Department) => void;
  deleteDepartment: (id: string) => void;

  addItem: (item: Omit<Item, 'id' | 'stock'>) => void;
  updateItem: (item: Omit<Item, 'stock'>) => void; // Stock is updated via transactions
  deleteItem: (id: string) => void;

  addIncomingTransaction: (transaction: Omit<IncomingTransaction, 'id'>) => boolean; // Returns true if successful
  addOutgoingTransaction: (transaction: Omit<OutgoingTransaction, 'id'>) => boolean; // Returns true if successful

  getItemById: (id: string) => Item | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getDepartmentById: (id: string) => Department | undefined;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Create the provider component
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [incomingTransactions, setIncomingTransactions] = useState<IncomingTransaction[]>([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState<OutgoingTransaction[]>([]);
  const { toast } = useToast();

  // Helper functions to get data by ID
  const getItemById = (id: string) => items.find(item => item.id === id);
  const getSupplierById = (id: string) => suppliers.find(supplier => supplier.id === id);
  const getDepartmentById = (id: string) => departments.find(department => department.id === id);


  // Supplier actions
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { id: Date.now().toString(), ...supplier };
    setSuppliers([...suppliers, newSupplier]);
    toast({ title: "Berhasil", description: "Suplier baru berhasil ditambahkan." });
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(sup =>
      sup.id === updatedSupplier.id ? updatedSupplier : sup
    ));
    toast({ title: "Berhasil", description: "Data suplier berhasil diupdate." });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(sup => sup.id !== id));
    toast({ title: "Berhasil", description: "Suplier berhasil dihapus." });
  };

  // Department actions
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment = { id: Date.now().toString(), ...department };
    setDepartments([...departments, newDepartment]);
    toast({ title: "Berhasil", description: "Departemen baru berhasil ditambahkan." });
  };

  const updateDepartment = (updatedDepartment: Department) => {
    setDepartments(departments.map(dep =>
      dep.id === updatedDepartment.id ? updatedDepartment : dep
    ));
    toast({ title: "Berhasil", description: "Data departemen berhasil diupdate." });
  };

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(dep => dep.id !== id));
    toast({ title: "Berhasil", description: "Departemen berhasil dihapus." });
  };

  // Item actions
  const addItem = (item: Omit<Item, 'id' | 'stock'>) => {
    const newItem = { id: Date.now().toString(), ...item, stock: 0 };
    setItems([...items, newItem]);
    toast({ title: "Berhasil", description: "Barang baru berhasil ditambahkan." });
  };

  const updateItem = (updatedItem: Omit<Item, 'stock'>) => {
     setItems(items.map(item =>
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    ));
    toast({ title: "Berhasil", description: "Data barang berhasil diupdate." });
  };

  const deleteItem = (id: string) => {
    // TODO: Add check if item is used in transactions before deleting
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Berhasil", description: "Barang berhasil dihapus." });
  };

  // Transaction actions
  const addIncomingTransaction = (transaction: Omit<IncomingTransaction, 'id'>): boolean => {
    const item = getItemById(transaction.itemId);
    if (!item) {
      toast({ title: "Gagal", description: "Barang tidak ditemukan.", variant: "destructive" });
      return false;
    }
    if (transaction.quantity <= 0) {
         toast({ title: "Gagal", description: "Jumlah masuk harus lebih dari 0.", variant: "destructive" });
         return false;
    }

    const newTransaction = { id: Date.now().toString(), ...transaction };
    setIncomingTransactions([newTransaction, ...incomingTransactions]);

    // Update item stock
    setItems(items.map(item =>
      item.id === transaction.itemId ? { ...item, stock: item.stock + transaction.quantity } : item
    ));

    toast({ title: "Berhasil", description: "Transaksi barang masuk berhasil dicatat." });
    return true;
  };

  const addOutgoingTransaction = (transaction: Omit<OutgoingTransaction, 'id'>): boolean => {
    const item = getItemById(transaction.itemId);
    if (!item) {
      toast({ title: "Gagal", description: "Barang tidak ditemukan.", variant: "destructive" });
      return false;
    }
     if (transaction.quantity <= 0) {
         toast({ title: "Gagal", description: "Jumlah keluar harus lebih dari 0.", variant: "destructive" });
         return false;
    }
    if (item.stock < transaction.quantity) {
      toast({ title: "Gagal", description: "Stok barang tidak mencukupi.", variant: "destructive" });
      return false;
    }

    const newTransaction = { id: Date.now().toString(), ...transaction };
    setOutgoingTransactions([newTransaction, ...outgoingTransactions]);

    // Update item stock
    setItems(items.map(item =>
      item.id === transaction.itemId ? { ...item, stock: item.stock - transaction.quantity } : item
    ));

    toast({ title: "Berhasil", description: "Transaksi barang keluar berhasil dicatat." });
    return true;
  };

  // TODO: Implement update/delete for transactions (requires careful stock adjustment)

  return (
    <InventoryContext.Provider
      value={{
        suppliers,
        departments,
        items,
        incomingTransactions,
        outgoingTransactions,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addItem,
        updateItem,
        deleteItem,
        addIncomingTransaction,
        addOutgoingTransaction,
        getItemById,
        getSupplierById,
        getDepartmentById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the InventoryContext
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};