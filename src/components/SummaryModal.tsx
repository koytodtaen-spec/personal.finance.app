import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  FileText,
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  Scale,
  PiggyBank,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Transaction, SavingsGoal, GoogleSheetConfig, DateRangeFilter } from '../types';
import { calculateFinancialSummary, formatCurrency, formatThaiDate, formatThaiDateRange } from '../utils/calculator';
import { exportTransactionsToCSV, generateShareableSummaryText } from '../services/googleSheetsService';
import { DateRangeSelector } from './DateRangeSelector';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  goals: SavingsGoal[];
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  sheetsConfig: GoogleSheetConfig;
  onSyncGoogleSheets: () => void;
  onOpenPdfExport?: () => void;
}

// Harmonious, distinct color palette for expense categories
const CATEGORY_COLORS: string[] = [
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#64748b', // Slate
];

// Custom Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      amount: number;
      percent?: number;
      color?: string;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const item = data.payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-xs text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-0.5 pointer-events-none z-50">
        <div className="font-bold flex items-center gap-1.5 text-slate-100">
          {item.color && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span>{item.name}</span>
        </div>
        <div className="text-emerald-400 font-extrabold text-sm">
          {formatCurrency(item.amount ?? item.value)}
        </div>
        {item.percent !== undefined && (
          <div className="text-[11px] text-slate-400">
            คิดเป็น {item.percent}% ของรายจ่ายทั้งหมด
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  goals,
  dateRange,
  onDateRangeChange,
  sheetsConfig,
  onSyncGoogleSheets,
  onOpenPdfExport,
}) => {
  const [copied, setCopied] = useState(false);
  const [chartType, setChartType] = useState<'donut' | 'bar' | 'overview'>('donut');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const summary = calculateFinancialSummary(transactions, goals, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const currentPeriodLabel = formatThaiDateRange(dateRange.startDate, dateRange.endDate, dateRange.preset);

  const handleCopySummary = () => {
    const text = generateShareableSummaryText(summary, goals, currentPeriodLabel);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, goals);
  };

  // Prepare Data for Expense Category Chart
  const expenseChartData = summary.topExpenseCategories.map((cat, idx) => ({
    name: cat.name,
    amount: cat.amount,
    value: cat.amount,
    percent: cat.percent,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  // Overview Comparison Data (Income vs Expense vs Savings)
  const overviewChartData = [
    {
      name: 'รายรับ',
      amount: summary.totalIncome,
      value: summary.totalIncome,
      color: '#10b981', // Emerald
    },
    {
      name: 'รายจ่าย',
      amount: summary.totalExpense,
      value: summary.totalExpense,
      color: '#f43f5e', // Rose
    },
    {
      name: 'เงินออม',
      amount: summary.totalSavings || 0,
      value: summary.totalSavings || 0,
      color: '#0d9488', // Teal
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">สรุปข้อมูลการเงิน & กราฟสถิติ</h2>
              <p className="text-[11px] text-emerald-100">ภาพรวมรายรับ รายจ่าย และแผนออม</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {/* Period Selector (Date Range with Presets & Date Pickers) */}
          <DateRangeSelector
            dateRange={dateRange}
            onChange={onDateRangeChange}
            showPresets={true}
          />

          {/* Financial Health Verdict Banner */}
          <div className={`p-3.5 rounded-2xl border ${summary.financialVerdict.color} flex items-start gap-3`}>
            <div className="shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{summary.financialVerdict.title}</h3>
              <p className="text-xs mt-0.5 leading-relaxed">{summary.financialVerdict.description}</p>
            </div>
          </div>

          {/* 3 Core Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5">
              <div className="text-[11px] font-medium text-emerald-800">รายรับรวม</div>
              <div className="text-sm font-extrabold text-emerald-700 mt-0.5 truncate">
                +{formatCurrency(summary.totalIncome)}
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2.5">
              <div className="text-[11px] font-medium text-rose-800">รายจ่ายรวม</div>
              <div className="text-sm font-extrabold text-rose-700 mt-0.5 truncate">
                -{formatCurrency(summary.totalExpense)}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-300">เงินคงเหลือ</div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5 truncate">
                {formatCurrency(summary.netBalance)}
              </div>
            </div>
          </div>

          {/* Savings Rate & Daily Average Row */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
            <div>
              <span className="text-slate-500 block">อัตราการออมเงิน (Savings Rate):</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{summary.savingsRatePercent}%</span>
                <span className="text-[11px] text-slate-500">ของรายได้</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">รายจ่ายเฉลี่ยต่อวัน:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(summary.dailyAverageExpense)}
                </span>
                <span className="text-[11px] text-slate-500">/วัน</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Graph Module */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
            {/* Chart Header with Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <PieIcon className="w-4 h-4 text-rose-500" />
                <span>แผนภูมิกราฟสรุปการเงิน</span>
              </div>

              {/* Toggle Buttons */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartType('donut')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    chartType === 'donut'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieIcon className="w-3 h-3 text-rose-500" />
                  <span>วงกลม</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    chartType === 'bar'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3 h-3 text-blue-500" />
                  <span>กราฟแท่ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('overview')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    chartType === 'overview'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3 h-3 text-teal-600" />
                  <span>เปรียบเทียบ</span>
                </button>
              </div>
            </div>

            {/* Render Graph based on chartType */}
            {chartType === 'overview' ? (
              // Cashflow Overview Bar Chart (Income vs Expense vs Savings)
              <div className="space-y-2">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overviewChartData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#475569' }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar 
                        dataKey="amount" 
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                      >
                        {overviewChartData.map((entry, index) => (
                          <Cell key={`overview-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="bg-emerald-50 rounded-lg p-1.5 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block">รายรับ</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(summary.totalIncome)}</span>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-1.5 border border-rose-100">
                    <span className="text-[10px] text-rose-700 block">รายจ่าย</span>
                    <span className="font-bold text-rose-800">{formatCurrency(summary.totalExpense)}</span>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-1.5 border border-teal-100">
                    <span className="text-[10px] text-teal-700 block">เงินออม</span>
                    <span className="font-bold text-teal-800">{formatCurrency(summary.totalSavings || 0)}</span>
                  </div>
                </div>
              </div>
            ) : expenseChartData.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีข้อมูลรายจ่ายในช่วงเวลานี้
              </div>
            ) : chartType === 'donut' ? (
              // Donut / Pie Chart for Expense Categories
              <div className="space-y-3">
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomChartTooltip />} />
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={700}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={activeIndex === index ? 3 : 1.5}
                            opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Label inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {activeIndex !== null ? expenseChartData[activeIndex]?.name : 'จ่ายรวม'}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {activeIndex !== null
                        ? formatCurrency(expenseChartData[activeIndex]?.amount)
                        : formatCurrency(summary.totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Category Chips Legend with proportions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {expenseChartData.map((item, idx) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        activeIndex === idx
                          ? 'bg-slate-100 border-slate-400 shadow-2xs ring-1 ring-slate-300 scale-102'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate max-w-[110px]">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Horizontal Bar Chart for Expense Categories
              <div className="space-y-2">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenseChartData.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar 
                        dataKey="amount" 
                        radius={[0, 6, 6, 0]}
                        animationDuration={600}
                      >
                        {expenseChartData.slice(0, 6).map((entry, index) => (
                          <Cell key={`bar-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Top Expense Categories Breakdown List */}
          {summary.topExpenseCategories.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  รายละเอียดหมวดหมู่ใช้จ่ายสูงสุด
                </span>
                <span className="text-slate-400">100%</span>
              </div>

              <div className="space-y-2">
                {summary.topExpenseCategories.slice(0, 5).map((cat, idx) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-slate-700 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                        <span className="text-[11px] font-semibold text-slate-400 w-9 text-right">
                          {cat.percent}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${cat.percent}%`,
                          backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Savings Goals Status */}
          {goals.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-500" />
                  เป้าหมายการเงินเพื่ออนาคต ({goals.length} รายการ)
                </span>
                <span className="text-amber-600 font-bold">
                  รวม {formatCurrency(summary.totalSavedInGoals)}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {goals.map((g) => {
                  const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                  return (
                    <div key={g.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{g.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)} ({pct}%)
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {pct >= 100 ? (
                          <span className="text-[11px] font-bold text-emerald-600">สำเร็จแล้ว! 🏆</span>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-medium">
                            ขาดอีก {formatCurrency(remaining)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1-Click Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* Copy Summary Text Button */}
            <button
              id="btn-copy-summary-text"
              onClick={handleCopySummary}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>คัดลอกข้อความสรุปเรียบร้อยแล้ว! (พร้อมส่งใน LINE/Notes)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกข้อความสรุป (สำหรับแชร์ LINE / จดบันทึก)</span>
                </>
              )}
            </button>

            {/* PDF Report & Export Actions */}
            <div className="grid grid-cols-3 gap-2">
              {onOpenPdfExport && (
                <button
                  id="btn-open-pdf-from-summary"
                  onClick={() => {
                    onClose();
                    onOpenPdfExport();
                  }}
                  className="py-2.5 px-2.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  title="สร้างรายงานและดาวน์โหลดเป็น PDF หรือพิมพ์"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">รายงาน PDF</span>
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                title="ส่งออกรายการทั้งหมดเป็นไฟล์ CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">ส่งออก CSV</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSyncGoogleSheets();
                }}
                className="py-2.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                title="เปิดเมนูตั้งค่าและซิงค์ Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Google Sheets</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

