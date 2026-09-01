export type TransactionType = 'income' | 'expense' | 'savings';

export type DateRangePreset = 
  | 'this_month' 
  | 'last_month' 
  | 'today' 
  | 'last_7_days' 
  | 'last_30_days' 
  | 'this_year' 
  | 'all' 
  | 'custom';

export interface DateRangeFilter {
  startDate: string; // YYYY-MM-DD or empty
  endDate: string;   // YYYY-MM-DD or empty
  preset: DateRangePreset;
}

export interface UserProfile {
  id: string;
  name: string;
  roleLabel: string; // เช่น 'ฉัน (ภรรยา)', 'สามี', 'ครอบครัว'
  avatarIcon: string;
  avatarBg: string;
  pin?: string; // PIN 4 หลักป้องกันคนอื่นกดดู (Optional)
  createdAt: number;
}

export interface BankAccount {
  id: string;
  name: string;
  bankCode: string; // 'KBANK' | 'SCB' | 'BBL' | 'KTB' | 'BAY' | 'PROMPTPAY' | 'CASH' | 'OTHER';
  accountNumber?: string;
  color: string;
}

export interface BankBalanceInfo {
  id: string;
  name: string;
  shortName: string;
  accountNumber?: string;
  color: string;
  badgeBg: string;
  icon: string;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  currentBalance: number;
  transactionCount: number;
}

export interface BankTransferPayload {
  fromBank: string;
  toBank: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string; // เช่น 'ธ.กสิกรไทย (KBank)', 'ธ.ไทยพาณิชย์ (SCB)', 'ธ.กรุงเทพ (BBL)', 'ธ.กรุงไทย (KTB)'
  goalId?: string; // หากเป็นการออมเพื่อเป้าหมายใดเป้าหมายหนึ่ง หรือถอนจากเป้าหมาย
  createdAt: number;
  isSynced?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  note?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetConfig {
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  alertThresholdPercent: number; // default 80%
}

export interface GoogleSheetConfig {
  webAppUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface UndoAction {
  type: 'add' | 'delete' | 'edit';
  item: Transaction;
  previousItem?: Transaction;
  description: string;
  timestamp: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  bgColor: string;
}

