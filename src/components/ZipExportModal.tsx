import React, { useState } from 'react';
import { PRODUCTION_PROJECT_FILES, ProjectFileEntry } from '../data/zipFiles';
import { downloadProjectZip } from '../lib/zipExporter';
import { 
  Download, 
  FolderGit2, 
  Check, 
  Copy, 
  FileCode, 
  ExternalLink, 
  Terminal, 
  Sparkles, 
  FileText, 
  Layers, 
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFileEntry>(PRODUCTION_PROJECT_FILES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const gitBashScript = `# ١. چوونە ناو فۆڵدەری دەرهێنراو
cd magic-platform

# ٢. دەستپێکردنی Git
git init

# ٣. زیادکردنی هەموو فایلەکان
git add .
git commit -m "feat: initial release of Magic No-Code Platform for Kurdistan"

# ٤. دیاریکردنی لقی سەرەکی
git branch -M main

# ٥. بەستنەوە بە ئەکاونتی گیت هەبی خۆت (ناوی بەکارهێنەری خۆت بنووسە)
git remote add origin https://github.com/YOUR_USERNAME/magic-platform.git

# ٦. بڵاوکردنەوە لەسەر گیتهەب!
git push -u origin main`;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      await downloadProjectZip((filename, percent) => {
        setProgressMsg(`کۆکردنەوەی [${filename}] ... ${percent}%`);
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
      setProgressMsg('');
    }
  };

  const handleCopyFile = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyGitCmd = () => {
    navigator.clipboard.writeText(gitBashScript);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with the One-Click Download Button */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <PackageCheck className="w-4 h-4" />
            <span>فایلی ZIP ئامادەیە بۆ داگرتن و بڵاوکردنەوە لە GitHub</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            پڕۆژەی تەواوی <span className="text-emerald-400">«ماجیک (Magic)»</span> وەک فایلی ZIP بە یەک کلیک داگرە!
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            ئەم فایلی ZIPـە تەواوی کۆدەکانی Next.js، سێرڤەری باکێند، سکێمای داتابەیسی Prisma، فایلی Docker و مۆدیولی زیرەکی دەستکرد بە زمانی کوردی لەخۆدەگرێت.
          </p>

          {/* Giant Download Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer ring-2 ring-white/20"
            >
              <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>
                {isExporting ? 'خەریکی دروستکردنی فایلی ZIPـە...' : 'داگرتنی فایلی magic-platform.zip'}
              </span>
            </button>

            <a
              href="https://github.com/new"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span>دروستکردنی Repo لە GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          {progressMsg && (
            <div className="text-xs font-mono text-emerald-300 animate-pulse pt-1">
              ⚡ {progressMsg}
            </div>
          )}

          {downloadSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>پیرۆزە! فایلی magic-platform.zip دابەزی. ئێستا ڕاستەوخۆ دەتوانیت لەسەر گیت هەب دایبنێیت.</span>
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Instructions & Git Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-step Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <span>چۆن بە یەک کلیک لەسەر GitHub بڵاوی بکەمەوە؟</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                1
              </div>
              <div>
                <strong className="text-white block font-semibold">فایلی ZIP دابەزێنە و بیکەرەوە (Extract)</strong>
                <p className="text-slate-400 mt-0.5">
                  کلیک لەسەر دوگمەی سەوزی سەرەوە بکە بۆ داگرتنی <code className="text-emerald-400">magic-platform.zip</code> و ڕایبکێشە سەر دێسکتۆپ.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                2
              </div>
              <div>
                <strong className="text-white block font-semibold">ڕیپۆزیتۆرییەکی نوێ لە GitHub بکەرەوە</strong>
                <p className="text-slate-400 mt-0.5">
                  بچۆ ماڵپەڕی <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-400 underline">github.com/new</a> و ناوەکەی بنێ <code className="text-indigo-300">magic-platform</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                3
              </div>
              <div>
                <strong className="text-white block font-semibold">فایلەکان بڵاوبکەرەوە (دوو ڕێگای ئاسان هەیە):</strong>
                <ul className="text-slate-400 mt-1 list-disc list-inside space-y-1">
                  <li><strong>ڕێگای وێب:</strong> کلیک لەسەر "uploading an existing file" بکە لە گیت هەب و تەواوی فۆڵدەرەکە ڕابکێشە بۆی.</li>
                  <li><strong>ڕێگای تێرمیناڵ:</strong> فەرمانەکانی خوارەوە کۆپی بکە و لە Terminal جێبەجێی بکە.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Git Commands with 1-click Copy */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>فەرمانەکانی Git بۆ ترمیناڵ (Bash)</span>
            </h3>
            <button
              onClick={handleCopyGitCmd}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              {copiedGitCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGitCmd ? 'کۆپی کرا!' : 'کۆپیکردنی فەرمانەکان'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed select-all">
            {gitBashScript}
          </pre>

          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl text-[11px] text-slate-300">
            💡 <strong>کارپێکردن بە دۆکەر:</strong> تەنها بنووسە <code className="text-emerald-300 font-mono">docker-compose up -d --build</code> تا بنکەی دراوەی پۆستگرێس و سێرڤەرەکە کاربکات.
          </div>
        </div>
      </div>

      {/* In-App Code & File Explorer (Inspect any file inside the zip) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <span>پشکنەری ناوەڕۆکی فایلی ZIP (Repository Code Explorer)</span>
            </h3>
            <p className="text-xs text-slate-400">
              دەتوانیت پێش داگرتن سەیری ناوەڕۆکی هەر یەکێک لەم فایلە پرۆدەکشنانە بکەیت یان کۆدی هەر فایلێک کۆپی بکەیت:
            </p>
          </div>

          <button
            onClick={handleCopyFile}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'کۆپی کرا!' : 'کۆپیکردنی کۆد'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* File Tree List */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-96 overflow-y-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
              فایلەکانی پڕۆژەکە ({PRODUCTION_PROJECT_FILES.length})
            </span>
            {PRODUCTION_PROJECT_FILES.map((f) => {
              const isSelected = f.path === selectedFile.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate">{f.path}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/20 uppercase">
                    {f.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* File Code Viewer */}
          <div className="md:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col h-96">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="text-white font-bold">{selectedFile.path}</span>
              <span className="text-slate-500">{selectedFile.description}</span>
            </div>
            <pre className="flex-1 overflow-auto text-xs font-mono text-slate-300 leading-relaxed pr-2 select-all">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
