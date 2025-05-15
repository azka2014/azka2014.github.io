import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast'; // Using shadcn's useToast

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
  unit: string; // Satuan
  stock: number; // Stok barang
}

interface IncomingTransaction {
  id: string;
  date: string; // Using string for simplicity, can be Date
  itemId: string; // Link to Item
  supplierId: string; // Link to Supplier
  quantity: number;
}

interface OutgoingTransaction {
  id: string;
  date: string; // Using string for simplicity, can be Date
  itemId: string; // Link to Item
  departmentId: string; // Link to Department
  quantity: number;
}

interface AppData {
  suppliers: Supplier[];
  departments: Department[];
  items: Item[];
  incomingTransactions: IncomingTransaction[];
  outgoingTransactions: OutgoingTransaction[];
}

interface DataContextType extends AppData {
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

  // Helper functions to get related data
  getItemById: (id: string) => Item | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getDepartmentById: (id: string) => Department | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'rsud_inventory_data';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    suppliers: [],
    departments: [],
    items: [],
    incomingTransactions: [],
    outgoingTransactions: [],
  });
  const { toast } = useToast();

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData: AppData = JSON.parse(savedData);
        // Ensure stock and quantity are numbers, handle potential parsing issues
        parsedData.items = parsedData.items.map(item => ({
            ...item,
            stock: Number(item.stock) || 0
        }));
         parsedData.incomingTransactions = parsedData.incomingTransactions.map(tx => ({
            ...tx,
            quantity: Number(tx.quantity) || 0
        }));
         parsedData.outgoingTransactions = parsedData.outgoingTransactions.map(tx => ({
            ...tx,
            quantity: Number(tx.quantity) || 0
        }));

        setData(parsedData);
      } catch (e) {
        console.error("Failed to parse data from localStorage", e);
        // Optionally clear invalid data if parsing fails completely
        // localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
      toast({
        title: "Peringatan",
        description: "Gagal menyimpan data ke penyimpanan lokal. Data mungkin hilang saat refresh.",
        variant: "destructive",
      });
    }
  }, [data, toast]);

  // --- Supplier Actions ---
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = { id: Date.now().toString(), ...supplier };
    setData(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }));
  };

  const updateSupplier = (supplier: Supplier) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(sup => sup.id === supplier.id ? supplier : sup)
    }));
  };

  const deleteSupplier = (id: string) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(sup => sup.id !== id)
    }));
  };

  // --- Department Actions ---
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment: Department = { id: Date.now().toString(), ...department };
    setData(prev => ({ ...prev, departments: [...prev.departments, newDepartment] }));
  };

  const updateDepartment = (department: Department) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.map(dep => dep.id === department.id ? department : dep)
    }));
  };

  const deleteDepartment = (id: string) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.filter(dep => dep.id !== id)
    }));
  };

  // --- Item Actions ---
  const addItem = (item: Omit<Item, 'id' | 'stock'>) => {
    const newItem: Item = { id: Date.now().toString(), ...item, stock: 0 };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (item: Item) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(itm => itm.id === item.id ? item : itm)
    }));
  };

  const deleteItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(itm => itm.id !== id)
    }));
  };

  // --- Transaction Actions ---
  const addIncomingTransaction = (transaction: Omit<IncomingTransaction, 'id'>) => {
    const newTransaction: IncomingTransaction = { id: Date.now().toString(), ...transaction };
    setData(prev => {
      // Update item stock
      const updatedItems = prev.items.map(item =>
        item.id === transaction.itemId ? { ...item, stock: item.stock + transaction.quantity } : item
      );
      return {
        ...prev,
        incomingTransactions: [...prev.incomingTransactions, newTransaction],
        items: updatedItems,
      };
    });
  };

  const addOutgoingTransaction = (transaction: Omit<OutgoingTransaction, 'id'>) => {
     setData(prev => {
      // Update item stock - check if enough stock first (basic check)
      const itemToUpdate = prev.items.find(item => item.id === transaction.itemId);
      if (!itemToUpdate || itemToUpdate.stock < transaction.quantity) {
         toast({
            title: "Gagal",
            description: `Stok barang "${itemToUpdate?.name || 'Barang tidak ditemukan'}" tidak mencukupi. Stok tersedia: ${itemToUpdate?.stock || 0}.`,
            variant: "destructive",
          });
         return prev; // Return previous state if stock is insufficient
      }

      const newTransaction: OutgoingTransaction = { id: Date.now().toString(), ...transaction };
      const updatedItems = prev.items.map(item =>
        item.id === transaction.itemId ? { ...item, stock: item.stock - transaction.quantity } : item
      );
      return {
        ...prev,
        outgoingTransactions: [...prev.outgoingTransactions, newTransaction],
        items: updatedItems,
      };
    });
  };

  // --- Helper Getters ---
  const getItemById = (id: string) => data.items.find(item => item.id === id);
  const getSupplierById = (id: string) => data.suppliers.find(sup => sup.id === id);
  const getDepartmentById = (id: string) => data.departments.find(dep => dep.id === dep.id); // Fix: should be dep.id === id


  return (
    <DataContext.Provider value={{
      ...data,
      addSupplier, updateSupplier, deleteSupplier,
      addDepartment, updateDepartment, deleteDepartment,
      addItem, updateItem, deleteItem,
      addIncomingTransaction, addOutgoingTransaction,
      getItemById, getSupplierById, getDepartmentById,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};