import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarRange, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Check, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DateRangeFilter, DateRangePreset } from '../types';
import { getDateRangeFromPreset, formatThaiDateRange, formatThaiDate } from '../utils/calculator';

interface DateRangeSelectorProps {
  dateRange: DateRangeFilter;
  onChange: (newRange: DateRangeFilter) => void;
  variant?: 'inline' | 'card' | 'compact';
  showPresets?: boolean;
  className?: string;
}

const PRESET_OPTIONS: { id: DateRangePreset; label: string; icon?: string }[] = [
  { id: 'this_month', label: 'เดือนนี้' },
  { id: 'last_7_days', label: '7 วันล่าสุด' },
  { id: 'last_30_days', label: '30 วันล่าสุด' },
  { id: 'last_month', label: 'เดือนที่แล้ว' },
  { id: 'this_year', label: 'ปีนี้' },
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'custom', label: 'กำหนดเอง 📅' },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onChange,
  variant = 'inline',
  showPresets = true,
  className = '',
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(dateRange.preset === 'custom');

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setIsCustomOpen(true);
      // Keep existing dates or default to this month's range if empty
      if (!dateRange.startDate || !dateRange.endDate) {
        const thisMonthRange = getDateRangeFromPreset('this_month');
        onChange({
          startDate: thisMonthRange.startDate,
          endDate: thisMonthRange.endDate,
          preset: 'custom',
        });
      } else {
        onChange({ ...dateRange, preset: 'custom' });
      }
      return;
    }

    const calculated = getDateRangeFromPreset(preset);
    onChange(calculated);
    setIsCustomOpen(false);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({
      ...dateRange,
      startDate: val,
      preset: 'custom',
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({
      ...dateRange,
      endDate: val,
      preset: 'custom',
    });
  };

  const handleQuickToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    onChange({
      startDate: today,
      endDate: today,
      preset: 'custom',
    });
  };

  const handleQuickThisMonth = () => {
    const range = getDateRangeFromPreset('this_month');
    onChange({
      startDate: range.startDate,
      endDate: range.endDate,
      preset: 'custom',
    });
  };

  const formattedRangeText = formatThaiDateRange(dateRange.startDate, dateRange.endDate, dateRange.preset);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Preset Chips Bar */}
      {showPresets && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-0.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>ช่วงเวลา:</span>
          </span>

          {PRESET_OPTIONS.map((opt) => {
            const isActive = dateRange.preset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`btn-preset-${opt.id}`}
                onClick={() => handlePresetSelect(opt.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-xs shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold ring-2 ring-emerald-600/30'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Date Range Summary Header / Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium leading-none mb-0.5">
              ช่วงวันที่เลือก
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{formattedRangeText}</span>
              {dateRange.preset !== 'custom' && dateRange.preset !== 'all' && (
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-medium rounded-md border border-emerald-200">
                  {PRESET_OPTIONS.find(p => p.id === dateRange.preset)?.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-toggle-custom-date"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            isCustomOpen
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <span>{isCustomOpen ? 'ซ่อนเลือกวันที่' : 'ระบุวันที่เจาะจง'}</span>
          {isCustomOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Custom Date Pickers Drawer */}
      {isCustomOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>วันที่เริ่มต้น (Start Date)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="input-filter-start-date"
                  value={dateRange.startDate}
                  onChange={handleStartDateChange}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {dateRange.startDate && (
                <div className="text-[10px] text-slate-500 mt-0.5 ml-1">
                  {formatThaiDate(dateRange.startDate, 'long')}
                </div>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>ถึงวันที่ (End Date)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="input-filter-end-date"
                  value={dateRange.endDate}
                  onChange={handleEndDateChange}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {dateRange.endDate && (
                <div className="text-[10px] text-slate-500 mt-0.5 ml-1">
                  {formatThaiDate(dateRange.endDate, 'long')}
                </div>
              )}
            </div>
          </div>

          {/* Validation warning if startDate > endDate */}
          {dateRange.startDate && dateRange.endDate && dateRange.startDate > dateRange.endDate && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <span>⚠️ วันที่เริ่มต้นไม่ควรมากกว่าวันที่สิ้นสุด</span>
            </div>
          )}

          {/* Quick Action Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">ปุ่มลัด:</span>
              <button
                type="button"
                onClick={handleQuickToday}
                className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium"
              >
                เฉพาะวันนี้
              </button>
              <button
                type="button"
                onClick={handleQuickThisMonth}
                className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium"
              >
                ทั้งเดือนนี้
              </button>
            </div>

            <button
              type="button"
              onClick={() => handlePresetSelect('all')}
              className="text-slate-500 hover:text-slate-800 underline font-medium"
            >
              แสดงข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
