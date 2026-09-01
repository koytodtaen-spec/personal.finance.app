import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Wallet, 
  ArrowRightLeft, 
  Check, 
  Save, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { BankBalanceInfo, Transaction, BankTransferPayload } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculator';
import { PAYMENT_METHODS } from '../data/defaultCategories';

interface BankBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankBalanceInfo[];
  totalLiquidWealth: number;
  initialBalances: Record<string, number>;
  onSaveInitialBalances: (balances: Record<string, number>) => void;
  onTransferMoney: (payload: BankTransferPayload) => void;
  transactions: Transaction[];
  initialTab?: 'overview' | 'settings' | 'transfer';
}

const BANK_ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Banknote: <Banknote className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
};

export const BankBalancesModal: React.FC<BankBalancesModalProps> = ({
  isOpen,
  onClose,
  accounts,
  totalLiquidWealth,
  initialBalances,
  onSaveInitialBalances,
  onTransferMoney,
  transactions,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'transfer'>(initialTab);
  
  // Local state for editing initial balances
  const [editBalances, setEditBalances] = useState<Record<string, number>>(() => ({ ...initialBalances }));
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Local state for transfer
  const [fromBank, setFromBank] = useState<string>('ธ.กสิกรไทย (KBank)');
  const [toBank, setToBank] = useState<string>('ธ.ไทยพาณิชย์ (SCB)');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [transferNote, setTransferNote] = useState<string>('โอนเงินย้ายบัญชี');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditBalances({ ...initialBalances });
      setActiveTab(initialTab);
      setIsSavedSuccess(false);
      setTransferSuccess(null);
      setTransferError(null);
    }
  }, [isOpen, initialBalances, initialTab]);

  if (!isOpen) return null;

  const handleSaveInitialBalances = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInitialBalances(editBalances);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError('กรุณาระบุจำนวนเงินที่ต้องการโอน');
      return;
    }

    if (fromBank === toBank) {
      setTransferError('ธนาคารต้นทางและปลายทางต้องไม่เป็นบัญชีเดียวกัน');
      return;
    }

    // Check available balance of fromBank
    const sourceAccount = accounts.find((acc) => acc.name === fromBank);
    if (sourceAccount && sourceAccount.currentBalance < amount) {
      // warning but allow if user wants
    }

    onTransferMoney({
      fromBank,
      toBank,
      amount,
      date: transferDate,
      note: transferNote || `โอนจาก ${fromBank} เข้า ${toBank}`,
    });

    setTransferSuccess(`โอนเงินจำนวน ${formatCurrency(amount)} จาก ${fromBank} ไปยัง ${toBank} เรียบร้อยแล้ว!`);
    setTransferAmount('');
    setTimeout(() => {
      setTransferSuccess(null);
      setActiveTab('overview');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">เช็คยอดเงินในแต่ละธนาคาร</h2>
              <p className="text-xs text-slate-300">
                ยอดเงินคงเหลือสุทธิรวม: <strong className="text-emerald-400">{formatCurrency(totalLiquidWealth)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ยอดคงเหลือทุกธนาคาร ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'transfer'
                ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>โอนเงินระหว่างบัญชี</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>ตั้งค่ายอดเงินเริ่มต้น</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Total Wealth Summary Banner */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-200 font-medium">สินทรัพย์สภาพคล่องรวม (ทุกบัญชี)</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                      {formatCurrency(totalLiquidWealth)}
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setActiveTab('transfer')}
                      className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>โอนย้ายเงิน</span>
                    </button>
                  </div>
                </div>

                {/* Wealth Distribution Bar */}
                {totalLiquidWealth > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-[11px] text-blue-200 mb-1 flex items-center justify-between">
                      <span>สัดส่วนเงินในแต่ละธนาคาร:</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                      {accounts
                        .filter((acc) => acc.currentBalance > 0)
                        .map((acc) => {
                          const pct = Math.max(2, (acc.currentBalance / totalLiquidWealth) * 100);
                          return (
                            <div
                              key={acc.id}
                              style={{ width: `${pct}%` }}
                              className={`${acc.color.split(' ')[0]} transition-all duration-300`}
                              title={`${acc.shortName}: ${formatCurrency(acc.currentBalance)} (${pct.toFixed(1)}%)`}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Bank Accounts List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    รายละเอียดรายบัญชีธนาคาร
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    แก้ไขยอดเงินตั้งต้น
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {accounts.map((account) => {
                    const isNegative = account.currentBalance < 0;
                    return (
                      <div
                        key={account.id}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg ${account.color} flex items-center justify-center text-xs shadow-2xs`}>
                                {BANK_ICON_MAP[account.icon] || <Building2 className="w-4 h-4" />}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{account.name}</h4>
                                <span className="text-[10px] text-slate-400">{account.transactionCount} รายการบันทึก</span>
                              </div>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${account.badgeBg}`}>
                              {account.shortName}
                            </span>
                          </div>

                          {/* Current Balance */}
                          <div className="my-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                            <div className="text-[10px] text-slate-500 font-medium">ยอดเงินคงเหลือปัจจุบัน:</div>
                            <div className={`text-lg font-black tracking-tight ${
                              isNegative ? 'text-rose-600' : 'text-slate-900'
                            }`}>
                              {formatCurrency(account.currentBalance)}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown footer: Initial, In, Out */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-500 text-center">
                          <div>
                            <span className="block text-slate-400">ยอดเริ่มต้น</span>
                            <span className="font-semibold text-slate-700 truncate block">
                              {formatCurrency(account.initialBalance)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400">เงินเข้า (+)</span>
                            <span className="font-semibold text-emerald-600 truncate block">
                              +{formatCurrency(account.totalIncome)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400">เงินออก (-)</span>
                            <span className="font-semibold text-rose-600 truncate block">
                              -{formatCurrency(account.totalExpense + account.totalSavings)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFER BETWEEN ACCOUNTS */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">โอนเงินระหว่างธนาคาร / ถอนเงินสด</strong>
                  <span className="text-blue-700 text-[11px]">
                    ระบบจะทำการปรับย้ายยอดเงินจากบัญชีต้นทาง ไปยังบัญชีปลายทางให้โดยอัตโนมัติ โดยไม่กระทบยอดรายรับ/รายจ่ายรวมของครอบครัว
                  </span>
                </div>
              </div>

              {transferSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{transferSuccess}</span>
                </div>
              )}

              {transferError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Source Bank */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    จากบัญชี (ต้นทาง / โอนออก) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={fromBank}
                    onChange={(e) => setFromBank(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((pm) => {
                      const acc = accounts.find((a) => a.name === pm.name);
                      const balance = acc ? acc.currentBalance : 0;
                      return (
                        <option key={pm.id} value={pm.name}>
                          {pm.name} (คงเหลือ: {formatCurrency(balance)})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Destination Bank */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ไปยังบัญชี (ปลายทาง / รับเงิน) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={toBank}
                    onChange={(e) => setToBank(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((pm) => {
                      const acc = accounts.find((a) => a.name === pm.name);
                      const balance = acc ? acc.currentBalance : 0;
                      return (
                        <option key={pm.id} value={pm.name}>
                          {pm.name} (คงเหลือ: {formatCurrency(balance)})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    จำนวนเงินที่ต้องการโอน (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full text-base font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none pl-3 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ฿
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่ทำรายการ
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Transfer Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกช่วยจำ (Note)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ถอนเงินสดมาพกติดตัว, ย้ายเงินไปบัญชีออมทรัพย์"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>ยืนยันการโอนเงิน</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SET INITIAL BALANCES */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveInitialBalances} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">ตั้งค่ายอดเงินตั้งต้น (Initial Opening Balance)</strong>
                  <span className="text-amber-800 text-[11px]">
                    กรอกยอดเงินจริงที่มีอยู่ในบัญชีธนาคาร ณ ปัจจุบัน เพื่อให้ระบบคำนวณยอดเงินคงเหลือได้อย่างแม่นยำตรงกับแอปธนาคารของคุณ
                  </span>
                </div>
              </div>

              {isSavedSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>บันทึกยอดเงินเริ่มต้นเรียบร้อยแล้ว ยอดคงเหลือถูกอัปเดตทันที</span>
                </div>
              )}

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const currentValue = editBalances[pm.name] ?? editBalances[pm.shortName] ?? editBalances[pm.id] ?? 0;
                  return (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-[140px] sm:min-w-[180px]">
                        <div className={`w-7 h-7 rounded-lg ${pm.color} flex items-center justify-center text-xs shadow-2xs`}>
                          {BANK_ICON_MAP[pm.icon] || <Building2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{pm.shortName}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px] sm:max-w-[160px]">{pm.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative w-36 sm:w-44">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={currentValue}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditBalances((prev) => ({
                                ...prev,
                                [pm.name]: val,
                              }));
                            }}
                            className="w-full text-right text-xs sm:text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                            ฿
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditBalances({ ...initialBalances });
                    setActiveTab('overview');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  กลับไปหน้าสรุป
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกการตั้งค่า</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            💡 บันทึกแยกอิสระตามแต่ละโปรไฟล์ผู้ใช้งาน
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
