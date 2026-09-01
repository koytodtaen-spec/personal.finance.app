import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Target, 
  Calendar, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Plane,
  Home,
  Car,
  Heart,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { calculateSavingsGoal, formatCurrency } from '../utils/calculator';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  editingGoal?: SavingsGoal | null;
}

const GOAL_ICONS = [
  { id: 'ShieldCheck', label: 'ความมั่นคง/ฉุกเฉิน', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
  { id: 'Plane', label: 'ท่องเที่ยว', icon: <Plane className="w-4 h-4 text-sky-600" /> },
  { id: 'Home', label: 'บ้าน/ที่พัก', icon: <Home className="w-4 h-4 text-amber-600" /> },
  { id: 'Car', label: 'ยานยนต์/รถ', icon: <Car className="w-4 h-4 text-indigo-600" /> },
  { id: 'Heart', label: 'สุขภาพ/ครอบครัว', icon: <Heart className="w-4 h-4 text-rose-600" /> },
  { id: 'GraduationCap', label: 'การศึกษา', icon: <GraduationCap className="w-4 h-4 text-purple-600" /> },
  { id: 'Briefcase', label: 'ธุรกิจ/ลงทุน', icon: <Briefcase className="w-4 h-4 text-teal-600" /> },
  { id: 'Target', label: 'เป้าหมายทั่วไป', icon: <Target className="w-4 h-4 text-blue-600" /> },
];

const PRESET_GOALS = [
  { title: 'กองทุนสำรองฉุกเฉิน', amount: 100000, months: 12, icon: 'ShieldCheck' },
  { title: 'ท่องเที่ยวต่างประเทศ', amount: 50000, months: 6, icon: 'Plane' },
  { title: 'เงินดาวน์บ้าน/คอนโด', amount: 250000, months: 24, icon: 'Home' },
  { title: 'ซื้อคอมพิวเตอร์/มือถือใหม่', amount: 40000, months: 4, icon: 'Briefcase' },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [title, setTitle] = useState<string>('');
  const [targetAmountStr, setTargetAmountStr] = useState<string>('');
  const [currentAmountStr, setCurrentAmountStr] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('');
  const [icon, setIcon] = useState<string>('Target');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmountStr(String(editingGoal.targetAmount));
      setCurrentAmountStr(String(editingGoal.currentAmount || 0));
      setTargetDate(editingGoal.targetDate);
      setIcon(editingGoal.icon || 'Target');
      setNote(editingGoal.note || '');
    } else {
      // Default 6 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 6);
      setTitle('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      setTargetDate(defaultDate.toISOString().slice(0, 10));
      setIcon('ShieldCheck');
      setNote('');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  // Live Auto-Calculation Preview
  const targetAmountNum = parseFloat(targetAmountStr) || 0;
  const currentAmountNum = parseFloat(currentAmountStr) || 0;

  const tempGoal: SavingsGoal = {
    id: 'temp',
    title: title || 'เป้าหมาย',
    targetAmount: targetAmountNum,
    currentAmount: currentAmountNum,
    targetDate: targetDate || new Date().toISOString().slice(0, 10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const calc = calculateSavingsGoal(tempGoal);

  const applyPreset = (preset: typeof PRESET_GOALS[0]) => {
    setTitle(preset.title);
    setTargetAmountStr(String(preset.amount));
    setIcon(preset.icon);
    const date = new Date();
    date.setMonth(date.getMonth() + preset.months);
    setTargetDate(date.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อเป้าหมาย');
      return;
    }
    if (targetAmountNum <= 0) {
      alert('กรุณากรอกจำนวนเงินเป้าหมายที่มากกว่า 0');
      return;
    }
    if (!targetDate) {
      alert('กรุณาเลือกวันที่เป้าหมาย');
      return;
    }

    onSave(
      {
        title: title.trim(),
        targetAmount: targetAmountNum,
        currentAmount: currentAmountNum,
        targetDate,
        icon,
        note: note.trim(),
      },
      editingGoal?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {editingGoal ? 'แก้ไขเป้าหมายการเงิน' : 'วางแผนเป้าหมายออมเงินใหม่'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Presets if new */}
          {!editingGoal && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                ⚡ เลือกเป้าหมายยอดนิยม:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_GOALS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1.5 text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {formatCurrency(p.amount)} ({p.months} เดือน)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อเป้าหมายการเงิน *
            </label>
            <input
              id="input-goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น กองทุนสำรองฉุกเฉิน, เที่ยวญี่ปุ่น, ซื้อรถ..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Target Amount & Current Saved */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เป้าหมายที่ต้องการ (บาท) *
              </label>
              <input
                id="input-goal-target"
                type="number"
                step="any"
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                placeholder="50,000"
                className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เงินที่มีอยู่แล้ว (บาท)
              </label>
              <input
                type="number"
                step="any"
                value={currentAmountStr}
                onChange={(e) => setCurrentAmountStr(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>วันที่ต้องการให้บรรลุเป้าหมาย *</span>
            </label>
            <input
              id="input-goal-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* 🌟 Dynamic Live Calculation Preview Card */}
          {targetAmountNum > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ผลการคำนวณแผนการออมเงินอัตโนมัติ:</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <span className="text-[11px] text-slate-500">ต้องเก็บต่อเดือน:</span>
                  <div className="text-base font-extrabold text-emerald-700">
                    {formatCurrency(calc.monthlyNeeded)}
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <span className="text-[11px] text-slate-500">ต้องเก็บต่อวัน:</span>
                  <div className="text-base font-extrabold text-teal-700">
                    {formatCurrency(calc.dailyNeeded)}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                <span>
                  ขาดอีก: <strong className="text-rose-600">{formatCurrency(calc.remainingAmount)}</strong>
                </span>
                <span>
                  ระยะเวลาเหลือ: <strong className="text-slate-800">~{calc.monthsRemaining} เดือน</strong> ({calc.daysRemaining} วัน)
                </span>
              </div>
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกไอคอนเป้าหมาย
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    icon === item.id
                      ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / แผนปฏิบัติ (ถ้ามี)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น เก็บเงินทันทีหลังเงินเดือนออก วันที่ 1 ของทุกเดือน..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-submit-goal"
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingGoal ? 'บันทึกการแก้ไขเป้าหมาย' : 'สร้างเป้าหมายการเงิน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
