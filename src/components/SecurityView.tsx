import React, { useState } from 'react';
import { BlockedIpEntry, Dialect } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  Unlock, 
  Plus, 
  Terminal, 
  Activity, 
  AlertTriangle,
  Lock,
  Globe
} from 'lucide-react';

interface SecurityViewProps {
  blockedIps: BlockedIpEntry[];
  onToggleUnblock: (ipId: string) => void;
  onAddBlockedIp: (ip: string, reason: string) => void;
  currentDialect: Dialect;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  blockedIps,
  onToggleUnblock,
  onAddBlockedIp,
  currentDialect,
}) => {
  const [manualIp, setManualIp] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [liveLogs, setLiveLogs] = useState<string[]>([
    '[13:20:14] WAF Filter initialized on port 3000',
    '[13:20:16] RateLimiter active: 5 attempts/min threshold',
    '[13:20:19] Protected routes: /api/records, /api/ai, /public',
    '[13:20:22] Clean traffic verified from local client 127.0.0.1',
  ]);

  const handleManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;

    onAddBlockedIp(manualIp, manualReason || 'بلۆککردنی دەستی لەلایەن بەڕێوەبەرەوە');
    setLiveLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] IP ${manualIp} manually added to blacklist`,
      ...prev,
    ]);
    setManualIp('');
    setManualReason('');
  };

  const simulateAttack = () => {
    const fakeIp = `195.14.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;
    const reason = 'هێرشی Brute-Force و پەلاماری داتابەیس دەستنیشانکرا (خۆکارانە بلۆککرا)';
    onAddBlockedIp(fakeIp, reason);
    setLiveLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🚨 ALERT: SQL Injection pattern detected from ${fakeIp}`,
      `[${new Date().toLocaleTimeString()}] ⛔ Auto-Blocked IP ${fakeIp} (Threshold exceeded)`,
      ...prev,
    ]);
  };

  const totalAttacksPrevented = blockedIps.reduce((acc, b) => acc + b.attackCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">کۆی IPـە بلۆککراوەکان</span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              {blockedIps.filter((b) => b.status === 'BLOCKED').length}
            </div>
            <span className="text-[10px] text-slate-500">لیستی ڕەشی WAF</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Ban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">پەلامارە بەرپەرچدراوەکان</span>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {totalAttacksPrevented}
            </div>
            <span className="text-[10px] text-slate-500">SQLi, XSS, DDoS Brute-force</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">دۆخی پاراستنی سێرڤەر</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>100% پارێزراوە</span>
            </div>
            <span className="text-[10px] text-slate-500">Next.js WAF Middleware Active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table: Blocked IP List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>لیستی IPـە بلۆککراوەکان و هێرشە دەستنیشانکراوەکان</span>
            </div>
            <button
              onClick={simulateAttack}
              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تاقیکردنەوەی بەرپەرچدانی هێرش (Simulate Attack)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <th className="p-3">ناونیشانی IP</th>
                  <th className="p-3">هۆکاری بلۆککردن</th>
                  <th className="p-3">ژمارەی پەلامار</th>
                  <th className="p-3">کات</th>
                  <th className="p-3 text-center">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blockedIps.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-rose-400">
                      {entry.ip}
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs">
                      {entry.reason}
                    </td>
                    <td className="p-3 font-mono text-amber-300 font-bold">
                      {entry.attackCount} جار
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {entry.blockedAt}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleUnblock(entry.id)}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        لابردنی بلۆک
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Manual Block & Live Terminal Logs */}
        <div className="space-y-6">
          {/* Manual Block Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <span>بلۆککردنی دەستی ناونیشانی IP</span>
            </h3>

            <form onSubmit={handleManualBlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  ناونیشانی IP:
                </label>
                <input
                  type="text"
                  required
                  placeholder="بۆ نموونە: 185.122.45.19"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  هۆکار:
                </label>
                <input
                  type="text"
                  placeholder="چالاکی گوماناوی لە دەرەوە..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl shadow transition-all cursor-pointer"
              >
                + خستنە ناو لیستی ڕەش
              </button>
            </form>
          </div>

          {/* Live Terminal Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl font-mono text-[11px] space-y-2">
            <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>تۆماری ڕاستەوخۆی WAF (Live Firewall Logs)</span>
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1 text-slate-400">
              {liveLogs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-emerald-500">$</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
