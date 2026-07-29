import React, { useState } from 'react';
import { Landmark, Plus, ArrowRightLeft, Wallet, ShieldCheck, Edit, Trash2, Building2 } from 'lucide-react';
import { Account, UserPreferences, Transaction } from '../types';
import { formatCurrency, formatDateShort } from '../services/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  preferences: UserPreferences;
  onSaveAccount: (account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onOpenTransferModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  preferences,
  onSaveAccount,
  onDeleteAccount,
  onOpenTransferModal,
}) => {
  const hide = preferences.hideBalances;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<Account> | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const handleOpenAdd = () => {
    setEditingAccount({
      name: '',
      bankName: '',
      type: 'checking',
      balance: 0,
      initialBalance: 0,
      color: '#10b981',
      icon: 'Landmark',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount({ ...acc });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount?.name) return;
    onSaveAccount(editingAccount);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contas Bancárias &amp; Carteiras</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o saldo real em cada banco, corretora ou carteira física
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" /> Transferência Interna
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Conta
          </button>
        </div>
      </div>

      {/* Total Balance Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider block mb-1">
            Patrimônio Financeiro em Contas
          </span>
          <h3 className="text-3xl font-black tracking-tight">{formatCurrency(totalBalance, preferences.currency, hide)}</h3>
        </div>
        <div className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{accounts.length} Contas cadastradas</span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const accTxs = transactions
            .filter((t) => t.accountId === acc.id || t.targetAccountId === acc.id)
            .slice(0, 3);

          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <CategoryIcon name={acc.icon || 'Landmark'} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{acc.bankName || acc.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="my-4">
                  <span className="text-xs text-slate-400 block mb-1">Saldo Atual</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(acc.balance, preferences.currency, hide)}
                  </div>
                </div>

                {/* Últimas Movimentações */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">Últimos Lançamentos</span>
                  {accTxs.length > 0 ? (
                    <div className="space-y-2">
                      {accTxs.map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-xs">
                          <span className="truncate text-slate-700 dark:text-slate-300 max-w-[150px]">{t.description}</span>
                          <span
                            className={`font-semibold ${
                              t.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatCurrency(t.amount, preferences.currency, hide)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sem lançamentos recentes.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingAccount?.id ? 'Editar Conta' : 'Nova Conta Bancária'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank, Itaú, Carteira"
                  value={editingAccount?.name || ''}
                  onChange={(e) => setEditingAccount((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Instituição Bancária</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú, Bradesco"
                  value={editingAccount?.bankName || ''}
                  onChange={(e) => setEditingAccount((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tipo de Conta</label>
                  <select
                    value={editingAccount?.type || 'checking'}
                    onChange={(e) => setEditingAccount((prev) => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="checking">Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="investment">Investimento</option>
                    <option value="cash">Carteira Física</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Saldo Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingAccount?.balance ?? 0}
                    onChange={(e) => setEditingAccount((prev) => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor do Card</label>
                <div className="flex items-center gap-2">
                  {['#820ad1', '#ec7000', '#002d72', '#16a34a', '#10b981', '#3b82f6', '#ef4444', '#f97316'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingAccount((prev) => ({ ...prev, color }))}
                      className={`w-7 h-7 rounded-full border-2 ${
                        editingAccount?.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
