import { Transaction, SavingsGoal, BudgetConfig, BankBalanceInfo, DateRangePreset, DateRangeFilter } from '../types';
import { PAYMENT_METHODS } from '../data/defaultCategories';

/**
 * คำนวณช่วงวันที่เริ่มต้นและสิ้นสุดตาม Preset ลัด
 */
export function getDateRangeFromPreset(
  preset: DateRangePreset,
  referenceDate: Date = new Date()
): { startDate: string; endDate: string; preset: DateRangePreset } {
  const ref = new Date(referenceDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (preset) {
    case 'today': {
      const todayStr = formatYMD(ref);
      return { startDate: todayStr, endDate: todayStr, preset };
    }
    case 'last_7_days': {
      const endStr = formatYMD(ref);
      const start = new Date(ref);
      start.setDate(start.getDate() - 6);
      return { startDate: formatYMD(start), endDate: endStr, preset };
    }
    case 'last_30_days': {
      const endStr = formatYMD(ref);
      const start = new Date(ref);
      start.setDate(start.getDate() - 29);
      return { startDate: formatYMD(start), endDate: endStr, preset };
    }
    case 'this_month': {
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: formatYMD(start), endDate: formatYMD(end), preset };
    }
    case 'last_month': {
      const year = ref.getFullYear();
      const month = ref.getMonth() - 1;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: formatYMD(start), endDate: formatYMD(end), preset };
    }
    case 'this_year': {
      const year = ref.getFullYear();
      return { startDate: `${year}-01-01`, endDate: `${year}-12-31`, preset };
    }
    case 'all': {
      return { startDate: '', endDate: '', preset };
    }
    case 'custom':
    default: {
      return { startDate: '', endDate: '', preset: 'custom' };
    }
  }
}

/**
 * ตรวจสอบว่าวันที่อยู่ในช่วงเริ่มต้นและสิ้นสุดหรือไม่
 */
export function isDateInRange(date: string, startDate?: string, endDate?: string): boolean {
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

/**
 * แปลงช่วงวันที่เป็นภาษาไทย เช่น '1 ส.ค. 2569 - 31 ส.ค. 2569' หรือ 'ทั้งหมด'
 */
export function formatThaiDateRange(
  startDate?: string,
  endDate?: string,
  preset?: DateRangePreset
): string {
  if (preset === 'all' || (!startDate && !endDate)) {
    return 'ทุกช่วงเวลา';
  }

  if (preset === 'today' || (startDate && endDate && startDate === endDate)) {
    return `วันนี้ (${formatThaiDate(startDate, 'long')})`;
  }

  if (startDate && endDate) {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
      // ถ้าเดือนและปีเดียวกัน
      if (sDate.getFullYear() === eDate.getFullYear() && sDate.getMonth() === eDate.getMonth()) {
        const thaiMonths = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const monthName = thaiMonths[sDate.getMonth()];
        const yearThai = sDate.getFullYear() + 543;
        return `${sDate.getDate()} - ${eDate.getDate()} ${monthName} ${yearThai}`;
      }
      return `${formatThaiDate(startDate, 'short')} - ${formatThaiDate(endDate, 'short')}`;
    }
    return `${startDate} ถึง ${endDate}`;
  }

  if (startDate && !endDate) {
    return `ตั้งแต่ ${formatThaiDate(startDate, 'short')}`;
  }

  if (!startDate && endDate) {
    return `ถึงวันที่ ${formatThaiDate(endDate, 'short')}`;
  }

  return 'ทุกช่วงเวลา';
}

export interface GoalCalculation {
  goal: SavingsGoal;
  remainingAmount: number;
  progressPercent: number;
  monthsRemaining: number;
  daysRemaining: number;
  monthlyNeeded: number;
  dailyNeeded: number;
  isCompleted: boolean;
  isNearCompletion: boolean; // >= 80% and < 100%
  isOverdue: boolean;
}

export interface BudgetStatus {
  totalExpenseThisMonth: number;
  monthlyBudget: number;
  remainingBudget: number;
  usedPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean; // >= threshold % (e.g., 80%)
  categorySpending: Record<string, number>;
  categoryWarnings: { category: string; spent: number; budget: number; percent: number }[];
}

export interface FinancialHealthSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  netBalance: number;
  totalSavedInGoals: number;
  totalGoalsTarget: number;
  goalsCompletionPercent: number;
  savingsRatePercent: number; // (Savings / Total Income) * 100
  expenseToIncomePercent: number;
  topExpenseCategories: { name: string; amount: number; percent: number }[];
  topIncomeCategories: { name: string; amount: number; percent: number }[];
  dailyAverageExpense: number;
  daysInCurrentMonth: number;
  financialVerdict: {
    status: 'excellent' | 'good' | 'warning' | 'danger';
    title: string;
    description: string;
    color: string;
  };
}

