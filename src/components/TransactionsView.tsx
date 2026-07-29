import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Calendar,
  X,
  Tag,
} from 'lucide-react';
import { Transaction, Account, Category, UserPreferences, TransactionType, TransactionStatus } from '../types';
import { formatCurrency, formatDate } from '../services/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  preferences: UserPreferences;
  onOpenNewTransaction: (tx?: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  preferences,
  onOpenNewTransaction,
  onDeleteTransaction,
  onToggleStatus,
}) => {
  const hide = preferences.hideBalances;

  // State de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'prev_month' | 'all'>('current_month');

  // Lógica de Períodos
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filtro de Busca
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(term);
        const matchesNotes = tx.notes?.toLowerCase().includes(term);
        const matchesTags = tx.tags?.some((t) => t.toLowerCase().includes(term));
        if (!matchesDesc && !matchesNotes && !matchesTags) return false;
      }

      // Filtro por Tipo
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Filtro por Status
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;

      // Filtro por Categoria
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // Filtro por Conta
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId && tx.targetAccountId !== selectedAccountId) return false;

      // Filtro por Período
      if (selectedPeriod !== 'all') {
        const txDate = new Date(tx.date + 'T00:00:00');
        if (selectedPeriod === 'current_month') {
          if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) return false;
        } else if (selectedPeriod === 'prev_month') {
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (txDate.getMonth() !== prevMonth || txDate.getFullYear() !== prevYear) return false;
        }
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [
    transactions,
    searchTerm,
    selectedType,
    selectedStatus,
    selectedCategoryId,
    selectedAccountId,
    selectedPeriod,
    currentMonth,
    currentYear,
  ]);

  // Resumo do Período Filtrado
  const filteredIncome = filteredTransactions
    .filter((tx) => tx.type === 'income' && tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense' && tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Descricao', 'Tipo', 'Valor', 'Categoria', 'Conta', 'Status', 'Metodo'];
    const rows = filteredTransactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || '';
      return [
        tx.id,
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.type,
        tx.amount,
        `"${cat}"`,
        `"${acc}"`,
        tx.status,
        tx.paymentMethod,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fincontrol_extrato_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Extrato de Lançamentos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie todas as suas movimentações financeiras com filtros avançados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={() => onOpenNewTransaction()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, tag ou nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tipo Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="paid">Pagas / Realizadas</option>
            <option value="pending">Pendentes</option>
          </select>

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="current_month">Mês Atual</option>
            <option value="prev_month">Mês Anterior</option>
            <option value="all">Todo o Histórico</option>
          </select>
        </div>

        {/* Secondary Category and Account Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Filtrar por:</span>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas as Contas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtered Balance Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 flex items-center justify-between">
          <span className="text-xs font-semibold">Entradas do Filtro:</span>
          <span className="font-bold text-sm">{formatCurrency(filteredIncome, preferences.currency, hide)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <span className="text-xs font-semibold">Saídas do Filtro:</span>
          <span className="font-bold text-sm">{formatCurrency(filteredExpense, preferences.currency, hide)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold">Resultado Líquido:</span>
          <span className={`font-bold text-sm ${filteredNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(filteredNet, preferences.currency, hide)}
          </span>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Conta</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const targetAcc = accounts.find((a) => a.id === tx.targetAccountId);

                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Status Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          className={`p-1 rounded-lg transition-colors flex items-center justify-center ${
                            tx.status === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                              : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                          }`}
                          title={tx.status === 'paid' ? 'Pago (Clique para pendente)' : 'Pendente (Clique para baixar)'}
                        >
                          {tx.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </button>
                      </td>

                      {/* Descrição & Tags */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {tx.installment && (
                                <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-sm text-[10px] font-semibold">
                                  {tx.installment.current}/{tx.installment.total}x
                                </span>
                              )}
                              {tx.tags?.map((t, idx) => (
                                <span key={idx} className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                  <Tag className="w-2.5 h-2.5" /> {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {cat && <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />}
                          <span>{cat ? cat.name : 'Sem categoria'}</span>
                        </div>
                      </td>

                      {/* Conta */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {isTransfer ? `${acc?.name} ➔ ${targetAcc?.name}` : acc?.name || '-'}
                        </span>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? 'text-teal-600 dark:text-teal-400'
                              : isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''} {formatCurrency(tx.amount, preferences.currency, hide)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenNewTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum lançamento encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
