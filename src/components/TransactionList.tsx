import React from 'react';
import { 
  Plus, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Tag, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Target,
  Sparkles,
  Search,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Briefcase,
  Award,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Transaction, SavingsGoal, UndoAction } from '../types';
import { getCategoryInfo } from '../data/defaultCategories';
import { formatCurrency, formatThaiDate } from '../utils/calculator';

interface TransactionListProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  lastUndoAction: UndoAction | null;
  onUndo: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onAddNew: () => void;
  onOpenPdfExport?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Film: <Film className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  PiggyBank: <PiggyBank className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  MoreHorizontal: <MoreHorizontal className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  Store: <Store className="w-4 h-4" />,
  Laptop: <Laptop className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  PlusCircle: <PlusCircle className="w-4 h-4" />,
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  goals,
  lastUndoAction,
  onUndo,
  onEditTransaction,
  onDeleteTransaction,
  onAddNew,
  onOpenPdfExport,
}) => {
  // จัดกลุ่มรายการตามวันที่
  const groupedTransactions = React.useMemo(() => {
    const groups: { date: string; items: Transaction[]; dayIncome: number; dayExpense: number; daySavings: number }[] = [];
    const dateMap: Record<string, { items: Transaction[]; dayIncome: number; dayExpense: number; daySavings: number }> = {};

    // Sort newest date first
    const sorted = [...transactions].sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    sorted.forEach((t) => {
      if (!dateMap[t.date]) {
        dateMap[t.date] = { items: [], dayIncome: 0, dayExpense: 0, daySavings: 0 };
        groups.push({ date: t.date, ...dateMap[t.date] });
      }
      dateMap[t.date].items.push(t);
      if (t.type === 'income') {
        dateMap[t.date].dayIncome += t.amount;
      } else if (t.type === 'savings') {
        dateMap[t.date].daySavings += t.amount;
      } else {
        dateMap[t.date].dayExpense += t.amount;
      }
    });

    return groups;
  }, [transactions]);

  // Helper เพื่อแสดงชื่อวันที่ เช่น "วันนี้", "เมื่อวาน", หรือ "31 ส.ค. 2569"
  const getRelativeDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dateStr === today) return 'วันนี้';
    if (dateStr === yesterday) return 'เมื่อวาน';
    return formatThaiDate(dateStr, 'long');
  };

  return (
    <div className="space-y-3">
      {/* Section Header & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">ประวัติรายการ</h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
            {transactions.length} รายการ
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export PDF Button */}
          {onOpenPdfExport && transactions.length > 0 && (
            <button
              id="btn-list-export-pdf"
              onClick={onOpenPdfExport}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-lg transition-colors"
              title="ส่งออกรายงานและประวัติเป็นไฟล์ PDF หรือสั่งพิมพ์"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกรายงาน PDF</span>
            </button>
          )}

          {/* Undo Button in list header */}
          {lastUndoAction && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors animate-fadeIn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ย้อนรายการล่าสุด ({lastUndoAction.description})</span>
              <span className="sm:hidden">ย้อน</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">ไม่พบรายการที่ค้นหา</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มบันทึกเพื่อเพิ่มรายการใหม่
          </p>
          <button
            onClick={onAddNew}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายการใหม่</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              {/* Group Date Header */}
              <div className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{getRelativeDateLabel(group.date)}</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    ({formatThaiDate(group.date, 'short')})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-700">+{formatCurrency(group.dayIncome)}</span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-700">-{formatCurrency(group.dayExpense)}</span>
                  )}
                  {group.daySavings > 0 && (
                    <span className="text-teal-700">🎯 ออม {formatCurrency(group.daySavings)}</span>
                  )}
                </div>
              </div>

              {/* Transactions List within the day */}
              <div className="divide-y divide-slate-100">
                {group.items.map((tx) => {
                  const catInfo = getCategoryInfo(tx.category, tx.type);
                  const isIncome = tx.type === 'income';
                  const isSavings = tx.type === 'savings';
                  const goalLinked = goals.find((g) => g.id === tx.goalId);
                  const iconElement = CATEGORY_ICON_MAP[catInfo.icon] || <Tag className="w-4 h-4" />;

                  return (
                    <div
                      key={tx.id}
                      className="px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700'
                              : isSavings
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {iconElement}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {tx.category}
                            </span>
                            {isSavings && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-md">
                                เงินออม
                              </span>
                            )}
                            {goalLinked && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-medium bg-amber-100 text-amber-800 rounded-md">
                                <Target className="w-2.5 h-2.5" />
                                {goalLinked.title}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            {tx.note ? (
                              <span className="text-slate-700 truncate">{tx.note}</span>
                            ) : (
                              <span className="text-slate-400">ไม่มีบันทึก</span>
                            )}
                            {tx.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{tx.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <div>
                          <div
                            className={`text-sm font-bold tracking-tight ${
                              isIncome 
                                ? 'text-emerald-600' 
                                : isSavings
                                ? 'text-teal-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? '+' : isSavings ? '🎯 ' : '-'}
                            {formatCurrency(tx.amount)}
                          </div>
                        </div>

                        {/* Action buttons (Edit & Delete) */}
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="แก้ไขรายการ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
