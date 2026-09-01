import React, { useState } from 'react';
import { X, Check, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BudgetConfig } from '../types';
import { EXPENSE_CATEGORIES } from '../data/defaultCategories';
import { formatCurrency } from '../utils/calculator';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetConfig: BudgetConfig;
  onSave: (config: BudgetConfig) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetConfig,
  onSave,
}) => {
  const [monthlyBudgetStr, setMonthlyBudgetStr] = useState<string>(
    String(budgetConfig.monthlyBudget || 0)
  );
  const [threshold, setThreshold] = useState<number>(
    budgetConfig.alertThresholdPercent || 80
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(
    budgetConfig.categoryBudgets || {}
  );

  if (!isOpen) return null;

  const handleCategoryBudgetChange = (catName: string, value: string) => {
    const valNum = parseFloat(value) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [catName]: valNum,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyBudget = parseFloat(monthlyBudgetStr) || 0;
    onSave({
      monthlyBudget,
      categoryBudgets,
      alertThresholdPercent: threshold,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              ตั้งค่างบประมาณและการแจ้งเตือน
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Total Monthly Budget */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              งบประมาณรายจ่ายรวมต่อเดือน (บาท) *
            </label>
            <div className="relative">
              <input
                id="input-monthly-budget"
                type="number"
                step="any"
                value={monthlyBudgetStr}
                onChange={(e) => setMonthlyBudgetStr(e.target.value)}
                placeholder="25,000"
                className="w-full px-3 py-2.5 text-lg font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ฿
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              เมื่อยอดใช้จ่ายรวมในเดือนใกล้หรือเกินจำนวนนี้ ระบบจะแสดงแถบแจ้งเตือนเตือนทันที
            </p>
          </div>

          {/* Alert Threshold Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>ระดับการแจ้งเตือนเตือนล่วงหน้า</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[70, 80, 85, 90].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setThreshold(val)}
                  className={`py-2 rounded-xl border text-center font-bold transition-all ${
                    threshold === val
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              จะขึ้นเตือนเมื่อใช้เงินถึง <strong>{threshold}%</strong> ของงบประมาณ
            </p>
          </div>

          {/* Category Budgets */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              คุมงบเฉพาะหมวดหมู่ (ไม่บังคับ):
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {EXPENSE_CATEGORIES.filter((c) => c.id !== 'savings_allocation').map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 truncate font-medium flex-1">
                    {cat.name}
                  </span>
                  <div className="w-32 relative">
                    <input
                      type="number"
                      step="any"
                      value={categoryBudgets[cat.name] || ''}
                      onChange={(e) => handleCategoryBudgetChange(cat.name, e.target.value)}
                      placeholder="ไม่จำกัด"
                      className="w-full px-2 py-1 text-xs text-right bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-save-budget"
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการตั้งค่างบประมาณ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
