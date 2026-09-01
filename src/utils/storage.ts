import { Transaction, SavingsGoal, BudgetConfig, GoogleSheetConfig, UndoAction } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mp_thai_transactions_v2_main',
  GOALS: 'mp_thai_goals_v2_main',
  BUDGET: 'mp_thai_budget_v2_main',
  SHEETS: 'mp_thai_sheets_v2_main',
  UNDO_STACK: 'mp_thai_undo_stack_v2_main',
  BANK_BALANCES: 'mp_thai_bank_initial_v2_main',
};

// Legacy keys for seamless migration
const LEGACY_KEYS = {
  WIFE_TX: 'mp_thai_transactions_v2_profile-wife',
  HUSBAND_TX: 'mp_thai_transactions_v2_profile-husband',
  OLD_TX: 'mp_thai_transactions_v1',
  WIFE_GOALS: 'mp_thai_goals_v2_profile-wife',
  WIFE_BUDGET: 'mp_thai_budget_v2_profile-wife',
  WIFE_SHEETS: 'mp_thai_sheets_v2_profile-wife',
  WIFE_BANKS: 'mp_thai_bank_initial_v2_profile-wife',
};

export const DEFAULT_INITIAL_BANK_BALANCES: Record<string, number> = {
  'ธ.กสิกรไทย (KBank)': 25000,
  'ธ.ไทยพาณิชย์ (SCB)': 15000,
  'ธ.กรุงเทพ (BBL)': 10000,
  'ธ.กรุงไทย (KTB)': 8000,
  'ธ.กรุงศรีฯ (BAY)': 5000,
  'พร้อมเพย์ (PromptPay)': 2500,
  'เงินสด (Cash)': 3000,
  'TrueMoney / e-Wallet': 1200,
  'บัตรเครดิต (Credit Card)': 0,
};

// ข้อมูลเริ่มต้นสำหรับผู้ใช้งานใหม่
const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'กองทุนสำรองฉุกเฉิน 6 เดือน',
    targetAmount: 120000,
    currentAmount: 95000,
    targetDate: '2026-12-31',
    category: 'ความมั่นคง',
    icon: 'ShieldCheck',
    color: 'emerald',
    note: 'สำรองค่าใช้จ่าย 6 เดือนเพื่อความอุ่นใจ',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    updatedAt: Date.now(),
  },
  {
    id: 'goal-2',
    title: 'ทริปท่องเที่ยวญี่ปุ่นสิ้นปี',
    targetAmount: 45000,
    currentAmount: 38000,
    targetDate: '2026-11-20',
    category: 'ท่องเที่ยว',
    icon: 'Plane',
    color: 'sky',
    note: 'ค่าตั๋วเครื่องบินและที่พักโตเกียว',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    updatedAt: Date.now(),
  },
  {
    id: 'goal-3',
    title: 'เงินดาวน์คอนโด / บ้านใหม่',
    targetAmount: 300000,
    currentAmount: 110000,
    targetDate: '2027-12-31',
    category: 'ที่อยู่อาศัย',
    icon: 'Home',
    color: 'violet',
    note: 'เก็บสะสมเดือนละ 10,000 บาท',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    updatedAt: Date.now(),
  },
];

const INITIAL_BUDGET: BudgetConfig = {
  monthlyBudget: 28000,
  categoryBudgets: {
    'อาหาร & เครื่องดื่ม': 9000,
    'การเดินทาง & น้ำมัน': 4000,
    'ช้อปปิ้ง & ของใช้': 3500,
    'ที่พัก & ค่าน้ำไฟ/เน็ต': 5500,
    'บันเทิง & ท่องเที่ยว': 3000,
  },
  alertThresholdPercent: 80,
};

const INITIAL_SHEETS_CONFIG: GoogleSheetConfig = {
  webAppUrl: '',
  sheetName: 'บันทึกการเงิน',
  autoSync: false,
  status: 'idle',
};

