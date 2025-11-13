
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Bill, Category, Transaction, User, BillShare, Asset } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';
const USER_STORAGE_KEY = 'finTrackUser';

// --- Context Definition ---
interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  bills: Bill[];
  activeBillId: string | null;
  setActiveBillId: (id: string | null) => void;
  addBill: (bill: Omit<Bill, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'userId'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  billShares: BillShare[];
  addBillShare: (share: Omit<BillShare, 'id' | 'ownerUserId' | 'sharedWithUserId' | 'sharedWithUserEmail'> & { email: string }) => Promise<void>;
  updateBillShare: (share: BillShare) => Promise<void>;
  deleteBillShare: (id: string) => Promise<void>;
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'userId'>) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [billShares, setBillShares] = useState<BillShare[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  
  const getAuthHeaders = useCallback(() => {
    if (!user) return {};
    return {
      'Content-Type': 'application/json',
      'X-User-ID': user.id,
    };
  }, [user]);

  const fetchDataForUser = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const headers = { 'X-User-ID': user.id };
      const [billsRes, transactionsRes, categoriesRes, billSharesRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/transactions`, { headers }),
        fetch(`${API_BASE_URL}/categories`, { headers }),
        fetch(`${API_BASE_URL}/billShares`, { headers }),
        fetch(`${API_BASE_URL}/assets`, { headers }),
      ]);
      const [billsData, transactionsData, categoriesData, billSharesData, assetsData] = await Promise.all([
        billsRes.json(),
        transactionsRes.json(),
        categoriesRes.json(),
        billSharesRes.json(),
        assetsRes.json(),
      ]);

      setBills(billsData || []);
      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
      setBillShares(billSharesData || []);
      setAssets(assetsData || []);
      
      if (billsData.length > 0) {
        const currentBillExists = billsData.some((b: Bill) => b.id === activeBillId);
        if (!activeBillId || !currentBillExists) {
            setActiveBillId(billsData[0].id);
        }
      } else {
        setActiveBillId(null);
      }

    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeBillId]);

  useEffect(() => {
    try {
        const storedUserJSON = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUserJSON) {
            setUser(JSON.parse(storedUserJSON));
            setIsAuthenticated(true);
        }
    } catch (error) {
        console.error("Could not parse user from localStorage", error);
        localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
        setIsAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (isAuthenticated && user) {
      fetchDataForUser();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchDataForUser, isAuthChecked]);

  const performLogin = async (email: string, password: string, endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate');
    }
    const loggedInUser = await response.json();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const login = (email: string, password: string) => performLogin(email, password, 'login');
  const register = (email: string, password: string) => performLogin(email, password, 'register');

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setBills([]);
    setTransactions([]);
    setCategories([]);
    setBillShares([]);
    setAssets([]);
    setActiveBillId(null);
  };
  
  // --- Bills ---
  const addBill = async (bill: Omit<Bill, 'id' | 'userId' | 'createdAt'>) => {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(bill),
    });
    const newBill = await response.json();
    setBills(prev => [...prev, newBill]);
    if (!activeBillId) setActiveBillId(newBill.id);
  };
  const updateBill = async (updatedBill: Bill) => {
    const response = await fetch(`${API_BASE_URL}/bills/${updatedBill.id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedBill),
    });
    const result = await response.json();
    setBills(prev => prev.map(b => b.id === result.id ? result : b));
  };
  const deleteBill = async (id: string) => {
    await fetch(`${API_BASE_URL}/bills/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const newBills = bills.filter(b => b.id !== id);
    setBills(newBills);
    setTransactions(prev => prev.filter(t => t.billId !== id));
    if (activeBillId === id) {
      setActiveBillId(newBills.length > 0 ? newBills[0].id : null);
    }
  };
  
  // --- Transactions ---
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'userId'>) => {
     const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(tx),
    });
    const { newTransaction, updatedAsset } = await response.json();
    setTransactions(prev => [...prev, newTransaction]);
    if (updatedAsset) {
      setAssets(prevAssets => prevAssets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    }
  };
  const updateTransaction = async (updatedTx: Transaction) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${updatedTx.id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedTx),
    });
    const { updatedTransaction, updatedAssets } = await response.json();
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    if (updatedAssets && updatedAssets.length > 0) {
      setAssets(prevAssets => {
        const newAssets = [...prevAssets];
        updatedAssets.forEach((updatedAsset: Asset) => {
          const index = newAssets.findIndex(a => a.id === updatedAsset.id);
          if (index > -1) {
            newAssets[index] = updatedAsset;
          }
        });
        return newAssets;
      });
    }
  };
  const deleteTransaction = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const { deletedTransactionId, updatedAsset } = await response.json();
    setTransactions(prev => prev.filter(t => t.id !== deletedTransactionId));
    if (updatedAsset) {
        setAssets(prevAssets => prevAssets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    }
  };

  // --- Categories ---
  const addCategory = async (cat: Omit<Category, 'id' | 'userId'>) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(cat),
    });
    const newCat = await response.json();
    setCategories(prev => [...prev, newCat]);
  };
  const updateCategory = async (updatedCat: Category) => {
    const response = await fetch(`${API_BASE_URL}/categories/${updatedCat.id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedCat),
    });
    const result = await response.json();
    setCategories(prev => prev.map(c => c.id === result.id ? result : c));
  };
  const deleteCategory = async (id: string) => {
    await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // --- Bill Shares ---
  const addBillShare = async (share: Omit<BillShare, 'id' | 'ownerUserId' | 'sharedWithUserId' | 'sharedWithUserEmail'> & { email: string }) => {
    const response = await fetch(`${API_BASE_URL}/billShares`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(share),
    });
    const newShare = await response.json();
    setBillShares(prev => [...prev, newShare]);
  };
  const updateBillShare = async (updatedShare: BillShare) => {
     const response = await fetch(`${API_BASE_URL}/billShares/${updatedShare.id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedShare),
    });
    const result = await response.json();
    setBillShares(prev => prev.map(bs => bs.id === result.id ? result : bs));
  };
  const deleteBillShare = async (id: string) => {
    await fetch(`${API_BASE_URL}/billShares/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setBillShares(prev => prev.filter(bs => bs.id !== id));
  };

  // --- Assets ---
  const addAsset = async (asset: Omit<Asset, 'id' | 'userId'>) => {
    const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(asset),
    });
    const newAsset = await response.json();
    setAssets(prev => [...prev, newAsset]);
  };
  const updateAsset = async (updatedAsset: Asset) => {
    const response = await fetch(`${API_BASE_URL}/assets/${updatedAsset.id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedAsset),
    });
    const result = await response.json();
    setAssets(prev => prev.map(a => a.id === result.id ? result : a));
  };
  const deleteAsset = async (id: string) => {
    await fetch(`${API_BASE_URL}/assets/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setAssets(prev => prev.filter(a => a.id !== id));
  };


  return (
    <AppContext.Provider
      value={{
        user, isAuthenticated, isLoading, login, register, logout,
        bills, activeBillId, setActiveBillId, addBill, updateBill, deleteBill,
        transactions, addTransaction, updateTransaction, deleteTransaction,
        categories, addCategory, updateCategory, deleteCategory,
        billShares, addBillShare, updateBillShare, deleteBillShare,
        assets, addAsset, updateAsset, deleteAsset
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
