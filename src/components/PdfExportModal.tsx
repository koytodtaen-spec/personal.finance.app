import React, { useState, useRef } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CheckCircle2, 
  Eye, 
  Check, 
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { Transaction, SavingsGoal, DateRangeFilter } from '../types';
import { calculateFinancialSummary, formatCurrency, formatThaiDate, formatThaiDateRange, isDateInRange } from '../utils/calculator';
import { downloadElementAsPdf, triggerPrintReport } from '../services/pdfExportService';
import { DateRangeSelector } from './DateRangeSelector';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  goals: SavingsGoal[];
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  goals,
  dateRange,
  onDateRangeChange,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeGoals, setIncludeGoals] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [reportTitle, setReportTitle] = useState<string>('รายงานสรุปสถานะการเงินและแผนออม');

  if (!isOpen) return null;

  // Filter transactions by date range
  const filteredTxs = transactions.filter((t) =>
    isDateInRange(t.date, dateRange.startDate, dateRange.endDate)
  );

  // Calculate summary metrics for the filtered date range
  const summary = calculateFinancialSummary(filteredTxs, goals, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Date range formatted label for display
  const periodDisplay = formatThaiDateRange(dateRange.startDate, dateRange.endDate, dateRange.preset);

  // Format today's date for document issuance
  const todayFormatted = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);
    setProgressMsg('กำลังเตรียมการสร้างไฟล์ PDF...');

    const cleanDatePart = dateRange.startDate && dateRange.endDate 
      ? `${dateRange.startDate}_to_${dateRange.endDate}`
      : 'all-time';
    const fileName = `Financial_Report_${cleanDatePart}.pdf`;

    const success = await downloadElementAsPdf(printAreaRef.current, fileName, (msg) => {
      setProgressMsg(msg);
    });

    setIsGenerating(false);
    setProgressMsg('');

    if (success) {
      // PDF downloaded successfully
    }
  };

  const handlePrint = () => {
    triggerPrintReport();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col animate-slideUp overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">สร้างและส่งออกรายงาน PDF</h2>
              <p className="text-xs text-slate-300">
                เอกสารสรุปสถานะการเงิน จัดรูปแบบ A4 คมชัดระดับมืออาชีพ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Two Columns on large screen (Options + Live Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-100/70">
          {/* Controls & Customization Panel (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                ตั้งค่ารายงาน
              </h3>

              {/* Date Range Selector with Presets & Date Pickers */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ช่วงวันที่ของรายงาน
                </label>
                <DateRangeSelector
                  dateRange={dateRange}
                  onChange={onDateRangeChange}
                  showPresets={true}
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อรายงาน
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="เช่น รายงานสรุปการเงินประจำเดือน"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Inclusion Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={includeGoals}
                    onChange={(e) => setIncludeGoals(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>รวมตารางเป้าหมายเงินออม</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={includeTransactions}
                    onChange={(e) => setIncludeTransactions(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>รวมตารางบันทึกรายการละเอียด ({filteredTxs.length} รายการ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>รวมช่องลงชื่อและบันทึกท้ายเอกสาร</span>
                </label>
              </div>
            </div>

            {/* Actions: Download PDF & Print Buttons */}
            <div className="space-y-2">
              <button
                id="btn-confirm-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{progressMsg || 'กำลังสร้าง PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดเป็นไฟล์ PDF (.pdf)</span>
                  </>
                )}
              </button>

              <button
                id="btn-print-report"
                onClick={handlePrint}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>สั่งพิมพ์ / พิมพ์ผ่านเบราว์เซอร์ (Print)</span>
              </button>
            </div>
          </div>

          {/* Document Preview Panel (8 Cols on LG) */}
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                ตัวอย่างเอกสาร A4 (Live Preview)
              </span>
              <span className="text-[11px] text-slate-400">ขนาดมาตราฐานกระดาษ A4</span>
            </div>

            {/* Printable A4 Container with white background & paper shadow */}
            <div className="overflow-x-auto p-1">
              <div
                ref={printAreaRef}
                id="financial-statement-print-root"
                className="bg-white text-slate-900 w-full min-w-[620px] max-w-[780px] mx-auto p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 font-sans text-xs print:p-0 print:border-none print:shadow-none"
              >
                {/* 1. Header Section */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                        ฿
                      </div>
                      <h1 className="text-lg font-black tracking-tight text-slate-900">
                        {reportTitle}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      สมุดการเงิน & แผนออมเงินอัจฉริยะ • รายงานสรุปสถานะทางการเงินส่วนบุคคล
                    </p>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-900 text-xs">
                      ช่วงเวลา: <span className="text-emerald-700">{periodDisplay}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">วันที่ออกรายงาน: {todayFormatted}</div>
                  </div>
                </div>

                {/* 2. Executive 4-Card KPI Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      รายรับรวม (+)
                    </span>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                      +{formatCurrency(summary.totalIncome)}
                    </div>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      รายจ่ายรวม (-)
                    </span>
                    <div className="text-base font-extrabold text-rose-700 mt-0.5">
                      -{formatCurrency(summary.totalExpense)}
                    </div>
                  </div>

                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-teal-800 uppercase block">
                      เงินออมสะสม (🎯)
                    </span>
                    <div className="text-base font-extrabold text-teal-700 mt-0.5">
                      {formatCurrency(summary.totalSavings || 0)}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-xl p-3 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">
                      เงินคงเหลือสุทธิ
                    </span>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                      {formatCurrency(summary.netBalance)}
                    </div>
                  </div>
                </div>

                {/* 3. Financial Ratio & Verdict Block */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-center border-r border-slate-200 pr-2">
                    <span className="text-[10px] text-slate-500 block">อัตราการออมเงิน (Savings Rate)</span>
                    <span className="text-base font-black text-emerald-600">
                      {summary.savingsRatePercent}%
                    </span>
                  </div>
                  <div className="text-center border-r border-slate-200 pr-2">
                    <span className="text-[10px] text-slate-500 block">รายจ่ายเฉลี่ยต่อวัน</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(summary.dailyAverageExpense)}/วัน
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">ผลการประเมินสุขภาพการเงิน</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {summary.financialVerdict.title}
                    </span>
                  </div>
                </div>

                {/* 4. Top Expense Categories Table */}
                {summary.topExpenseCategories.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>สรุปสัดส่วนรายจ่ายแยกตามหมวดหมู่</span>
                      <span className="text-[10px] font-normal text-slate-500">ยอดรวม {formatCurrency(summary.totalExpense)}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {summary.topExpenseCategories.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between border-b border-slate-100 pb-1 text-xs">
                          <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({cat.percent}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Savings Goals Section (Optional) */}
                {includeGoals && goals.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>สถานะความคืบหน้าเป้าหมายเงินออม</span>
                      <span className="text-[10px] font-normal text-emerald-700">ออมสะสมรวม {formatCurrency(summary.totalSavedInGoals)}</span>
                    </h3>
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="p-1.5 font-semibold">ชื่อเป้าหมาย</th>
                          <th className="p-1.5 font-semibold text-right">ยอดเป้าหมาย</th>
                          <th className="p-1.5 font-semibold text-right">เก็บได้แล้ว</th>
                          <th className="p-1.5 font-semibold text-center">ความคืบหน้า</th>
                          <th className="p-1.5 font-semibold text-right">ยอดคงเหลือที่ต้องเก็บ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {goals.map((g) => {
                          const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                          const rem = Math.max(0, g.targetAmount - g.currentAmount);
                          return (
                            <tr key={g.id}>
                              <td className="p-1.5 font-medium text-slate-800">{g.title}</td>
                              <td className="p-1.5 text-right">{formatCurrency(g.targetAmount)}</td>
                              <td className="p-1.5 text-right font-bold text-emerald-600">{formatCurrency(g.currentAmount)}</td>
                              <td className="p-1.5 text-center font-bold text-slate-700">{pct}%</td>
                              <td className="p-1.5 text-right text-rose-600">{rem === 0 ? 'สำเร็จแล้ว 🏆' : formatCurrency(rem)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. Itemized Transactions Table (Optional) */}
                {includeTransactions && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>ตารางบันทึกรายการธุรกรรม (Itemized Ledger)</span>
                      <span className="text-[10px] font-normal text-slate-500">จำนวน {filteredTxs.length} รายการ</span>
                    </h3>

                    {filteredTxs.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs">
                        ไม่มีรายการธุรกรรมในรอบระยะเวลานี้
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-y border-slate-200">
                            <th className="p-1.5 font-semibold w-20">วันที่</th>
                            <th className="p-1.5 font-semibold w-16">ประเภท</th>
                            <th className="p-1.5 font-semibold">หมวดหมู่</th>
                            <th className="p-1.5 font-semibold w-24">ช่องทาง</th>
                            <th className="p-1.5 font-semibold">บันทึกช่วยจำ</th>
                            <th className="p-1.5 font-semibold text-right w-24">จำนวนเงิน (฿)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTxs.map((t) => {
                            const isInc = t.type === 'income';
                            const isSav = t.type === 'savings';
                            return (
                              <tr key={t.id} className="hover:bg-slate-50">
                                <td className="p-1.5 text-slate-600 whitespace-nowrap">{t.date}</td>
                                <td className="p-1.5 whitespace-nowrap">
                                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    isInc ? 'bg-emerald-100 text-emerald-800' : isSav ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {isInc ? 'รายรับ' : isSav ? 'เงินออม' : 'รายจ่าย'}
                                  </span>
                                </td>
                                <td className="p-1.5 font-medium text-slate-900">{t.category}</td>
                                <td className="p-1.5 text-slate-600">{t.bankAccount || t.paymentMethod || '-'}</td>
                                <td className="p-1.5 text-slate-500 truncate max-w-[120px]">{t.note || '-'}</td>
                                <td className={`p-1.5 text-right font-bold whitespace-nowrap ${
                                  isInc ? 'text-emerald-600' : isSav ? 'text-teal-600' : 'text-slate-900'
                                }`}>
                                  {isInc ? '+' : isSav ? '🎯 ' : '-'}{formatCurrency(t.amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 7. Sign-off / Signature Footer */}
                {includeNotes && (
                  <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
                    <div className="space-y-6">
                      <div>บันทึกเพิ่มเติม: ________________________________________________</div>
                      <div className="text-[10px] text-slate-400">
                        * เอกสารนี้สร้างขึ้นโดยอัตโนมัติจากระบบสมุดการเงิน & แผนออมเงิน
                      </div>
                    </div>
                    <div className="text-center space-y-8">
                      <div>ลงชื่อ ___________________________________ (ผู้จัดทำรายงาน)</div>
                      <div className="text-[10px] text-slate-500">วันที่ ______ / ______ / ________</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
