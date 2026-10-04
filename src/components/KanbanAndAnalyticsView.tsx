import React from 'react';
import { SheetModel, Dialect } from '../types';
import { getFieldName } from '../data/translations';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface KanbanAndAnalyticsViewProps {
  sheet: SheetModel;
  currentDialect: Dialect;
  exchangeRate: number;
}

export const KanbanAndAnalyticsView: React.FC<KanbanAndAnalyticsViewProps> = ({
  sheet,
  currentDialect,
  exchangeRate,
}) => {
  // Extract statuses for kanban
  const statusField = sheet.fields.find(
    (f) => f.key === 'payment_status' || f.key === 'approval_status' || f.key === 'status'
  );

  const statuses = statusField?.options || ['چاوەڕوان', 'پەسەندکراو', 'ڕەتکراوەتەوە'];

  // Analytics Metrics
  const totalRecords = sheet.records.length;
  const totalUsd = sheet.records.reduce((acc, r) => acc + (Number(r.total_usd) || Number(r.price_usd) || Number(r.amount_usd) || 0), 0);
  const totalIqd = Math.round(totalUsd * exchangeRate);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400">کۆی گشتی تۆمارەکان</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{totalRecords}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400">کۆی گشتی بە دۆلار ($)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            ${totalUsd.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400">کۆی گشتی بە دیناری عێراقی</span>
          <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
            {totalIqd.toLocaleString()} د.ع
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400">ڕێژەی جێبەجێکردن</span>
          <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">
            {Math.round((sheet.records.filter((r) => String(r.status || r.payment_status).includes('پەسەند') || String(r.status || r.payment_status).includes('دراوە')).length / (totalRecords || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>تەختەی کانبان بەپێی دۆخ (Kanban Workflow Board)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statuses.map((status) => {
            const matchedRows = sheet.records.filter((r) =>
              String(r.payment_status || r.approval_status || r.status || '').includes(status.split(' ')[0])
            );

            return (
              <div
                key={status}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span>{status}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono text-[10px]">
                    {matchedRows.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {matchedRows.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 shadow-sm space-y-1.5 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-100">
                        {item.item_name || item.customer_name || item.req_id || item.property_title || 'تۆمار'}
                      </div>
                      {item.customer_phone && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          📞 {item.customer_phone}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono">
                        <span className="text-emerald-400 font-bold">
                          {item.total_usd ? `$${Number(item.total_usd).toLocaleString()}` : item.unit_price_usd ? `$${item.unit_price_usd}` : ''}
                        </span>
                        {item.total_iqd && (
                          <span className="text-[10px] text-amber-300">
                            {Number(item.total_iqd).toLocaleString()} د.ع
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {matchedRows.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-600 font-medium">
                      هیچ تۆمارێک لێرە نییە
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
