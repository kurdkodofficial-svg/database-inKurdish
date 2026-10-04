import React, { useState, useEffect } from 'react';
import { Dialect, SheetModel, BlockedIpEntry } from './types';
import { 
  INITIAL_INVOICES, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVENTORY, 
  INITIAL_APPROVALS,
  INITIAL_BLOCKED_IPS,
  INITIAL_EXCHANGE_RATE 
} from './data/initialData';
import { DIALECT_LABELS, getUIText } from './data/translations';
import { Navbar } from './components/Navbar';
import { SpreadsheetView } from './components/SpreadsheetView';
import { AIAgentView } from './components/AIAgentView';
import { SecurityView } from './components/SecurityView';
import { SeoOptimizerView } from './components/SeoOptimizerView';
import { ZipExportModal } from './components/ZipExportModal';
import { KanbanAndAnalyticsView } from './components/KanbanAndAnalyticsView';
import { SettingsView } from './components/SettingsView';
import { downloadProjectZip } from './lib/zipExporter';
import { 
  FileSpreadsheet, 
  Bot, 
  ShieldCheck, 
  Search, 
  FolderGit2, 
  BarChart3, 
  Grid,
  CheckCircle,
  Download
} from 'lucide-react';

export default function App() {
  const [currentDialect, setCurrentDialect] = useState<Dialect>('ku_sorani');
  const [activeTab, setActiveTab] = useState<'sheets' | 'ai' | 'security' | 'seo' | 'github' | 'settings'>('sheets');
  const [exchangeRate, setExchangeRate] = useState<number>(INITIAL_EXCHANGE_RATE);
  const [sheets, setSheets] = useState<SheetModel[]>([
    INITIAL_INVOICES,
    INITIAL_CUSTOMERS,
    INITIAL_INVENTORY,
    INITIAL_APPROVALS,
  ]);
  const [activeSheetId, setActiveSheetId] = useState<string>(INITIAL_INVOICES.id);
  const [sheetViewMode, setSheetViewMode] = useState<'grid' | 'kanban'>('grid');
  const [blockedIps, setBlockedIps] = useState<BlockedIpEntry[]>(INITIAL_BLOCKED_IPS);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isDownloadingFastZip, setIsDownloadingFastZip] = useState(false);

  // Sync document direction and lang attribute whenever dialect changes
  useEffect(() => {
    const isRtl = DIALECT_LABELS[currentDialect].dir === 'rtl';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentDialect.startsWith('ku') ? 'ku' : currentDialect;
  }, [currentDialect]);

  // Reset database to initial template values
  const handleResetToDefaults = () => {
    setSheets([
      INITIAL_INVOICES,
      INITIAL_CUSTOMERS,
      INITIAL_INVENTORY,
      INITIAL_APPROVALS,
    ]);
    setActiveSheetId(INITIAL_INVOICES.id);
    setBlockedIps(INITIAL_BLOCKED_IPS);
    setExchangeRate(INITIAL_EXCHANGE_RATE);
  };

  // Handle sheet updates (e.g. adding records, modifying cells, adding columns)
  const handleUpdateSheet = (updatedSheet: SheetModel) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === updatedSheet.id ? updatedSheet : s))
    );
  };

  // Add a brand new sheet manually or via AI
  const handleAddNewSheet = (customName?: string) => {
    const newId = `sheet_${Date.now()}`;
    const name = customName || `خشتەی نوێ ${sheets.length + 1}`;
    const newSheet: SheetModel = {
      id: newId,
      slug: `sheet-${Date.now()}`,
      nameKuSorani: name,
      nameKuBadini: name,
      nameKuKurmanji: name,
      nameAr: name,
      nameEn: name,
      icon: 'FileSpreadsheet',
      category: 'ERP',
      isPublicSeo: false,
      fields: [
        { id: `f_1_${newId}`, key: 'item_name', nameKuSorani: 'ناوی کەرەستە', nameKuBadini: 'ناڤێ کەلۆپەلی', nameKuKurmanji: 'Nav', nameAr: 'الاسم', nameEn: 'Name', type: 'TEXT', required: true },
        { id: `f_2_${newId}`, key: 'price_usd', nameKuSorani: 'نرخ ($)', nameKuBadini: 'بها ($)', nameKuKurmanji: 'Bihayê Dolar ($)', nameAr: 'السعر ($)', nameEn: 'Price ($)', type: 'CURRENCY_USD' },
        { id: `f_3_${newId}`, key: 'price_iqd', nameKuSorani: 'نرخ بە دینار', nameKuBadini: 'بها ب دیناری', nameKuKurmanji: 'Bihayê Dînar', nameAr: 'السعر بالدينار', nameEn: 'Price (IQD)', type: 'FORMULA', formula: '=price_usd * EXCHANGE_RATE' },
      ],
      records: [
        { id: `rec_${Date.now()}_1`, item_name: 'نموونەی یەکەم', price_usd: 100, price_iqd: 100 * exchangeRate }
      ],
    };

    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newId);
  };

  // Toggle public SEO for a sheet
  const handleToggleSheetPublicSeo = (sheetId: string) => {
    setSheets((prev) =>
      prev.map((s) =>
        s.id === sheetId ? { ...s, isPublicSeo: !s.isPublicSeo } : s
      )
    );
  };

  // Unblock IP
  const handleToggleUnblock = (ipId: string) => {
    setBlockedIps((prev) => prev.filter((b) => b.id !== ipId));
  };

  // Add blocked IP
  const handleAddBlockedIp = (ip: string, reason: string) => {
    const newEntry: BlockedIpEntry = {
      id: `blk_${Date.now()}`,
      ip,
      reason,
      attackCount: 1,
      blockedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'BLOCKED',
    };
    setBlockedIps((prev) => [newEntry, ...prev]);
  };

  // One-click instant zip download from navbar
  const handleQuickDownloadZip = async () => {
    setIsDownloadingFastZip(true);
    try {
      await downloadProjectZip();
    } finally {
      setIsDownloadingFastZip(false);
    }
  };

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentDialect={currentDialect}
        onDialectChange={setCurrentDialect}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
        onOpenZipModal={() => setIsZipModalOpen(true)}
        isDownloadingZip={isDownloadingFastZip}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Database Sheets (Spreadsheet Grid & Kanban) */}
        {activeTab === 'sheets' && (
          <div className="space-y-4">
            {/* View Switcher: Grid vs Kanban */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSheetViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sheetViewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{getUIText('viewGrid', currentDialect)}</span>
                </button>

                <button
                  onClick={() => setSheetViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sheetViewMode === 'kanban'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{getUIText('viewKanban', currentDialect)}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono hidden sm:block">
                ⚡ فۆرمولا و Link & Load بە کاتی ڕاستەقینە کاردەکات
              </div>
            </div>

            {sheetViewMode === 'grid' ? (
              <SpreadsheetView
                sheets={sheets}
                activeSheetId={activeSheetId}
                onSelectSheet={setActiveSheetId}
                onUpdateSheet={handleUpdateSheet}
                onAddNewSheet={() => handleAddNewSheet()}
                currentDialect={currentDialect}
                exchangeRate={exchangeRate}
              />
            ) : (
              <KanbanAndAnalyticsView
                sheet={activeSheet}
                currentDialect={currentDialect}
                exchangeRate={exchangeRate}
              />
            )}
          </div>
        )}

        {/* Tab 2: Kurdish AI Agent */}
        {activeTab === 'ai' && (
          <AIAgentView
            currentDialect={currentDialect}
            sheets={sheets}
            exchangeRate={exchangeRate}
            onSheetCreated={(newSheet) => {
              setSheets((prev) => [...prev, newSheet]);
              setActiveSheetId(newSheet.id);
            }}
            onSelectSheet={(sheetId) => {
              setActiveSheetId(sheetId);
              setActiveTab('sheets');
            }}
          />
        )}

        {/* Tab 3: Security & IP Protection WAF */}
        {activeTab === 'security' && (
          <SecurityView
            blockedIps={blockedIps}
            onToggleUnblock={handleToggleUnblock}
            onAddBlockedIp={handleAddBlockedIp}
            currentDialect={currentDialect}
          />
        )}

        {/* Tab 4: Google SEO & Public Portal Engine */}
        {activeTab === 'seo' && (
          <SeoOptimizerView
            sheets={sheets}
            onToggleSheetPublicSeo={handleToggleSheetPublicSeo}
            currentDialect={currentDialect}
          />
        )}

        {/* Tab 5: GitHub Code & ZIP Export Center */}
        {activeTab === 'github' && (
          <ZipExportModal
            isOpen={true}
            onClose={() => setActiveTab('sheets')}
          />
        )}

        {/* Tab 6: Settings Panel with Database Backup */}
        {activeTab === 'settings' && (
          <SettingsView
            sheets={sheets}
            blockedIps={blockedIps}
            exchangeRate={exchangeRate}
            onExchangeRateChange={setExchangeRate}
            currentDialect={currentDialect}
            onDialectChange={setCurrentDialect}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* Floating ZIP Modal if triggered from Navbar */}
      {isZipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
            <button
              onClick={() => setIsZipModalOpen(false)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              داخستن ✕
            </button>
            <ZipExportModal
              isOpen={isZipModalOpen}
              onClose={() => setIsZipModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>ماجیک (Magic) - باشترین پلاتفۆرمی بنکەی داتا بێ کۆدنوسین و بەڕێوەبردن بۆ کوردستان</span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <button onClick={() => setActiveTab('settings')} className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
              <span>پاشەکەوتکردن (Backup SQL)</span>
            </button>
            <span>•</span>
            <button onClick={() => setIsZipModalOpen(true)} className="text-emerald-400 hover:underline cursor-pointer">
              داگرتنی ZIP
            </button>
            <span>•</span>
            <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
              بڵاوکردنەوە لە GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
