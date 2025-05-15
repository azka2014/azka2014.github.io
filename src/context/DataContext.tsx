import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define interfaces for data types
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

export interface IncomingTransaction {
  id: string;
  date: string; // Using string for simplicity, could use Date
  itemId: string;
  supplierId: string;
  quantity: number;
}

export interface OutgoingTransaction {
  id: string;
  date: string; // Using string for simplicity, could use Date
  itemId: string;
  departmentId: string;
  quantity: number;
}

// Define the shape of the context data
interface DataContextType {
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
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  addIncomingTransaction: (transaction: Omit<IncomingTransaction, 'id'>) => void;
  addOutgoingTransaction: (transaction: Omit<OutgoingTransaction, 'id'>) => void;
  // Add update/delete for transactions if needed later
  getItemById: (id: string) => Item | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getDepartmentById: (id: string) => Department | undefined;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // State for each data type
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [incomingTransactions, setIncomingTransactions] = useState<IncomingTransaction[]>([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState<OutgoingTransaction[]>([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedDepartments = localStorage.getItem('departments');
    const savedItems = localStorage.getItem('items');
    const savedIncoming = localStorage.getItem('incomingTransactions');
    const savedOutgoing = localStorage.getItem('outgoingTransactions');

    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedDepartments) setDepartments(JSON.parse(savedDepartments));
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedIncoming) setIncomingTransactions(JSON.parse(savedIncoming));
    if (savedOutgoing) setOutgoingTransactions(JSON.parse(savedOutgoing));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('incomingTransactions', JSON.stringify(incomingTransactions));
  }, [incomingTransactions]);

  useEffect(() => {
    localStorage.setItem('outgoingTransactions', JSON.stringify(outgoingTransactions));
  }, [outgoingTransactions]);

  // Helper function to generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

  // CRUD operations for Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { id: generateId(), ...supplier };
    setSuppliers([...suppliers, newSupplier]);
    toast({ title: "Berhasil", description: "Suplier baru berhasil ditambahkan." });
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(sup => sup.id === updatedSupplier.id ? updatedSupplier : sup));
    toast({ title: "Berhasil", description: "Data suplier berhasil diupdate." });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(sup => sup.id !== id));
    toast({ title: "Berhasil", description: "Suplier berhasil dihapus." });
  };

  // CRUD operations for Departments
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment = { id: generateId(), ...department };
    setDepartments([...departments, newDepartment]);
    toast({ title: "Berhasil", description: "Departemen baru berhasil ditambahkan." });
  };

  const updateDepartment = (updatedDepartment: Department) => {
    setDepartments(departments.map(dep => dep.id === updatedDepartment.id ? updatedDepartment : dep));
    toast({ title: "Berhasil", description: "Data departemen berhasil diupdate." });
  };

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(dep => dep.id !== id));
    toast({ title: "Berhasil", description: "Departemen berhasil dihapus." });
  };

  // CRUD operations for Items
  const addItem = (item: Omit<Item, 'id' | 'stock'>) => {
    const newItem = { id: generateId(), ...item, stock: 0 }; // New items start with 0 stock
    setItems([...items, newItem]);
    toast({ title: "Berhasil", description: "Barang baru berhasil ditambahkan." });
  };

  const updateItem = (updatedItem: Item) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    toast({ title: "Berhasil", description: "Data barang berhasil diupdate." });
  };

  const deleteItem = (id: string) => {
     // Prevent deleting items that have stock > 0
     const itemToDelete = items.find(item => item.id === id);
     if (itemToDelete && itemToDelete.stock > 0) {
       toast({
         title: "Gagal",
         description: "Tidak dapat menghapus barang karena stok masih ada.",
         variant: "destructive",
       });
       return;
     }
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Berhasil", description: "Barang berhasil dihapus." });
  };

  // Transaction operations
  const addIncomingTransaction = (transaction: Omit<IncomingTransaction, 'id'>) => {
    const newTransaction = { id: generateId(), ...transaction };
    setIncomingTransactions([newTransaction, ...incomingTransactions]); // Add to the beginning

    // Update item stock
    setItems(items.map(item =>
      item.id === transaction.itemId ? { ...item, stock: item.stock + transaction.quantity } : item
    ));

    toast({ title: "Berhasil", description: "Transaksi barang masuk berhasil dicatat." });
  };

  const addOutgoingTransaction = (transaction: Omit<OutgoingTransaction, 'id'>) => {
     // Check if enough stock is available
     const item = items.find(item => item.id === transaction.itemId);
     if (!item || item.stock < transaction.quantity) {
       toast({
         title: "Gagal",
         description: "Stok barang tidak mencukupi.",
         variant: "destructive",
       });
       return;
     }

    const newTransaction = { id: generateId(), ...transaction };
    setOutgoingTransactions([newTransaction, ...outgoingTransactions]); // Add to the beginning

    // Update item stock
    setItems(items.map(item =>
      item.id === transaction.itemId ? { ...item, stock: item.stock - transaction.quantity } : item
    ));

    toast({ title: "Berhasil", description: "Transaksi barang keluar berhasil dicatat." });
  };

  // Helper functions to get data by ID
  const getItemById = (id: string) => items.find(item => item.id === id);
  const getSupplierById = (id: string) => suppliers.find(supplier => supplier.id === id);
  const getDepartmentById = (id: string) => departments.find(department => department.id === id);


  return (
    <DataContext.Provider
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
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};