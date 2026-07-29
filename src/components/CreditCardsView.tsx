import React, { useState } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  Receipt,
  X,
} from 'lucide-react';
import { CreditCard, Account, Transaction, UserPreferences } from '../types';
import { formatCurrency } from '../services/formatters';

interface CreditCardsViewProps {
  creditCards: CreditCard[];
  accounts: Account[];
  transactions: Transaction[];
  preferences: UserPreferences;
  onSaveCreditCard: (card: Partial<CreditCard>) => void;
  onDeleteCreditCard: (id: string) => void;
  onDeleteInvoice: (cardId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onPayInvoice: (cardId: string, accountId: string, amount: number) => void;
}

type DeleteTarget =
  | { type: 'card'; id: string; name: string }
  | { type: 'invoice'; cardId: string; cardName: string; amount: number }
  | { type: 'transaction'; id: string; description: string; amount: number };

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({
  creditCards,
  accounts,
  transactions,
  preferences,
  onSaveCreditCard,
  onDeleteCreditCard,
  onDeleteInvoice,
  onDeleteTransaction,
  onPayInvoice,
}) => {
  const hide = preferences.hideBalances;

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Partial<CreditCard> | null>(null);

  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);
  const [payFromAccountId, setPayFromAccountId] = useState<string>(accounts[0]?.id || '');

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const totalInvoice = creditCards.reduce((sum, c) => sum + c.currentInvoice, 0);
  const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);

  const handleOpenAdd = () => {
    setEditingCard({
      name: '',
      limit: 10000,
      currentInvoice: 0,
      closingDay: 5,
      dueDay: 12,
      color: '#820ad1',
      brand: 'mastercard',
      accountId: accounts[0]?.id || '',
    });
    setIsCardModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard({ ...card });
    setIsCardModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard?.name) return;
    onSaveCreditCard(editingCard);
    setIsCardModalOpen(false);
  };

  const handleConfirmPayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCard || !payFromAccountId) return;
    onPayInvoice(payingCard.id, payFromAccountId, payingCard.currentInvoice);
    setPayingCard(null);
  };

  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'card') {
      onDeleteCreditCard(deleteTarget.id);
    } else if (deleteTarget.type === 'invoice') {
      onDeleteInvoice(deleteTarget.cardId);
    } else if (deleteTarget.type === 'transaction') {
      onDeleteTransaction(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cartões de Crédito</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe limites, faturas abertas, datas de fechamento, vencimentos e gerencie exclusões de faturas
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Cartão
        </button>
      </div>

      {/* Credit Summary Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-purple-300 uppercase tracking-wider block mb-1">
            Total em Faturas Abertas
          </span>
          <h3 className="text-3xl font-black tracking-tight">{formatCurrency(totalInvoice, preferences.currency, hide)}</h3>
        </div>
        <div className="text-xs text-purple-200 bg-purple-950/80 px-3.5 py-2 rounded-xl border border-purple-700/50">
          <span>Limite Total Concedido: <b>{formatCurrency(totalLimit, preferences.currency, hide)}</b></span>
        </div>
      </div>

      {/* Cards Grid */}
      {creditCards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <CreditCardIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum cartão cadastrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Adicione seus cartões de crédito como Nubank, Itaú ou Inter para controlar faturas e compras parceladas.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Cadastrar Cartão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creditCards.map((card) => {
            const usedPercent = Math.min(100, Math.round((card.currentInvoice / card.limit) * 100));
            const availableLimit = Math.max(0, card.limit - card.currentInvoice);

            const cardTxs = transactions.filter((t) => t.creditCardId === card.id);

            return (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                {/* Card Top Face */}
                <div
                  className="p-5 rounded-2xl text-white shadow-md relative overflow-hidden"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.brand}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(card)}
                        title="Editar Cartão"
                        className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'card', id: card.id, name: card.name })}
                        title="Excluir Cartão"
                        className="p-1.5 hover:bg-rose-500/80 rounded-lg text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight mb-2">{card.name}</h3>

                  <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-white/20">
                    <div>
                      <span className="block opacity-75">Fatura Atual</span>
                      <span className="text-lg font-black">{formatCurrency(card.currentInvoice, preferences.currency, hide)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block opacity-75">Limite Disponível</span>
                      <span className="font-bold">{formatCurrency(availableLimit, preferences.currency, hide)}</span>
                    </div>
                  </div>
                </div>

                {/* Limit Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Uso do Limite</span>
                    <span className={usedPercent > 80 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {usedPercent}% ({formatCurrency(card.currentInvoice, preferences.currency, hide)} / {formatCurrency(card.limit, preferences.currency, hide)})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usedPercent > 85 ? 'bg-rose-500' : usedPercent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Dates & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span>Fechamento: <b>Dia {card.closingDay}</b></span>
                    <span>•</span>
                    <span>Vencimento: <b>Dia {card.dueDay}</b></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {card.currentInvoice > 0 && (
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'invoice',
                            cardId: card.id,
                            cardName: card.name,
                            amount: card.currentInvoice,
                          })
                        }
                        title="Excluir Fatura"
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-semibold transition-all border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Fatura
                      </button>
                    )}

                    <button
                      onClick={() => setPayingCard(card)}
                      disabled={card.currentInvoice <= 0}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xs"
                    >
                      Pagar Fatura
                    </button>
                  </div>
                </div>

                {/* Items on invoice */}
                {cardTxs.length > 0 && (
                  <div className="pt-2 text-xs space-y-1.5 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Lançamentos da Fatura ({cardTxs.length}):
                      </span>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {cardTxs.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[200px]">
                            <Receipt className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{t.description}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(t.amount, preferences.currency, hide)}
                            </span>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'transaction',
                                  id: t.id,
                                  description: t.description,
                                  amount: t.amount,
                                })
                              }
                              title="Excluir este lançamento"
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete Actions */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {deleteTarget.type === 'card'
                  ? 'Excluir Cartão de Crédito'
                  : deleteTarget.type === 'invoice'
                  ? 'Excluir Fatura do Cartão'
                  : 'Excluir Lançamento'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {deleteTarget.type === 'card' && (
                <>
                  Você está prestes a excluir o cartão <b>{deleteTarget.name}</b> e seus lançamentos vinculados.
                  <br />
                  <br />
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Tem certeza que deseja excluir este cartão/fatura? Esta ação não poderá ser desfeita.
                  </span>
                </>
              )}

              {deleteTarget.type === 'invoice' && (
                <>
                  Você está prestes a apagar a fatura de <b>{deleteTarget.cardName}</b> no valor de{' '}
                  <b>{formatCurrency(deleteTarget.amount, preferences.currency, hide)}</b>.
                  <br />
                  <br />
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Tem certeza que deseja excluir este cartão/fatura? Esta ação não poderá ser desfeita.
                  </span>
                </>
              )}

              {deleteTarget.type === 'transaction' && (
                <>
                  Você está prestes a excluir o lançamento <b>'{deleteTarget.description}'</b> (
                  {formatCurrency(deleteTarget.amount, preferences.currency, hide)}) da fatura.
                  <br />
                  <br />
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Tem certeza que deseja excluir este cartão/fatura? Esta ação não poderá ser desfeita.
                  </span>
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payingCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pagar Fatura do Cartão</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O valor da fatura de <b>{payingCard.name}</b> será debitado da sua conta escolhida e o limite do cartão será restaurado.
            </p>

            <form onSubmit={handleConfirmPayInvoice} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Valor da Fatura:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(payingCard.currentInvoice, preferences.currency, hide)}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Debitar da Conta</label>
                <select
                  value={payFromAccountId}
                  onChange={(e) => setPayFromAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Saldo: {formatCurrency(a.balance, preferences.currency, hide)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCard(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCard?.id ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
            </h3>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank Violeta, Itaú Visa"
                  value={editingCard?.name || ''}
                  onChange={(e) => setEditingCard((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Limite Total (R$)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={editingCard?.limit ?? 5000}
                    onChange={(e) => setEditingCard((prev) => ({ ...prev, limit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Bandeira</label>
                  <select
                    value={editingCard?.brand || 'mastercard'}
                    onChange={(e) => setEditingCard((prev) => ({ ...prev, brand: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="mastercard">Mastercard</option>
                    <option value="visa">Visa</option>
                    <option value="elo">Elo</option>
                    <option value="amex">Amex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Dia Fechamento Fatura</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editingCard?.closingDay ?? 5}
                    onChange={(e) => setEditingCard((prev) => ({ ...prev, closingDay: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Dia Vencimento Fatura</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editingCard?.dueDay ?? 12}
                    onChange={(e) => setEditingCard((prev) => ({ ...prev, dueDay: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
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

