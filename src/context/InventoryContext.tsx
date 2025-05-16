import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';
import { useToast } from '@/components/ui/use-toast';
// Perbaiki import: import instance supabase yang sudah diekspor
import { supabase } from '@/integrations/supabase/client';

// Define types for your data (should match Supabase table structure)
interface Supplier {
  id: string;
  name: string;
  contact: string | null; // Allow null based on Supabase schema
  address: string | null; // Allow null based on Supabase schema
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
  date: string; // YYYY-MM-DD format from Supabase DATE type
  item_id: string; // Use item_id to match Supabase column name
  supplier_id: string; // Use supplier_id to match Supabase column name
  quantity: number;
}

interface OutgoingTransaction {
  id: string;
  date: string; // YYYY-MM-DD format from Supabase DATE type
  item_id: string; // Use item_id to match Supabase column name
  department_id: string; // Use department_id to match Supabase column name
  quantity: number;
}

// Define the shape of the state
interface InventoryState {
  suppliers: Supplier[];
  departments: Department[];
  items: Item[];
  incomingTransactions: IncomingTransaction[];
  outgoingTransactions: OutgoingTransaction[];
  loading: boolean; // Add loading state
  error: string | null; // Add error state
}

// Define the actions
type Action =
  | { type: 'SET_STATE'; payload: InventoryState } // Action to set the entire state (used after fetching)
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: Department }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_INCOMING_TRANSACTION'; payload: IncomingTransaction }
  | { type: 'UPDATE_INCOMING_TRANSACTION'; payload: IncomingTransaction }
  | { type: 'DELETE_INCOMING_TRANSACTION'; payload: string }
  | { type: 'ADD_OUTGOING_TRANSACTION'; payload: OutgoingTransaction }
  | { type: 'UPDATE_OUTGOING_TRANSACTION'; payload: OutgoingTransaction } // Added update action
  | { type: 'DELETE_OUTGOING_TRANSACTION'; payload: string } // Added delete action
  | { type: 'SET_LOADING'; payload: boolean } // Action to set loading state
  | { type: 'SET_ERROR'; payload: string | null }; // Action to set error state


// Reducer function to handle state changes (mostly for local state updates after Supabase ops)
const inventoryReducer = (state: InventoryState, action: Action): InventoryState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload, loading: false, error: null }; // Set state from fetch
    case 'SET_LOADING':
        return { ...state, loading: action.payload };
    case 'SET_ERROR':
        return { ...state, error: action.payload, loading: false };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(sup =>
          sup.id === action.payload.id ? action.payload : sup
        ),
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(sup => sup.id !== action.payload),
      };
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, action.payload] };
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map(dep =>
          dep.id === action.payload.id ? action.payload : dep
        ),
      };
    case 'DELETE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.filter(dep => dep.id !== action.payload),
      };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'ADD_INCOMING_TRANSACTION':
      return {
        ...state,
        incomingTransactions: [...state.incomingTransactions, action.payload],
        // Stock update will be handled by a database trigger or function later
        // For now, we'll rely on refetching or a separate stock update mechanism
      };
    case 'UPDATE_INCOMING_TRANSACTION':
        return {
            ...state,
            incomingTransactions: state.incomingTransactions.map(tx =>
                tx.id === action.payload.id ? action.payload : tx
            ),
             // Stock update will be handled by a database trigger or function later
        };
    case 'DELETE_INCOMING_TRANSACTION':
        return {
            ...state,
            incomingTransactions: state.incomingTransactions.filter(tx => tx.id !== action.payload),
             // Stock update will be handled by a database trigger or function later
        };
    case 'ADD_OUTGOING_TRANSACTION':
      return {
        ...state,
        outgoingTransactions: [...state.outgoingTransactions, action.payload],
         // Stock update will be handled by a database trigger or function later
      };
    case 'UPDATE_OUTGOING_TRANSACTION': // Added update case
        return {
            ...state,
            outgoingTransactions: state.outgoingTransactions.map(tx =>
                tx.id === action.payload.id ? action.payload : tx
            ),
             // Stock update will be handled by a database trigger or function later
        };
    case 'DELETE_OUTGOING_TRANSACTION': // Added delete case
        return {
            ...state,
            outgoingTransactions: state.outgoingTransactions.filter(tx => tx.id !== action.payload),
             // Stock update will be handled by a database trigger or function later
        };
    default:
      return state;
  }
};

