import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { GoogleSheetConfig, Transaction, SavingsGoal } from '../types';
import { APPS_SCRIPT_TEMPLATE, exportTransactionsToCSV } from '../services/googleSheetsService';
import { formatThaiDate } from '../utils/calculator';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetsConfig: GoogleSheetConfig;
  onSaveConfig: (config: GoogleSheetConfig) => void;
  onSyncNow: () => Promise<void>;
  transactions: Transaction[];
  goals: SavingsGoal[];
  isSyncing: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  sheetsConfig,
  onSaveConfig,
  onSyncNow,
  transactions,
  goals,
  isSyncing,
}) => {
  const [url, setUrl] = useState(sheetsConfig.webAppUrl);
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = () => {
    onSaveConfig({
      ...sheetsConfig,
      webAppUrl: url.trim(),
      autoSync,
    });
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, goals);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">เชื่อมต่อ Google Sheets</h2>
              <p className="text-[11px] text-slate-300">บันทึกและซิงค์ข้อมูลอัตโนมัติ (ไม่ต้อง Login)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {/* Status Alert */}
          {sheetsConfig.webAppUrl ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">เชื่อมต่อกับ Google Sheets แล้ว</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {sheetsConfig.lastSyncedAt
                    ? `ซิงค์ล่าสุดเมื่อ: ${new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('th-TH')} (${formatThaiDate(new Date(sheetsConfig.lastSyncedAt).toISOString())})`
                    : 'พร้อมสำหรับการซิงค์ข้อมูล'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ซิงค์ไปยัง Google Sheet ส่วนตัวของคุณ</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  นำ Web App URL จาก Google Apps Script ของคุณมาวาง เพื่อบันทึกข้อมูลทุกรายการลง Google Sheet โดยตรง
                </p>
              </div>
            </div>
          )}

          {/* Web App URL Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Google Apps Script Web App URL:
            </label>
            <input
              id="input-sheets-webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Auto-Sync Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-800">ซิงค์อัตโนมัติเมื่อบันทึกรายการใหม่</span>
              <p className="text-[11px] text-slate-500">ส่งข้อมูลลง Google Sheet ทันทีที่เพิ่มรายการ</p>
            </div>
          </label>

          {/* Action Buttons: Save & Sync Now */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-center transition-colors"
            >
              บันทึกการตั้งค่า
            </button>

            {url && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลทั้งหมด'}</span>
              </button>
            )}
          </div>

          {/* How-to Setup Guide (Collapsible) */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                วิธีติดตั้ง Google Apps Script (ทำครั้งเดียวใน 1 นาที):
              </span>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-emerald-700 font-semibold hover:underline"
              >
                {showInstructions ? 'ซ่อนคำแนะนำ' : 'ดูขั้นตอน'}
              </button>
            </div>

            {showInstructions && (
              <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1">
                  <li>เปิด <strong>Google Sheets</strong> เปล่าของคุณขึ้นมา 1 ไฟล์</li>
                  <li>
                    ไปที่เมนู <strong>ส่วนขยาย (Extensions) &rarr; Apps Script</strong>
                  </li>
                  <li>
                    กดปุ่ม <strong>"คัดลอกโค้ดสคริปต์"</strong> ด้านล่าง แล้วนำไปวางแทนที่โค้ดเดิมทั้งหมด
                  </li>
                  <li>
                    กดปุ่ม <strong>"การทำให้ใช้งานได้ (Deploy)" &rarr; "การทำให้ใช้งานได้ใหม่ (New deployment)"</strong>
                  </li>
                  <li>
                    เลือกประเภท <strong>เว็บแอป (Web app)</strong> โดยตั้งค่า:
                    <ul className="list-disc list-inside ml-3 text-slate-700 font-medium">
                      <li>ดำเนินการในฐานะ: ฉัน (Me)</li>
                      <li>ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)</li>
                    </ul>
                  </li>
                  <li>กด Deploy แล้วคัดลอก <strong>Web App URL</strong> นำมาวางในช่องด้านบนนี้</li>
                </ol>

                {/* Copy Script Code Button */}
                <button
                  id="btn-copy-apps-script"
                  onClick={handleCopyCode}
                  className={`w-full mt-2 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    copiedCode
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>คัดลอกโค้ดสคริปต์แล้ว! นำไปวางใน Apps Script ได้เลย</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด Apps Script (Code.gs)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Direct CSV Export Alternative */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">หรือต้องการนำเข้าแบบไฟล์:</span>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ .CSV (รองรับภาษาไทย)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
