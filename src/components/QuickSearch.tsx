import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { TransactionType } from '../types';

interface QuickSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: 'all' | TransactionType | 'goal';
  onTypeFilterChange: (type: 'all' | TransactionType | 'goal') => void;
  dateFilter: 'all' | 'today' | 'month';
  onDateFilterChange: (date: 'all' | 'today' | 'month') => void;
  resultCount: number;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateFilter,
  onDateFilterChange,
  resultCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5 mb-3">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          id="input-quick-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="พิมพ์ค้นหาทันที เช่น ข้าว, น้ำมัน, 500, สด..."
          className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            title="ล้างคำค้นหา"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
        <button
          onClick={() => onTypeFilterChange('all')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            typeFilter === 'all'
              ? 'bg-slate-800 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ทั้งหมด
        </button>

        <button
          onClick={() => onTypeFilterChange('expense')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            typeFilter === 'expense'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          💸 รายจ่าย
        </button>

        <button
          onClick={() => onTypeFilterChange('income')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            typeFilter === 'income'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          💰 รายรับ
        </button>

        <button
          onClick={() => onTypeFilterChange('goal')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            typeFilter === 'goal'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          🎯 เงินออม
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

        <button
          onClick={() => onDateFilterChange(dateFilter === 'today' ? 'all' : 'today')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            dateFilter === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          วันนี้
        </button>

        <button
          onClick={() => onDateFilterChange(dateFilter === 'month' ? 'all' : 'month')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            dateFilter === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          เดือนนี้
        </button>
      </div>

      {/* Result Count Indicator if filtered */}
      {(searchQuery || typeFilter !== 'all' || dateFilter !== 'all') && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            พบ <strong className="font-semibold text-slate-800">{resultCount}</strong> รายการ
            {searchQuery && ` สำหรับ "${searchQuery}"`}
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onTypeFilterChange('all');
              onDateFilterChange('all');
            }}
            className="text-emerald-700 font-medium hover:underline"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
};
