import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Wallet, 
  Target, 
  Sparkles, 
  FileSpreadsheet, 
  BarChart3, 
  RotateCcw, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Building2
} from 'lucide-react';
import { 
  Transaction, 
  SavingsGoal, 
  BudgetConfig, 
  GoogleSheetConfig, 
  UndoAction, 
  TransactionType,
  BankBalanceInfo,
  BankTransferPayload,
  DateRangeFilter
} from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadGoals, 
  saveGoals, 
  loadBudgetConfig, 
  saveBudgetConfig, 
  loadSheetsConfig, 
  saveSheetsConfig, 
  loadUndoStack, 
  saveUndoStack,
  loadBankInitialBalances,
  saveBankInitialBalances
} from './utils/storage';
import { 
  calculateSavingsGoal, 
  calculateBudgetStatus, 
  calculateFinancialSummary, 
  calculateBankBalances,
  getDateRangeFromPreset,
  isDateInRange,
  formatCurrency, 
  formatThaiDate 
} from './utils/calculator';
import { syncToGoogleSheets, pushTransactionToGoogleSheets } from './services/googleSheetsService';

import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { QuickStats } from './components/QuickStats';
import { BankAccountsWidget } from './components/BankAccountsWidget';
import { QuickSearch } from './components/QuickSearch';
import { SavingsGoalsSection } from './components/SavingsGoalsSection';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { GoalModal } from './components/GoalModal';
import { SummaryModal } from './components/SummaryModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { BudgetModal } from './components/BudgetModal';
import { PdfExportModal } from './components/PdfExportModal';
import { BankBalancesModal } from './components/BankBalancesModal';

