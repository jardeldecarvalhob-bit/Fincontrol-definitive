import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { Transaction, Account, CreditCard, Category, Goal, Budget, UserPreferences } from '../types';
import { formatCurrency } from '../services/formatters';

interface AiAdvisorViewProps {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  goals: Goal[];
  budgets: Budget[];
  preferences: UserPreferences;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  transactions,
  accounts,
  creditCards,
  categories,
  goals,
  budgets,
  preferences,
}) => {
  const hide = preferences.hideBalances;

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `👋 Olá! Sou o **FinControl AI**, seu consultor financeiro pessoal.

Posso analisar suas receitas, despesas, cartões, metas e orçamentos para fornecer **insights inteligentes, alertas de gastos e estratégias de economia**.

Escolha uma sugestão rápida abaixo ou digite sua pergunta!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    '💡 Fazer um raio-x completo da minha saúde financeira este mês',
    '🎯 Como organizar meu orçamento para atingir minhas metas mais rápido?',
    '💳 Análise de riscos e gastos nos cartões de crédito',
    '📊 Onde posso cortar R$ 500 do meu orçamento sem perder qualidade de vida?',
  ];

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = promptOverride || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) setInputMessage('');
    setIsLoading(true);

    // Preparar resumo consolidado para enviar à API do Gemini
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const totalCreditCard = creditCards.reduce((s, c) => s + c.currentInvoice, 0);

    const financialData = {
      saldoTotal: totalBalance,
      dividaCartaoCredito: totalCreditCard,
      contas: accounts.map((a) => ({ nome: a.name, saldo: a.balance })),
      cartoes: creditCards.map((c) => ({ nome: c.name, faturaAtual: c.currentInvoice, limite: c.limit })),
      metas: goals.map((g) => ({ titulo: g.title, atual: g.currentAmount, alvo: g.targetAmount })),
      ultimosLancamentos: transactions.slice(0, 10).map((t) => ({
        desc: t.description,
        valor: t.amount,
        tipo: t.type,
        status: t.status,
      })),
    };

    try {
      const response = await fetch('/api/financial-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: textToSend,
          financialData,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.advice || 'Não consegui processar a análise.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ Ocorreu um erro ao comunicar com o servidor da IA. Verifique se o servidor está rodando e tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" /> FinControl AI - Inteligência Financeira
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Assistente inteligente com tecnologia Gemini para consultoria e planejamento personalizado
        </p>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-xl hover:bg-amber-100 transition-colors font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isAi
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs space-y-2 ${
                  isAi
                    ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <span className={`text-[10px] block text-right ${isAi ? 'text-slate-400' : 'text-emerald-200'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>Analisando suas movimentações e gerando parecer financeiro...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Pergunte qualquer coisa sobre suas finanças..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" /> Enviar
        </button>
      </form>
    </div>
  );
};
