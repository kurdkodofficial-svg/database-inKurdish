import React, { useState } from 'react';
import { SheetModel, Dialect, FieldDefinition, SheetRecord } from '../types';
import { getFieldName, getUIText } from '../data/translations';
import { ClientFormulaEngine } from '../lib/formulaEngine';
import { 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ExternalLink,
  Layers,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SpreadsheetViewProps {
  sheets: SheetModel[];
  activeSheetId: string;
  onSelectSheet: (sheetId: string) => void;
  onUpdateSheet: (updatedSheet: SheetModel) => void;
  onAddNewSheet: () => void;
  currentDialect: Dialect;
  exchangeRate: number;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onUpdateSheet,
  onAddNewSheet,
  currentDialect,
  exchangeRate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<FieldDefinition['type']>('TEXT');
  const [newColFormula, setNewColFormula] = useState('');

  const currentSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  // Quick helper to get customer names for Link & Load
  const customerSheet = sheets.find((s) => s.id === 'sheet_customers');
  const customerList = customerSheet?.records || [];

  // Update a single cell and trigger formula and Link & Load recalculation
  const handleCellChange = (recordId: string, fieldKey: string, newValue: any) => {
    let updatedRecords = currentSheet.records.map((rec) => {
      if (rec.id !== recordId) return rec;

      const modRec = { ...rec, [fieldKey]: newValue };

      // Check if this field triggers Link & Load (e.g. customer_name selected)
      const fieldDef = currentSheet.fields.find((f) => f.key === fieldKey);
      if (fieldDef?.type === 'LINK_FIELD' && fieldDef.linkConfig) {
        const targetSheet = sheets.find((s) => s.id === fieldDef.linkConfig?.targetSheetId);
        if (targetSheet) {
          const matchedTarget = targetSheet.records.find(
            (tr) => tr[fieldDef.linkConfig!.sourceKey] === newValue
          );
          if (matchedTarget) {
            fieldDef.linkConfig.loadedFields.forEach((lf) => {
              modRec[lf.toFieldKey] = matchedTarget[lf.fromFieldKey];
            });
          }
        }
      }

      // Recalculate dynamic formulas & currency rates
      return ClientFormulaEngine.evaluateRecord(modRec, exchangeRate);
    });

    onUpdateSheet({
      ...currentSheet,
      records: updatedRecords,
    });
  };

  // Add a new empty row with default values
  const handleAddRow = () => {
    const newId = `rec_${Date.now()}`;
    const newRecord: SheetRecord = { id: newId };

    currentSheet.fields.forEach((f) => {
      if (f.key === 'inv_number') newRecord[f.key] = `INV-2026-00${currentSheet.records.length + 1}`;
      else if (f.key === 'req_id') newRecord[f.key] = `REQ-${100 + currentSheet.records.length}`;
      else if (f.key === 'sku') newRecord[f.key] = `SKU-NEW-${100 + currentSheet.records.length}`;
      else if (f.type === 'NUMBER' || f.type === 'CURRENCY_USD') newRecord[f.key] = 0;
      else if (f.type === 'DROPDOWN' && f.options?.length) newRecord[f.key] = f.options[0];
      else newRecord[f.key] = '';
    });

    const evaluated = ClientFormulaEngine.evaluateRecord(newRecord, exchangeRate);

    onUpdateSheet({
      ...currentSheet,
      records: [...currentSheet.records, evaluated],
    });
  };

  // Delete a record
  const handleDeleteRow = (recordId: string) => {
    onUpdateSheet({
      ...currentSheet,
      records: currentSheet.records.filter((r) => r.id !== recordId),
    });
  };

  // Add a new custom column
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const colKey = `col_${Date.now()}`;
    const newField: FieldDefinition = {
      id: `f_${colKey}`,
      key: colKey,
      nameKuSorani: newColName,
      nameKuBadini: newColName,
      nameKuKurmanji: newColName,
      nameAr: newColName,
      nameEn: newColName,
      type: newColType,
      formula: newColFormula || undefined,
    };

    onUpdateSheet({
      ...currentSheet,
      fields: [...currentSheet.fields, newField],
    });

    setNewColName('');
    setNewColFormula('');
    setShowAddColumnModal(false);
  };

  // Export current table to CSV
  const handleExportCsv = () => {
    const headers = currentSheet.fields.map((f) => getFieldName(f, currentDialect));
    const rows = currentSheet.records.map((r) =>
      currentSheet.fields.map((f) => `"${r[f.key] ?? ''}"`).join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSheet.slug}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter records based on search query
  const filteredRecords = currentSheet.records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(r).some((val) =>
      String(val).toLowerCase().includes(query)
    );
  });

  // Calculate totals for currency columns
  const sumTotalUsd = filteredRecords.reduce((acc, r) => acc + (Number(r.total_usd) || Number(r.price_usd) || 0), 0);
  const sumTotalIqd = filteredRecords.reduce((acc, r) => acc + (Number(r.total_iqd) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Sheets Navigation Bar (Tabs) */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {sheets.map((sheet) => {
            const isActive = sheet.id === currentSheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => onSelectSheet(sheet.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>{getFieldName(sheet, currentDialect)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 font-mono">
                  {sheet.records.length}
                </span>
              </button>
            );
          })}

          <button
            onClick={onAddNewSheet}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-xl border border-dashed border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>خشتەی نوێ</span>
          </button>
        </div>

        {/* Action Buttons: Add Record, Add Column, Export CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{getUIText('addRow', currentDialect)}</span>
          </button>

          <button
            onClick={() => setShowAddColumnModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{getUIText('addColumn', currentDialect)}</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Export as CSV"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان لەناو فاکتۆرەکان، کڕیاران و نرخ..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {sumTotalUsd > 0 && (
            <div className="text-slate-400">
              کۆی دۆلار:{' '}
              <span className="font-bold text-emerald-400">
                ${sumTotalUsd.toLocaleString()}
              </span>
            </div>
          )}
          {sumTotalIqd > 0 && (
            <div className="text-slate-400">
              کۆی دینار:{' '}
              <span className="font-bold text-amber-300">
                {sumTotalIqd.toLocaleString()} د.ع
              </span>
            </div>
          )}
          <div className="text-slate-500">
            {filteredRecords.length} تۆمار
          </div>
        </div>
      </div>

      {/* Interactive Spreadsheet Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-right border-collapse select-text">
            <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 text-slate-300 text-xs font-bold">
              <tr>
                <th className="p-3 w-12 text-center border-l border-slate-800/80 text-slate-500 font-mono">
                  #
                </th>
                {currentSheet.fields.map((col) => (
                  <th
                    key={col.id}
                    className="p-3 border-l border-slate-800/80 min-w-[170px] whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span>{getFieldName(col, currentDialect)}</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {col.type === 'CURRENCY_USD'
                          ? '$'
                          : col.type === 'CURRENCY_IQD'
                          ? 'IQD'
                          : col.type === 'FORMULA'
                          ? 'fx'
                          : col.type === 'LINK_FIELD'
                          ? '🔗'
                          : col.type}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-3 w-12 text-center text-slate-500">سڕینەوە</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="p-2.5 text-center text-slate-500 font-mono border-l border-slate-800/60">
                    {index + 1}
                  </td>

                  {currentSheet.fields.map((col) => {
                    const cellVal = row[col.key];

                    // Render Formula or Calculated Cells
                    if (col.type === 'FORMULA') {
                      return (
                        <td
                          key={col.id}
                          className="p-2 border-l border-slate-800/60 bg-slate-950/30 font-mono font-semibold"
                        >
                          <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800/60 text-slate-100 flex items-center justify-between">
                            <span>
                              {col.key.includes('iqd')
                                ? `${Number(cellVal || 0).toLocaleString()} د.ع`
                                : `$${Number(cellVal || 0).toLocaleString()}`}
                            </span>
                            <Calculator className="w-3 h-3 text-indigo-400 opacity-60" />
                          </div>
                        </td>
                      );
                    }

                    // Render Link & Load Field (e.g. Customer Select Dropdown)
                    if (col.type === 'LINK_FIELD' && customerList.length > 0) {
                      return (
                        <td key={col.id} className="p-2 border-l border-slate-800/60">
                          <select
                            value={cellVal ?? ''}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-indigo-300 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="">-- کڕیار دیاریبکە --</option>
                            {customerList.map((c) => (
                              <option key={c.id} value={c.customer_name}>
                                {c.customer_name} ({c.city})
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    // Render Dropdown Field
                    if (col.type === 'DROPDOWN' && col.options) {
                      const isApproved = String(cellVal).includes('پەسەند') || String(cellVal).includes('Paid') || String(cellVal).includes('چالاک') || String(cellVal).includes('Approved');
                      const isPending = String(cellVal).includes('چاوەڕوان') || String(cellVal).includes('Pending') || String(cellVal).includes('نیوە');
                      const isRejected = String(cellVal).includes('ڕەت') || String(cellVal).includes('Rejected') || String(cellVal).includes('قەرز');

                      return (
                        <td key={col.id} className="p-2 border-l border-slate-800/60">
                          <select
                            value={cellVal ?? ''}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold border outline-none cursor-pointer ${
                              isApproved
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                                : isPending
                                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                                : isRejected
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                                : 'bg-slate-950 text-slate-200 border-slate-700'
                            }`}
                          >
                            {col.options.map((opt) => (
                              <option key={opt} value={opt} className="bg-slate-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    // Render Editable Number or Currency
                    if (col.type === 'NUMBER' || col.type === 'CURRENCY_USD' || col.type === 'CURRENCY_IQD') {
                      return (
                        <td key={col.id} className="p-2 border-l border-slate-800/60">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={cellVal ?? ''}
                              onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                              className="w-full bg-transparent font-mono rounded-lg px-2.5 py-1.5 hover:bg-slate-950 focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-100 transition-colors"
                            />
                            {col.type === 'CURRENCY_USD' && (
                              <span className="text-slate-500 text-[10px] font-mono mr-1 select-none">
                                $
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Render Standard Text or Date
                    return (
                      <td key={col.id} className="p-2 border-l border-slate-800/60">
                        <input
                          type={col.type === 'DATE' ? 'date' : 'text'}
                          value={cellVal ?? ''}
                          onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                          className="w-full bg-transparent rounded-lg px-2.5 py-1.5 hover:bg-slate-950 focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 transition-colors"
                        />
                      </td>
                    );
                  })}

                  {/* Delete Action */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="سڕینەوەی ئەم تۆمارە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              <span>زیادکردنی ستوونی نوێ بەبێ کۆدنوسین</span>
            </h3>

            <form onSubmit={handleAddColumnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ناوی ستوون:
                </label>
                <input
                  type="text"
                  required
                  placeholder="بۆ نموونە: ناونیشانی کڕیار، نرخی داشکاندن..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  جۆری خانە (Data Type):
                </label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TEXT">دەق (Text)</option>
                  <option value="NUMBER">ژمارە (Number)</option>
                  <option value="CURRENCY_USD">دراو بە دۆلار ($ USD)</option>
                  <option value="CURRENCY_IQD">دراو بە دیناری عێراقی (IQD)</option>
                  <option value="FORMULA">فۆرمولا و حیسابات (Formula)</option>
                  <option value="DATE">بەروار (Date)</option>
                </select>
              </div>

              {newColType === 'FORMULA' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    دەربڕینی فۆرمولا (نموونە: =price_usd * qty):
                  </label>
                  <input
                    type="text"
                    placeholder="=unit_price_usd * qty"
                    value={newColFormula}
                    onChange={(e) => setNewColFormula(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  + دروستکردنی ستوون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
