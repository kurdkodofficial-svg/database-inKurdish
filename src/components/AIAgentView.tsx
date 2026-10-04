import React, { useState } from 'react';
import { Dialect, SheetModel } from '../types';
import { processAIAgentMessage } from '../lib/aiAgentClient';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Table, 
  ArrowRight, 
  CheckCircle2, 
  Wand2,
  Cpu
} from 'lucide-react';

interface AIAgentViewProps {
  currentDialect: Dialect;
  sheets: SheetModel[];
  exchangeRate: number;
  onSheetCreated: (newSheet: SheetModel) => void;
  onSelectSheet: (sheetId: string) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  createdSheet?: SheetModel;
  timestamp: string;
}

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  currentDialect,
  sheets,
  exchangeRate,
  onSheetCreated,
  onSelectSheet,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome_1',
      sender: 'agent',
      text: currentDialect === 'ku_badini'
        ? 'سڵاڤ! ئەز بریکارێ زیرەکی دەستکردێ ماجیکم. فەرمانەکا دەقی ب بادینی یان سۆرانی بێژە تا دەستبەجێ خشتە و فۆڕمێن پێشکەفتی بۆ تە چێکەم!'
        : currentDialect === 'ar'
        ? 'أهلاً بك! أنا وكيل ماجيك الذكي لقواعد البيانات. اكتب طلبك باللغة الكردية أو العربية وسأقوم بإنشاء الجداول وحساب المعادلات فوراً!'
        : 'سڵاو! من بریکاری زیرەکی دەستکردی ماجیکم. بە زمانی کوردی (سۆرانی، بادینی، کورمانجی) فەرمان بنووسە تا دەستبەجێ خشتە و فۆڕمی پێشکەوتوو بە حیساباتی دۆلار و دینار بۆت دروستبکەم!',
      timestamp: 'ئێستا',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const samplePrompts = [
    {
      title: 'نۆرینگە و نەخۆشەکان (Sorani)',
      prompt: 'خشتەیەکی نۆرینگە و نەخۆشەکان دروست بکە لەگەڵ پشکنین، تێچووی دۆلار و گۆڕینی بۆ دینار',
    },
    {
      title: 'خشتەکا کلینیکێ (Badini)',
      prompt: 'خشتەکێ نوی چێکە ژبۆ کلینیک و نەخۆشان دگەل دەستنیشانکرنا نەخۆشیێ و بهایێ دۆلاری',
    },
    {
      title: 'خانووبەرە و مولکەکان',
      prompt: 'خشتەی بەڕێوەبردنی خانووبەرە دروست بکە بە نرخی دۆلار و هاوکاتکردنی بە دیناری عێراقی',
    },
    {
      title: 'گەیاندن و دیلیڤەری',
      prompt: 'سیستەمێکی بەڕێوەبردنی داواکاری و گەیاندن (Delivery) دروست بکە لەگەڵ کرێی گەیاندن',
    },
    {
      title: 'شیکاری فرۆش بە دینار',
      prompt: 'کۆی گشتی فاکتۆرەکان چەندە بە دۆلار و دیناری عێراقی لەم ساتەدا؟',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await processAIAgentMessage(text, currentDialect, sheets, exchangeRate);

      const agentMsg: MessageItem = {
        id: `agt_${Date.now()}`,
        sender: 'agent',
        text: response.message,
        createdSheet: response.createdSheet,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (response.createdSheet) {
        onSheetCreated(response.createdSheet);
      }

      setMessages((prev) => [...prev, agentMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `agt_err_${Date.now()}`,
          sender: 'agent',
          text: 'هەڵەیەک ڕوویدا لە کاتی پەیوەندیکردن بە ژیریی دەستکرد. تکایە دووبارە هەوڵبدەرەوە.',
          timestamp: 'ئێستا',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Chat Stream */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[650px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>بریکاری ژیریی دەستکردی ماجیک</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400">
                پشتگیری دەق و فەرمانی کوردی (سۆرانی، بادینی، کورمانجی)، عەرەبی و ئینگلیزی
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Gemini 2.5 Flash Engine
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 pl-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-violet-900/60 text-violet-200 border border-violet-700/50'
                }`}
              >
                {msg.sender === 'user' ? 'تۆ' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* If the message triggered the creation of a new database sheet */}
                {msg.createdSheet && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>خشتەی نوێ: {msg.createdSheet.nameKuSorani}</span>
                    </div>
                    <button
                      onClick={() => onSelectSheet(msg.createdSheet!.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <span>کردنەوەی لەناو خشتەکان</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span className="block text-[10px] text-slate-400 mt-2 text-left font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 text-xs text-violet-400 bg-violet-950/30 p-3 rounded-2xl border border-violet-800/40 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>ماجیک لە فەرمانە کوردییەکەت ورد دەبێتەوە و بنکەی داتاکەت بۆ دادەڕێژێت...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="بۆ نموونە: خشتەیەکی کۆگای کاڵا دروست بکە بە نرخی دۆلار و دینار..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isProcessing || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <span>ناردن</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Col: Instant Kurdish Prompt Starters */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>قاڵب و فەرمانە ئامادەکراوەکان</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            کلیک لەسەر هەر یەکێک لەم فەرمانانە بکە تا بەبێ نووسین بریکاری AI ڕاستەوخۆ سیستەمەکەت بۆ دروستبکات:
          </p>

          <div className="space-y-2.5">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sp.prompt)}
                disabled={isProcessing}
                className="w-full text-right p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/40 transition-all text-xs space-y-1 group cursor-pointer"
              >
                <div className="font-bold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                  <span>{sp.title}</span>
                  <Wand2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  "{sp.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 shadow-xl space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>چۆن کاردەکات؟</span>
          </div>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
            <li>شیکردنەوەی داواکارییەکە بە مۆدێلی NLP بۆ زمانی کوردی.</li>
            <li>دیاریکردنی جۆری خانەکان (Text, Number, Currency, Formula).</li>
            <li>بەستنەوەی فۆرمولای داینامیکی بە نرخی ڕۆژی دیناری عێراقی.</li>
            <li>تۆمارکردنی خشتەکە لە داتابەیسی PostgreSQL لە باکێند.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
