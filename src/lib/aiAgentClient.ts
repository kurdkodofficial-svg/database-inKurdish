import { GoogleGenAI } from '@google/genai';
import { SheetModel, Dialect } from '../types';

export interface AgentResponse {
  message: string;
  createdSheet?: SheetModel;
  insertedRecords?: any[];
  actionType: 'CREATE_SHEET' | 'ADD_RECORD' | 'QUERY_ANSWER' | 'EXPLAIN';
}

export async function processAIAgentMessage(
  prompt: string,
  dialect: Dialect,
  existingSheets: SheetModel[],
  exchangeRate: number
): Promise<AgentResponse> {
  const trimmed = prompt.trim().toLowerCase();

  // Try using Google GenAI if key available
  try {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY || '';
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const promptInstruct = `
You are the AI Assistant for "Magic (ماجیک)", a Kurdish No-Code Database & Spreadsheet platform.
The user wrote: "${prompt}".
User dialect is: ${dialect}.
Respond in the same dialect with helpful database actions.
Return pure JSON with:
{
  "message": "Friendly response in user's Kurdish/Arabic/English dialect",
  "actionType": "CREATE_SHEET" or "ADD_RECORD" or "QUERY_ANSWER",
  "sheetName": "Kurdish name if creating",
  "sheetNameEn": "English name",
  "fields": [
    {"key": "col_name", "nameKu": "ناوی ستوون", "type": "TEXT"|"NUMBER"|"CURRENCY_USD"|"CURRENCY_IQD"|"FORMULA"}
  ]
}
`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptInstruct,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (result.text) {
        const parsed = JSON.parse(result.text);
        if (parsed.actionType === 'CREATE_SHEET' && parsed.fields?.length) {
          const newSheet: SheetModel = {
            id: `sheet_${Date.now()}`,
            slug: `custom_${Date.now()}`,
            nameKuSorani: parsed.sheetName || 'خشتەی نوێی ژیری دەستکرد',
            nameKuBadini: parsed.sheetName || 'خشتەکێ نوی یێ ژیرییا دەستکرد',
            nameKuKurmanji: parsed.sheetNameEn || 'Xşteya Nû',
            nameAr: parsed.sheetName || 'جدول جديد',
            nameEn: parsed.sheetNameEn || 'AI Generated Sheet',
            icon: 'Sparkles',
            category: 'ERP',
            isPublicSeo: false,
            fields: parsed.fields.map((f: any, idx: number) => ({
              id: `f_${idx}_${Date.now()}`,
              key: f.key || `col_${idx}`,
              nameKuSorani: f.nameKu || f.nameKuSorani || f.key,
              nameKuBadini: f.nameKuBadini || f.nameKu || f.key,
              nameKuKurmanji: f.nameEn || f.key,
              nameAr: f.nameAr || f.nameKu || f.key,
              nameEn: f.nameEn || f.key,
              type: f.type || 'TEXT',
              formula: f.formula,
            })),
            records: [
              {
                id: `rec_${Date.now()}_1`,
                [parsed.fields[0]?.key || 'title']: 'نموونەی تۆماری یەکەم',
              }
            ],
          };

          return {
            message: parsed.message || 'خشتەکە بە سەرکەوتوویی دروستکرا!',
            createdSheet: newSheet,
            actionType: 'CREATE_SHEET',
          };
        }

        return {
          message: parsed.message || 'فەرمانەکەت بە سەرکەوتوویی وەرگیرا.',
          actionType: 'QUERY_ANSWER',
        };
      }
    }
  } catch (err) {
    console.warn('GenAI fallback used:', err);
  }

  // Smart Built-in Kurdish NLP Engine (Sorani, Badini, Kurmanji, Arabic, English)
  // Check for clinic/doctor request
  if (trimmed.includes('نۆرینگە') || trimmed.includes('کلینیک') || trimmed.includes('دکتۆر') || trimmed.includes('نۆڕینگە') || trimmed.includes('clinic') || trimmed.includes('طبيب')) {
    const clinicSheet: SheetModel = {
      id: `sheet_clinic_${Date.now()}`,
      slug: 'clinic-patients',
      nameKuSorani: 'نۆرینگە و نەخۆشەکان (Clinic & Patients)',
      nameKuBadini: 'کلینیک و نەخۆش (Clinic & Patients)',
      nameKuKurmanji: 'Klînîk û Nexweş (Clinic)',
      nameAr: 'إدارة العيادة والمرضى',
      nameEn: 'Clinic & Patients CRM',
      icon: 'Activity',
      category: 'CRM',
      isPublicSeo: false,
      fields: [
        { id: 'f_cl_1', key: 'patient_name', nameKuSorani: 'ناوی نەخۆش', nameKuBadini: 'ناڤێ نەخۆشی', nameKuKurmanji: 'Navê Nexweş', nameAr: 'اسم المريض', nameEn: 'Patient Name', type: 'TEXT', required: true },
        { id: 'f_cl_2', key: 'phone', nameKuSorani: 'مۆبایل', nameKuBadini: 'مۆبایل', nameKuKurmanji: 'Mobîl', nameAr: 'الهاتف', nameEn: 'Phone', type: 'TEXT' },
        { id: 'f_cl_3', key: 'visit_date', nameKuSorani: 'بەرواری سەردان', nameKuBadini: 'مێژوویا سەرەدانێ', nameKuKurmanji: 'Dîroka Serdanê', nameAr: 'تاريخ الزيارة', nameEn: 'Visit Date', type: 'DATE' },
        { id: 'f_cl_4', key: 'diagnosis', nameKuSorani: 'دەستنیشانکردنی نەخۆشی', nameKuBadini: 'دەستنیشانکرنا نەخۆشیێ', nameKuKurmanji: 'Teşxîs', nameAr: 'التشخيص', nameEn: 'Diagnosis', type: 'TEXT' },
        { id: 'f_cl_5', key: 'fee_usd', nameKuSorani: 'تێچووی پشکنین ($)', nameKuBadini: 'تێچوونا پشکنینێ ($)', nameKuKurmanji: 'Mesref ($)', nameAr: 'رسوم الكشف ($)', nameEn: 'Fee ($)', type: 'CURRENCY_USD' },
        { id: 'f_cl_6', key: 'fee_iqd', nameKuSorani: 'تێچوو بە دینار (IQD)', nameKuBadini: 'تێچوو ب دینار (IQD)', nameKuKurmanji: 'Bi Dînar (IQD)', nameAr: 'الرسوم بالدينار', nameEn: 'Fee (IQD)', type: 'FORMULA', formula: '=fee_usd * EXCHANGE_RATE' },
      ],
      records: [
        { id: 'rec_cl_1', patient_name: 'ئاکۆ فەرهاد', phone: '0750 444 8899', visit_date: '2026-10-03', diagnosis: 'پشکنینی گشتی و تاقیگە', fee_usd: 25, fee_iqd: 38250 },
        { id: 'rec_cl_2', patient_name: 'شیلان عومەر', phone: '0770 111 2233', visit_date: '2026-10-02', diagnosis: 'ئێکس ڕەی و ددان', fee_usd: 40, fee_iqd: 61200 },
      ],
    };

    return {
      message: dialect === 'ku_badini'
        ? 'ب سەرکەفتن خشتەکێ نوی ژبۆ کلینیک و نەخۆشان هاتە دروستکرن دگەل بهایێ دۆلاری و دینارێ عیراقی!'
        : dialect === 'ar'
        ? 'تم بنجاح إنشاء جدول العيادة والمرضى مع حساب الرسوم بالدولار والدينار العراقي!'
        : 'بە سەرکەوتوویی خشتەیەکی نوێ بۆ نۆرینگە و نەخۆشەکان دروستکرا بە حیساباتی خۆکاری دۆلار و دیناری عێراقی!',
      createdSheet: clinicSheet,
      actionType: 'CREATE_SHEET',
    };
  }

  // Check for real estate request
  if (trimmed.includes('خانووبەرە') || trimmed.includes('مولک') || trimmed.includes('خانی') || trimmed.includes('عقار') || trimmed.includes('real estate')) {
    const estateSheet: SheetModel = {
      id: `sheet_estate_${Date.now()}`,
      slug: 'real-estate',
      nameKuSorani: 'خانووبەرە و مولکەکان (Real Estate)',
      nameKuBadini: 'خانووبەرە و مولک (Real Estate)',
      nameKuKurmanji: 'Xanî û Mulk (Real Estate)',
      nameAr: 'العقارات والأملاك',
      nameEn: 'Real Estate Listings',
      icon: 'Home',
      category: 'CRM',
      isPublicSeo: true,
      fields: [
        { id: 'f_es_1', key: 'property_title', nameKuSorani: 'ناونیشانی مولک', nameKuBadini: 'ناڤونیشانێ مولکی', nameKuKurmanji: 'Navê Xanî', nameAr: 'عنوان العقار', nameEn: 'Property Title', type: 'TEXT', required: true },
        { id: 'f_es_2', key: 'location', nameKuSorani: 'گەڕەک / شوێن', nameKuBadini: 'تاخ / جهـ', nameKuKurmanji: 'Cih', nameAr: 'الموقع / الحي', nameEn: 'Location', type: 'TEXT' },
        { id: 'f_es_3', key: 'type', nameKuSorani: 'جۆری مولک', nameKuBadini: 'جۆرێ مولکی', nameKuKurmanji: 'Cure', nameAr: 'نوع العقار', nameEn: 'Type', type: 'DROPDOWN', options: ['خانوو (House)', 'شوقە (Apartment)', 'زەوی (Land)', 'دووکان (Commercial)'] },
        { id: 'f_es_4', key: 'price_usd', nameKuSorani: 'نرخ بە دۆلار ($)', nameKuBadini: 'بها ب دۆلاری ($)', nameKuKurmanji: 'Bihayê Dolar ($)', nameAr: 'السعر بالدولار ($)', nameEn: 'Price ($)', type: 'CURRENCY_USD' },
        { id: 'f_es_5', key: 'price_iqd', nameKuSorani: 'نرخ بە دینار', nameKuBadini: 'بها ب دیناری', nameKuKurmanji: 'Bihayê Dînar', nameAr: 'السعر بالدينار', nameEn: 'Price (IQD)', type: 'FORMULA', formula: '=price_usd * EXCHANGE_RATE' },
      ],
      records: [
        { id: 'rec_es_1', property_title: 'خانووی ٢٠٠م لە بەختیاری', location: 'هەولێر - بەختیاری', type: 'خانوو (House)', price_usd: 185000, price_iqd: 283050000 },
        { id: 'rec_es_2', property_title: 'شوقەی دەباشان ڤیو', location: 'سلێمانی - دەباشان', type: 'شوقە (Apartment)', price_usd: 92000, price_iqd: 140760000 },
      ],
    };

    return {
      message: 'خشتەی خانووبەرە دروستکرا لەگەڵ گۆڕینی خۆکاری نرخی دۆلار بۆ دیناری عێراقی بەپێی نرخی بازاڕ ($185,000 = 283,050,000 د.ع)!',
      createdSheet: estateSheet,
      actionType: 'CREATE_SHEET',
    };
  }

  // Check for Delivery / گەیاندن
  if (trimmed.includes('گەیاندن') || trimmed.includes('دلیڤەری') || trimmed.includes('دیلیڤەری') || trimmed.includes('گەهاندن') || trimmed.includes('توصيل') || trimmed.includes('delivery')) {
    const deliverySheet: SheetModel = {
      id: `sheet_delivery_${Date.now()}`,
      slug: 'delivery-orders',
      nameKuSorani: 'بەڕێوەبردنی گەیاندن (Delivery CRM)',
      nameKuBadini: 'برێڤەبرنا گەهاندنێ (Delivery CRM)',
      nameKuKurmanji: 'Pergala Gehandinê (Delivery)',
      nameAr: 'إدارة الطلبات والتوصيل',
      nameEn: 'Delivery Orders',
      icon: 'Truck',
      category: 'ERP',
      isPublicSeo: false,
      fields: [
        { id: 'f_dl_1', key: 'order_id', nameKuSorani: 'کۆدی داواکاری', nameKuBadini: 'کۆدێ داخوازیێ', nameKuKurmanji: 'Koda Siparîşê', nameAr: 'رقم الطلب', nameEn: 'Order ID', type: 'TEXT', required: true },
        { id: 'f_dl_2', key: 'receiver_name', nameKuSorani: 'ناوی وەرگر', nameKuBadini: 'ناڤێ وەرگری', nameKuKurmanji: 'Navê Wergir', nameAr: 'اسم المستلم', nameEn: 'Receiver Name', type: 'TEXT' },
        { id: 'f_dl_3', key: 'driver', nameKuSorani: 'مەندوبی گەیاندن', nameKuBadini: 'مەندوبێ گەهاندنێ', nameKuKurmanji: 'Şofêr / Mendûb', nameAr: 'السائق المندوب', nameEn: 'Courier / Driver', type: 'TEXT' },
        { id: 'f_dl_4', key: 'delivery_fee_iqd', nameKuSorani: 'کرێی گەیاندن (د.ع)', nameKuBadini: 'کرێیا گەهاندنێ (د.ع)', nameKuKurmanji: 'Heqê Gehandinê (IQD)', nameAr: 'أجور التوصيل', nameEn: 'Delivery Fee (IQD)', type: 'CURRENCY_IQD' },
        { id: 'f_dl_5', key: 'status', nameKuSorani: 'دۆخی گەیاندن', nameKuBadini: 'ڕەوشا گەهاندنێ', nameKuKurmanji: 'Rewş', nameAr: 'الحالة', nameEn: 'Status', type: 'DROPDOWN', options: ['گەیەندرایەوە (Delivered)', 'لە ڕێگایە (On the way)', 'ڕەتکرایەوە (Returned)'] },
      ],
      records: [
        { id: 'rec_dl_1', order_id: 'DLV-1001', receiver_name: 'کاک هێمن', driver: 'ڕەوەند مەندوب', delivery_fee_iqd: 5000, status: 'لە ڕێگایە (On the way)' },
        { id: 'rec_dl_2', order_id: 'DLV-1002', receiver_name: 'مامۆستا ژیان', driver: 'سەردار', delivery_fee_iqd: 6000, status: 'گەیەندرایەوە (Delivered)' },
      ],
    };

    return {
      message: 'خشتەی بەڕێوەبردنی گەیاندن و دیلیڤەری (Delivery Orders) بە سەرکەوتوویی دروستکرا!',
      createdSheet: deliverySheet,
      actionType: 'CREATE_SHEET',
    };
  }

  // Default query analysis
  const totalSalesUsd = existingSheets.find(s => s.id === 'sheet_invoices')?.records.reduce((acc, r) => acc + (Number(r.total_usd) || 0), 0) || 0;
  const totalSalesIqd = Math.round(totalSalesUsd * exchangeRate);

  return {
    message: dialect === 'ku_badini'
      ? `ئەز بریکارێ ماجیکم. هەتا نوکە کۆمێ گشتی یێ فرۆتنێ د سیستەمیدا: $${totalSalesUsd.toLocaleString()} دۆلارە (بەرامبەر ${totalSalesIqd.toLocaleString()} دینارێن عیراقی). هەر خشتەکا تە بڤێت بتنێ بێژە دێ چێکەم!`
      : dialect === 'ar'
      ? `أنا مساعد ماجيك الذكي. إجمالي مبيعات الفواتير الحالية: $${totalSalesUsd.toLocaleString()} (يعادل ${totalSalesIqd.toLocaleString()} دينار عراقي). يمكنك أن تطلب مني إنشاء أي جدول تريده!`
      : `من بریکاری زیرەکی دەستکردی ماجیکم. کۆی گشتی فرۆش لە فاکتۆرەکاندا لەم ساتەدا: $${totalSalesUsd.toLocaleString()} دۆلارە (بەرامبەر ${totalSalesIqd.toLocaleString()} دیناری عێراقی). دەتوانیت پێم بڵێیت خشتەی کۆگا، کلینیک، گەیاندن یان هەر سیستمێک دروستبکەم!`,
    actionType: 'QUERY_ANSWER',
  };
}
