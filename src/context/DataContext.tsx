import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define interfaces for data types
interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

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

interface IncomingTransaction {
  id: string;
  date: string; // Or Date type if using DatePicker
  itemId: string;
  supplierId: string;
  quantity: number;
}

interface OutgoingTransaction {
  id: string;
  date: string; // Or Date type
  itemId: string;
  departmentId: string;
  quantity: number;
}

// Define the shape of the context state and actions
interface DataContextType {
  items: Item[];
  suppliers: Supplier[];
  departments: Department[];
  incomingTransactions: IncomingTransaction[];
  outgoingTransactions: OutgoingTransaction[];

  addItem: (item: Omit<Item, 'id' | 'stock'>) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  updateItemStock: (itemId: string, quantityChange: number) => void; // quantityChange can be positive (incoming) or negative (outgoing)

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (department: Department) => void;
  deleteDepartment: (id: string) => void;

  addIncomingTransaction: (transaction: Omit<IncomingTransaction, 'id'>) => void;
  updateIncomingTransaction: (transaction: IncomingTransaction) => void;
  deleteIncomingTransaction: (id: string) => void;

  addOutgoingTransaction: (transaction: Omit<OutgoingTransaction, 'id'>) => void;
  updateOutgoingTransaction: (transaction: OutgoingTransaction) => void;
  deleteOutgoingTransaction: (id: string) => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [incomingTransactions, setIncomingTransactions] = useState<IncomingTransaction[]>([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState<OutgoingTransaction[]>([]);

  // --- Item Actions ---
  const addItem = (item: Omit<Item, 'id' | 'stock'>) => {
    const newItem: Item = { id: Date.now().toString(), ...item, stock: 0 };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (updatedItem: Item) => {
    setItems((prev) => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter(item => item.id !== id));
    // TODO: Also delete related transactions? Or prevent deletion if transactions exist?
  };

  const updateItemStock = (itemId: string, quantityChange: number) => {
    setItems((prev) =>
      prev.map(item =>
        item.id === itemId ? { ...item, stock: item.stock + quantityChange } : item
      )
    );
  };

  // --- Supplier Actions ---
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = { id: Date.now().toString(), ...supplier };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((prev) => prev.map(sup => sup.id === updatedSupplier.id ? updatedSupplier : sup));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter(sup => sup.id !== id));
    // TODO: Handle related incoming transactions
  };

  // --- Department Actions ---
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment: Department = { id: Date.now().toString(), ...department };
    setDepartments((prev) => [...prev, newDepartment]);
  };

  const updateDepartment = (updatedDepartment: Department) => {
    setDepartments((prev) => prev.map(dep => dep.id === updatedDepartment.id ? updatedDepartment : dep));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter(dep => dep.id !== id));
    // TODO: Handle related outgoing transactions
  };

  // --- Incoming Transaction Actions ---
  const addIncomingTransaction = (transaction: Omit<IncomingTransaction, 'id'>) => {
    const newTransaction: IncomingTransaction = { id: Date.now().toString(), ...transaction };
    setIncomingTransactions((prev) => [newTransaction, ...prev]); // Add to the beginning for "last 10"
    updateItemStock(transaction.itemId, transaction.quantity); // Update stock
  };

  const updateIncomingTransaction = (updatedTransaction: IncomingTransaction) => {
    // TODO: Need to calculate stock change correctly
    // This is complex: old quantity vs new quantity.
    // For simplicity now, we'll just update the transaction. Stock update logic needs refinement.
    console.warn("Update Incoming Transaction: Stock update logic not fully implemented.");
    setIncomingTransactions((prev) => prev.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx));
  };

  const deleteIncomingTransaction = (id: string) => {
    const transactionToDelete = incomingTransactions.find(tx => tx.id === id);
    if (transactionToDelete) {
      updateItemStock(transactionToDelete.itemId, -transactionToDelete.quantity); // Revert stock change
      setIncomingTransactions((prev) => prev.filter(tx => tx.id !== id));
    }
  };

  // --- Outgoing Transaction Actions ---
  const addOutgoingTransaction = (transaction: Omit<OutgoingTransaction, 'id'>) => {
    const newTransaction: OutgoingTransaction = { id: Date.now().toString(), ...transaction };
    setOutgoingTransactions((prev) => [newTransaction, ...prev]); // Add to the beginning
    updateItemStock(transaction.itemId, -transaction.quantity); // Update stock (decrease)
  };

  const updateOutgoingTransaction = (updatedTransaction: OutgoingTransaction) => {
     // TODO: Need to calculate stock change correctly
     // This is complex: old quantity vs new quantity.
     // For simplicity now, we'll just update the transaction. Stock update logic needs refinement.
     console.warn("Update Outgoing Transaction: Stock update logic not fully implemented.");
    setOutgoingTransactions((prev) => prev.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx));
  };

  const deleteOutgoingTransaction = (id: string) => {
    const transactionToDelete = outgoingTransactions.find(tx => tx.id === id);
    if (transactionToDelete) {
      updateItemStock(transactionToDelete.itemId, transactionToDelete.quantity); // Revert stock change
      setOutgoingTransactions((prev) => prev.filter(tx => tx.id !== id));
    }
  };


  return (
    <DataContext.Provider
      value={{
        items,
        suppliers,
        departments,
        incomingTransactions,
        outgoingTransactions,
        addItem,
        updateItem,
        deleteItem,
        updateItemStock,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addIncomingTransaction,
        updateIncomingTransaction,
        deleteIncomingTransaction,
        addOutgoingTransaction,
        updateOutgoingTransaction,
        deleteOutgoingTransaction,
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