export default function App() {
  // Core State (Single User)
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [goals, setGoals] = useState<SavingsGoal[]>(loadGoals);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(loadBudgetConfig);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetConfig>(loadSheetsConfig);
  const [undoStack, setUndoStack] = useState<UndoAction[]>(loadUndoStack);
  const [initialBankBalances, setInitialBankBalances] = useState<Record<string, number>>(loadBankInitialBalances);
  
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<'all' | 'transactions' | 'goals'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType | 'goal'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>(() => getDateRangeFromPreset('this_month'));
  const [selectedBankFilter, setSelectedBankFilter] = useState<string | null>(null);

  // Modal Control States
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | undefined>(undefined);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [bankModalTab, setBankModalTab] = useState<'overview' | 'settings' | 'transfer'>('overview');
  
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize state changes to LocalStorage
  const updateTransactions = useCallback((newTxs: Transaction[]) => {
    setTransactions(newTxs);
    saveTransactions(newTxs);
  }, []);

  const updateGoals = useCallback((newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  }, []);

  const updateBudget = useCallback((newBudget: BudgetConfig) => {
    setBudgetConfig(newBudget);
    saveBudgetConfig(newBudget);
    showToast('บันทึกการตั้งค่างบประมาณแล้ว');
  }, []);

  const updateSheetsConfig = useCallback((newConfig: GoogleSheetConfig) => {
    setSheetsConfig(newConfig);
    saveSheetsConfig(newConfig);
    showToast('บันทึกการตั้งค่า Google Sheets แล้ว');
  }, []);

  const pushUndo = useCallback((action: UndoAction) => {
    setUndoStack((prev) => {
      const updated = [action, ...prev.slice(0, 19)];
      saveUndoStack(updated);
      return updated;
    });
  }, []);

  // Handle Undo Operation ("ย้อนรายการล่าสุดได้")
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const [actionToUndo, ...remainingUndo] = undoStack;

    if (actionToUndo.type === 'add') {
      // Revert Add -> Delete the added item
      const newTxs = transactions.filter((t) => t.id !== actionToUndo.item.id);
      updateTransactions(newTxs);

      // If linked to goal, revert goal current amount
      if (actionToUndo.item.goalId) {
        const goalId = actionToUndo.item.goalId;
        const amount = actionToUndo.item.amount;
        updateGoals(
          goals.map((g) =>
            g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g
          )
        );
      }
      showToast(`↺ ย้อนกลับรายการ: ยกเลิก "${actionToUndo.description}"`);
    } else if (actionToUndo.type === 'delete') {
      // Revert Delete -> Restore the item
      const newTxs = [actionToUndo.item, ...transactions];
      updateTransactions(newTxs);

      if (actionToUndo.item.goalId) {
        const goalId = actionToUndo.item.goalId;
        const amount = actionToUndo.item.amount;
        updateGoals(
          goals.map((g) =>
            g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
          )
        );
      }
      showToast(`↺ กู้คืนรายการ: "${actionToUndo.description}"`);
    } else if (actionToUndo.type === 'edit' && actionToUndo.previousItem) {
      // Revert Edit -> Restore previousItem
      const prev = actionToUndo.previousItem;
      const current = actionToUndo.item;
      const newTxs = transactions.map((t) => (t.id === prev.id ? prev : t));
      updateTransactions(newTxs);

      // Adjust goal amounts if goal involved
      if (current.goalId || prev.goalId) {
        updateGoals(
          goals.map((g) => {
            let adj = g.currentAmount;
            if (g.id === current.goalId) adj -= current.amount;
            if (g.id === prev.goalId) adj += prev.amount;
            return { ...g, currentAmount: Math.max(0, adj) };
          })
        );
      }
      showToast(`↺ ย้อนกลับการแก้ไข: "${actionToUndo.description}"`);
    }

    setUndoStack(remainingUndo);
    saveUndoStack(remainingUndo);
  }, [undoStack, transactions, goals, updateTransactions, updateGoals]);

  // Handle Save Transaction (Add or Edit)
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit existing
      const oldTx = transactions.find((t) => t.id === existingId);
      if (!oldTx) return;

      const updatedTx: Transaction = {
        ...oldTx,
        ...data,
      };

      const newTxs = transactions.map((t) => (t.id === existingId ? updatedTx : t));
      updateTransactions(newTxs);

      // Adjust goals if needed
      if (oldTx.goalId !== data.goalId || oldTx.amount !== data.amount) {
        updateGoals(
          goals.map((g) => {
            let amount = g.currentAmount;
            if (g.id === oldTx.goalId) amount -= oldTx.amount;
            if (g.id === data.goalId) amount += data.amount;
            return { ...g, currentAmount: Math.max(0, amount) };
          })
        );
      }

      pushUndo({
        type: 'edit',
        item: updatedTx,
        previousItem: oldTx,
        description: `แก้ไข ${data.category} ${formatCurrency(data.amount)}`,
        timestamp: Date.now(),
      });

      showToast(`แก้ไขรายการ ${data.category} เรียบร้อยแล้ว`);
    } else {
      // Add new
      const newTx: Transaction = {
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        ...data,
        createdAt: Date.now(),
      };

      const newTxs = [newTx, ...transactions];
      updateTransactions(newTxs);

      // If allocated to a goal, increment goal currentAmount
      if (data.goalId) {
        updateGoals(
          goals.map((g) =>
            g.id === data.goalId ? { ...g, currentAmount: g.currentAmount + data.amount } : g
          )
        );
      }

      pushUndo({
        type: 'add',
        item: newTx,
        description: `${data.type === 'income' ? 'รายรับ' : data.type === 'savings' ? 'เงินออม' : 'รายจ่าย'} ${data.category} ${formatCurrency(data.amount)}`,
        timestamp: Date.now(),
      });

      showToast(`บันทึก ${data.type === 'income' ? 'รายรับ' : data.type === 'savings' ? 'เงินออม' : 'รายจ่าย'} ${formatCurrency(data.amount)} สำเร็จ!`);

      // Auto sync to Google Sheets if configured
      if (sheetsConfig.autoSync && sheetsConfig.webAppUrl) {
        pushTransactionToGoogleSheets(sheetsConfig.webAppUrl, newTx);
      }
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (transactionId: string) => {
    const target = transactions.find((t) => t.id === transactionId);
    if (!target) return;

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการ "${target.category} (${formatCurrency(target.amount)})"?`)) {
      return;
    }

    const newTxs = transactions.filter((t) => t.id !== transactionId);
    updateTransactions(newTxs);

    if (target.goalId) {
      updateGoals(
        goals.map((g) =>
          g.id === target.goalId
            ? { ...g, currentAmount: Math.max(0, g.currentAmount - target.amount) }
            : g
        )
      );
    }

    pushUndo({
      type: 'delete',
      item: target,
      description: `ลบ ${target.category} ${formatCurrency(target.amount)}`,
      timestamp: Date.now(),
    });

    showToast(`ลบรายการเรียบร้อย (สามารถกดย้อนกลับได้)`);
  };

  // Handle Save Savings Goal (Add or Edit)
  const handleSaveGoal = (
    data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updatedGoals = goals.map((g) =>
        g.id === existingId ? { ...g, ...data, updatedAt: Date.now() } : g
      );
      updateGoals(updatedGoals);
      showToast(`แก้ไขเป้าหมาย "${data.title}" เรียบร้อยแล้ว`);
    } else {
      const newGoal: SavingsGoal = {
        id: 'goal-' + Date.now(),
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateGoals([...goals, newGoal]);
      showToast(`สร้างเป้าหมาย "${data.title}" สำเร็จ!`);
    }
  };

  // Handle Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;

    if (!window.confirm(`คุณต้องการลบเป้าหมาย "${target.title}" หรือไม่?`)) {
      return;
    }

    updateGoals(goals.filter((g) => g.id !== goalId));
    showToast(`ลบเป้าหมาย "${target.title}" เรียบร้อยแล้ว`);
  };

  // Quick Deposit into a goal
  const handleQuickDeposit = (goal: SavingsGoal) => {
    setDepositGoalId(goal.id);
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // Trigger Google Sheets Batch Sync
  const handleSyncGoogleSheets = async () => {
    if (!sheetsConfig.webAppUrl) {
      setIsSheetsModalOpen(true);
      return;
    }

    setIsSyncing(true);
    const result = await syncToGoogleSheets(sheetsConfig.webAppUrl, transactions, goals);
    setIsSyncing(false);

    if (result.success) {
      updateSheetsConfig({
        ...sheetsConfig,
        lastSyncedAt: Date.now(),
        status: 'success',
      });
      showToast('✅ ซิงค์ข้อมูลลง Google Sheets เรียบร้อยแล้ว!');
    } else {
      updateSheetsConfig({
        ...sheetsConfig,
        status: 'error',
        errorMessage: result.message,
      });
      showToast('❌ ไม่สามารถซิงค์ได้: ' + result.message);
    }
  };

  // Calculations for Goals & Budgets
  const goalCalculations = useMemo(() => goals.map(calculateSavingsGoal), [goals]);
  const nearGoals = useMemo(() => goalCalculations.filter((c) => c.isNearCompletion), [goalCalculations]);
  const completedGoals = useMemo(() => goalCalculations.filter((c) => c.isCompleted), [goalCalculations]);

  const budgetStatus = useMemo(
    () => calculateBudgetStatus(transactions, budgetConfig, dateRange.startDate ? dateRange.startDate.slice(0, 7) : undefined),
    [transactions, budgetConfig, dateRange]
  );

  const financialSummary = useMemo(
    () => calculateFinancialSummary(transactions, goals, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [transactions, goals, dateRange]
  );

  // Bank Balances & Liquid Wealth Calculation
  const bankBalancesData = useMemo(() => {
    return calculateBankBalances(transactions, initialBankBalances);
  }, [transactions, initialBankBalances]);

  const handleSaveBankInitialBalances = (newBalances: Record<string, number>) => {
    setInitialBankBalances(newBalances);
    saveBankInitialBalances(newBalances);
    showToast('🏦 บันทึกยอดเงินเริ่มต้นของธนาคารเรียบร้อยแล้ว');
  };

  const handleTransferMoney = (payload: BankTransferPayload) => {
    const now = Date.now();
    const expenseTx: Transaction = {
      id: 'tx-tf-out-' + now,
      type: 'expense',
      amount: payload.amount,
      category: 'โอนเงินระหว่างธนาคาร',
      note: `${payload.note || 'โอนย้ายเงิน'} (โอนออกไปยัง ${payload.toBank})`,
      date: payload.date,
      paymentMethod: payload.fromBank,
      createdAt: now,
    };
    const incomeTx: Transaction = {
      id: 'tx-tf-in-' + (now + 1),
      type: 'income',
      amount: payload.amount,
      category: 'โอนเงินระหว่างธนาคาร',
      note: `${payload.note || 'โอนย้ายเงิน'} (รับโอนจาก ${payload.fromBank})`,
      date: payload.date,
      paymentMethod: payload.toBank,
      createdAt: now + 1,
    };

    const updated = [incomeTx, expenseTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);

    // Push to Google Sheets if autoSync is active
    if (sheetsConfig.autoSync && sheetsConfig.webAppUrl) {
      pushTransactionToGoogleSheets(sheetsConfig.webAppUrl, expenseTx);
      pushTransactionToGoogleSheets(sheetsConfig.webAppUrl, incomeTx);
    }

    showToast(`💸 โอนเงิน ${formatCurrency(payload.amount)} จาก ${payload.fromBank} ไปยัง ${payload.toBank} สำเร็จ`);
  };

  // Available Month Filter Options
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const currentYM = new Date().toISOString().slice(0, 7);
    monthSet.add(currentYM);

    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.slice(0, 7));
      }
    });

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const [yearStr, monthStr] = ym.split('-');
        const monthNum = parseInt(monthStr, 10) - 1;
        const yearThai = parseInt(yearStr, 10) + 543;
        return {
          value: ym,
          label: `${thaiMonths[monthNum]} ${yearThai}`,
        };
      });
  }, [transactions]);

  // Fast Instant Search Filter ("ค้นหาด้วยการพิมพ์ไม่กี่ตัวอักษร ไม่ต้องเลื่อนหา")
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type Filter
      if (typeFilter === 'income' && t.type !== 'income') return false;
      if (typeFilter === 'expense' && t.type !== 'expense') return false;
      if (typeFilter === 'savings' && t.type !== 'savings') return false;
      if (typeFilter === 'goal' && !t.goalId && t.type !== 'savings') return false;

      // Date Filter
      const todayStr = new Date().toISOString().slice(0, 10);
      const currentYM = new Date().toISOString().slice(0, 7);
      if (dateFilter === 'today' && t.date !== todayStr) return false;
      if (dateFilter === 'month' && !t.date.startsWith(currentYM)) return false;

      // Active Date Range Filter (when dateFilter is 'all')
      if (dateFilter === 'all' && !isDateInRange(t.date, dateRange.startDate, dateRange.endDate)) {
        return false;
      }

      // Bank Account Filter (when user selects a specific bank)
      if (selectedBankFilter) {
        const method = t.paymentMethod || 'ธ.กสิกรไทย (KBank)';
        const matchBank = method === selectedBankFilter || method.includes(selectedBankFilter);
        if (!matchBank) return false;
      }

      // Search Query (Instant match on note, category, amount, method, date)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const noteMatch = (t.note || '').toLowerCase().includes(q);
        const catMatch = t.category.toLowerCase().includes(q);
        const amountMatch = String(t.amount).includes(q);
        const methodMatch = (t.paymentMethod || '').toLowerCase().includes(q);
        const dateMatch = t.date.includes(q);

        return noteMatch || catMatch || amountMatch || methodMatch || dateMatch;
      }

      return true;
    });
  }, [transactions, typeFilter, dateFilter, dateRange, searchQuery, selectedBankFilter]);

  const lastUndoAction = undoStack.length > 0 ? undoStack[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Sticky Header */}
      <Navbar
        onOpenSummary={() => setIsSummaryModalOpen(true)}
        onOpenSheets={() => setIsSheetsModalOpen(true)}
        onOpenBudget={() => setIsBudgetModalOpen(true)}
        onOpenPdfExport={() => setIsPdfModalOpen(true)}
        onOpenBankManager={() => {
          setBankModalTab('overview');
          setIsBankModalOpen(true);
        }}
        sheetsConfig={sheetsConfig}
        lastUndoAction={lastUndoAction}
        onUndo={handleUndo}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-3.5 pt-3.5">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Smart Alerts Banner (Over-budget, Near-goal, etc.) */}
        <AlertBanner
          budgetStatus={budgetStatus}
          nearGoals={nearGoals}
          completedGoals={completedGoals}
          onOpenGoalsTab={() => setActiveTab('goals')}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Quick Stats Balance & Financial Metrics */}
        <QuickStats
          totalIncome={financialSummary.totalIncome}
          totalExpense={financialSummary.totalExpense}
          totalSavings={financialSummary.totalSavings}
          netBalance={financialSummary.netBalance}
          totalSavedInGoals={financialSummary.totalSavedInGoals}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* View Tabs Selector */}
        <div className="grid grid-cols-3 p-1 bg-slate-200/80 rounded-xl mb-3.5 text-xs font-bold">
          <button
            id="tab-all"
            onClick={() => setActiveTab('all')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>หน้าหลัก & รายการ</span>
          </button>

          <button
            id="tab-goals"
            onClick={() => setActiveTab('goals')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'goals'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>เป้าหมายออมเงิน ({goals.length})</span>
          </button>

          <button
            id="tab-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>ประวัติรายการ</span>
          </button>
        </div>

        {/* Tab 1: All (Clean Overview: QuickSearch + Transactions Feed) */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Instant Search Bar */}
            <QuickSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              resultCount={filteredTransactions.length}
            />

            {/* Transactions Feed */}
            <TransactionList
              transactions={filteredTransactions}
              goals={goals}
              lastUndoAction={lastUndoAction}
              onUndo={handleUndo}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTx(null);
                setDepositGoalId(undefined);
                setIsTxModalOpen(true);
              }}
              onOpenPdfExport={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Goals View */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <SavingsGoalsSection
              goals={goals}
              onAddGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditGoal={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onQuickDeposit={handleQuickDeposit}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Transaction History & Search View */}
        {activeTab === 'transactions' && (
          <div className="space-y-3">
            <QuickSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              resultCount={filteredTransactions.length}
            />

            <TransactionList
              transactions={filteredTransactions}
              goals={goals}
              lastUndoAction={lastUndoAction}
              onUndo={handleUndo}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTx(null);
                setDepositGoalId(undefined);
                setIsTxModalOpen(true);
              }}
              onOpenPdfExport={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) & Mobile Bottom Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-around relative">
          {/* Overview Tab Button */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              activeTab === 'all' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">ภาพรวม</span>
          </button>

          {/* Goals Tab Button */}
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              activeTab === 'goals' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px]">เป้าหมาย</span>
          </button>

          {/* Central Big Quick-Add Floating Button */}
          <div className="relative -top-5">
            <button
              id="btn-fab-add"
              onClick={() => {
                setEditingTx(null);
                setDepositGoalId(undefined);
                setIsTxModalOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 ring-4 ring-slate-50"
              title="บันทึกรายการด่วน"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          {/* Financial Bank Accounts Info Button */}
          <button
            id="btn-bottom-banks"
            onClick={() => {
              setBankModalTab('overview');
              setIsBankModalOpen(true);
            }}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-600 hover:text-blue-700 active:text-blue-800 transition-colors group"
            title="ข้อมูลบัญชีธนาคารทางการเงิน"
          >
            <Building2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-slate-700 group-hover:text-blue-700">บัญชีธนาคาร</span>
          </button>

          {/* Financial Summary & Stats Button */}
          <button
            id="btn-bottom-summary"
            onClick={() => setIsSummaryModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            title="สรุปข้อมูลการเงิน"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px]">สรุปข้อมูล</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
          setDepositGoalId(undefined);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        goals={goals}
        defaultGoalId={depositGoalId}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        transactions={transactions}
        goals={goals}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sheetsConfig={sheetsConfig}
        onSyncGoogleSheets={handleSyncGoogleSheets}
        onOpenPdfExport={() => setIsPdfModalOpen(true)}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        transactions={transactions}
        goals={goals}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        sheetsConfig={sheetsConfig}
        onSaveConfig={updateSheetsConfig}
        onSyncNow={handleSyncGoogleSheets}
        transactions={transactions}
        goals={goals}
        isSyncing={isSyncing}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetConfig={budgetConfig}
        onSave={updateBudget}
      />

      <BankBalancesModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        accounts={bankBalancesData.accounts}
        totalLiquidWealth={bankBalancesData.totalLiquidWealth}
        initialBalances={initialBankBalances}
        onSaveInitialBalances={handleSaveBankInitialBalances}
        onTransferMoney={handleTransferMoney}
        transactions={transactions}
        initialTab={bankModalTab}
      />
    </div>
  );
}

