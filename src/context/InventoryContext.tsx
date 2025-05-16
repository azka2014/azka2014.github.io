import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define types for your data
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
  stock: number; // Stock will be managed by transactions
}

interface IncomingTransaction {
  id: string;
  date: string; // Using string for simplicity, could use Date object
  itemId: string;
  supplierId: string;
  quantity: number;
}

interface OutgoingTransaction {
  id: string;
  date: string; // Using string for simplicity, could use Date object
  itemId: string;
  departmentId: string;
  quantity: number;
}

// Define the shape of the state
interface InventoryState {
  suppliers: Supplier[];
  departments: Department[];
  items: Item[];
  incomingTransactions: IncomingTransaction[];
  outgoingTransactions: OutgoingTransaction[];
}

// Define the actions
type Action =
  | { type: 'LOAD_STATE'; payload: InventoryState }
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
  | { type: 'UPDATE_INCOMING_TRANSACTION'; payload: IncomingTransaction } // Added update action
  | { type: 'DELETE_INCOMING_TRANSACTION'; payload: string } // Added delete action
  | { type: 'ADD_OUTGOING_TRANSACTION'; payload: OutgoingTransaction };

// Reducer function to handle state changes
const inventoryReducer = (state: InventoryState, action: Action): InventoryState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
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
      // Also remove related transactions? For simplicity, let's just remove the item for now.
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'ADD_INCOMING_TRANSACTION': {
      const transaction = action.payload;
      const updatedItems = state.items.map(item =>
        item.id === transaction.itemId
          ? { ...item, stock: item.stock + transaction.quantity }
          : item
      );
      return {
        ...state,
        incomingTransactions: [...state.incomingTransactions, transaction],
        items: updatedItems,
      };
    }
    case 'UPDATE_INCOMING_TRANSACTION': { // Handle update
        const updatedTransaction = action.payload;
        const oldTransaction = state.incomingTransactions.find(tx => tx.id === updatedTransaction.id);

        if (!oldTransaction) {
            console.error("Transaction not found for update:", updatedTransaction.id);
            return state; // Return current state if transaction not found
        }

        // Calculate the difference in quantity
        const quantityDifference = updatedTransaction.quantity - oldTransaction.quantity;

        const updatedItems = state.items.map(item => {
            // If the item ID changed (though we'll limit editing to quantity/date for simplicity),
            // this logic would need to be more complex to adjust stock for both old and new items.
            // Assuming item ID doesn't change during update for now.
            if (item.id === updatedTransaction.itemId) {
                return { ...item, stock: item.stock + quantityDifference };
            }
            return item;
        });

        return {
            ...state,
            incomingTransactions: state.incomingTransactions.map(tx =>
                tx.id === updatedTransaction.id ? updatedTransaction : tx
            ),
            items: updatedItems,
        };
    }
    case 'DELETE_INCOMING_TRANSACTION': { // Handle delete
        const transactionIdToDelete = action.payload;
        const transactionToDelete = state.incomingTransactions.find(tx => tx.id === transactionIdToDelete);

        if (!transactionToDelete) {
            console.error("Transaction not found for deletion:", transactionIdToDelete);
            return state; // Return current state if transaction not found
        }

        // Decrease stock of the associated item
        const updatedItems = state.items.map(item => {
            if (item.id === transactionToDelete.itemId) {
                // Ensure stock doesn't go below zero
                const newStock = item.stock - transactionToDelete.quantity;
                return { ...item, stock: Math.max(0, newStock) };
            }
            return item;
        });

        return {
            ...state,
            incomingTransactions: state.incomingTransactions.filter(tx => tx.id !== transactionIdToDelete),
            items: updatedItems,
        };
    }
    case 'ADD_OUTGOING_TRANSACTION': {
      const transaction = action.payload;
       // Check if enough stock is available before processing
      const item = state.items.find(item => item.id === transaction.itemId);
      if (!item || item.stock < transaction.quantity) {
         // In a real app, you'd handle this error properly (e.g., show a toast)
         console.error("Not enough stock for outgoing transaction");
         // Return current state or handle error state
         return state; // Or throw an error, or return state with an error flag
      }
      const updatedItems = state.items.map(item =>
        item.id === transaction.itemId
          ? { ...item, stock: item.stock - transaction.quantity }
          : item
      );
      return {
        ...state,
        outgoingTransactions: [...state.outgoingTransactions, transaction],
        items: updatedItems,
      };
    }
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
};

// Create the context
interface InventoryContextProps extends InventoryState {
  dispatch: React.Dispatch<Action>;
  // Add helper functions if needed, e.g., getItemById, getSupplierById etc.
  getItemById: (id: string) => Item | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getDepartmentById: (id: string) => Department | undefined;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

// Create the provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { toast } = useToast(); // Use toast for feedback

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('inventoryState');
      if (savedState) {
        const loadedState: InventoryState = JSON.parse(savedState);
        // Ensure stock is number, just in case localStorage stored it as string
         loadedState.items = loadedState.items.map(item => ({
            ...item,
            stock: Number(item.stock) || 0 // Ensure stock is a number
         }));
         // Ensure quantities are numbers
         loadedState.incomingTransactions = loadedState.incomingTransactions.map(tx => ({
             ...tx,
             quantity: Number(tx.quantity) || 0
         }));
         loadedState.outgoingTransactions = loadedState.outgoingTransactions.map(tx => ({
             ...tx,
             quantity: Number(tx.quantity) || 0
         }));

        dispatch({ type: 'LOAD_STATE', payload: loadedState });
        console.log("Inventory state loaded from localStorage.");
      }
    } catch (error) {
      console.error("Failed to load inventory state from localStorage:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data persediaan dari penyimpanan lokal.",
        variant: "destructive",
      });
    }
  }, [toast]); // Depend on toast to avoid lint warning, though it's stable

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('inventoryState', JSON.stringify(state));
      console.log("Inventory state saved to localStorage.");
    } catch (error) {
      console.error("Failed to save inventory state to localStorage:", error);
       toast({
        title: "Error",
        description: "Gagal menyimpan data persediaan ke penyimpanan lokal.",
        variant: "destructive",
      });
    }
  }, [state, toast]); // Depend on state and toast

  // Helper functions to get data by ID
  const getItemById = (id: string) => state.items.find(item => item.id === id);
  const getSupplierById = (id: string) => state.suppliers.find(sup => sup.id === id);
  const getDepartmentById = (id: string) => state.departments.find(dep => dep.id === id);


  return (
    <InventoryContext.Provider value={{ ...state, dispatch, getItemById, getSupplierById, getDepartmentById }}>
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