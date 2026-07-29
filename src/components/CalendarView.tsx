import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Transaction, Category, UserPreferences } from '../types';
import { formatCurrency, getMonthName } from '../services/formatters';

interface CalendarViewProps {
  transactions: Transaction[];
  categories: Category[];
  preferences: UserPreferences;
  onToggleStatus: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  categories,
  preferences,
  onToggleStatus,
}) => {
  const hide = preferences.hideBalances;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayTxs, setSelectedDayTxs] = useState<{ dateStr: string; txs: Transaction[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group transactions by date YYYY-MM-DD
  const txsByDate: { [dateStr: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    if (!txsByDate[tx.date]) {
      txsByDate[tx.date] = [];
    }
    txsByDate[tx.date].push(tx);
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendário de Vencimentos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe receitas e contas por dia de vencimento para se planejar
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[130px] text-center">
            {getMonthName(month)} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span>DOM</span>
          <span>SEG</span>
          <span>TER</span>
          <span>QUA</span>
          <span>QUI</span>
          <span>SEX</span>
          <span>SÁB</span>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty Padding Cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-slate-50/40 dark:bg-slate-800/20 rounded-xl" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTxs = txsByDate[dateStr] || [];

            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

            return (
              <div
                key={dayNum}
                onClick={() => dayTxs.length > 0 && setSelectedDayTxs({ dateStr, txs: dayTxs })}
                className={`h-24 p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dayNum}
                  </span>
                  {dayTxs.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                <div className="space-y-0.5 text-[10px]">
                  {dayIncome > 0 && (
                    <div className="truncate text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50 px-1 rounded-sm">
                      +{formatCurrency(dayIncome, preferences.currency, hide)}
                    </div>
                  )}
                  {dayExpense > 0 && (
                    <div className="truncate text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1 rounded-sm">
                      -{formatCurrency(dayExpense, preferences.currency, hide)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Drawer / Modal */}
      {selectedDayTxs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Lançamentos do Dia {selectedDayTxs.dateStr}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedDayTxs.txs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(tx.id)}
                      className={`p-1 rounded-lg ${
                        tx.status === 'paid' ? 'text-emerald-600' : 'text-amber-500'
                      }`}
                    >
                      {tx.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{tx.status === 'paid' ? 'Pago' : 'Pendente'}</span>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-teal-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(tx.amount, preferences.currency, hide)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDayTxs(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
