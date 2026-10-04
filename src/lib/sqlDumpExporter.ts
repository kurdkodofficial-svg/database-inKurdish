import { SheetModel, BlockedIpEntry } from '../types';

export function generatePostgreSqlDump(
  sheets: SheetModel[],
  blockedIps: BlockedIpEntry[],
  exchangeRate: number
): string {
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.replace('T', ' ').slice(0, 19);

  const escapeSql = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
  };

  const escapeJson = (obj: any): string => {
    if (obj === null || obj === undefined) return "'{}'::jsonb";
    return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
  };

  let sql = `-- =====================================================================
-- PostgreSQL Database Dump - Magic Platform (ماجیک)
-- Exported on: ${dateStr} UTC
-- Compatible with PostgreSQL 13, 14, 15, 16
-- Charset: UTF-8
-- =====================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Table Schema: workspaces
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    default_currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate_iqd NUMERIC(12, 2) DEFAULT 1530.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. Table Schema: sheets
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    name_ku_sorani VARCHAR(255) NOT NULL,
    name_ku_badini VARCHAR(255) NOT NULL,
    name_ku_kurmanji VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'FileSpreadsheet',
    category VARCHAR(50) DEFAULT 'ERP',
    is_public_seo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. Table Schema: fields
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    name_ku_sorani VARCHAR(255) NOT NULL,
    name_ku_badini VARCHAR(255) NOT NULL,
    name_ku_kurmanji VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    order_index INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. Table Schema: records
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_records_sheet_id ON records(sheet_id);
CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING gin(data);

-- ---------------------------------------------------------------------
-- 5. Table Schema: blocked_ips (Security & WAF)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    attack_count INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'BLOCKED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. Seed Default Workspace
-- ---------------------------------------------------------------------
INSERT INTO workspaces (id, name, slug, default_currency, exchange_rate_iqd)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Magic Kurdistan Workspace',
    'magic-krd-main',
    'USD',
    ${exchangeRate.toFixed(2)}
) ON CONFLICT (slug) DO UPDATE 
SET exchange_rate_iqd = EXCLUDED.exchange_rate_iqd;

`;

  const workspaceId = 'a0000000-0000-0000-0000-000000000001';

  // Insert Sheets
  sql += `-- ---------------------------------------------------------------------\n`;
  sql += `-- 7. Insert Sheets Dataset (${sheets.length} Sheets)\n`;
  sql += `-- ---------------------------------------------------------------------\n`;

  sheets.forEach((sheet, sIdx) => {
    const sheetUuid = `b0000000-0000-0000-0000-${String(sIdx + 1).padStart(12, '0')}`;
    sql += `INSERT INTO sheets (id, workspace_id, slug, name_ku_sorani, name_ku_badini, name_ku_kurmanji, name_ar, name_en, icon, category, is_public_seo)
VALUES (
    '${sheetUuid}'::uuid,
    '${workspaceId}'::uuid,
    ${escapeSql(sheet.slug)},
    ${escapeSql(sheet.nameKuSorani)},
    ${escapeSql(sheet.nameKuBadini)},
    ${escapeSql(sheet.nameKuKurmanji)},
    ${escapeSql(sheet.nameAr)},
    ${escapeSql(sheet.nameEn)},
    ${escapeSql(sheet.icon)},
    ${escapeSql(sheet.category)},
    ${sheet.isPublicSeo ? 'TRUE' : 'FALSE'}
) ON CONFLICT DO NOTHING;\n\n`;

    // Insert Fields for this sheet
    sql += `-- Fields for Sheet: ${sheet.nameKuSorani} (${sheet.fields.length} fields)\n`;
    sheet.fields.forEach((field, fIdx) => {
      const fieldUuid = `c0000000-${String(sIdx + 1).padStart(4, '0')}-0000-0000-${String(fIdx + 1).padStart(12, '0')}`;
      const config = {
        options: field.options,
        formula: field.formula,
        linkConfig: field.linkConfig,
      };

      sql += `INSERT INTO fields (id, sheet_id, key, name_ku_sorani, name_ku_badini, name_ku_kurmanji, name_ar, name_en, type, config, order_index, is_required)
VALUES (
    '${fieldUuid}'::uuid,
    '${sheetUuid}'::uuid,
    ${escapeSql(field.key)},
    ${escapeSql(field.nameKuSorani)},
    ${escapeSql(field.nameKuBadini)},
    ${escapeSql(field.nameKuKurmanji)},
    ${escapeSql(field.nameAr)},
    ${escapeSql(field.nameEn)},
    ${escapeSql(field.type)},
    ${escapeJson(config)},
    ${fIdx},
    ${field.required ? 'TRUE' : 'FALSE'}
);\n`;
    });
    sql += `\n`;

    // Insert Records for this sheet
    sql += `-- Records for Sheet: ${sheet.nameKuSorani} (${sheet.records.length} records)\n`;
    sheet.records.forEach((record, rIdx) => {
      const recordUuid = `d0000000-${String(sIdx + 1).padStart(4, '0')}-0000-0000-${String(rIdx + 1).padStart(12, '0')}`;
      sql += `INSERT INTO records (id, sheet_id, workspace_id, data)
VALUES (
    '${recordUuid}'::uuid,
    '${sheetUuid}'::uuid,
    '${workspaceId}'::uuid,
    ${escapeJson(record)}
);\n`;
    });
    sql += `\n`;
  });

  // Insert Blocked IPs
  if (blockedIps.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n`;
    sql += `-- 8. Insert Blocked IPs (${blockedIps.length} blocked entries)\n`;
    sql += `-- ---------------------------------------------------------------------\n`;
    blockedIps.forEach((b, bIdx) => {
      const ipUuid = `e0000000-0000-0000-0000-${String(bIdx + 1).padStart(12, '0')}`;
      sql += `INSERT INTO blocked_ips (id, ip_address, reason, attack_count, status)
VALUES (
    '${ipUuid}'::uuid,
    ${escapeSql(b.ip)},
    ${escapeSql(b.reason)},
    ${b.attackCount},
    ${escapeSql(b.status)}
) ON CONFLICT (ip_address) DO UPDATE 
SET attack_count = EXCLUDED.attack_count, reason = EXCLUDED.reason;\n`;
    });
    sql += `\n`;
  }

  sql += `-- ---------------------------------------------------------------------\n`;
  sql += `-- Complete Transaction\n`;
  sql += `-- ---------------------------------------------------------------------\n`;
  sql += `COMMIT;\n\n`;
  sql += `-- PostgreSQL Dump Completed Successfully on ${dateStr} UTC\n`;

  return sql;
}

export function downloadPostgreSqlDumpFile(
  sheets: SheetModel[],
  blockedIps: BlockedIpEntry[],
  exchangeRate: number
): { filename: string; totalBytes: number } {
  const sqlContent = generatePostgreSqlDump(sheets, blockedIps, exchangeRate);
  const now = new Date();
  const dateFormatted = now.toISOString().slice(0, 10);
  const timeFormatted = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `magic_postgres_backup_${dateFormatted}_${timeFormatted}.sql`;

  const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    filename,
    totalBytes: blob.size,
  };
}
