import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, DollarSign, ArrowRightLeft, CreditCard as CreditCardIcon } from 'lucide-react';
import { Transaction, Account, Category, CreditCard, TransactionType, TransactionStatus, PaymentMethod } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  initialTransaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  creditCards: CreditCard[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  accounts,
  categories,
  creditCards,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(2);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const validCats = categories.filter((c) => c.type === (newType === 'income' ? 'income' : 'expense'));
      const isCurrentValid = validCats.some((c) => c.id === categoryId);
      if (!isCurrentValid && validCats.length > 0) {
        setCategoryId(validCats[0].id);
      }
    }
  };

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setDescription(initialTransaction.description);
      setAmount(initialTransaction.amount);
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setCreditCardId(initialTransaction.creditCardId || '');
      setTargetAccountId(initialTransaction.targetAccountId || '');
      setDate(initialTransaction.date);
      setStatus(initialTransaction.status);
      setPaymentMethod(initialTransaction.paymentMethod);
      setNotes(initialTransaction.notes || '');
      setTagInput(initialTransaction.tags ? initialTransaction.tags.join(', ') : '');
      if (initialTransaction.installment) {
        setIsInstallment(true);
        setInstallmentTotal(initialTransaction.installment.total);
      } else {
        setIsInstallment(false);
      }
    } else {
      setType('expense');
      setDescription('');
      setAmount(0);
      const defaultExpenseCat = categories.find((c) => c.type === 'expense')?.id || categories[0]?.id || '';
      setCategoryId(defaultExpenseCat);
      setAccountId(accounts[0]?.id || '');
      setCreditCardId('');
      setTargetAccountId(accounts[1]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('paid');
      setPaymentMethod('pix');
      setNotes('');
      setTagInput('');
      setIsInstallment(false);
    }
  }, [initialTransaction, isOpen, categories, accounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    const tagsArr = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    // Garante validação estrita da categoria de acordo com o tipo
    let finalCatId = categoryId;
    if (type === 'income') {
      const isIncomeCat = categories.some((c) => c.id === categoryId && c.type === 'income');
      if (!isIncomeCat) {
        finalCatId = categories.find((c) => c.type === 'income')?.id || 'cat-inc-1';
      }
    } else if (type === 'expense') {
      const isExpenseCat = categories.some((c) => c.id === categoryId && c.type === 'expense');
      if (!isExpenseCat) {
        finalCatId = categories.find((c) => c.type === 'expense')?.id || 'cat-exp-1';
      }
    }

    onSave({
      id: initialTransaction?.id,
      description,
      amount: Math.abs(amount),
      type: type,
      categoryId: finalCatId,
      accountId: paymentMethod === 'credit_card' ? (creditCards.find((c) => c.id === creditCardId)?.accountId || accountId) : accountId,
      creditCardId: paymentMethod === 'credit_card' ? creditCardId : undefined,
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      date,
      status,
      paymentMethod,
      notes,
      tags: tagsArr,
      installment: isInstallment ? { current: 1, total: installmentTotal } : undefined,
    });

    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 rounded-lg transition-all ${
              type === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 rounded-lg transition-all ${
              type === 'income' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`py-2 rounded-lg transition-all ${
              type === 'transfer' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Transferência
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Valor */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base font-bold"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Aluguel, Salário"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Categoria & Método de Pagamento */}
          {type !== 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Método de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="bank_transfer">TED/DOC</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>
            </div>
          )}

          {/* Conta Origem / Cartão / Conta Destino */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Conta Origem</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Conta Destino</label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : paymentMethod === 'credit_card' && creditCards.length > 0 ? (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Selecione o Cartão</label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Escolha um cartão...</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} (Fatura atual)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Conta Bancária</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="paid">Pago / Concluído</option>
                <option value="pending">Pendente / A Vencer</option>
              </select>
            </div>
          </div>

          {/* Parcelamento Toggle (Se for cartão de crédito despesa) */}
          {paymentMethod === 'credit_card' && type === 'expense' && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 dark:text-purple-300">
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Compra Parcelada?</span>
              </label>

              {isInstallment && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Total de Parcelas:</span>
                  <input
                    type="number"
                    min="2"
                    max="48"
                    value={installmentTotal}
                    onChange={(e) => setInstallmentTotal(parseInt(e.target.value) || 2)}
                    className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 rounded-lg text-center font-bold"
                  />
                  <span className="text-slate-400 text-[11px]">x de {((amount || 0) / installmentTotal).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              placeholder="Ex: mercado, fixo, trabalho"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Observações</label>
            <textarea
              rows={2}
              placeholder="Anotações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
