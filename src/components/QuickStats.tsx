import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/calculator';
import { DateRangeFilter } from '../types';
import { DateRangeSelector } from './DateRangeSelector';

interface QuickStatsProps {
  totalIncome: number;
  totalExpense: number;
  totalSavings?: number;
  netBalance: number;
  totalSavedInGoals: number;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalIncome,
  totalExpense,
  totalSavings = 0,
  netBalance,
  totalSavedInGoals,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="space-y-2.5 mb-3.5">
      {/* Date Range Selector Bar with presets and custom date pickers */}
      <DateRangeSelector
        dateRange={dateRange}
        onChange={onDateRangeChange}
        showPresets={true}
      />

      {/* Main Net Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background ring */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              เงินคงเหลือสุทธิ (รายรับ - รายจ่าย)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/80 text-emerald-300 font-medium">
              {netBalance >= 0 ? 'สถานะบวก' : 'สถานะติดลบ'}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            {formatCurrency(netBalance, true)}
          </div>

          {/* Sub Row: Total Savings Progress */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              เงินที่ออมในเป้าหมายรวม:
            </span>
            <span className="font-bold text-amber-300">
              {formatCurrency(totalSavedInGoals)}
            </span>
          </div>
        </div>
      </div>

      {/* Income & Expense & Savings 3-Card Responsive Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total Income */}
        <div className="bg-white border border-emerald-100 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-medium">รายรับรวม</span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
            +{formatCurrency(totalIncome)}
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white border border-rose-100 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-medium">รายจ่ายรวม</span>
            <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
            -{formatCurrency(totalExpense)}
          </div>
        </div>

        {/* Total Savings */}
        <div className="bg-white border border-teal-100 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-teal-700 mb-1">
            <span className="text-[11px] font-medium">เงินเก็บออม</span>
            <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <PiggyBank className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-teal-700 truncate">
            🎯 {formatCurrency(totalSavings)}
          </div>
        </div>
      </div>
    </div>
  );
};