/**
 * คำนวณเป้าหมายการออมเงิน
 */
export function calculateSavingsGoal(goal: SavingsGoal): GoalCalculation {
  const currentAmount = Math.max(0, goal.currentAmount || 0);
  const targetAmount = Math.max(0, goal.targetAmount || 0);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
  
  const isCompleted = currentAmount >= targetAmount && targetAmount > 0;
  const isNearCompletion = !isCompleted && progressPercent >= 80;

  // คำนวณวันและเดือนที่เหลือ
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let targetDate = new Date(goal.targetDate);
  if (isNaN(targetDate.getTime())) {
    // fallback 1 year from now
    targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && !isCompleted;
  
  const daysRemaining = Math.max(1, diffDays);
  
  // คำนวณเดือนที่เหลือ (อย่างน้อย 1 เดือน หรือตามวันหาร 30.4)
  const monthsRemaining = Math.max(0.5, Number((daysRemaining / 30.416).toFixed(1)));
  
  // คำนวณเงินที่ต้องเก็บต่อเดือนและต่อวันเพื่อให้บรรลุเป้าหมาย
  let monthlyNeeded = 0;
  let dailyNeeded = 0;
  
  if (remainingAmount > 0) {
    if (monthsRemaining <= 1) {
      monthlyNeeded = Math.round(remainingAmount);
      dailyNeeded = Math.round(remainingAmount / daysRemaining);
    } else {
      monthlyNeeded = Math.round(remainingAmount / monthsRemaining);
      dailyNeeded = Math.round(remainingAmount / daysRemaining);
    }
  }

  return {
    goal,
    remainingAmount,
    progressPercent,
    monthsRemaining,
    daysRemaining,
    monthlyNeeded,
    dailyNeeded,
    isCompleted,
    isNearCompletion,
    isOverdue,
  };
}

/**
 * คำนวณสถานะงบประมาณและแจ้งเตือนเกินงบ
 */
export function calculateBudgetStatus(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  currentYearMonth?: string // Format: 'YYYY-MM'
): BudgetStatus {
  const targetYearMonth = currentYearMonth || new Date().toISOString().substring(0, 7);
  
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(targetYearMonth)
  );

  const totalExpenseThisMonth = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const monthlyBudget = budgetConfig.monthlyBudget || 0;
  const remainingBudget = monthlyBudget - totalExpenseThisMonth;
  const usedPercent = monthlyBudget > 0 ? Math.round((totalExpenseThisMonth / monthlyBudget) * 100) : 0;
  const threshold = budgetConfig.alertThresholdPercent || 80;

  const isOverBudget = monthlyBudget > 0 && totalExpenseThisMonth > monthlyBudget;
  const isNearLimit = monthlyBudget > 0 && !isOverBudget && usedPercent >= threshold;

  // คำนวณรายจ่ายแยกตามหมวดหมู่
  const categorySpending: Record<string, number> = {};
  currentMonthExpenses.forEach((t) => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  const categoryWarnings: { category: string; spent: number; budget: number; percent: number }[] = [];
  if (budgetConfig.categoryBudgets) {
    Object.entries(budgetConfig.categoryBudgets).forEach(([cat, catBudget]) => {
      if (catBudget > 0) {
        const spent = categorySpending[cat] || 0;
        const percent = Math.round((spent / catBudget) * 100);
        if (percent >= threshold) {
          categoryWarnings.push({
            category: cat,
            spent,
            budget: catBudget,
            percent,
          });
        }
      }
    });
  }

  return {
    totalExpenseThisMonth,
    monthlyBudget,
    remainingBudget,
    usedPercent,
    isOverBudget,
    isNearLimit,
    categorySpending,
    categoryWarnings,
  };
}

/**
 * คำนวณสรุปข้อมูลการเงินแบบเจาะลึก (One-Click Financial Health Summary)
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  goals: SavingsGoal[],
  filterDate?: { startDate?: string; endDate?: string } | string // e.g. { startDate, endDate } or 'YYYY-MM' or 'all'
): FinancialHealthSummary {
  let targetTransactions = transactions;
  let rangeStartDate = '';
  let rangeEndDate = '';

  if (filterDate) {
    if (typeof filterDate === 'string') {
      if (filterDate !== 'all') {
        if (filterDate.length === 7) {
          // 'YYYY-MM'
          targetTransactions = transactions.filter((t) => t.date.startsWith(filterDate));
          rangeStartDate = `${filterDate}-01`;
          const [yr, mo] = filterDate.split('-').map(Number);
          const lastDay = new Date(yr, mo, 0).getDate();
          rangeEndDate = `${filterDate}-${String(lastDay).padStart(2, '0')}`;
        } else {
          // 'YYYY-MM-DD'
          targetTransactions = transactions.filter((t) => t.date === filterDate);
          rangeStartDate = filterDate;
          rangeEndDate = filterDate;
        }
      }
    } else {
      rangeStartDate = filterDate.startDate || '';
      rangeEndDate = filterDate.endDate || '';
      targetTransactions = transactions.filter((t) =>
        isDateInRange(t.date, rangeStartDate, rangeEndDate)
      );
    }
  }

  const totalIncome = targetTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = targetTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = targetTransactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  // Net Balance = Income - Expenses
  const netBalance = totalIncome - totalExpense;

  const totalSavedInGoals = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalGoalsTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const goalsCompletionPercent = totalGoalsTarget > 0 
    ? Math.min(100, Math.round((totalSavedInGoals / totalGoalsTarget) * 100))
    : 0;

  const savingsRatePercent = totalIncome > 0
    ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
    : 0;

  const expenseToIncomePercent = totalIncome > 0
    ? Math.round((totalExpense / totalIncome) * 100)
    : 0;

  // หมวดหมู่รายจ่ายสูงสุด
  const expenseCatMap: Record<string, number> = {};
  targetTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;
    });

  const topExpenseCategories = Object.entries(expenseCatMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // หมวดหมู่รายรับสูงสุด
  const incomeCatMap: Record<string, number> = {};
  targetTransactions
    .filter((t) => t.type === 'income')
    .forEach((t) => {
      incomeCatMap[t.category] = (incomeCatMap[t.category] || 0) + t.amount;
    });

  const topIncomeCategories = Object.entries(incomeCatMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // คำนวณรายจ่ายเฉลี่ยต่อวันตามช่วงเวลาที่เลือก
  const now = new Date();
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  let daysInPeriod = 1;
  if (rangeStartDate && rangeEndDate) {
    const sDate = new Date(rangeStartDate);
    const eDate = new Date(rangeEndDate);
    if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
      const diffMs = Math.max(0, eDate.getTime() - sDate.getTime());
      daysInPeriod = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    }
  } else if (rangeStartDate && !rangeEndDate) {
    const sDate = new Date(rangeStartDate);
    const diffMs = Math.max(0, now.getTime() - sDate.getTime());
    daysInPeriod = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
  } else {
    daysInPeriod = Math.max(1, now.getDate());
  }

  const dailyAverageExpense = Math.round(totalExpense / daysInPeriod);

  // ประเมินสุขภาพการเงิน
  let financialVerdict: FinancialHealthSummary['financialVerdict'];
  if (totalExpense > totalIncome && totalIncome > 0) {
    financialVerdict = {
      status: 'danger',
      title: 'รายจ่ายเกินรายรับ ⚠️',
      description: 'เดือนนี้รายจ่ายมากกว่ารายได้ แนะนำให้ลดค่าใช้จ่ายฟุ่มเฟือยเพื่อป้องกันเงินขาดมือ',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  } else if (savingsRatePercent >= 30) {
    financialVerdict = {
      status: 'excellent',
      title: 'สุขภาพการเงินยอดเยี่ยม 🌟',
      description: `คุณเก็บออมได้ถึง ${savingsRatePercent}% ของรายได้ อยู่ในเกณฑ์ดีเยี่ยมตามหลักสากล`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  } else if (savingsRatePercent >= 10) {
    financialVerdict = {
      status: 'good',
      title: 'สุขภาพการเงินดีปานกลาง 👍',
      description: `มีเงินเหลือออม ${savingsRatePercent}% ของรายได้ แนะนำแบ่งออมเพิ่มเข้าเป้าหมายอย่างสม่ำเสมอ`,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  } else {
    financialVerdict = {
      status: 'warning',
      title: 'ควรระวังเรื่องการออม 💡',
      description: 'มีเงินเหลือออมน้อยกว่า 10% ควรทบทวนรายการรายจ่ายและวางแผนสำรองเงินฉุกเฉิน',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  return {
    totalIncome,
    totalExpense,
    totalSavings,
    netBalance,
    totalSavedInGoals,
    totalGoalsTarget,
    goalsCompletionPercent,
    savingsRatePercent,
    expenseToIncomePercent,
    topExpenseCategories,
    topIncomeCategories,
    dailyAverageExpense,
    daysInCurrentMonth,
    financialVerdict,
  };
}

/**
 * แปลงตัวเลขเป็นฟอร์แมตเงินบาทไทย (เช่น 1,250.00 หรือ 1,250 ฿)
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount)) return '0 ฿';
  return amount.toLocaleString('th-TH', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }) + ' ฿';
}

/**
 * แปลงวันที่เป็นภาษาไทยแบบสวยงาม (เช่น 31 ส.ค. 2026 หรือ 31 สิงหาคม 2569)
 */
export function formatThaiDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiMonthsLong = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear() + 543; // พ.ศ.

  if (format === 'long') {
    return `${day} ${thaiMonthsLong[month]} ${year}`;
  }
  return `${day} ${thaiMonthsShort[month]} ${year}`;
}

