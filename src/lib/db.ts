import { SheetModel, SheetRecord, FieldDefinition } from '../types';

/**
 * Escapes strings for safe inclusion in SQL statements
 */
function escapeSqlString(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

/**
 * Escapes JavaScript objects for PostgreSQL JSONB format
 */
function escapeJsonb(obj: any): string {
  if (obj === null || obj === undefined) return "'{}'::jsonb";
  return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
}

export interface SqlDumpOptions {
  workspaceName?: string;
  workspaceSlug?: string;
  exchangeRate?: number;
  includeSchemaDdl?: boolean;
}

/**
 * Generates a clean, valid PostgreSQL SQL dump string representing the
 * current database state including all sheets, field definitions, and records.
 */
export function generateSqlDump(
  sheets: SheetModel[],
  options: SqlDumpOptions = {}
): string {
  const {
    workspaceName = 'Magic Kurdistan Workspace',
    workspaceSlug = 'magic-krd-main',
    exchangeRate = 1530,
    includeSchemaDdl = true,
  } = options;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);
  const workspaceId = 'a0000000-0000-0000-0000-000000000001';

  let sql = `-- =====================================================================\n`;
  sql += `-- PostgreSQL SQL Dump Export - Magic Platform (ماجیک)\n`;
  sql += `-- Generated At: ${dateStr} UTC\n`;
  sql += `-- Total Sheets: ${sheets.length}\n`;
  sql += `-- Total Records: ${sheets.reduce((acc, s) => acc + s.records.length, 0)}\n`;
  sql += `-- =====================================================================\n\n`;

  sql += `SET statement_timeout = 0;\n`;
  sql += `SET lock_timeout = 0;\n`;
  sql += `SET client_encoding = 'UTF8';\n`;
  sql += `SET standard_conforming_strings = on;\n\n`;

  sql += `BEGIN;\n\n`;

  if (includeSchemaDdl) {
    sql += `-- ---------------------------------------------------------------------\n`;
    sql += `-- 1. Schema DDL: Workspaces, Sheets, Fields & Records\n`;
    sql += `-- ---------------------------------------------------------------------\n`;

    sql += `CREATE TABLE IF NOT EXISTS workspaces (\n`;
    sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `    name VARCHAR(255) NOT NULL,\n`;
    sql += `    slug VARCHAR(100) UNIQUE NOT NULL,\n`;
    sql += `    default_currency VARCHAR(10) DEFAULT 'USD',\n`;
    sql += `    exchange_rate_iqd NUMERIC(12, 2) DEFAULT 1530.00,\n`;
    sql += `    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS sheets (\n`;
    sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,\n`;
    sql += `    slug VARCHAR(100) NOT NULL,\n`;
    sql += `    name_ku_sorani VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ku_badini VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ku_kurmanji VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ar VARCHAR(255) NOT NULL,\n`;
    sql += `    name_en VARCHAR(255) NOT NULL,\n`;
    sql += `    icon VARCHAR(50) DEFAULT 'FileSpreadsheet',\n`;
    sql += `    category VARCHAR(50) DEFAULT 'ERP',\n`;
    sql += `    is_public_seo BOOLEAN DEFAULT FALSE,\n`;
    sql += `    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS fields (\n`;
    sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `    sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,\n`;
    sql += `    key VARCHAR(100) NOT NULL,\n`;
    sql += `    name_ku_sorani VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ku_badini VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ku_kurmanji VARCHAR(255) NOT NULL,\n`;
    sql += `    name_ar VARCHAR(255) NOT NULL,\n`;
    sql += `    name_en VARCHAR(255) NOT NULL,\n`;
    sql += `    type VARCHAR(50) NOT NULL,\n`;
    sql += `    config JSONB DEFAULT '{}'::jsonb,\n`;
    sql += `    order_index INT DEFAULT 0,\n`;
    sql += `    is_required BOOLEAN DEFAULT FALSE,\n`;
    sql += `    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS records (\n`;
    sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `    sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,\n`;
    sql += `    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,\n`;
    sql += `    data JSONB NOT NULL DEFAULT '{}'::jsonb,\n`;
    sql += `    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE INDEX IF NOT EXISTS idx_records_sheet_id ON records(sheet_id);\n`;
    sql += `CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING gin(data);\n\n`;

    sql += `-- Seed Workspace\n`;
    sql += `INSERT INTO workspaces (id, name, slug, default_currency, exchange_rate_iqd)\n`;
    sql += `VALUES ('${workspaceId}'::uuid, ${escapeSqlString(workspaceName)}, ${escapeSqlString(workspaceSlug)}, 'USD', ${exchangeRate.toFixed(2)})\n`;
    sql += `ON CONFLICT (slug) DO UPDATE SET exchange_rate_iqd = EXCLUDED.exchange_rate_iqd;\n\n`;
  }

  // Iterate through sheets and write INSERT statements
  sql += `-- ---------------------------------------------------------------------\n`;
  sql += `-- 2. Sheets and Records Data\n`;
  sql += `-- ---------------------------------------------------------------------\n\n`;

  sheets.forEach((sheet, sheetIdx) => {
    const sheetUuid = `b0000000-0000-0000-0000-${String(sheetIdx + 1).padStart(12, '0')}`;

    sql += `-- Sheet [${sheet.slug}]: ${sheet.nameKuSorani} (${sheet.records.length} records)\n`;
    sql += `INSERT INTO sheets (id, workspace_id, slug, name_ku_sorani, name_ku_badini, name_ku_kurmanji, name_ar, name_en, icon, category, is_public_seo)\n`;
    sql += `VALUES (\n`;
    sql += `    '${sheetUuid}'::uuid,\n`;
    sql += `    '${workspaceId}'::uuid,\n`;
    sql += `    ${escapeSqlString(sheet.slug)},\n`;
    sql += `    ${escapeSqlString(sheet.nameKuSorani)},\n`;
    sql += `    ${escapeSqlString(sheet.nameKuBadini)},\n`;
    sql += `    ${escapeSqlString(sheet.nameKuKurmanji)},\n`;
    sql += `    ${escapeSqlString(sheet.nameAr)},\n`;
    sql += `    ${escapeSqlString(sheet.nameEn)},\n`;
    sql += `    ${escapeSqlString(sheet.icon)},\n`;
    sql += `    ${escapeSqlString(sheet.category)},\n`;
    sql += `    ${sheet.isPublicSeo ? 'TRUE' : 'FALSE'}\n`;
    sql += `) ON CONFLICT DO NOTHING;\n\n`;

    // Fields
    sql += `-- Fields metadata for ${sheet.slug}\n`;
    sheet.fields.forEach((field, fIdx) => {
      const fieldUuid = `c0000000-${String(sheetIdx + 1).padStart(4, '0')}-0000-0000-${String(fIdx + 1).padStart(12, '0')}`;
      const config = {
        options: field.options,
        formula: field.formula,
        linkConfig: field.linkConfig,
      };

      sql += `INSERT INTO fields (id, sheet_id, key, name_ku_sorani, name_ku_badini, name_ku_kurmanji, name_ar, name_en, type, config, order_index, is_required)\n`;
      sql += `VALUES (\n`;
      sql += `    '${fieldUuid}'::uuid,\n`;
      sql += `    '${sheetUuid}'::uuid,\n`;
      sql += `    ${escapeSqlString(field.key)},\n`;
      sql += `    ${escapeSqlString(field.nameKuSorani)},\n`;
      sql += `    ${escapeSqlString(field.nameKuBadini)},\n`;
      sql += `    ${escapeSqlString(field.nameKuKurmanji)},\n`;
      sql += `    ${escapeSqlString(field.nameAr)},\n`;
      sql += `    ${escapeSqlString(field.nameEn)},\n`;
      sql += `    ${escapeSqlString(field.type)},\n`;
      sql += `    ${escapeJsonb(config)},\n`;
      sql += `    ${fIdx},\n`;
      sql += `    ${field.required ? 'TRUE' : 'FALSE'}\n`;
      sql += `);\n`;
    });
    sql += `\n`;

    // Records
    if (sheet.records.length > 0) {
      sql += `-- Rows data for ${sheet.slug}\n`;
      sheet.records.forEach((record, rIdx) => {
        const recordUuid = `d0000000-${String(sheetIdx + 1).padStart(4, '0')}-0000-0000-${String(rIdx + 1).padStart(12, '0')}`;
        sql += `INSERT INTO records (id, sheet_id, workspace_id, data)\n`;
        sql += `VALUES (\n`;
        sql += `    '${recordUuid}'::uuid,\n`;
        sql += `    '${sheetUuid}'::uuid,\n`;
        sql += `    '${workspaceId}'::uuid,\n`;
        sql += `    ${escapeJsonb(record)}\n`;
        sql += `);\n`;
      });
      sql += `\n`;
    }
  });

  sql += `COMMIT;\n\n`;
  sql += `-- PostgreSQL Dump Completed Successfully\n`;

  return sql;
}

/**
 * Generates the SQL dump string and triggers an instant local file download in the browser.
 */
export function downloadSqlDumpFile(
  sheets: SheetModel[],
  options: SqlDumpOptions = {},
  customFilename?: string
): { filename: string; size: number; sqlContent: string } {
  const sqlContent = generateSqlDump(sheets, options);

  const now = new Date();
  const dateFormatted = now.toISOString().slice(0, 10);
  const timeFormatted = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = customFilename || `magic_database_backup_${dateFormatted}_${timeFormatted}.sql`;

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
    size: blob.size,
    sqlContent,
  };
}
