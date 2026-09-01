import { Transaction, SavingsGoal } from '../types';
import { FinancialHealthSummary, formatCurrency, formatThaiDate } from '../utils/calculator';

export const APPS_SCRIPT_TEMPLATE = `// 📊 Apps Script สำหรับเชื่อมต่อ บันทึกรายรับรายจ่าย & วางแผนการเงิน กับ Google Sheets
// วิธีติดตั้งง่ายๆ ใน 1 นาที:
// 1. ใน Google Sheet ของคุณ ไปที่เมนู "ส่วนขยาย (Extensions)" -> "Apps Script"
// 2. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ไปวาง
// 3. กด "การทำให้ใช้งานได้ (Deploy)" -> "การทำให้ใช้งานได้ใหม่ (New deployment)"
// 4. เลือกประเภทเป็น "เว็บแอป (Web app)"
//    - ดำเนินการในฐานะ: ฉัน (Me)
//    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)
// 5. กด Deploy แล้วคัดลอก Web App URL นำมาวางในเว็บแอปได้เลย!

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // จัดการแท็บ Transactions
    var txSheet = ss.getSheetByName("รายการรายรับรายจ่าย");
    if (!txSheet) {
      txSheet = ss.insertSheet("รายการรายรับรายจ่าย");
      txSheet.appendRow(["ID", "วันที่", "ประเภท", "หมวดหมู่", "จำนวนเงิน (บาท)", "บันทึกช่วยจำ", "ช่องทางชำระ", "เป้าหมายที่ออม", "เวลาที่บันทึก"]);
      txSheet.getRange(1, 1, 1, 9).setBackground("#047857").setFontColor("#FFFFFF").setFontWeight("bold");
    }
    
    // จัดการแท็บ SavingsGoals
    var goalSheet = ss.getSheetByName("เป้าหมายการออม");
    if (!goalSheet) {
      goalSheet = ss.insertSheet("เป้าหมายการออม");
      goalSheet.appendRow(["ID", "ชื่อเป้าหมาย", "เป้าหมาย (บาท)", "ออมแล้ว (บาท)", "ขาดอีก (บาท)", "ความคืบหน้า (%)", "วันที่เป้าหมาย", "บันทึก"]);
      goalSheet.getRange(1, 1, 1, 8).setBackground("#0284C7").setFontColor("#FFFFFF").setFontWeight("bold");
    }

    if (data.action === "syncAll") {
      // เคลียร์และเขียนข้อมูลใหม่ทั้งหมด
      if (txSheet.getLastRow() > 1) {
        txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 9).clearContent();
      }
      if (data.transactions && data.transactions.length > 0) {
        var txRows = data.transactions.map(function(t) {
          return [
            t.id,
            t.date,
            t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
            t.category,
            t.amount,
            t.note || '-',
            t.paymentMethod || 'ทั่วไป',
            t.goalId || '-',
            new Date(t.createdAt).toLocaleString('th-TH')
          ];
        });
        txSheet.getRange(2, 1, txRows.length, 9).setValues(txRows);
      }

      if (goalSheet.getLastRow() > 1) {
        goalSheet.getRange(2, 1, goalSheet.getLastRow() - 1, 8).clearContent();
      }
      if (data.goals && data.goals.length > 0) {
        var goalRows = data.goals.map(function(g) {
          var remaining = Math.max(0, g.targetAmount - g.currentAmount);
          var pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
          return [
            g.id,
            g.title,
            g.targetAmount,
            g.currentAmount,
            remaining,
            pct + '%',
            g.targetDate,
            g.note || '-'
          ];
        });
        goalSheet.getRange(2, 1, goalRows.length, 8).setValues(goalRows);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "ซิงค์ข้อมูลทั้งหมดเรียบร้อยแล้ว", timestamp: new Date() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === "addTransaction") {
      var t = data.transaction;
      txSheet.appendRow([
        t.id,
        t.date,
        t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
        t.category,
        t.amount,
        t.note || '-',
        t.paymentMethod || 'ทั่วไป',
        t.goalId || '-',
        new Date(t.createdAt).toLocaleString('th-TH')
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกรายการลงชีทแล้ว" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "online", service: "Money Planner & Google Sheets Sync" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * ซิงค์ข้อมูลทั้งหมดไปยัง Google Sheets ผ่าน Web App URL
 */
export async function syncToGoogleSheets(
  webAppUrl: string,
  transactions: Transaction[],
  goals: SavingsGoal[]
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return { success: false, message: 'กรุณากรอก Web App URL ของ Google Apps Script ให้ถูกต้อง' };
  }

  try {
    const payload = {
      action: 'syncAll',
      transactions,
      goals,
      syncedAt: new Date().toISOString(),
    };

    // Note: Google Apps Script Web App redirects on POST, so standard fetch mode 'no-cors' or direct POST
    await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors', // Apps Script requires no-cors for direct browser post
    });

    return {
      success: true,
      message: `ซิงค์ข้อมูลสำเร็จ (${transactions.length} รายการ, ${goals.length} เป้าหมาย)`,
    };
  } catch (error: any) {
    console.error('Google Sheets Sync Error:', error);
    return {
      success: false,
      message: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets',
    };
  }
}

/**
 * ส่งรายการเดียวไปเพิ่มใน Google Sheets แบบ Real-time
 */
export async function pushTransactionToGoogleSheets(
  webAppUrl: string,
  transaction: Transaction
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) return false;

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'addTransaction',
        transaction,
      }),
      mode: 'no-cors',
    });
    return true;
  } catch (e) {
    console.warn('Real-time sync error (will retry on batch sync):', e);
    return false;
  }
}

/**
 * สร้างไฟล์ CSV ที่รองรับภาษาไทยสำหรับเปิดใน Excel / Google Sheets
 */
export function exportTransactionsToCSV(transactions: Transaction[], goals: SavingsGoal[]): void {
  // Add UTF-8 BOM so Thai characters are not garbled
  const BOM = '\uFEFF';
  
  let csvContent = BOM + 'วันที่,ประเภท,หมวดหมู่,จำนวนเงิน,บันทึกช่วยจำ,ช่องทางชำระ,เป้าหมายออม\n';

  transactions.forEach((t) => {
    const typeThai = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const noteClean = (t.note || '').replace(/"/g, '""');
    const goalTitle = goals.find((g) => g.id === t.goalId)?.title || '-';
    
    csvContent += `"${t.date}","${typeThai}","${t.category}",${t.amount},"${noteClean}","${t.paymentMethod || 'ทั่วไป'}","${goalTitle}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `financial-records-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * สร้างข้อความสรุปการเงินสำหรับ 1-Click Copy (แชร์ลง LINE หรือ Google Sheets)
 */
