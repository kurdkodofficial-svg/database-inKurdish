import { SheetRecord } from '../types';

export class ClientFormulaEngine {
  /**
   * Recalculates all calculated and linked fields for a record
   */
  static evaluateRecord(
    record: SheetRecord,
    exchangeRate: number,
    allSheets?: Record<string, any[]>
  ): SheetRecord {
    const updated: SheetRecord = { ...record };

    // Numerical conversions
    const unitPrice = Number(updated.unit_price_usd) || 0;
    const qty = Number(updated.qty) || 0;
    const oldDebt = Number(updated.cust_old_debt) || 0;

    // Standard formula for sales: total_usd = unit_price_usd * qty
    if (updated.unit_price_usd !== undefined && updated.qty !== undefined) {
      updated.total_usd = Math.round(unitPrice * qty * 100) / 100;
    }

    // Formula for IQD: total_iqd = total_usd * exchangeRate
    if (updated.total_usd !== undefined) {
      updated.total_iqd = Math.round(updated.total_usd * exchangeRate);
    }

    // Overall customer balance: final_balance_usd = oldDebt + total_usd
    if (updated.total_usd !== undefined && updated.cust_old_debt !== undefined) {
      updated.final_balance_usd = Math.round((oldDebt + updated.total_usd) * 100) / 100;
    }

    // Inventory calculations (cost vs selling vs margin)
    if (updated.cost_usd !== undefined && updated.sell_usd !== undefined) {
      const cost = Number(updated.cost_usd) || 0;
      const sell = Number(updated.sell_usd) || 0;
      updated.margin_usd = Math.round((sell - cost) * 100) / 100;
      if (sell > 0) {
        updated.margin_percent = Math.round(((sell - cost) / sell) * 100);
      }
    }

    return updated;
  }
}
