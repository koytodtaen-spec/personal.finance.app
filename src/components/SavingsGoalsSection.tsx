import React from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Coins, 
  Edit3, 
  Trash2,
  ShieldCheck,
  Plane,
  Home,
  Car,
  Heart,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types';
import { calculateSavingsGoal, formatCurrency, formatThaiDate } from '../utils/calculator';

interface SavingsGoalsSectionProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onQuickDeposit: (goal: SavingsGoal) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
  Plane: <Plane className="w-5 h-5 text-sky-600" />,
  Home: <Home className="w-5 h-5 text-amber-600" />,
  Car: <Car className="w-5 h-5 text-indigo-600" />,
  Heart: <Heart className="w-5 h-5 text-rose-600" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-purple-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-teal-600" />,
  Target: <Target className="w-5 h-5 text-blue-600" />,
};

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onQuickDeposit,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">เป้าหมายเก็บเงินเพื่ออนาคต</h2>
            <p className="text-xs text-slate-500">
              คำนวณเงินออมต่อเดือนอัตโนมัติ ({goals.length} เป้าหมาย)
            </p>
          </div>
        </div>

        <button
          id="btn-add-goal"
          onClick={onAddGoal}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มเป้าหมาย</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      {goals.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">ยังไม่มีเป้าหมายการออมเงิน</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            ตั้งเป้าหมาย เช่น กองทุนฉุกเฉิน, ท่องเที่ยว, ซื้อบ้าน แล้วระบบจะช่วยคำนวณการออมให้ทันที
          </p>
          <button
            onClick={onAddGoal}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างเป้าหมายแรกของคุณ</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const calc = calculateSavingsGoal(goal);
            const iconElement = ICON_MAP[goal.icon || 'Target'] || <Target className="w-5 h-5 text-blue-600" />;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-2xs ${
                  calc.isCompleted
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : calc.isNearCompletion
                    ? 'border-sky-300 ring-1 ring-sky-200'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Icon, Title, Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {iconElement}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{goal.title}</h3>
                        {calc.isCompleted ? (
                          <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            สำเร็จแล้ว
                          </span>
                        ) : calc.isNearCompletion ? (
                          <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            ใกล้ถึงเป้า!
                          </span>
                        ) : null}
                      </div>
                      {goal.note && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{goal.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="แก้ไขเป้าหมาย"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="ลบเป้าหมาย"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Progress Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <div>
                      <span className="text-slate-500">ออมแล้ว: </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-slate-400"> / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <span className="font-bold text-slate-800">{calc.progressPercent}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        calc.isCompleted
                          ? 'bg-emerald-500'
                          : calc.isNearCompletion
                          ? 'bg-sky-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${calc.progressPercent}%` }}
                    />
                  </div>

                  {/* Remaining Amount & Target Date */}
                  <div className="flex items-center justify-between text-xs mt-2 text-slate-600">
                    <div>
                      {calc.isCompleted ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          🎉 ครบตามเป้าหมายแล้ว!
                        </span>
                      ) : (
                        <span>
                          ขาดอีก:{' '}
                          <strong className="font-semibold text-rose-600">
                            {formatCurrency(calc.remainingAmount)}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatThaiDate(goal.targetDate)}</span>
                    </div>
                  </div>

                  {/* Auto-Calculated Monthly & Daily Savings Box */}
                  {!calc.isCompleted && calc.remainingAmount > 0 && (
                    <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-amber-800 font-medium">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>ต้องเก็บเงินเพื่อให้สำเร็จ:</span>
                        </div>
                        <div className="text-[11px] text-amber-900 font-bold mt-0.5">
                          เดือนละ {formatCurrency(calc.monthlyNeeded)}{' '}
                          <span className="text-amber-700 font-normal">
                            (ประมาณ {formatCurrency(calc.dailyNeeded)}/วัน, เหลือ ~{calc.monthsRemaining} เดือน)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Row: Deposit / Celebrate */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {calc.isCompleted ? (
                      <button
                        onClick={triggerConfetti}
                        className="w-full py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ฉลองความสำเร็จ! 🎊</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuickDeposit(goal)}
                        className="w-full py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>ฝากเงินเข้าเป้าหมายนี้</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