// สร้างตัวอย่างรายการรายรับรายจ่ายในเดือนปัจจุบัน
function generateInitialTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = (d: number) => `${year}-${month}-${String(d).padStart(2, '0')}`;

  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 45000,
      category: 'เงินเดือน / ค่าจ้าง',
      note: 'เงินเดือนประจำเดือน (โอนเข้าบัญชี)',
      date: day(1),
      paymentMethod: 'ธ.กสิกรไทย (KBank)',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 4500,
      category: 'ที่พัก & ค่าน้ำไฟ/เน็ต',
      note: 'ค่าเช่าห้องและอินเทอร์เน็ต',
      date: day(2),
      paymentMethod: 'ธ.ไทยพาณิชย์ (SCB)',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    },
    {
      id: 'tx-3',
      type: 'savings',
      amount: 5000,
      category: 'ออมเงินสำรองฉุกเฉิน',
      note: 'เก็บเข้ากองทุนสำรองฉุกเฉิน',
      date: day(3),
      paymentMethod: 'ธ.กรุงเทพ (BBL)',
      goalId: 'goal-1',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
      id: 'tx-4',
      type: 'savings',
      amount: 3000,
      category: 'ออมเงินท่องเที่ยว',
      note: 'เก็บเข้าทริปเที่ยวญี่ปุ่น',
      date: day(4),
      paymentMethod: 'ธ.กรุงไทย (KTB)',
      goalId: 'goal-2',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 350,
      category: 'อาหาร & เครื่องดื่ม',
      note: 'มื้อกลางวัน + ชานมไข่มุก',
      date: day(Math.max(1, now.getDate() - 1)),
      paymentMethod: 'พร้อมเพย์ (PromptPay)',
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 1200,
      category: 'การเดินทาง & น้ำมัน',
      note: 'เติมน้ำมันรถยนต์เต็มถัง',
      date: day(Math.max(1, now.getDate())),
      paymentMethod: 'บัตรเครดิต (Credit Card)',
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: 'tx-7',
      type: 'income',
      amount: 6500,
      category: 'งานฟรีแลนซ์ / พิเศษ',
      note: 'รับออกแบบกราฟิกแบนเนอร์',
      date: day(Math.max(1, now.getDate())),
      paymentMethod: 'ธ.กสิกรไทย (KBank)',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
  ];
}

// === Single-User Loaders & Savers ===

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      return JSON.parse(raw);
    }

    // Try migrating from previous profile keys
    const legacyWife = localStorage.getItem(LEGACY_KEYS.WIFE_TX);
    if (legacyWife) {
      const parsed = JSON.parse(legacyWife);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveTransactions(parsed);
        return parsed;
      }
    }

    const legacyOld = localStorage.getItem(LEGACY_KEYS.OLD_TX);
    if (legacyOld) {
      const parsed = JSON.parse(legacyOld);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveTransactions(parsed);
        return parsed;
      }
    }

    // Default initial seed
    const initial = generateInitialTransactions();
    saveTransactions(initial);
    return initial;
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) {
      return JSON.parse(raw);
    }

    // Check legacy wife profile goals
    const legacy = localStorage.getItem(LEGACY_KEYS.WIFE_GOALS);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveGoals(parsed);
        return parsed;
      }
    }

    saveGoals(INITIAL_GOALS);
    return INITIAL_GOALS;
  } catch (e) {
    console.error('Failed to load goals:', e);
    return INITIAL_GOALS;
  }
}

export function saveGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals:', e);
  }
}

export function loadBudgetConfig(): BudgetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (raw) {
      return { ...INITIAL_BUDGET, ...JSON.parse(raw) };
    }

    const legacy = localStorage.getItem(LEGACY_KEYS.WIFE_BUDGET);
    if (legacy) {
      return { ...INITIAL_BUDGET, ...JSON.parse(legacy) };
    }

    return INITIAL_BUDGET;
  } catch (e) {
    return INITIAL_BUDGET;
  }
}

export function saveBudgetConfig(config: BudgetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save budget config:', e);
  }
}

export function loadSheetsConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS);
    if (raw) {
      return { ...INITIAL_SHEETS_CONFIG, ...JSON.parse(raw) };
    }

    const legacy = localStorage.getItem(LEGACY_KEYS.WIFE_SHEETS);
    if (legacy) {
      return { ...INITIAL_SHEETS_CONFIG, ...JSON.parse(legacy) };
    }

    return INITIAL_SHEETS_CONFIG;
  } catch (e) {
    return INITIAL_SHEETS_CONFIG;
  }
}

export function saveSheetsConfig(config: GoogleSheetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save sheets config:', e);
  }
}

export function loadUndoStack(): UndoAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNDO_STACK);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveUndoStack(stack: UndoAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack.slice(0, 20)));
  } catch (e) {
    console.error('Failed to save undo stack:', e);
  }
}

export function loadBankInitialBalances(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_BALANCES);
    if (raw) {
      return { ...DEFAULT_INITIAL_BANK_BALANCES, ...JSON.parse(raw) };
    }

    const legacy = localStorage.getItem(LEGACY_KEYS.WIFE_BANKS);
    if (legacy) {
      return { ...DEFAULT_INITIAL_BANK_BALANCES, ...JSON.parse(legacy) };
    }

    saveBankInitialBalances(DEFAULT_INITIAL_BANK_BALANCES);
    return DEFAULT_INITIAL_BANK_BALANCES;
  } catch (e) {
    return DEFAULT_INITIAL_BANK_BALANCES;
  }
}

export function saveBankInitialBalances(balances: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK_BALANCES, JSON.stringify(balances));
  } catch (e) {
    console.error('Failed to save bank initial balances:', e);
  }
}
