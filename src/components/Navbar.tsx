import React from 'react';
import { Dialect } from '../types';
import { DIALECT_LABELS, getUIText } from '../data/translations';
import { 
  Sparkles, 
  FolderGit2, 
  Download, 
  DollarSign, 
  ShieldCheck, 
  Globe, 
  FileSpreadsheet, 
  Bot, 
  Search,
  Check,
  Settings
} from 'lucide-react';

interface NavbarProps {
  currentDialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  activeTab: 'sheets' | 'ai' | 'security' | 'seo' | 'github' | 'settings';
  onTabChange: (tab: 'sheets' | 'ai' | 'security' | 'seo' | 'github' | 'settings') => void;
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  onOpenZipModal: () => void;
  isDownloadingZip?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDialect,
  onDialectChange,
  activeTab,
  onTabChange,
  exchangeRate,
  onExchangeRateChange,
  onOpenZipModal,
  isDownloadingZip = false,
}) => {
  const [isEditingRate, setIsEditingRate] = React.useState(false);
  const [tempRate, setTempRate] = React.useState(exchangeRate.toString());

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(tempRate);
    if (!isNaN(parsed) && parsed > 0) {
      onExchangeRateChange(parsed);
    }
    setIsEditingRate(false);
  };

  const isRtl = DIALECT_LABELS[currentDialect].dir === 'rtl';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Banner with Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>ماجیک</span>
                <span className="text-indigo-400 font-mono text-base font-semibold">Magic</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                No-Code Kurdish v2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {getUIText('tagline', currentDialect)}
            </p>
          </div>
        </div>

        {/* Action Controls: Dual Currency, Dialect Switcher, and One-Click ZIP Button */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Real-time Exchange Rate Widget */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs transition-colors">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 hidden md:inline">
              {getUIText('exchangeRate', currentDialect)}:
            </span>
            {isEditingRate ? (
              <form onSubmit={handleRateSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-20 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-white text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="text-emerald-400 hover:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsEditingRate(true)}
                className="font-mono font-bold text-amber-300 hover:underline cursor-pointer"
                title="کلیک بکە بۆ دەستکاریکردنی نرخی دۆلار بە دینار"
              >
                $1 = {exchangeRate.toLocaleString()} د.ع
              </button>
            )}
          </div>

          {/* Dialect / Language Selector */}
          <div className="relative">
            <select
              value={currentDialect}
              onChange={(e) => onDialectChange(e.target.value as Dialect)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {(Object.keys(DIALECT_LABELS) as Dialect[]).map((d) => (
                <option key={d} value={d}>
                  {DIALECT_LABELS[d].native}
                </option>
              ))}
            </select>
          </div>

          {/* Prominent One-Click Download ZIP Button */}
          <button
            onClick={onOpenZipModal}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Download className={`w-4 h-4 ${isDownloadingZip ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition-transform'}`} />
            <span>{getUIText('downloadZip', currentDialect)}</span>
            <span className="hidden lg:inline bg-black/20 text-[10px] px-1.5 py-0.5 rounded font-mono">
              .ZIP
            </span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 py-1">
          <button
            onClick={() => onTabChange('sheets')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{getUIText('sheetsTab', currentDialect)}</span>
          </button>

          <button
            onClick={() => onTabChange('ai')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-violet-400" />
            <span>{getUIText('aiAgentTab', currentDialect)}</span>
            <span className="bg-violet-500/20 text-violet-300 text-[10px] px-1.5 py-0.2 rounded-full border border-violet-500/30">
              Kurdish NLP
            </span>
          </button>

          <button
            onClick={() => onTabChange('security')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{getUIText('securityTab', currentDialect)}</span>
            <span className="bg-red-500/20 text-red-300 text-[10px] px-1.5 py-0.2 rounded-full border border-red-500/30">
              WAF Live
            </span>
          </button>

          <button
            onClick={() => onTabChange('seo')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span>{getUIText('seoTab', currentDialect)}</span>
          </button>

          <button
            onClick={() => onTabChange('github')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'github'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>{getUIText('githubTab', currentDialect)}</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
              1-Click ZIP
            </span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ml-auto ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>{getUIText('settingsTab', currentDialect)}</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
              Backup
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
