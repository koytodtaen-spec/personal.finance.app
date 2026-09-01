import React from 'react';
import { AlertTriangle, Sparkles, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { BudgetStatus, GoalCalculation, formatCurrency } from '../utils/calculator';

interface AlertBannerProps {
  budgetStatus: BudgetStatus;
  nearGoals: GoalCalculation[];
  completedGoals: GoalCalculation[];
  onOpenGoalsTab: () => void;
  onOpenBudgetModal: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  budgetStatus,
  nearGoals,
  completedGoals,
  onOpenGoalsTab,
  onOpenBudgetModal,
}) => {
  const [dismissed, setDismissed] = React.useState<Record<string, boolean>>({});

  const isDismissed = (key: string) => !!dismissed[key];
  const dismiss = (key: string) => setDismissed((prev) => ({ ...prev, [key]: true }));

  const hasAnyAlert =
    (budgetStatus.isOverBudget && !isDismissed('over-budget')) ||
    (budgetStatus.isNearLimit && !isDismissed('near-budget')) ||
    (budgetStatus.categoryWarnings.length > 0 && !isDismissed('category-warnings')) ||
    (nearGoals.length > 0 && !isDismissed('near-goals')) ||
    (completedGoals.length > 0 && !isDismissed('completed-goals'));

  if (!hasAnyAlert) return null;

  return (
    <div className="space-y-2 mb-3">
      {/* ⚠️ Over Budget Alert */}
      {budgetStatus.isOverBudget && !isDismissed('over-budget') && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 shadow-xs flex items-start justify-between gap-3 text-rose-900 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-rose-700">เตือน: ค่าใช้จ่ายเกินงบประมาณแล้ว!</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full">
                  {budgetStatus.usedPercent}% ของงบ
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                ใช้จ่ายไปแล้ว {formatCurrency(budgetStatus.totalExpenseThisMonth)} (เกินงบที่ตั้งไว้{' '}
                {formatCurrency(Math.abs(budgetStatus.remainingBudget))})
              </p>
              <button
                onClick={onOpenBudgetModal}
                className="mt-1.5 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
              >
                ปรับเปลี่ยนงบประมาณ &rarr;
              </button>
            </div>
          </div>
          <button
            onClick={() => dismiss('over-budget')}
            className="text-rose-400 hover:text-rose-600 p-1 rounded-md"
            title="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ⚠️ Near Budget Limit Alert (80% - 99%) */}
      {budgetStatus.isNearLimit && !isDismissed('near-budget') && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 shadow-xs flex items-start justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-800">ใกล้เต็มงบประมาณประจำเดือน</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  ใช้ไป {budgetStatus.usedPercent}%
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                เหลือใช้ได้อีกเพียง {formatCurrency(budgetStatus.remainingBudget)} จากงบ {formatCurrency(budgetStatus.monthlyBudget)}
              </p>
            </div>
          </div>
          <button
            onClick={() => dismiss('near-budget')}
            className="text-amber-400 hover:text-amber-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ⚠️ Category Warnings */}
      {budgetStatus.categoryWarnings.length > 0 && !isDismissed('category-warnings') && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-xs text-orange-900 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">หมวดหมู่ที่ใช้เงินใกล้/เกินงบ:</span>{' '}
              {budgetStatus.categoryWarnings.map((w, idx) => (
                <span key={w.category} className="inline-block mr-2 font-medium">
                  • {w.category} ({w.percent}%)
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => dismiss('category-warnings')} className="text-orange-400 hover:text-orange-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🎉 Near Goal Alert (>= 80% to 99%) */}
      {nearGoals.length > 0 && !isDismissed('near-goals') && (
        <div className="bg-sky-50 border border-sky-300 rounded-xl p-3 shadow-xs flex items-start justify-between gap-3 text-sky-900">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-sky-100 rounded-lg text-sky-600 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-sky-800">
                  🎉 ใกล้ถึงเป้าหมายแล้ว! ({nearGoals.length} รายการ)
                </span>
              </div>
              <div className="space-y-1 mt-1">
                {nearGoals.map((g) => (
                  <p key={g.goal.id} className="text-xs text-sky-700">
                    • <strong className="font-semibold">{g.goal.title}</strong>: สำเร็จแล้ว {g.progressPercent}% 
                    (ขาดอีกเพียง <span className="font-bold text-sky-900">{formatCurrency(g.remainingAmount)}</span>)
                  </p>
                ))}
              </div>
              <button
                onClick={onOpenGoalsTab}
                className="mt-1.5 text-xs font-semibold text-sky-800 underline hover:text-sky-900"
              >
                ดูรายละเอียดเป้าหมาย &rarr;
              </button>
            </div>
          </div>
          <button
            onClick={() => dismiss('near-goals')}
            className="text-sky-400 hover:text-sky-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 🏆 Completed Goals Celebration */}
      {completedGoals.length > 0 && !isDismissed('completed-goals') && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 shadow-xs flex items-start justify-between gap-3 text-emerald-900">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-emerald-800">
                🏆 ยอดเยี่ยมมาก! คุณบรรลุเป้าหมายการเงินแล้ว:
              </span>
              <p className="text-xs text-emerald-700 mt-0.5">
                {completedGoals.map((g) => g.goal.title).join(', ')} สำเร็จครบ 100% แล้ว!
              </p>
            </div>
          </div>
          <button
            onClick={() => dismiss('completed-goals')}
            className="text-emerald-400 hover:text-emerald-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