// Initial state
const initialState: InventoryState = {
  suppliers: [],
  departments: [],
  items: [],
  incomingTransactions: [],
  outgoingTransactions: [],
  loading: true, // Start in loading state
  error: null,
};

// Create the context
interface InventoryContextProps extends InventoryState {
  dispatch: React.Dispatch<Action>; // Keep dispatch for local state updates
  // Add functions for Supabase operations
  fetchInventory: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addDepartment: (department: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (department: Department) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'stock'>) => Promise<void>; // Stock is managed by transactions
  updateItem: (item: Omit<Item, 'stock'>) => Promise<void>; // Stock is managed by transactions
  deleteItem: (id: string) => Promise<void>;
  addIncomingTransaction: (transaction: Omit<IncomingTransaction, 'id'>) => Promise<void>;
  updateIncomingTransaction: (transaction: IncomingTransaction) => Promise<void>;
  deleteIncomingTransaction: (id: string) => Promise<void>;
  addOutgoingTransaction: (transaction: Omit<OutgoingTransaction, 'id'>) => Promise<void>;
  updateOutgoingTransaction: (transaction: OutgoingTransaction) => Promise<void>; // Added update function
  deleteOutgoingTransaction: (id: string) => Promise<void>; // Added delete function
  // Helper functions to get data by ID (operate on local state)
  getItemById: (id: string) => Item | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getDepartmentById: (id: string) => Department | undefined;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

// Create the provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { toast } = useToast();
  // Gunakan instance supabase yang sudah diekspor
  // const supabase = createClient(); // Hapus baris ini
  // Gunakan instance supabase yang diimpor
  // const supabase = importedSupabase; // Ini hanya contoh, gunakan nama import yang benar

  // --- Data Fetching from Supabase ---
  const fetchInventory = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const [
        { data: suppliersData, error: suppliersError },
        { data: departmentsData, error: departmentsError },
        { data: itemsData, error: itemsError },
        { data: incomingData, error: incomingError },
        { data: outgoingData, error: outgoingError },
      ] = await Promise.all([
        supabase.from('suppliers').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('items').select('*'),
        supabase.from('incoming_transactions').select('*'),
        supabase.from('outgoing_transactions').select('*'),
      ]);

      if (suppliersError || departmentsError || itemsError || incomingError || outgoingError) {
        console.error("Error fetching inventory data:", suppliersError || departmentsError || itemsError || incomingError || outgoingError);
        throw new Error("Gagal memuat data dari database.");
      }

