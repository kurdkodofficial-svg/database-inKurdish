import React, { useState } from 'react';
import { SheetModel, Dialect } from '../types';
import { getFieldName } from '../data/translations';
import { 
  Search, 
  Globe, 
  Code, 
  ExternalLink, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  Share2
} from 'lucide-react';

interface SeoOptimizerViewProps {
  sheets: SheetModel[];
  onToggleSheetPublicSeo: (sheetId: string) => void;
  currentDialect: Dialect;
}

export const SeoOptimizerView: React.FC<SeoOptimizerViewProps> = ({
  sheets,
  onToggleSheetPublicSeo,
  currentDialect,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState(sheets[0]?.id || '');
  const activeSheet = sheets.find((s) => s.id === selectedSheetId) || sheets[0];

  const sheetName = getFieldName(activeSheet, currentDialect);
  const siteUrl = `https://magic.krd/public/${activeSheet.slug}`;

  // Generated Schema.org JSON-LD
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${sheetName} - پلاتفۆرمی ماجیک (Magic)`,
    description: `بنکەی داتای فەرمی ${sheetName} لە هەرێمی کوردستان، بەڕێوەبردن و بەدواداچوونی ئۆنلاین.`,
    url: siteUrl,
    keywords: ['کوردستان', 'داتابەیس', sheetName, 'ERP', 'CRM', 'Magic Platform'],
    publisher: {
      '@type': 'Organization',
      name: 'Magic Kurdish Platform',
      url: 'https://magic.krd',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
              <Search className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              مەکینەی گەشبینکردنی گووگڵ (Google SEO & Public Portal Engine)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            لە سیستەمی ماجیک، هەر فۆڕمێک یان کەتەلۆگێکی کاڵا دەتوانیت بە یەک کلیک بکەیتە ماڵپەڕێکی فەرمی و گشتی کە لە ئەنجامەکانی پێشەوەی گووگڵ ڕیزبەندی وەردەگرێت لەگەڵ تاگەکانی Schema.org و OpenGraph.
          </p>
        </div>

        {/* Sheet Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-300 font-semibold">
            خشتەکە دیاریبکە:
          </label>
          <select
            value={selectedSheetId}
            onChange={(e) => setSelectedSheetId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sheets.map((s) => (
              <option key={s.id} value={s.id}>
                {getFieldName(s, currentDialect)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Google Search Engine Result Preview (SERP Card) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>دەرکەوتن لەناو گەڕانی گووگڵ (Google SERP Preview)</span>
            </h3>
            <button
              onClick={() => onToggleSheetPublicSeo(activeSheet.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeSheet.isPublicSeo
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {activeSheet.isPublicSeo ? 'بڵاوکراوەتەوە (Public SEO On)' : 'ناچالاکە (Private)'}
            </button>
          </div>

          {/* Realistic Google SERP Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1.5 font-sans" dir="rtl">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">
                M
              </div>
              <span className="font-mono text-emerald-400 truncate max-w-xs">{siteUrl}</span>
            </div>
            <h4 className="text-base text-blue-400 hover:underline cursor-pointer font-medium leading-snug">
              {sheetName} | سیستەمی فەرمی بنکەی دراوەی ماجیک (Magic)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              کەتەلۆگ و زانیارییە بەردەستەکانی {sheetName}. بەڕێوەبردن بە زمانی کوردی، دەستکاریکردنی ئۆنلاین، ژمێریاری و هاوئاهەنگی کاتیی لە هەرێمی کوردستان.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500">
              <span>⭐ نمرەی بەکارهێنەران: 4.9/5</span>
              <span>• پشتگیری کوردی و عەرەبی</span>
              <span>• نوێکراوەتەوە: ئەمڕۆ</span>
            </div>
          </div>

          {/* Social Share Preview (OpenGraph) */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>کاتی بڵاوکردنەوە لە فەیسبووک و واتسئەپ (Social Card):</span>
            </span>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{sheetName}</div>
                <div className="text-[11px] text-slate-400">magic.krd • کوردستان</div>
              </div>
              <span className="bg-indigo-600/20 text-indigo-300 text-[10px] px-2 py-1 rounded font-mono">
                og:image HD
              </span>
            </div>
          </div>
        </div>

        {/* Right: Schema.org Structured Data & Public Live Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>کۆدی داڕێژراوی Schema.org (JSON-LD)</span>
            </h3>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
              Valid Google Schema
            </span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56">
            {JSON.stringify(schemaJsonLd, null, 2)}
          </pre>

          {/* Public Portal Visual Preview */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>دیمەنی پەیجی گشتی (بۆ کڕیاران و میوانان):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeSheet.records.length} داتای ئامادە
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {activeSheet.records.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-200">
                    {r.item_name || r.customer_name || r.property_title || r.req_id || 'تۆمار'}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {r.total_usd ? `$${Number(r.total_usd).toLocaleString()}` : r.city || r.status || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
