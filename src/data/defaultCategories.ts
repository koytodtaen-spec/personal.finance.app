import { CategoryInfo } from '../types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหาร & เครื่องดื่ม', type: 'expense', icon: 'Utensils', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'transport', name: 'การเดินทาง & น้ำมัน', type: 'expense', icon: 'Car', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'shopping', name: 'ช้อปปิ้ง & ของใช้', type: 'expense', icon: 'ShoppingBag', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { id: 'housing', name: 'ที่พัก & ค่าน้ำไฟ/เน็ต', type: 'expense', icon: 'Home', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'entertainment', name: 'บันเทิง & ท่องเที่ยว', type: 'expense', icon: 'Film', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'health', name: 'สุขภาพ & ยา / ประกัน', type: 'expense', icon: 'HeartPulse', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'education', name: 'การศึกษา & พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 'family', name: 'ให้ครอบครัว / กตัญญู', type: 'expense', icon: 'Users', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { id: 'bills', name: 'หนี้สิน & ผ่อนชำระ', type: 'expense', icon: 'CreditCard', color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 'savings_allocation', name: 'ออมเงินเข้าเป้าหมาย', type: 'expense', icon: 'PiggyBank', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'other_expense', name: 'เบ็ดเตล็ด / อื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: 'text-slate-600', bgColor: 'bg-slate-100' },
];

export const SAVINGS_CATEGORIES: CategoryInfo[] = [
  { id: 'save_emergency', name: 'ออมเงินสำรองฉุกเฉิน', type: 'savings', icon: 'PiggyBank', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'save_travel', name: 'ออมเงินท่องเที่ยว', type: 'savings', icon: 'PiggyBank', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { id: 'save_house_car', name: 'ออมเงินซื้อบ้าน/รถ', type: 'savings', icon: 'PiggyBank', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'save_investment', name: 'ออมเงินเพื่อลงทุน/เกษียณ', type: 'savings', icon: 'PiggyBank', color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { id: 'save_general', name: 'ออมเงินเข้าเป้าหมาย', type: 'savings', icon: 'PiggyBank', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { id: 'withdraw_goal', name: 'ถอนเงินออมมาใช้จ่าย', type: 'savings', icon: 'PiggyBank', color: 'text-rose-600', bgColor: 'bg-rose-100' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', icon: 'Briefcase', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'bonus', name: 'โบนัส / คอมมิชชั่น', type: 'income', icon: 'Award', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'freelance', name: 'งานฟรีแลนซ์ / พิเศษ', type: 'income', icon: 'Laptop', color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { id: 'investment', name: 'เงินปันผล / ดอกเบี้ย / ลงทุน', type: 'income', icon: 'TrendingUp', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { id: 'gift', name: 'ของขวัญ / ได้รับมา', type: 'income', icon: 'Gift', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: 'text-slate-600', bgColor: 'bg-slate-100' },
];

// รายการ 4 ธนาคารหลักในไทย + พร้อมเพย์ + เงินสด + บัตรเครดิต
export const PAYMENT_METHODS = [
  { id: 'kbank', name: 'ธ.กสิกรไทย (KBank)', shortName: 'KBANK', color: 'bg-emerald-600 text-white', icon: 'Building2', type: 'bank' },
  { id: 'scb', name: 'ธ.ไทยพาณิชย์ (SCB)', shortName: 'SCB', color: 'bg-purple-700 text-white', icon: 'Building2', type: 'bank' },
  { id: 'bbl', name: 'ธ.กรุงเทพ (BBL)', shortName: 'BBL', color: 'bg-blue-800 text-white', icon: 'Building2', type: 'bank' },
  { id: 'ktb', name: 'ธ.กรุงไทย (KTB)', shortName: 'KTB', color: 'bg-sky-500 text-white', icon: 'Building2', type: 'bank' },
  { id: 'bay', name: 'ธ.กรุงศรีฯ (BAY)', shortName: 'BAY', color: 'bg-amber-600 text-white', icon: 'Building2', type: 'bank' },
  { id: 'promptpay', name: 'พร้อมเพย์ (PromptPay)', shortName: 'PromptPay', color: 'bg-blue-900 text-white', icon: 'Smartphone', type: 'promptpay' },
  { id: 'cash', name: 'เงินสด (Cash)', shortName: 'เงินสด', color: 'bg-emerald-700 text-white', icon: 'Banknote', type: 'cash' },
  { id: 'credit_card', name: 'บัตรเครดิต (Credit Card)', shortName: 'บัตรเครดิต', color: 'bg-slate-800 text-white', icon: 'CreditCard', type: 'card' },
  { id: 'wallet', name: 'TrueMoney / e-Wallet', shortName: 'e-Wallet', color: 'bg-orange-500 text-white', icon: 'Wallet', type: 'wallet' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...SAVINGS_CATEGORIES];

export function getCategoryInfo(categoryName: string, type?: 'income' | 'expense' | 'savings'): CategoryInfo {
  const found = ALL_CATEGORIES.find((c) => c.name === categoryName || c.id === categoryName);
  if (found) return found;

  if (type === 'income') {
    return {
      id: 'custom_income',
      name: categoryName,
      type: 'income',
      icon: 'TrendingUp',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    };
  }

  if (type === 'savings') {
    return {
      id: 'custom_savings',
      name: categoryName,
      type: 'savings',
      icon: 'PiggyBank',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    };
  }

  return {
    id: 'custom_expense',
    name: categoryName,
    type: 'expense',
    icon: 'Tag',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  };
}