      dispatch({
        type: 'SET_STATE',
        payload: {
          suppliers: suppliersData || [],
          departments: departmentsData || [],
          items: itemsData || [],
          incomingTransactions: incomingData || [],
          outgoingTransactions: outgoingData || [],
          loading: false,
          error: null,
        },
      });
      console.log("Inventory state loaded from Supabase.");

    } catch (error: any) {
      console.error("Failed to fetch inventory state:", error);
      dispatch({ type: 'SET_ERROR', payload: error.message || "Terjadi kesalahan saat memuat data." });
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data persediaan dari database.",
        variant: "destructive",
      });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch data on initial mount
  useEffect(() => {
    fetchInventory();
  }, []); // Empty dependency array means this runs once on mount

  // --- Supabase CRUD Operations ---

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select().single();
    if (error) {
      console.error("Error adding supplier:", error);
      toast({ title: "Gagal", description: `Gagal menambahkan suplier: ${error.message}`, variant: "destructive" });
    } else if (data) {
      dispatch({ type: 'ADD_SUPPLIER', payload: data });
      toast({ title: "Berhasil", description: "Suplier baru berhasil ditambahkan." });
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    const { data, error } = await supabase.from('suppliers').update(supplier).eq('id', supplier.id).select().single();
     if (error) {
      console.error("Error updating supplier:", error);
      toast({ title: "Gagal", description: `Gagal mengupdate suplier: ${error.message}`, variant: "destructive" });
    } else if (data) {
      dispatch({ type: 'UPDATE_SUPPLIER', payload: data });
      toast({ title: "Berhasil", description: "Data suplier berhasil diupdate." });
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
     if (error) {
      console.error("Error deleting supplier:", error);
      toast({ title: "Gagal", description: `Gagal menghapus suplier: ${error.message}`, variant: "destructive" });
    } else {
      dispatch({ type: 'DELETE_SUPPLIER', payload: id });
      toast({ title: "Berhasil", description: "Suplier berhasil dihapus." });
    }
  };

  const addDepartment = async (department: Omit<Department, 'id'>) => {
    const { data, error } = await supabase.from('departments').insert([department]).select().single();
     if (error) {
      console.error("Error adding department:", error);
      toast({ title: "Gagal", description: `Gagal menambahkan departemen: ${error.message}`, variant: "destructive" });
    } else if (data) {
      dispatch({ type: 'ADD_DEPARTMENT', payload: data });
      toast({ title: "Berhasil", description: "Departemen baru berhasil ditambahkan." });
    }
  };

  const updateDepartment = async (department: Department) => {
    const { data, error } = await supabase.from('departments').update(department).eq('id', department.id).select().single();
     if (error) {
      console.error("Error updating department:", error);
      toast({ title: "Gagal", description: `Gagal mengupdate departemen: ${error.message}`, variant: "destructive" });
    } else if (data) {
      dispatch({ type: 'UPDATE_DEPARTMENT', payload: data });
      toast({ title: "Berhasil", description: "Data departemen berhasil diupdate." });
    }
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
     if (error) {
      console.error("Error deleting department:", error);
      toast({ title: "Gagal", description: `Gagal menghapus departemen: ${error.message}`, variant: "destructive" });
    } else {
      dispatch({ type: 'DELETE_DEPARTMENT', payload: id });
      toast({ title: "Berhasil", description: "Departemen berhasil dihapus." });
    }
  };

  const addItem = async (item: Omit<Item, 'id' | 'stock'>) => {
     // When adding an item, stock starts at 0 in the database
    const { data, error } = await supabase.from('items').insert([{ name: item.name, unit: item.unit, stock: 0 }]).select().single();
     if (error) {
      console.error("Error adding item:", error);
      toast({ title: "Gagal", description: `Gagal menambahkan barang: ${error.message}`, variant: "destructive" });
    } else if (data) {
      dispatch({ type: 'ADD_ITEM', payload: data });
      toast({ title: "Berhasil", description: "Barang baru berhasil ditambahkan." });
    }
  };

  const updateItem = async (item: Omit<Item, 'stock'>) => {
     // Note: Stock is not updated directly here, it's managed by transactions
    const { data, error } = await supabase.from('items').update({ name: item.name, unit: item.unit }).eq('id', item.id).select().single();
     if (error) {
      console.error("Error updating item:", error);
      toast({ title: "Gagal", description: `Gagal mengupdate barang: ${error.message}`, variant: "destructive" });
    } else if (data) {
       // Update local state with the returned data (which includes the current stock)
      dispatch({ type: 'UPDATE_ITEM', payload: data });
      toast({ title: "Berhasil", description: "Data barang berhasil diupdate." });
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
     if (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Gagal", description: `Gagal menghapus barang: ${error.message}`, variant: "destructive" });
    } else {
      dispatch({ type: 'DELETE_ITEM', payload: id });
      toast({ title: "Berhasil", description: "Barang berhasil dihapus." });
    }
  };

  const addIncomingTransaction = async (transaction: Omit<IncomingTransaction, 'id'>) => {
     // Supabase will handle stock update via trigger/function
    const { data, error } = await supabase.from('incoming_transactions').insert([transaction]).select().single();
     if (error) {
      console.error("Error adding incoming transaction:", error);
      toast({ title: "Gagal", description: `Gagal menambahkan transaksi masuk: ${error.message}`, variant: "destructive" });
    } else if (data) {
       // Refetch all data to ensure stock is updated correctly in local state
       // A more efficient way would be to update local state based on the transaction
       // and the item's previous stock, or use real-time subscriptions.
       // For simplicity now, we refetch everything.
       fetchInventory();
       toast({ title: "Berhasil", description: "Transaksi barang masuk baru berhasil ditambahkan." });
    }
  };

   const updateIncomingTransaction = async (transaction: IncomingTransaction) => {
       // Supabase will handle stock update via trigger/function
       const { data, error } = await supabase.from('incoming_transactions').update(transaction).eq('id', transaction.id).select().single();
       if (error) {
           console.error("Error updating incoming transaction:", error);
           toast({ title: "Gagal", description: `Gagal mengupdate transaksi masuk: ${error.message}`, variant: "destructive" });
       } else if (data) {
           // Refetch all data to ensure stock is updated correctly in local state
           fetchInventory();
           toast({ title: "Berhasil", description: "Transaksi barang masuk berhasil diupdate." });
       }
   };

   const deleteIncomingTransaction = async (id: string) => {
       // Supabase will handle stock update via trigger/function
       const { error } = await supabase.from('incoming_transactions').delete().eq('id', id);
       if (error) {
           console.error("Error deleting incoming transaction:", error);
           toast({ title: "Gagal", description: `Gagal menghapus transaksi masuk: ${error.message}`, variant: "destructive" });
       } else {
           // Refetch all data to ensure stock is updated correctly in local state
           fetchInventory();
           toast({ title: "Berhasil", description: "Transaksi barang masuk berhasil dihapus." });
       }
   };


  const addOutgoingTransaction = async (transaction: Omit<OutgoingTransaction, 'id'>) => {
     // Supabase will handle stock update via trigger/function
     // We might need a check here or in Supabase to ensure sufficient stock
    const { data, error } = await supabase.from('outgoing_transactions').insert([transaction]).select().single();
     if (error) {
      console.error("Error adding outgoing transaction:", error);
      toast({ title: "Gagal", description: `Gagal menambahkan transaksi keluar: ${error.message}`, variant: "destructive" });
    } else if (data) {
       // Refetch all data to ensure stock is updated correctly in local state
       fetchInventory();
       toast({ title: "Berhasil", description: "Transaksi barang keluar baru berhasil ditambahkan." });
    }
  };

  // Added update function
  const updateOutgoingTransaction = async (transaction: OutgoingTransaction) => {
      // Supabase will handle stock update via trigger/function
      const { data, error } = await supabase.from('outgoing_transactions').update(transaction).eq('id', transaction.id).select().single();
      if (error) {
          console.error("Error updating outgoing transaction:", error);
          toast({ title: "Gagal", description: `Gagal mengupdate transaksi keluar: ${error.message}`, variant: "destructive" });
      } else if (data) {
          // Refetch all data to ensure stock is updated correctly in local state
          fetchInventory();
          toast({ title: "Berhasil", description: "Transaksi barang keluar berhasil diupdate." });
      }
  };

  // Added delete function
  const deleteOutgoingTransaction = async (id: string) => {
      // Supabase will handle stock update via trigger/function
      const { error } = await supabase.from('outgoing_transactions').delete().eq('id', id);
      if (error) {
          console.error("Error deleting outgoing transaction:", error);
          toast({ title: "Gagal", description: `Gagal menghapus transaksi keluar: ${error.message}`, variant: "destructive" });
      } else {
          // Refetch all data to ensure stock is updated correctly in local state
          fetchInventory();
          toast({ title: "Berhasil", description: "Transaksi barang keluar berhasil dihapus." });
      }
  };


  // Helper functions to get data by ID (operate on local state)
  const getItemById = (id: string) => state.items.find(item => item.id === id);
  const getSupplierById = (id: string) => state.suppliers.find(sup => sup.id === id);
  const getDepartmentById = (id: string) => state.departments.find(dep => dep.id === id); // Fix: should use id === dep.id


  return (
    <InventoryContext.Provider value={{
        ...state,
        dispatch, // Keep dispatch for reducer actions if needed, but prefer direct Supabase calls via new functions
        fetchInventory,
        addSupplier, updateSupplier, deleteSupplier,
        addDepartment, updateDepartment, deleteDepartment,
        addItem, updateItem, deleteItem,
        addIncomingTransaction, updateIncomingTransaction, deleteIncomingTransaction,
        addOutgoingTransaction, updateOutgoingTransaction, deleteOutgoingTransaction, // Added new functions
        getItemById, getSupplierById, getDepartmentById
     }}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the Inventory Context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};