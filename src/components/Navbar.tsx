import React from 'react';
import { 
  Wallet, 
  Sparkles, 
  FileSpreadsheet, 
  Settings2, 
  RotateCcw, 
  CheckCircle2, 
  RefreshCw,
  FileText,
  Building2
} from 'lucide-react';
import { GoogleSheetConfig, UndoAction } from '../types';

interface NavbarProps {
  onOpenSummary: () => void;
  onOpenSheets: () => void;
  onOpenBudget: () => void;
  onOpenPdfExport?: () => void;
  onOpenBankManager?: () => void;
  sheetsConfig: GoogleSheetConfig;
  lastUndoAction: UndoAction | null;
  onUndo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSummary,
  onOpenSheets,
  onOpenBudget,
  onOpenPdfExport,
  onOpenBankManager,
  sheetsConfig,
  lastUndoAction,
  onUndo,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-3xl mx-auto px-3.5 py-2 flex items-center justify-between gap-2">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">
              สมุดการเงิน & แผนออม
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              บันทึกรายรับ-รายจ่ายส่วนบุคคล
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Undo Button (if available) */}
          {lastUndoAction && (
            <button
              id="btn-undo-header"
              onClick={onUndo}
              title={`ย้อนกลับ: ${lastUndoAction.description}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ย้อนรายการ</span>
            </button>
          )}

          {/* Google Sheets Sync Pill */}
          <button
            id="btn-google-sheets"
            onClick={onOpenSheets}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              sheetsConfig.webAppUrl
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="จัดการการเชื่อมต่อ Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Sheets</span>
            {sheetsConfig.status === 'syncing' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
            ) : sheetsConfig.webAppUrl ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : null}
          </button>

          {/* Financial Summary Button */}
          <button
            id="btn-quick-summary"
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-all hover:scale-[1.02]"
            title="สรุปข้อมูลการเงิน & กราฟสถิติ"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>สรุปข้อมูลการเงิน</span>
          </button>

          {/* Export PDF Button */}
          {onOpenPdfExport && (
            <button
              id="btn-navbar-pdf"
              onClick={onOpenPdfExport}
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="ส่งออกรายงานสรุปเป็น PDF / พิมพ์เอกสาร"
            >
              <FileText className="w-4 h-4 text-blue-600" />
            </button>
          )}

          {/* Bank Accounts Manager Button */}
          {onOpenBankManager && (
            <button
              id="btn-navbar-banks"
              onClick={onOpenBankManager}
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="เช็คยอดเงินในแต่ละธนาคาร / บัญชี"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
            </button>
          )}

          {/* Budget & Limits Settings */}
          <button
            id="btn-budget-settings"
            onClick={onOpenBudget}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="ตั้งค่างบประมาณและการแจ้งเตือน"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