export function generateShareableSummaryText(
  summary: FinancialHealthSummary,
  goals: SavingsGoal[],
  periodLabel: string = 'เดือนนี้'
): string {
  const dateStr = formatThaiDate(new Date().toISOString(), 'long');
  
  let text = `📊 สรุปรายงานการเงิน (${periodLabel})\n`;
  text += `📅 ข้อมูล ณ วันที่: ${dateStr}\n`;
  text += `────────────────────\n`;
  text += `💰 รายรับรวม: ${formatCurrency(summary.totalIncome)}\n`;
  text += `💸 รายจ่ายรวม: ${formatCurrency(summary.totalExpense)}\n`;
  text += `💵 เงินคงเหลือสุทธิ: ${formatCurrency(summary.netBalance)}\n`;
  text += `📈 อัตราการออมเงิน: ${summary.savingsRatePercent}%\n`;
  text += `💳 รายจ่ายเฉลี่ย: ${formatCurrency(summary.dailyAverageExpense)}/วัน\n`;
  text += `────────────────────\n`;
  
  if (summary.topExpenseCategories.length > 0) {
    text += `🏷️ หมวดหมู่รายจ่ายสูงสุด:\n`;
    summary.topExpenseCategories.slice(0, 3).forEach((c, idx) => {
      text += `  ${idx + 1}. ${c.name}: ${formatCurrency(c.amount)} (${c.percent}%)\n`;
    });
    text += `────────────────────\n`;
  }

  if (goals.length > 0) {
    text += `🎯 ความคืบหน้าเป้าหมายการเงิน (${goals.length} เป้าหมาย):\n`;
    goals.forEach((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const statusEmoji = pct >= 100 ? '✅' : pct >= 80 ? '🔥' : '⏳';
      text += `  ${statusEmoji} ${g.title}: ออมแล้ว ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)} (${pct}%)\n`;
      if (remaining > 0) {
        text += `     (ขาดอีก: ${formatCurrency(remaining)})\n`;
      }
    });
    text += `────────────────────\n`;
  }

  text += `💡 การประเมิน: ${summary.financialVerdict.title}\n`;
  text += `${summary.financialVerdict.description}\n`;

  return text;
}
