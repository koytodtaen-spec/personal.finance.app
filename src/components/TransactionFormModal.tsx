import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Tag, 
  Calendar, 
  CreditCard, 
  Target, 
  Sparkles,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  PiggyBank,
  MoreHorizontal,
  Briefcase,
  Award,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Building2,
  Smartphone,
  Banknote,
  Wallet,
  Info
} from 'lucide-react';
import { Transaction, TransactionType, SavingsGoal } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVINGS_CATEGORIES, PAYMENT_METHODS } from '../data/defaultCategories';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
  goals: SavingsGoal[];
  defaultGoalId?: string;
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

const SUGGESTED_EXPENSE_NOTES = ['ข้าวกลางวัน', 'กาแฟ & ขนม', 'ค่าน้ำมัน', 'ของใช้ในบ้าน', 'ค่าเน็ต/โทรศัพท์', 'เซเว่น'];
const SUGGESTED_INCOME_NOTES = ['เงินเดือน', 'โบนัส', 'ค่าจ้างพิเศษ', 'ขายของ', 'เงินคืน'];
const SUGGESTED_SAVINGS_NOTES = ['เก็บออมรายเดือน', 'ออมเข้ากองทุนสำรอง', 'เก็บค่าตั๋วเที่ยว', 'เงินเก็บก้อนพิเศษ'];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  goals,
  defaultGoalId,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<string>('ธ.กสิกรไทย (KBank)');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setAmountStr(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setNote(editingTransaction.note || '');
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'ธ.กสิกรไทย (KBank)');
      setSelectedGoalId(editingTransaction.goalId || '');
    } else {
      // Default reset
      if (defaultGoalId) {
        setType('savings');
        setSelectedGoalId(defaultGoalId);
        setCategory('ออมเงินเข้าเป้าหมาย');
      } else {
        setType('expense');
        setCategory(EXPENSE_CATEGORIES[0].name);
        setSelectedGoalId('');
      }
      setAmountStr('');
      setNote('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('ธ.กสิกรไทย (KBank)');
    }
  }, [editingTransaction, defaultGoalId, isOpen]);

  if (!isOpen) return null;

  const currentCategories = 
    type === 'income' 
      ? INCOME_CATEGORIES 
      : type === 'savings' 
      ? SAVINGS_CATEGORIES 
      : EXPENSE_CATEGORIES;

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    if (!category) {
      alert('กรุณาเลือกหมวดหมู่');
      return;
    }

    onSave(
      {
        type,
        amount,
        category,
        note: note.trim(),
        date,
        paymentMethod,
        goalId: selectedGoalId || undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col animate-slideUp">
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการ'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* 3-Type Toggle: Expense / Income / Savings */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (!editingTransaction) setCategory(EXPENSE_CATEGORIES[0].name);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💸 รายจ่าย
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setSelectedGoalId('');
                if (!editingTransaction) setCategory(INCOME_CATEGORIES[0].name);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💰 รายรับ
            </button>

            <button
              type="button"
              onClick={() => {
                setType('savings');
                if (!editingTransaction) {
                  setCategory(SAVINGS_CATEGORIES[0].name);
                  if (goals.length > 0 && !selectedGoalId) {
                    setSelectedGoalId(goals[0].id);
                  }
                }
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'savings'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 เงินออม
            </button>
          </div>

          {/* Explanatory Banner for Savings / Income / Expense */}
          {type === 'savings' && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-xs text-teal-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>เงินออมเปรียบเสมือนการโอนเข้ากระปุก:</strong> เงินก้อนนี้ยังอยู่กับคุณ (ไม่คิดเป็นค่าใช้จ่ายที่สูญเปล่า) และระบบจะนำไปเพิ่มในเป้าหมายเก็บเงินให้ทันที
              </div>
            </div>
          )}

          {/* Amount Input with Large Display */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <input
                id="input-tx-amount"
                type="number"
                step="any"
                autoFocus={!editingTransaction}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-4 pr-12 py-3 text-2xl font-extrabold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ฿
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
              {[50, 100, 500, 1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg whitespace-nowrap transition-colors"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg whitespace-nowrap"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Target Goal Link (Prominent if Savings or Expense) */}
          {(type === 'savings' || goals.length > 0) && (
            <div className={type === 'savings' ? 'bg-teal-50/70 border border-teal-200 rounded-xl p-3' : ''}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {type === 'savings' ? 'เก็บออมเข้าเป้าหมายใด? *' : 'ผูกกับเป้าหมายการเงิน (ถ้ามี):'}
                </span>
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => {
                  setSelectedGoalId(e.target.value);
                  if (e.target.value && type === 'expense') {
                    setCategory('ออมเงินเข้าเป้าหมาย');
                  }
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">
                  {type === 'savings' ? '-- เลือกเป้าหมายการออม --' : '-- ไม่ได้ระบุเป้าหมาย (ใช้จ่ายทั่วไป) --'}
                </option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.title} (สะสมแล้ว {g.currentAmount.toLocaleString()} / {g.targetAmount.toLocaleString()} ฿)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกหมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                const iconElement = CATEGORY_ICON_MAP[cat.icon] || <Tag className="w-4 h-4" />;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      if (cat.id === 'savings_allocation' && goals.length > 0 && !selectedGoalId) {
                        setSelectedGoalId(goals[0].id);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-2xs'
                        : 'border-transparent bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {iconElement}
                    </div>
                    <span className="text-[11px] leading-tight line-clamp-1">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note & Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกช่วยจำ (ถ้ามี)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ข้าวหมูกรอบ, ชาเขียว, บัญชีเงินเก็บฉุกเฉิน..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
            {/* Note Tag Suggestions */}
            <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
              {(type === 'income' 
                ? SUGGESTED_INCOME_NOTES 
                : type === 'savings' 
                ? SUGGESTED_SAVINGS_NOTES 
                : SUGGESTED_EXPENSE_NOTES
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNote(suggestion)}
                  className="px-2 py-0.5 text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method (4 Banks + Cash + PromptPay) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>วันที่</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {type === 'income' ? 'รับเงินเข้าธนาคาร/ช่องทาง' : 'จ่าย/โอนจากธนาคาร'}
                </span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              id="btn-submit-transaction"
              type="submit"
              className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                type === 'savings'
                  ? 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
                  : type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {editingTransaction
                  ? 'บันทึกการแก้ไข'
                  : type === 'savings'
                  ? 'บันทึกเงินออมเข้าเป้าหมาย'
                  : type === 'income'
                  ? 'บันทึกรายรับทันที'
                  : 'บันทึกรายจ่ายทันที'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

