import React, { useState } from 'react';
import { 
  Building2, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { BankBalanceInfo } from '../types';
import { formatCurrency } from '../utils/calculator';

interface BankAccountsWidgetProps {
  accounts: BankBalanceInfo[];
  totalLiquidWealth: number;
  selectedBankFilter?: string | null;
  onSelectBankFilter: (bankName: string | null) => void;
  onOpenBankManager: () => void;
  onOpenTransfer: () => void;
}

const BANK_ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Banknote: <Banknote className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
};

export const BankAccountsWidget: React.FC<BankAccountsWidgetProps> = ({
  accounts,
  totalLiquidWealth,
  selectedBankFilter,
  onSelectBankFilter,
  onOpenBankManager,
  onOpenTransfer,
}) => {
  const [showAmounts, setShowAmounts] = useState<boolean>(true);

  // Filter accounts that have either initial balance, transactions, or are major banks
  const activeAccounts = accounts.filter(
    (acc) => acc.initialBalance > 0 || acc.transactionCount > 0 || ['kbank', 'scb', 'bbl', 'ktb', 'promptpay', 'cash'].includes(acc.id)
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3 mb-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">เช็คยอดเงินในแต่ละธนาคาร</h3>
              <button
                type="button"
                onClick={() => setShowAmounts(!showAmounts)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
                title={showAmounts ? 'ซ่อนตัวเลขยอดเงิน' : 'แสดงตัวเลขยอดเงิน'}
              >
                {showAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              ยอดเงินคงเหลือรวมทุกบัญชี: <span className="font-bold text-emerald-600">{showAmounts ? formatCurrency(totalLiquidWealth) : '•••••• ฿'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-quick-transfer"
            onClick={onOpenTransfer}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/70"
            title="โอนเงินย้ายระหว่างธนาคาร"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โอนย้ายเงิน</span>
          </button>
          
          <button
            type="button"
            id="btn-manage-banks"
            onClick={onOpenBankManager}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="ตั้งค่ายอดเงินเริ่มต้นและดูรายละเอียดทุกธนาคาร"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">จัดการบัญชี</span>
          </button>
        </div>
      </div>

      {/* Active Bank filter chip indicator if active */}
      {selectedBankFilter && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
          <span className="text-blue-800 font-medium">
            🔍 กำลังแสดงรายการเฉพาะ: <strong>{selectedBankFilter}</strong>
          </span>
          <button
            type="button"
            onClick={() => onSelectBankFilter(null)}
            className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px]"
          >
            ล้างตัวกรอง (ดูทั้งหมด)
          </button>
        </div>
      )}

      {/* Horizontal Scrollable Bank Cards Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {activeAccounts.map((account) => {
          const isSelected = selectedBankFilter === account.name;
          const isNegative = account.currentBalance < 0;

          return (
            <div
              key={account.id}
              onClick={() => {
                // Toggle filter on click
                if (isSelected) {
                  onSelectBankFilter(null);
                } else {
                  onSelectBankFilter(account.name);
                }
              }}
              className={`relative cursor-pointer transition-all duration-200 p-3 rounded-xl border text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs bg-white'
              }`}
            >
              {/* Top row: Icon & Bank ShortName */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-lg ${account.color} flex items-center justify-center shadow-2xs text-[10px]`}>
                    {BANK_ICON_MAP[account.icon] || <Building2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[110px]" title={account.name}>
                    {account.shortName}
                  </span>
                </div>
                
                {isSelected ? (
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    เลือกอยู่
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {account.transactionCount} รายการ
                  </span>
                )}
              </div>

              {/* Middle row: Balance Amount */}
              <div className="my-1">
                <div className="text-[11px] text-slate-500 font-medium">เงินคงเหลือ:</div>
                <div className={`text-base font-extrabold tracking-tight truncate ${
                  isNegative 
                    ? 'text-rose-600' 
                    : account.currentBalance > 0 
                    ? 'text-slate-900' 
                    : 'text-slate-500'
                }`}>
                  {showAmounts ? formatCurrency(account.currentBalance) : '•••••• ฿'}
                </div>
              </div>

              {/* Bottom row: In & Out stats */}
              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5 text-emerald-600 font-medium truncate">
                  <ArrowDownLeft className="w-3 h-3 shrink-0" />
                  {showAmounts ? `+${formatCurrency(account.totalIncome)}` : '•••'}
                </span>
                <span className="flex items-center gap-0.5 text-rose-600 font-medium truncate">
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                  {showAmounts ? `-${formatCurrency(account.totalExpense + account.totalSavings)}` : '•••'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>💡 คลิกที่ธนาคารเพื่อกรองดูเฉพาะรายการของธนาคารนั้น</span>
        <button
          type="button"
          onClick={onOpenBankManager}
          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:underline"
        >
          <span>ดูสถิติและตั้งค่ายอดเงินทุกธนาคาร</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
