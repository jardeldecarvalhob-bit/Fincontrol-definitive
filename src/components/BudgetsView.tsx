import React, { useState } from 'react';
import { PieChart, AlertTriangle, CheckCircle2, Edit, ShieldAlert, Plus } from 'lucide-react';
import { Category, Budget, Transaction, UserPreferences } from '../types';
import { formatCurrency } from '../services/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsViewProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  preferences: UserPreferences;
  onSaveBudget: (categoryId: string, limitAmount: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  budgets,
  transactions,
  preferences,
  onSaveBudget,
}) => {
  const hide = preferences.hideBalances;

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState<number>(1000);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calcular Gastos por Categoria no Mês Atual
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const categorySpentMap: { [catId: string]: number } = {};
  transactions
    .filter((tx) => {
      const d = new Date(tx.date + 'T00:00:00');
      return tx.type === 'expense' && tx.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .forEach((tx) => {
      categorySpentMap[tx.categoryId] = (categorySpentMap[tx.categoryId] || 0) + tx.amount;
    });

  const handleOpenEdit = (catId: string, currentLimit: number) => {
    setEditingCategoryId(catId);
    setLimitInput(currentLimit || 1000);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId) return;
    onSaveBudget(editingCategoryId, limitInput);
    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Orçamentos &amp; Limites de Gastos</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Defina um teto mensal para cada categoria de despesa e evite surpresas no fim do mês
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {expenseCategories.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id);
          const limit = budget ? budget.limitAmount : cat.budgetLimit || 0;
          const spent = categorySpentMap[cat.id] || 0;
          const remaining = limit - spent;
          const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          const isOver = spent > limit && limit > 0;
          const isWarning = percent >= 75 && !isOver;

          return (
            <div
              key={cat.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                isOver
                  ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                    <span className="text-xs text-slate-400">
                      {limit > 0 ? `Teto Mensal: ${formatCurrency(limit, preferences.currency, hide)}` : 'Sem teto definido'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(cat.id, limit)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  title="Ajustar Teto de Gastos"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {limit > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gasto: <b>{formatCurrency(spent, preferences.currency, hide)}</b></span>
                    <span className={`font-bold ${isOver ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      {isOver ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Estourou por {formatCurrency(spent - limit, preferences.currency, hide)}
                        </span>
                      ) : (
                        `Disponível: ${formatCurrency(remaining, preferences.currency, hide)}`
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span>Gasto atual: {formatCurrency(spent, preferences.currency, hide)}</span>
                  <button
                    onClick={() => handleOpenEdit(cat.id, 1000)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    + Definir Teto
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      {editingCategoryId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ajustar Teto do Orçamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina o valor máximo recomendado para gastos nesta categoria a cada mês.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Limite Mensal (R$)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  required
                  value={limitInput}
                  onChange={(e) => setLimitInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategoryId(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
