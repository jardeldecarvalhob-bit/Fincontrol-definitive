import React, { useState } from 'react';
import { Target, Plus, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { Goal, UserPreferences } from '../types';
import { formatCurrency, formatDate } from '../services/formatters';
import { CategoryIcon } from './CategoryIcon';

interface GoalsViewProps {
  goals: Goal[];
  preferences: UserPreferences;
  onSaveGoal: (goal: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalAmount: (goalId: string, amountChange: number, type: 'deposit' | 'withdrawal', note?: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  preferences,
  onSaveGoal,
  onDeleteGoal,
  onUpdateGoalAmount,
}) => {
  const hide = preferences.hideBalances;

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Partial<Goal> | null>(null);

  const [activeDepositGoal, setActiveDepositGoal] = useState<{ goal: Goal; type: 'deposit' | 'withdrawal' } | null>(null);
  const [amountInput, setAmountInput] = useState<number>(100);
  const [noteInput, setNoteInput] = useState<string>('');

  const totalSavedInGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleOpenAdd = () => {
    setEditingGoal({
      title: '',
      targetAmount: 5000,
      currentAmount: 0,
      deadline: `${new Date().getFullYear() + 1}-12-31`,
      category: 'Geral',
      color: '#0284c7',
      icon: 'Target',
      status: 'active',
    });
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal?.title) return;
    onSaveGoal(editingGoal);
    setIsGoalModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal || amountInput <= 0) return;
    onUpdateGoalAmount(activeDepositGoal.goal.id, amountInput, activeDepositGoal.type, noteInput);
    setActiveDepositGoal(null);
    setAmountInput(100);
    setNoteInput('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Metas &amp; Caixinhas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Separe dinheiro para objetivos específicos e acompanhe seu progresso até a realização
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Caixinha
        </button>
      </div>

      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-sky-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-sky-300 uppercase tracking-wider block mb-1">
            Total Guardado em Caixinhas
          </span>
          <h3 className="text-3xl font-black tracking-tight">{formatCurrency(totalSavedInGoals, preferences.currency, hide)}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-sky-200 bg-sky-950/80 px-3.5 py-2 rounded-xl border border-sky-700/50">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{goals.filter((g) => g.currentAmount >= g.targetAmount).length} de {goals.length} Metas Concluídas</span>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: goal.color }}
                    >
                      <CategoryIcon name={goal.icon || 'Target'} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{goal.title}</h3>
                      <span className="text-[11px] text-slate-400">{goal.category}</span>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" title="Meta Concluída!">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </div>

                {/* Progress Circle & Metrics */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Valor Acumulado</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(goal.currentAmount, preferences.currency, hide)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Meta: {formatCurrency(goal.targetAmount, preferences.currency, hide)}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{percent}%</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Prazo Limite: <b>{formatDate(goal.deadline)}</b></span>
                </div>
              </div>

              {/* Action Deposit/Withdraw Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveDepositGoal({ goal, type: 'deposit' })}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Aportar
                </button>
                <button
                  onClick={() => setActiveDepositGoal({ goal, type: 'withdrawal' })}
                  disabled={goal.currentAmount <= 0}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 disabled:opacity-40 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Resgatar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Aportar/Resgatar */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeDepositGoal.type === 'deposit' ? 'Aportar na Caixinha' : 'Resgatar da Caixinha'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeDepositGoal.goal.title} • Atual: {formatCurrency(activeDepositGoal.goal.currentAmount, preferences.currency, hide)}
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Valor a {activeDepositGoal.type === 'deposit' ? 'Aportar' : 'Resgatar'} (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  min="1"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nota / Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Aporte mensal, sobrou do orçamento"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Caixinha */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Caixinha</h3>

            <form onSubmit={handleGoalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome do Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência, Viagem"
                  value={editingGoal?.title || ''}
                  onChange={(e) => setEditingGoal((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={editingGoal?.targetAmount ?? 5000}
                    onChange={(e) => setEditingGoal((prev) => ({ ...prev, targetAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Prazo Limite</label>
                  <input
                    type="date"
                    required
                    value={editingGoal?.deadline || ''}
                    onChange={(e) => setEditingGoal((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                >
                  Salvar Caixinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
