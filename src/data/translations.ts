import { Dialect } from '../types';

export const DIALECT_LABELS: Record<Dialect, { name: string; native: string; dir: 'rtl' | 'ltr' }> = {
  ku_sorani: { name: 'Kurdish Sorani', native: 'کوردی (سۆرانی)', dir: 'rtl' },
  ku_badini: { name: 'Kurdish Badini', native: 'کوردی (بادینی)', dir: 'rtl' },
  ku_kurmanji: { name: 'Kurdish Kurmanji', native: 'Kurdî (Kurmancî)', dir: 'ltr' },
  ku_hawrami: { name: 'Kurdish Hawrami', native: 'هەورامی', dir: 'rtl' },
  ar: { name: 'Arabic', native: 'العربية', dir: 'rtl' },
  en: { name: 'English', native: 'English', dir: 'ltr' },
};

export const UI_TEXTS: Record<string, Record<Dialect, string>> = {
  appName: {
    ku_sorani: 'ماجیک (Magic)',
    ku_badini: 'ماجیک (Magic)',
    ku_kurmanji: 'Magic',
    ku_hawrami: 'ماجیک (Magic)',
    ar: 'ماجيك (Magic)',
    en: 'Magic Platform',
  },
  tagline: {
    ku_sorani: 'سیستەمی بنکەی داتا بێ کۆدنوسین و بەڕێوەبردنی کار بۆ کوردستان',
    ku_badini: 'سیستەمێ بنکەیێ داتایێ بێ کۆد و برێڤەبرنا کاری بۆ کوردستانێ',
    ku_kurmanji: 'Pergala databasa bê kod û birêvebirina kar bo Kurdistanê',
    ku_hawrami: 'سیستەمو بنکەو داتای بێ کۆدنوسی و بەڕێوەبەری پەی کوردستانی',
    ar: 'منصة قواعد البيانات بدون كود وإدارة الأعمال مع الذكاء الاصطناعي',
    en: 'No-Code Spreadsheet Database & ERP Platform with Kurdish AI',
  },
  downloadZip: {
    ku_sorani: 'داگرتنی فایلی ZIP بۆ GitHub',
    ku_badini: 'داگرتنا فایلا ZIP بۆ GitHub',
    ku_kurmanji: 'Daxistina pelê ZIP bo GitHub',
    ku_hawrami: 'گیڕای فایلی ZIP پەی GitHub',
    ar: 'تحميل ملف ZIP لـ GitHub',
    en: 'Download GitHub ZIP',
  },
  sheetsTab: {
    ku_sorani: 'خشتەکان و بنکەی داتا',
    ku_badini: 'خشتە و بنکەیێ داتایێ',
    ku_kurmanji: 'Xşte û Binkeyê Daneyan',
    ku_hawrami: 'خشتەکێ و بنکەو داتای',
    ar: 'الجداول وقواعد البيانات',
    en: 'Database Sheets',
  },
  aiAgentTab: {
    ku_sorani: 'بریکاری ژیریی دەستکرد (AI)',
    ku_badini: 'بریکارێ ژیرییا دەستکرد (AI)',
    ku_kurmanji: 'Agentê Hişê Çêkirî (AI)',
    ku_hawrami: 'بریکارو زیرەکی دەسکرسی',
    ar: 'وكيل الذكاء الاصطناعي',
    en: 'AI Agent Copilot',
  },
  securityTab: {
    ku_sorani: 'ئاسایش و بلۆکی IP',
    ku_badini: 'پاراستن و بلۆککرنا IP',
    ku_kurmanji: 'Ewlehî û Astengkirina IP',
    ku_hawrami: 'ئاسایش و بلۆکو IP',
    ar: 'الأمان وحظر الـ IP',
    en: 'Security & IP Blocker',
  },
  seoTab: {
    ku_sorani: 'باشترکردنی گووگڵ (SEO)',
    ku_badini: 'باشترکرنا د گووگڵدا (SEO)',
    ku_kurmanji: 'Optîmîzasyona SEO ya Google',
    ku_hawrami: 'خاستەرکەردەی چە گووگڵ (SEO)',
    ar: 'تحسين محركات البحث (SEO)',
    en: 'Google SEO & Public Portal',
  },
  githubTab: {
    ku_sorani: 'ڕەوانەکردن بۆ GitHub',
    ku_badini: 'هنارتن بۆ GitHub',
    ku_kurmanji: 'Şandina bo GitHub',
    ku_hawrami: 'کیستەی پەی GitHub',
    ar: 'النشر على GitHub',
    en: 'Export to GitHub',
  },
  addRow: {
    ku_sorani: '+ زیادکردنی تۆمار',
    ku_badini: '+ زێدەکرنا تۆمارێ',
    ku_kurmanji: '+ Tomara Nû',
    ku_hawrami: '+ زیادکەردەی تۆماری',
    ar: '+ إضافة سجل جديد',
    en: '+ Add Record',
  },
  addColumn: {
    ku_sorani: '+ زیادکردنی ستوون',
    ku_badini: '+ زێدەکرنا ستوونێ',
    ku_kurmanji: '+ Stûna Nû',
    ku_hawrami: '+ زیادکەردەی ستوونی',
    ar: '+ إضافة عمود',
    en: '+ Add Column',
  },
  exchangeRate: {
    ku_sorani: 'نرخی دۆلار بە دینار',
    ku_badini: 'بهایێ دۆلاری ب دیناری',
    ku_kurmanji: 'Bihayê Dolar bi Dînar',
    ku_hawrami: 'نەرخو دۆلاری بە دینار',
    ar: 'سعر الصرف (USD إلى IQD)',
    en: 'Exchange Rate (USD ↔ IQD)',
  },
  viewGrid: {
    ku_sorani: 'خشتە (Excel)',
    ku_badini: 'خشتە (Excel)',
    ku_kurmanji: 'Xşte (Excel)',
    ku_hawrami: 'خشتە (Excel)',
    ar: 'جدول (Excel)',
    en: 'Grid (Excel)',
  },
  viewKanban: {
    ku_sorani: 'کانبان (Kanban)',
    ku_badini: 'کانبان (Kanban)',
    ku_kurmanji: 'Kanban',
    ku_hawrami: 'کانبان (Kanban)',
    ar: 'كانبان (Kanban)',
    en: 'Kanban Board',
  },
  viewAnalytics: {
    ku_sorani: 'شیکاری و ڕاپۆرت',
    ku_badini: 'شیکاری و ڕاپۆرت',
    ku_kurmanji: 'Şîrovekirin',
    ku_hawrami: 'شیکاری و ڕاپۆرت',
    ar: 'التقارير والتحليلات',
    en: 'Analytics & Pivot',
  },
  viewGantt: {
    ku_sorani: 'گانت چارت (Gantt)',
    ku_badini: 'گانت چارت (Gantt)',
    ku_kurmanji: 'Nexşeya Gantt',
    ku_hawrami: 'گانت چارت (Gantt)',
    ar: 'مخطط جانت (Gantt)',
    en: 'Gantt Timeline',
  },
  settingsTab: {
    ku_sorani: 'ڕێکخستنەکان (Settings)',
    ku_badini: 'ڕێکخستن (Settings)',
    ku_kurmanji: 'Mîheng (Settings)',
    ku_hawrami: 'ڕێکخستنەکێ (Settings)',
    ar: 'الإعدادات (Settings)',
    en: 'Settings & Backup',
  },
  backupButton: {
    ku_sorani: 'پاشەکەوتکردن (Backup SQL)',
    ku_badini: 'پاشەکەوتکرن (Backup SQL)',
    ku_kurmanji: 'Hilanîn (Backup SQL)',
    ku_hawrami: 'پاشەکەوتکەردەی (Backup SQL)',
    ar: 'نسخ احتياطي (Backup SQL)',
    en: 'Backup Database (SQL)',
  },
};

export function getUIText(key: string, dialect: Dialect): string {
  if (UI_TEXTS[key] && UI_TEXTS[key][dialect]) {
    return UI_TEXTS[key][dialect];
  }
  return UI_TEXTS[key]?.ku_sorani || key;
}

export function getFieldName(field: { nameKuSorani: string; nameKuBadini: string; nameKuKurmanji: string; nameAr: string; nameEn: string }, dialect: Dialect): string {
  switch (dialect) {
    case 'ku_sorani':
    case 'ku_hawrami':
      return field.nameKuSorani;
    case 'ku_badini':
      return field.nameKuBadini;
    case 'ku_kurmanji':
      return field.nameKuKurmanji;
    case 'ar':
      return field.nameAr;
    case 'en':
      return field.nameEn;
    default:
      return field.nameKuSorani;
  }
}
