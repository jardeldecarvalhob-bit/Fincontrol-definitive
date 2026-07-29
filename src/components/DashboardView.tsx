import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  CreditCard as CreditCardIcon,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  PieChart as PieIcon,
  ShieldAlert,
} from 'lucide-react';
import { Transaction, Account, CreditCard, Category, Budget, Goal, UserPreferences } from '../types';
import { formatCurrency, formatDateShort } from '../services/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  preferences: UserPreferences;
  onOpenNewTransaction: () => void;
  onNavigateToTab: (tab: any) => void;
  onToggleStatus: (txId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  accounts,
  creditCards,
  categories,
  budgets,
  goals,
  preferences,
  onOpenNewTransaction,
  onNavigateToTab,
  onToggleStatus,
}) => {
  const hide = preferences.hideBalances;

  // Calculando Métricas do Mês Atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date + 'T00:00:00');
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const monthlyIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income' && tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((tx) => tx.type === 'expense' && tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingExpenses = currentMonthTransactions
    .filter((tx) => tx.type === 'expense' && tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.currentInvoice, 0);

  const predictedBalance = totalBalance - pendingExpenses;

  // Preparando Dados para o Gráfico de Evolução (Últimos 6 Meses)
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(currentYear, currentMonth - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const monthTxs = transactions.filter((tx) => {
      const txDate = new Date(tx.date + 'T00:00:00');
      return txDate.getMonth() === m && txDate.getFullYear() === y && tx.status === 'paid';
    });

    const income = monthTxs.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = monthTxs.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

    return {
      name: `${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}/${y.toString().slice(-2)}`,
      Receitas: income,
      Despesas: expense,
    };
  });

  // Filtro do gráfico por Categoria: 'all' | 'expense' | 'income'
  const [categoryViewMode, setCategoryViewMode] = useState<'all' | 'expense' | 'income'>('all');

  // Paleta de Tons de Verde com alto contraste para Categorias de Receita
  const INCOME_GREEN_SHADES = [
    '#10b981', // Emerald Standard
    '#84cc16', // Verde Limão Vibrante
    '#059669', // Verde Jade Escuro
    '#2dd4bf', // Turquesa / Menta Tech
    '#15803d', // Verde Floresta / Pinho
    '#34d399', // Menta Primavera
    '#65a30d', // Verde Oliva Quente
    '#047857', // Verde Esmeralda Profundo
    '#22c55e', // Verde Grama / Vivo
    '#a7f3d0', // Menta Claro
  ];

  // Preparando Dados para o Gráfico por Categoria (Rosca)
  const categoryTotalsMap: { [catId: string]: { amount: number; type: 'income' | 'expense' } } = {};
  currentMonthTransactions
    .filter((tx) => {
      if (tx.status !== 'paid') return false;
      if (categoryViewMode === 'expense') return tx.type === 'expense';
      if (categoryViewMode === 'income') return tx.type === 'income';
      return tx.type === 'expense' || tx.type === 'income';
    })
    .forEach((tx) => {
      if (!categoryTotalsMap[tx.categoryId]) {
        categoryTotalsMap[tx.categoryId] = { amount: 0, type: tx.type as 'income' | 'expense' };
      }
      categoryTotalsMap[tx.categoryId].amount += tx.amount;
    });

  let incomeColorIndex = 0;
  const pieData = Object.keys(categoryTotalsMap)
    .map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      const info = categoryTotalsMap[catId];

      let color = cat ? cat.color : '#94a3b8';
      if (info.type === 'income') {
        // Atribui tons de verde vibrantes e variados para cada categoria de receita
        color = INCOME_GREEN_SHADES[incomeColorIndex % INCOME_GREEN_SHADES.length];
        incomeColorIndex++;
      }

      return {
        id: catId,
        name: cat ? cat.name : (info.type === 'income' ? 'Outras Receitas' : 'Outros Gastos'),
        value: info.amount,
        type: info.type,
        color: color,
      };
    })
    .sort((a, b) => {
      // Agrupa receitas do mesmo lado do gráfico e despesas do outro lado
      if (a.type !== b.type) {
        return a.type === 'income' ? -1 : 1;
      }
      return b.value - a.value;
    });

  // Vencimentos Próximos / Pendentes
  const pendingTxsList = transactions
    .filter((tx) => tx.status === 'pending')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Saldo Total */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Total Consolidado
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalBalance, preferences.currency, hide)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Previsão pós pendentes:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(predictedBalance, preferences.currency, hide)}
            </span>
          </div>
        </div>

        {/* Card Receitas do Mês */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receitas Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
            {formatCurrency(monthlyIncome, preferences.currency, hide)}
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Entradas confirmadas no mês
          </div>
        </div>

        {/* Card Despesas do Mês */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Despesas Pagas
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(monthlyExpenses, preferences.currency, hide)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pendente: <b>{formatCurrency(pendingExpenses, preferences.currency, hide)}</b></span>
          </div>
        </div>

        {/* Card Cartão de Crédito */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faturas Abertas
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            {formatCurrency(totalCreditCardDebt, preferences.currency, hide)}
          </div>
          <button
            onClick={() => onNavigateToTab('credit_cards')}
            className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Ver faturas detalhadas <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Evolução Mensal (Area Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Evolução Financeira (Últimos 6 Meses)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo de receitas e despesas pagas
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0, preferences.currency, hide)]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Categorias do Mês (Rosca com Receitas e Despesas) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Categorias do Mês
              </h3>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {categoryViewMode === 'all' && 'Gastos e receitas do mês por categoria'}
                {categoryViewMode === 'expense' && 'Apenas despesas pagas'}
                {categoryViewMode === 'income' && 'Receitas em diferentes tons de verde'}
              </p>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCategoryViewMode('all')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    categoryViewMode === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryViewMode('expense')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    categoryViewMode === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Despesas
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryViewMode('income')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    categoryViewMode === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Receitas
                </button>
              </div>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      formatCurrency(Number(val) || 0, preferences.currency, hide),
                      `${item.payload.name} (${item.payload.type === 'income' ? 'Receita' : 'Despesa'})`,
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-10">
                Nenhum lançamento pago registrado para o filtro selecionado.
              </div>
            )}
          </div>

          {/* Sublegenda de Categorias */}
          <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{item.name}</span>
                  {categoryViewMode === 'all' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        item.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  )}
                </div>
                <span className={`font-semibold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(item.value, preferences.currency, hide)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Contas Bancárias & Próximos Vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas Bancárias Resumo */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Minhas Contas Bancárias
            </h3>
            <button
              onClick={() => onNavigateToTab('accounts')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Gerenciar Contas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.icon || 'Landmark'} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{acc.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{acc.bankName || acc.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {formatCurrency(acc.balance, preferences.currency, hide)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lançamentos Pendentes / Vencimentos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Próximos Vencimentos
              </h3>
              {pendingTxsList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                  {pendingTxsList.length}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Ver Tudo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingTxsList.length > 0 ? (
              pendingTxsList.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleStatus(tx.id)}
                        className="p-1.5 text-amber-600 hover:text-emerald-600 dark:text-amber-400 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors"
                        title="Marcar como Pago"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{tx.description}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{formatDateShort(tx.date)}</span>
                          <span>•</span>
                          <span className="font-medium" style={{ color: cat?.color }}>
                            {cat?.name || 'Geral'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 block">
                        {formatCurrency(tx.amount, preferences.currency, hide)}
                      </span>
                      <button
                        onClick={() => onToggleStatus(tx.id)}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Baixar agora
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 text-xs py-8">
                🎉 Nenhuma conta pendente para vencer nos próximos dias!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
