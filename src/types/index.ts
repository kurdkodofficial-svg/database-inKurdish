export type Dialect = 'ku_sorani' | 'ku_badini' | 'ku_kurmanji' | 'ku_hawrami' | 'ar' | 'en';

export type FieldType = 
  | 'TEXT'
  | 'NUMBER'
  | 'CURRENCY_USD'
  | 'CURRENCY_IQD'
  | 'FORMULA'
  | 'DROPDOWN'
  | 'DATE'
  | 'LINK_FIELD'
  | 'SUB_TABLE';

export interface FieldDefinition {
  id: string;
  key: string;
  nameKuSorani: string;
  nameKuBadini: string;
  nameKuKurmanji: string;
  nameAr: string;
  nameEn: string;
  type: FieldType;
  options?: string[]; // for dropdown
  formula?: string; // e.g. "=price_usd * qty"
  linkConfig?: {
    targetSheetId: string;
    sourceKey: string;
    loadedFields: Array<{
      fromFieldKey: string;
      toFieldKey: string;
    }>;
  };
  required?: boolean;
}

export interface SheetRecord {
  id: string;
  [key: string]: any;
}

export interface SheetModel {
  id: string;
  slug: string;
  nameKuSorani: string;
  nameKuBadini: string;
  nameKuKurmanji: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  category: 'ERP' | 'CRM' | 'INVENTORY' | 'APPROVAL';
  isPublicSeo: boolean;
  fields: FieldDefinition[];
  records: SheetRecord[];
}

export interface BlockedIpEntry {
  id: string;
  ip: string;
  reason: string;
  attackCount: number;
  blockedAt: string;
  status: 'BLOCKED' | 'MONITORED' | 'WHITELISTED';
}

export interface WebhookConfig {
  id: string;
  targetUrl: string;
  event: 'RECORD_CREATED' | 'RECORD_UPDATED' | 'APPROVAL_NEEDED';
  platform: 'n8n' | 'Zapier' | 'Make' | 'Custom';
  isActive: boolean;
}