/**
 * คำนวณยอดเงินคงเหลือ รายรับ รายจ่าย และเงินออมแยกตามแต่ละธนาคาร / บัญชี
 */
export function calculateBankBalances(
  transactions: Transaction[],
  initialBalances: Record<string, number> = {}
): {
  accounts: BankBalanceInfo[];
  totalLiquidWealth: number;
  totalInitial: number;
  totalIncomeAll: number;
  totalExpenseAll: number;
} {
  let totalLiquidWealth = 0;
  let totalInitial = 0;
  let totalIncomeAll = 0;
  let totalExpenseAll = 0;

  const accounts: BankBalanceInfo[] = PAYMENT_METHODS.map((pm) => {
    // ดึงค่ายอดเงินเริ่มต้น (ถ้ามี)
    const initial = initialBalances[pm.name] ?? initialBalances[pm.shortName] ?? initialBalances[pm.id] ?? 0;
    totalInitial += initial;

    // กรองรายการที่เป็นของธนาคาร/ช่องทางนี้
    const bankTx = transactions.filter((t) => {
      const method = t.paymentMethod || 'ธ.กสิกรไทย (KBank)';
      return method === pm.name || method === pm.shortName || method.includes(pm.shortName);
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    bankTx.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
      } else if (t.type === 'savings') {
        // ถ้าเป็นการออมเงิน จะเป็นการตัดยอดเงินออกจากบัญชีธนาคารไปเก็บในเป้าหมาย
        // แต่ถ้าเป็นการถอนเงินออม (หมวดถอนเงินออมมาใช้จ่าย หรือจำนวนติดลบ) จะคืนเงินเข้าบัญชี
        if (t.category === 'ถอนเงินออมมาใช้จ่าย' || t.amount < 0) {
          totalIncome += Math.abs(t.amount);
        } else {
          totalSavings += t.amount;
        }
      }
    });

    totalIncomeAll += totalIncome;
    totalExpenseAll += totalExpense;

    // ยอดคงเหลือปัจจุบัน = ยอดเริ่มต้น + รายรับ - รายจ่าย - เงินออม
    const currentBalance = initial + totalIncome - totalExpense - totalSavings;
    
    // บัตรเครดิตยอดเงินอาจเป็นหนี้สิน (ค่าติดลบหรือแสดงแยก)
    if (pm.type !== 'card') {
      totalLiquidWealth += currentBalance;
    }

    let badgeBg = 'bg-slate-100 text-slate-700';
    if (pm.shortName === 'KBANK') badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (pm.shortName === 'SCB') badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
    else if (pm.shortName === 'BBL') badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
    else if (pm.shortName === 'KTB') badgeBg = 'bg-sky-50 text-sky-700 border-sky-200';
    else if (pm.shortName === 'BAY') badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (pm.shortName === 'PromptPay') badgeBg = 'bg-blue-50 text-blue-900 border-blue-200';
    else if (pm.shortName === 'เงินสด') badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    else if (pm.shortName === 'e-Wallet') badgeBg = 'bg-orange-50 text-orange-700 border-orange-200';
    else if (pm.shortName === 'บัตรเครดิต') badgeBg = 'bg-slate-100 text-slate-800 border-slate-300';

    return {
      id: pm.id,
      name: pm.name,
      shortName: pm.shortName,
      color: pm.color,
      badgeBg,
      icon: pm.icon,
      initialBalance: initial,
      totalIncome,
      totalExpense,
      totalSavings,
      currentBalance,
      transactionCount: bankTx.length,
    };
  });

  return {
    accounts,
    totalLiquidWealth,
    totalInitial,
    totalIncomeAll,
    totalExpenseAll,
  };
}

