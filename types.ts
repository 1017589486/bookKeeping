
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Category {
  id: string;
  name: string;
  isSeed?: boolean;
  type: TransactionType;
  icon: string;
  color: string;
  userId: string;
  billId: string;
  parentId?: string;
}

export interface Transaction {
  id:string;
  billId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  notes: string;
  userId: string;
  assetId?: string;
}

export interface Bill {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  permission?: 'owner' | 'view' | 'edit';
}

export interface BillShare {
  id: string;
  billId: string;
  ownerUserId: string;
  sharedWithUserId: string;
  sharedWithUserEmail: string; // For display purposes
  permission: 'view' | 'edit';
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
}