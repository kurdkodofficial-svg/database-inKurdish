import React, { useState } from 'react';
import { SheetModel, BlockedIpEntry, Dialect } from '../types';
import { getUIText, DIALECT_LABELS } from '../data/translations';
import { generateSqlDump, downloadSqlDumpFile } from '../lib/db';
import { 
  Settings, 
  Database, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  RefreshCw, 
  FileCode, 
  CheckCircle2, 
  Server, 
  Layers, 
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface SettingsViewProps {
  sheets: SheetModel[];
  blockedIps: BlockedIpEntry[];
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  currentDialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  onResetToDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sheets,
  blockedIps,
  exchangeRate,
  onExchangeRateChange,
  currentDialect,
  onDialectChange,
  onResetToDefaults,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportedInfo, setLastExportedInfo] = useState<{ filename: string; sizeKb: number } | null>(null);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Magic Kurdistan Workspace');
  const [savedSettings, setSavedSettings] = useState(false);

  // Statistics
  const totalSheets = sheets.length;
  const totalRecords = sheets.reduce((acc, s) => acc + s.records.length, 0);
  const totalFields = sheets.reduce((acc, s) => acc + s.fields.length, 0);
  const totalBlocked = blockedIps.length;

  const handleBackupClick = () => {
    setIsExporting(true);
    try {
      const result = downloadSqlDumpFile(sheets, {
        exchangeRate,
        workspaceName,
      });
      setLastExportedInfo({
        filename: result.filename,
        sizeKb: Math.round((result.size / 1024) * 10) / 10,
      });
      // Update preview cache
      setSqlContent(result.sqlContent);
    } catch (err) {
      console.error('Backup error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTogglePreview = () => {
    if (!sqlContent) {
      const fullDump = generateSqlDump(sheets, { exchangeRate, workspaceName });
      setSqlContent(fullDump);
    }
    setShowSqlPreview(!showSqlPreview);
  };

  const handleCopySql = () => {
    const textToCopy = sqlContent || generateSqlDump(sheets, { exchangeRate, workspaceName });
    setSqlContent(textToCopy);
    navigator.clipboard.writeText(textToCopy);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">
              {getUIText('settingsTab', currentDialect)}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            بەڕێوەبردنی تەواوی پلاتفۆرم، پاشەکەوتکردنی بنکەی دراوەی PostgreSQL (Backup SQL Dump)، فرە-دراو و زاراوەکان.
          </p>
        </div>

        {/* Quick Backup Trigger Pill */}
        <button
          onClick={handleBackupClick}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>{getUIText('backupButton', currentDialect)}</span>
        </button>
      </div>

      {/* Main Grid: Backup Section (Prominent Card) and General Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: PostgreSQL Backup & SQL Dump Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-2">
                <HardDrive className="w-3.5 h-3.5" />
                <span>PostgreSQL 14 / 15 / 16 Compatible</span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>پاشەکەوتکردنی بنکەی داتا (PostgreSQL Database Backup)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                بە کلیکێک تەواوی بنکەی دراوەی ماجیک، خشتەکان، پەیوەندییەکان، فۆرمولاکان، کڕیاران و پسوولەکان وەک فایلی <code className="text-emerald-400 font-mono">.sql</code> داگرە بۆ سەر کۆمپیوتەرەکەت بە شێوەی خۆماڵی (Locally).
              </p>
            </div>
          </div>

          {/* Dataset Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">خشتەکان (Sheets)</span>
              <span className="text-white font-bold text-base">{totalSheets}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">تۆمارەکان (Records)</span>
              <span className="text-emerald-400 font-bold text-base">{totalRecords}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">کێڵگەکان (Fields)</span>
              <span className="text-indigo-400 font-bold text-base">{totalFields}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">IPـە بلۆککراوەکان</span>
              <span className="text-rose-400 font-bold text-base">{totalBlocked}</span>
            </div>
          </div>

          {/* Action Row with the Primary Backup Button */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleBackupClick}
              disabled={isExporting}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer ring-2 ring-emerald-500/30"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'خەریکی دروستکردنی فایلی SQL...' : 'داگرتنی فایلی SQL Dump (Backup)'}</span>
            </button>

            <button
              onClick={handleTogglePreview}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-3 rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>{showSqlPreview ? 'شاردنەوەی پێشبینین' : 'پێشبینینی کۆدی SQL'}</span>
            </button>

            <button
              onClick={handleCopySql}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
              title="کۆپیکردنی دەقی SQL Dump"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Success Banner */}
          {lastExportedInfo && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  فایلی <strong>{lastExportedInfo.filename}</strong> بە قەبارەی ({lastExportedInfo.sizeKb} KB) بە سەرکەوتوویی لەسەر کۆمپیوتەرەکەت پاشەکەوتکرا.
                </span>
              </div>
            </div>
          )}

          {/* SQL Preview Box */}
          {showSqlPreview && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
                <span className="text-emerald-400">PostgreSQL Schema & Seed DDL</span>
                <button
                  onClick={handleCopySql}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedSql ? 'کۆپی کرا!' : 'کۆپیکردنی هەموو'}
                </button>
              </div>
              <pre className="max-h-64 overflow-y-auto text-[11px] font-mono text-slate-300 leading-relaxed pr-1 select-all">
                {sqlContent || generateSqlDump(sheets, { exchangeRate, workspaceName })}
              </pre>
            </div>
          )}

          {/* How to Restore Guide */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>چۆن لە داتابەیسی پۆستگرێسدا ئەم فایلە بگەڕێنیتەوە (Restore)؟</span>
            </h4>
            <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
              psql -U magic_admin -d magic_db -f magic_postgres_backup.sql
            </div>
          </div>
        </div>

        {/* Right Col: Workspace & General Settings */}
        <div className="space-y-6">
          {/* General Platform Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>ڕێکخستنە گشتییەکان (Workspace Settings)</span>
            </h3>

            <form onSubmit={handleSaveGeneralSettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  ناوی وۆرکسپەیس (Workspace Name):
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  نرخی بنەڕەتی دینار ($1 = IQD):
                </label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => onExchangeRateChange(Number(e.target.value) || 1530)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  زمانی بنەڕەتی و زاراوە:
                </label>
                <select
                  value={currentDialect}
                  onChange={(e) => onDialectChange(e.target.value as Dialect)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {(Object.keys(DIALECT_LABELS) as Dialect[]).map((d) => (
                    <option key={d} value={d}>
                      {DIALECT_LABELS[d].native}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition-all shadow cursor-pointer mt-1"
              >
                پاشەکەوتکردنی ڕێکخستنەکان
              </button>

              {savedSettings && (
                <div className="text-emerald-400 text-[11px] font-bold text-center">
                  ✓ ڕێکخستنەکان بە سەرکەوتوویی نوێکرانەوە!
                </div>
              )}
            </form>
          </div>

          {/* Reset / Danger Zone */}
          <div className="bg-slate-900 border border-red-950/60 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>ناوچەی مەترسیدار (Reset Data)</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ئەگەر دەتەوێت هەموو داتاکان ڕیسێت بکەیتەوە بۆ قاڵبە سەرەتاییەکان، دەتوانیت سەرەتا فایلی Backup داگریت و دواتر ڕیسێتی بکەیتەوە.
            </p>
            <button
              onClick={() => {
                if (window.confirm('ئایا دڵنیایت لە ڕیسێتکردنەوەی هەموو خشتەکان بۆ باری سەرەتایی؟')) {
                  onResetToDefaults();
                }
              }}
              className="w-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ڕیسێتکردنەوە بۆ باری سەرەتایی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
