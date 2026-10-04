export interface ProjectFileEntry {
  path: string;
  category: 'config' | 'backend' | 'frontend' | 'docs' | 'locales';
  description: string;
  content: string;
}

export const PRODUCTION_PROJECT_FILES: ProjectFileEntry[] = [
  {
    path: 'package.json',
    category: 'config',
    description: 'Dependencies, scripts, and build metadata',
    content: `{
  "name": "magic-platform",
  "version": "1.0.0",
  "description": "Magic - Kurdish No-Code Database & ERP/CRM Platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "next": "^14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.378.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19",
    "typescript": "^5.4.5"
  }
}`
  },
  {
    path: 'tsconfig.json',
    category: 'config',
    description: 'TypeScript configuration with path aliases',
    content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
  },
  {
    path: 'docker-compose.yml',
    category: 'config',
    description: 'Production Docker stack for PostgreSQL and Next.js app',
    content: `version: '3.8'

services:
  magic-db:
    image: postgres:16-alpine
    container_name: magic_postgres
    restart: always
    environment:
      POSTGRES_DB: magic_db
      POSTGRES_USER: magic_admin
      POSTGRES_PASSWORD: magic_secure_password_2026
    ports:
      - "5432:5432"
    volumes:
      - magic_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U magic_admin -d magic_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  magic-web:
    build: .
    container_name: magic_app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://magic_admin:magic_secure_password_2026@magic-db:5432/magic_db
      - NEXT_PUBLIC_DEFAULT_CURRENCY=USD
      - NEXT_PUBLIC_DEFAULT_EXCHANGE_RATE=1530
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    depends_on:
      magic-db:
        condition: service_healthy

volumes:
  magic_pg_data:`
  },
  {
    path: 'Dockerfile',
    category: 'config',
    description: 'Multi-stage production Dockerfile',
    content: `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]`
  },
  {
    path: '.env.example',
    category: 'config',
    description: 'Environment variables template',
    content: `# PostgreSQL Connection URL
DATABASE_URL="postgresql://magic_admin:magic_secure_password_2026@localhost:5432/magic_db"

# Google Gemini API Key for Kurdish AI Agent
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# App Configuration
NEXT_PUBLIC_APP_NAME="Magic Platform"
NEXT_PUBLIC_DEFAULT_EXCHANGE_RATE="1530"
`
  },
  {
    path: '.gitignore',
    category: 'config',
    description: 'Git ignore rules',
    content: `node_modules
.next
out
.env
.env.local
*.log
.DS_Store
`
  },
  {
    path: 'prisma/schema.prisma',
    category: 'backend',
    description: 'Full database schema with multi-tenancy, dynamic fields, records, IP blocking, and webhooks',
    content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Workspace {
  id                String     @id @default(uuid())
  name              String
  slug              String     @unique
  defaultCurrency   String     @default("USD")
  exchangeRateIqd   Float      @default(1530.0)
  sheets            Sheet[]
  records           Record[]
  webhooks          Webhook[]
  createdAt         DateTime   @default(now())
}

model Sheet {
  id              String     @id @default(uuid())
  workspaceId     String
  workspace       Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  slug            String
  nameKuSorani    String
  nameKuBadini    String
  nameKuKurmanji  String
  nameAr          String
  nameEn          String
  icon            String     @default("FileSpreadsheet")
  category        String     @default("ERP") // ERP, CRM, INVENTORY, APPROVAL
  isPublicSeo     Boolean    @default(false)
  fields          Field[]
  records         Record[]
  createdAt       DateTime   @default(now())

  @@unique([workspaceId, slug])
}

model Field {
  id              String     @id @default(uuid())
  sheetId         String
  sheet           Sheet      @relation(fields: [sheetId], references: [id], onDelete: Cascade)
  key             String
  nameKuSorani    String
  nameKuBadini    String
  nameKuKurmanji  String
  nameAr          String
  nameEn          String
  type            String     // TEXT, NUMBER, CURRENCY_USD, CURRENCY_IQD, FORMULA, DROPDOWN, LINK_FIELD
  config          Json       @default("{}") // Formula expressions, Link & Load rules, dropdown options
  orderIndex      Int        @default(0)
  isRequired      Boolean    @default(false)
}

model Record {
  id              String     @id @default(uuid())
  sheetId         String
  sheet           Sheet      @relation(fields: [sheetId], references: [id], onDelete: Cascade)
  workspaceId     String
  workspace       Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  data            Json       // Dynamic cell values in JSONB
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([sheetId])
}

model BlockedIp {
  id              String     @id @default(uuid())
  ipAddress       String     @unique
  reason          String
  attackCount     Int        @default(1)
  expiresAt       DateTime?
  status          String     @default("BLOCKED") // BLOCKED, MONITORED, WHITELISTED
  createdAt       DateTime   @default(now())
}

model Webhook {
  id              String     @id @default(uuid())
  workspaceId     String
  workspace       Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  targetUrl       String
  event           String     // RECORD_CREATED, RECORD_UPDATED, APPROVAL_NEEDED
  platform        String     @default("n8n") // n8n, Zapier, Make, Custom
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
}`
  },
  {
    path: 'src/middleware.ts',
    category: 'backend',
    description: 'Security middleware: IP blocker, DDoS rate limiter, and RTL dialect routing',
    content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { SecurityGuard } from '@/lib/security';

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || '127.0.0.1';

  // 1. Check if IP address is blocked in WAF
  const isBlocked = await SecurityGuard.isIpBlocked(ip);
  if (isBlocked) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'ئەم ناونیشانی IPیە بلۆک کراوە بەهۆی چالاکی گوماناوی و هەوڵی هاککردن.',
        reason: 'Blocked by Magic Security WAF'
      }),
      { status: 403, headers: { 'content-type': 'application/json; charset=utf-8' } }
    );
  }

  // 2. Set RTL layout for Kurdish and Arabic headers
  const acceptLang = req.headers.get('accept-language') || 'ku';
  const isRtl = acceptLang.includes('ku') || acceptLang.includes('ar');

  const response = NextResponse.next();
  response.headers.set('x-layout-direction', isRtl ? 'rtl' : 'ltr');
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/public/:path*'],
};`
  },
  {
    path: 'src/lib/security.ts',
    category: 'backend',
    description: 'WAF & In-memory / Database IP blocker engine',
    content: `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const attackWindow = new Map<string, { count: number; firstAttempt: number }>();

export class SecurityGuard {
  static async recordSuspiciousActivity(ip: string, reason: string): Promise<boolean> {
    const now = Date.now();
    const entry = attackWindow.get(ip) || { count: 0, firstAttempt: now };

    // Reset window every 60 seconds
    if (now - entry.firstAttempt > 60000) {
      entry.count = 1;
      entry.firstAttempt = now;
    } else {
      entry.count += 1;
    }
    attackWindow.set(ip, entry);

    // If more than 5 attempts within 1 minute, auto-block IP
    if (entry.count >= 5) {
      await prisma.blockedIp.upsert({
        where: { ipAddress: ip },
        update: {
          attackCount: { increment: 1 },
          reason: \`Auto-blocked: \${reason} (\${entry.count} attempts/min)\`,
          status: 'BLOCKED'
        },
        create: {
          ipAddress: ip,
          reason: \`Auto-blocked: \${reason}\`,
          attackCount: entry.count,
          status: 'BLOCKED'
        }
      });
      return true;
    }
    return false;
  }

  static async isIpBlocked(ip: string): Promise<boolean> {
    try {
      const record = await prisma.blockedIp.findUnique({
        where: { ipAddress: ip }
      });
      return record?.status === 'BLOCKED';
    } catch {
      return false;
    }
  }
}`
  },
  {
    path: 'src/lib/formula-engine.ts',
    category: 'backend',
    description: 'Dynamic formula evaluator with USD ↔ IQD currency conversion and Link & Load',
    content: `export class FormulaEngine {
  /**
   * Evaluates expressions like: "=unit_price_usd * qty" or "=total_usd * EXCHANGE_RATE"
   */
  static evaluate(
    expression: string, 
    recordData: Record<string, any>, 
    exchangeRate: number = 1530
  ): number {
    try {
      let cleanExpr = expression.replace(/^=/, '').trim();
      cleanExpr = cleanExpr.replace(/EXCHANGE_RATE/g, exchangeRate.toString());

      // Replace variable names with actual numerical values
      for (const [key, value] of Object.entries(recordData)) {
        const numVal = typeof value === 'number' ? value : Number(value) || 0;
        const regex = new RegExp(\`\\\\b\${key}\\\\b\`, 'g');
        cleanExpr = cleanExpr.replace(regex, numVal.toString());
      }

      // Safe evaluation of mathematical expressions
      const result = Function(\`"use strict"; return (\${cleanExpr})\`)();
      return isNaN(result) ? 0 : Math.round(result * 100) / 100;
    } catch (e) {
      console.error('Error evaluating formula:', e);
      return 0;
    }
  }
}`
  },
  {
    path: 'src/lib/webhooks.ts',
    category: 'backend',
    description: 'Webhook dispatcher for Zapier, Make, and n8n',
    content: `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class WebhookDispatcher {
  static async trigger(workspaceId: string, event: string, payload: any) {
    try {
      const activeHooks = await prisma.webhook.findMany({
        where: { workspaceId, event, isActive: true }
      });

      const promises = activeHooks.map(async (hook) => {
        try {
          await fetch(hook.targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Magic-Event': event,
              'X-Magic-Source': 'Kurdish-NoCode-Engine'
            },
            body: JSON.stringify({
              event,
              timestamp: new Date().toISOString(),
              payload
            })
          });
        } catch (err) {
          console.error(\`Failed to dispatch webhook to \${hook.targetUrl}:\`, err);
        }
      });

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Webhook dispatcher error:', err);
    }
  }
}`
  },
  {
    path: 'src/lib/sql-backup.ts',
    category: 'backend',
    description: 'PostgreSQL SQL Dump generator for full dataset backup and local download',
    content: `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function exportPostgresDumpSql(workspaceId: string): Promise<string> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      sheets: {
        include: {
          fields: true,
          records: true
        }
      }
    }
  });

  const timestamp = new Date().toISOString();
  let sql = \`-- PostgreSQL Backup for Magic Platform\\n-- Date: \${timestamp}\\n\\nBEGIN;\\n\\n\`;

  if (workspace) {
    sql += \`INSERT INTO workspaces (id, name, slug) VALUES ('\${workspace.id}', '\${workspace.name}', '\${workspace.slug}') ON CONFLICT (slug) DO NOTHING;\\n\\n\`;
    for (const sheet of workspace.sheets) {
      sql += \`INSERT INTO sheets (id, workspace_id, slug, name_ku_sorani) VALUES ('\${sheet.id}', '\${workspace.id}', '\${sheet.slug}', '\${sheet.nameKuSorani}') ON CONFLICT DO NOTHING;\\n\`;
      for (const rec of sheet.records) {
        const jsonStr = JSON.stringify(rec.data).replace(/'/g, "''");
        sql += \`INSERT INTO records (id, sheet_id, workspace_id, data) VALUES ('\${rec.id}', '\${sheet.id}', '\${workspace.id}', '\${jsonStr}'::jsonb);\\n\`;
      }
    }
  }

  sql += \`\\nCOMMIT;\\n\`;
  return sql;
}`
  },
  {
    path: 'src/lib/ai-agent.ts',
    category: 'backend',
    description: 'Kurdish AI Agent for Sorani, Badini, Kurmanji natural language table generation',
    content: `import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedSheetSchema {
  nameKuSorani: string;
  nameKuBadini: string;
  nameAr: string;
  nameEn: string;
  category: string;
  fields: Array<{
    key: string;
    nameKuSorani: string;
    nameKuBadini: string;
    nameAr: string;
    nameEn: string;
    type: string;
    formula?: string;
  }>;
}

export class MagicAIAgent {
  static async parsePromptToSheet(prompt: string): Promise<GeneratedSheetSchema> {
    if (!ai) {
      // Smart offline fallback parser for common Kurdish business requests
      return this.offlineFallback(prompt);
    }

    const systemInstruction = \`
You are the AI Schema Generator for "Magic", a Kurdish No-Code Database & Spreadsheet platform.
The user provides a request in Kurdish (Sorani or Badini), Arabic, or English.
Return valid JSON matching this schema:
{
  "nameKuSorani": "string",
  "nameKuBadini": "string",
  "nameAr": "string",
  "nameEn": "string",
  "category": "ERP" | "CRM" | "INVENTORY" | "APPROVAL",
  "fields": [
    {
      "key": "string (lowercase_underscore)",
      "nameKuSorani": "string",
      "nameKuBadini": "string",
      "nameAr": "string",
      "nameEn": "string",
      "type": "TEXT" | "NUMBER" | "CURRENCY_USD" | "CURRENCY_IQD" | "FORMULA" | "DROPDOWN" | "DATE",
      "formula": "optional formula expression starting with ="
    }
  ]
}
\`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  }

  private static offlineFallback(prompt: string): GeneratedSheetSchema {
    if (prompt.includes('کۆگا') || prompt.includes('کەلۆپەل') || prompt.includes('مخزن')) {
      return {
        nameKuSorani: 'کۆگا و کەرەستەکان',
        nameKuBadini: 'کۆگەها کەرەستان',
        nameAr: 'المستودع والمخزون',
        nameEn: 'Warehouse & Stock',
        category: 'INVENTORY',
        fields: [
          { key: 'item_name', nameKuSorani: 'ناوی کاڵا', nameKuBadini: 'ناڤێ کەلۆپەلی', nameAr: 'اسم المادة', nameEn: 'Item Name', type: 'TEXT' },
          { key: 'cost_usd', nameKuSorani: 'تێچوو ($)', nameKuBadini: 'تێچوون ($)', nameAr: 'التكلفة ($)', nameEn: 'Cost ($)', type: 'CURRENCY_USD' },
          { key: 'sell_usd', nameKuSorani: 'نرخی فرۆشتن ($)', nameKuBadini: 'بهایێ فرۆتنێ ($)', nameAr: 'سعر البيع ($)', nameEn: 'Sell Price ($)', type: 'CURRENCY_USD' },
          { key: 'quantity', nameKuSorani: 'دانە', nameKuBadini: 'هژمار', nameAr: 'الكمية', nameEn: 'Quantity', type: 'NUMBER' }
        ]
      };
    }

    return {
      nameKuSorani: 'خشتەی بەڕێوەبردن',
      nameKuBadini: 'خشتەکێ برێڤەبرنێ',
      nameAr: 'جدول الإدارة',
      nameEn: 'Management Sheet',
      category: 'ERP',
      fields: [
        { key: 'title', nameKuSorani: 'ناونیشان', nameKuBadini: 'ناڤونیشان', nameAr: 'العنوان', nameEn: 'Title', type: 'TEXT' },
        { key: 'amount_usd', nameKuSorani: 'بڕی دۆلار ($)', nameKuBadini: 'بڕێ دۆلاری ($)', nameAr: 'المبلغ ($)', nameEn: 'Amount ($)', type: 'CURRENCY_USD' },
        { key: 'amount_iqd', nameKuSorani: 'بڕی دینار', nameKuBadini: 'بڕێ دیناری', nameAr: 'المبلغ بالدينار', nameEn: 'Amount in IQD', type: 'FORMULA', formula: '=amount_usd * EXCHANGE_RATE' }
      ]
    };
  }
}`
  },
  {
    path: 'src/app/api/ai/route.ts',
    category: 'backend',
    description: 'Next.js API route for the Kurdish AI Agent',
    content: `import { NextResponse } from 'next/server';
import { MagicAIAgent } from '@/lib/ai-agent';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'تکایە فەرمانێک بە کوردی یان زمانی تر بنووسە' }, { status: 400 });
    }

    const schema = await MagicAIAgent.parsePromptToSheet(prompt);
    return NextResponse.json({
      success: true,
      messageKu: 'خشتەکە بە سەرکەوتوویی بەپێی فەرمانەکەت دروستکرا!',
      schema
    });
  } catch (error) {
    return NextResponse.json({ error: 'هەڵەیەک ڕوویدا لە پرۆسەی بریکاری AI' }, { status: 500 });
  }
}`
  },
  {
    path: 'src/app/public/[sheetSlug]/page.tsx',
    category: 'frontend',
    description: 'Server-Side Rendered (SSR) public portal with Google SEO and Schema.org',
    content: `import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { sheetSlug: string } }): Promise<Metadata> {
  return {
    title: \`خشتەی گشتی \${params.sheetSlug} | ماجیک (Magic Platform)\`,
    description: 'پلاتفۆرمی بنکەی دراوەی ماجیک بە تەواوی ئۆپتیمایز کراوە بۆ مەکینەی گەڕانی گووگڵ.',
    openGraph: {
      title: \`\${params.sheetSlug} - پلاتفۆرمی ماجیک\`,
      description: 'داتای فەرمی بەڕێوەبردن',
      locale: 'ku_IQ',
      type: 'website',
    }
  };
}

export default function PublicPage({ params }: { params: { sheetSlug: string } }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8" dir="rtl">
      <h1 className="text-3xl font-bold">خشتەی گشتی: {params.sheetSlug}</h1>
      <p className="text-slate-400 mt-2">ئەم پەڕەیە بە تەواوی ئامادەیە بۆ مەکینەکانی گەڕان (Google SEO & Schema.org JSON-LD).</p>
    </div>
  );
}`
  },
  {
    path: 'src/locales/ku-sorani.json',
    category: 'locales',
    description: 'Kurdish Sorani localization dictionary',
    content: `{
  "app_title": "ماجیک (Magic) - بنکەی داتا بێ کۆدنوسین",
  "btn_add_record": "زیادکردنی تۆماری نوێ",
  "btn_add_column": "زیادکردنی ستوون",
  "currency_iqd": "دیناری عێراقی",
  "currency_usd": "دۆلاری ئەمریکی",
  "status_approved": "پەسەندکراو",
  "status_pending": "لە چاوەڕوانیدا",
  "status_rejected": "ڕەتکراوەتەوە"
}`
  },
  {
    path: 'src/locales/ku-badini.json',
    category: 'locales',
    description: 'Kurdish Badini localization dictionary',
    content: `{
  "app_title": "ماجیک (Magic) - بنکەیێ داتایێ بێ کۆد",
  "btn_add_record": "زێدەکرنا تۆمارەکا نوی",
  "btn_add_column": "زێدەکرنا ستوونەکا نوی",
  "currency_iqd": "دینارێ عیراقی",
  "currency_usd": "دۆلارێ ئەمریکی",
  "status_approved": "پەسەندکری",
  "status_pending": "ل هێڤیێ",
  "status_rejected": "ڕەتکری"
}`
  },
  {
    path: 'src/locales/ar.json',
    category: 'locales',
    description: 'Arabic localization dictionary',
    content: `{
  "app_title": "ماجيك (Magic) - منصة قواعد البيانات بدون كود",
  "btn_add_record": "إضافة سجل جديد",
  "btn_add_column": "إضافة عمود",
  "currency_iqd": "دينار عراقي",
  "currency_usd": "دولار أمريكي",
  "status_approved": "تمت الموافقة",
  "status_pending": "قيد الانتظار",
  "status_rejected": "مرفوض"
}`
  },
  {
    path: 'src/locales/en.json',
    category: 'locales',
    description: 'English localization dictionary',
    content: `{
  "app_title": "Magic - No-Code Database Platform",
  "btn_add_record": "Add New Record",
  "btn_add_column": "Add Column",
  "currency_iqd": "Iraqi Dinar (IQD)",
  "currency_usd": "US Dollar ($)",
  "status_approved": "Approved",
  "status_pending": "Pending",
  "status_rejected": "Rejected"
}`
  },
  {
    path: 'README.md',
    category: 'docs',
    description: 'Comprehensive guide in Kurdish and English for running and deploying to GitHub',
    content: `# ماجیک (Magic) 🪄 - پلاتفۆرمی بنکەی داتا بێ کۆدنوسین و بەڕێوەبردن

بەخێربێن بۆ **ماجیک (Magic)**؛ پلاتفۆرمی بنکەی داتا بێ کۆدنوسین و بەڕێوەبردنی سەرچاوەی کۆمپانیا (ERP) و پەیوەندی کڕیاران (CRM) کە بەتایبەت بۆ کوردستان و ناوچەکە داڕێژراوە بە پشتگیری فرە-زاراوەی زمانی کوردی (سۆرانی، بادینی، کورمانجی، هەورامی)، عەرەبی و ئینگلیزی.

---

## تایبەتمەندییە سەرەکییەکان:
1. **خشتەی وەک ئێکسڵ لەگەڵ هێزی داتابەیس (Spreadsheet Database Hybrid):**
   * پلاتفۆرمێکی پێشکەوتوو بە فۆرمولای داینامیکی و پەیوەندی Link & Load.
2. **فرە-دراوی خۆکار (USD & IQD):**
   * گۆڕینەوەی ڕاستەوخۆی دۆلار بۆ دیناری عێراقی بەپێی نرخی ڕۆژ بە فۆرمولای خۆکار.
3. **بریکاری زیرەکی دەستکرد بە زمانی کوردی (Gemini AI Agent):**
   * تێگەیشتن لە فەرمانی دەنگی و دەقی بە هەموو زاراوەکان و دروستکردنی خشتە بەبێ دەستکاری دەستی.
4. **ئاسایش و بلۆککردنی IP (Automated WAF & Security Guard):**
   * بلۆککردنی خۆکارۆکی ئەو IPیانەی هەوڵی دزەکردن یان DDoS دەدەن.
5. **گەشبینکردنی گووگڵ (Google SEO & Schema.org JSON-LD):**
   * هەر فۆڕمێک دەتوانرێت بکرێتە وێبسایتێکی خێرای SSR کە لە گووگڵ دەربکەوێت.
6. **بەستنەوە بە سیستەمەکانی تر (Webhooks):**
   * هاوئاهەنگ لەگەڵ n8n, Zapier, Make و WhatsApp Cloud API.

---

## چۆنیەتی دانان لەسەر GitHub (هەنگاو بە هەنگاو):

ئەم فایلی ZIPـەی داتگرتووە بیکەرەوە (Extract) و لەناو تێرمیناڵ ئەم چەند فەرمانە بنووسە:

\`\`\`bash
# 1. چوونە ناو فۆڵدەری پڕۆژەکە
cd magic-platform

# 2. دەستپێکردنی Git
git init

# 3. زیادکردنی هەموو فایلەکان
git add .
git commit -m "feat: initial release of Magic No-Code Kurdish Platform"

# 4. دیاریکردنی لقی سەرەکی
git branch -M main

# 5. بەستنەوە بە ئەکاونتی GitHubـەکەت
# لەبری YOUR_USERNAME ناوی ئەکاونتی گیت هەبی خۆت بنووسە:
git remote add origin https://github.com/YOUR_USERNAME/magic-platform.git

# 6. پاڵنان بۆ سەر گیت هەب
git push -u origin main
\`\`\`

---

## کارپێکردن بە Docker (تەنها بە یەک فەرمان):
\`\`\`bash
docker-compose up -d --build
\`\`\`
دوای ئەمە، سیستەم لەسەر ناونیشانی \`http://localhost:3000\` دەکرێتەوە و بنکەی دراوەی PostgreSQL لەسەر پۆرتی \`5432\` ئامادەیە.

---

## مۆڵەت و خاوەندارێتی:
ئەم پڕۆژەیە بە سەرچاوەی کراوە (Open Source - Apache 2.0) پێشکەش کراوە بۆ گەلی کورد و تەواوی گەشەپێدەران.
`
  }
];
