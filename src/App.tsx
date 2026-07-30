import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { CreditCardsView } from './components/CreditCardsView';
import { GoalsView } from './components/GoalsView';
import { BudgetsView } from './components/BudgetsView';
import { CalendarView } from './components/CalendarView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { LoginView } from './components/LoginView';

import { Transaction, Account, CreditCard, Category, Goal, Budget, UserPreferences } from './types';
import { storageService } from './services/storage';
import { supabaseService } from './services/supabaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Supabase User State & Authentication
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fincontrol_auth') === 'true';
  });

  // States
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [accounts, setAccounts] = useState<Account[]>(() => storageService.getAccounts());
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => storageService.getCreditCards());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [goals, setGoals] = useState<Goal[]>(() => storageService.getGoals());
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.getBudgets());
  const [preferences, setPreferences] = useState<UserPreferences>(() => storageService.getPreferences());

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Subscribe to Supabase Auth state changes & synchronize database data
  useEffect(() => {
    const { data: authListener } = supabaseService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('fincontrol_auth', 'true');

        const userEmail = user.email || preferences.userEmail || '';
        const userName =
          user.user_metadata?.full_name || preferences.userName || userEmail.split('@')[0] || 'Usuário';

        // Attempt fetching synced database records for current authenticated user
        const [sbTxs, sbAccs, sbCards, sbGoals, sbBudgets, sbPrefs] = await Promise.all([
          supabaseService.fetchTransactions(user.id),
          supabaseService.fetchAccounts(user.id),
          supabaseService.fetchCreditCards(user.id),
          supabaseService.fetchGoals(user.id),
          supabaseService.fetchBudgets(user.id),
          supabaseService.fetchPreferences(user.id),
        ]);

        if (sbTxs && sbTxs.length > 0) {
          setTransactions(sbTxs);
          storageService.saveTransactions(sbTxs);
        } else if (transactions.length > 0) {
          supabaseService.saveTransactions(user.id, transactions);
        }

        if (sbAccs && sbAccs.length > 0) {
          setAccounts(sbAccs);
          storageService.saveAccounts(sbAccs);
        } else if (accounts.length > 0) {
          supabaseService.saveAccounts(user.id, accounts);
        }

        if (sbCards && sbCards.length > 0) {
          setCreditCards(sbCards);
          storageService.saveCreditCards(sbCards);
        } else if (creditCards.length > 0) {
          supabaseService.saveCreditCards(user.id, creditCards);
        }

        if (sbGoals && sbGoals.length > 0) {
          setGoals(sbGoals);
          storageService.saveGoals(sbGoals);
        } else if (goals.length > 0) {
          supabaseService.saveGoals(user.id, goals);
        }

        if (sbBudgets && sbBudgets.length > 0) {
          setBudgets(sbBudgets);
          storageService.saveBudgets(sbBudgets);
        } else if (budgets.length > 0) {
          supabaseService.saveBudgets(user.id, budgets);
        }

        if (sbPrefs) {
          setPreferences(sbPrefs);
          storageService.savePreferences(sbPrefs);
        } else {
          const updatedPref = { ...preferences, userName, userEmail };
          setPreferences(updatedPref);
          storageService.savePreferences(updatedPref);
          supabaseService.savePreferences(user.id, updatedPref);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync theme, accent color, font family, and font size with user preferences across the entire application
  useEffect(() => {
    const activeTheme = preferences.theme || 'light';
    const activeAccent = preferences.accentColor || 'emerald';

    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.setAttribute('data-accent', activeAccent);
    document.documentElement.setAttribute('data-font-family', preferences.fontFamily || 'inter');

    if (activeTheme === 'dark' || activeTheme === 'amoled' || activeTheme === 'modern') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const sizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    document.documentElement.style.fontSize = sizeMap[preferences.fontSize || 'medium'] || '16px';
  }, [preferences.theme, preferences.accentColor, preferences.fontFamily, preferences.fontSize]);

  // Persist handlers (Syncs both Local Storage and Supabase)
  const saveAllTransactions = (txs: Transaction[]) => {
    setTransactions(txs);
    storageService.saveTransactions(txs);
    if (currentUser?.id) {
      supabaseService.saveTransactions(currentUser.id, txs);
    }
  };

  const saveAllAccounts = (accs: Account[]) => {
    setAccounts(accs);
    storageService.saveAccounts(accs);
    if (currentUser?.id) {
      supabaseService.saveAccounts(currentUser.id, accs);
    }
  };

  const saveAllCreditCards = (cards: CreditCard[]) => {
    setCreditCards(cards);
    storageService.saveCreditCards(cards);
    if (currentUser?.id) {
      supabaseService.saveCreditCards(currentUser.id, cards);
    }
  };

  const saveAllGoals = (gls: Goal[]) => {
    setGoals(gls);
    storageService.saveGoals(gls);
    if (currentUser?.id) {
      supabaseService.saveGoals(currentUser.id, gls);
    }
  };

  const saveAllBudgets = (bdgs: Budget[]) => {
    setBudgets(bdgs);
    storageService.saveBudgets(bdgs);
    if (currentUser?.id) {
      supabaseService.saveBudgets(currentUser.id, bdgs);
    }
  };

  const updatePreferences = (updated: Partial<UserPreferences>) => {
    const next = { ...preferences, ...updated };
    setPreferences(next);
    storageService.savePreferences(next);
    if (currentUser?.id) {
      supabaseService.savePreferences(currentUser.id, next);
    }
  };

  const handleLogin = (userName: string, userEmail: string) => {
    updatePreferences({ userName, userEmail });
    setIsAuthenticated(true);
    localStorage.setItem('fincontrol_auth', 'true');
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fincontrol_auth');
  };

  // Add / Edit Transaction Lógica
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    let updatedTxs = [...transactions];

    if (txData.id) {
      // Editar existente
      updatedTxs = updatedTxs.map((t) => (t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t));
    } else {
      // Criar novo
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        description: txData.description || 'Lançamento',
        amount: txData.amount || 0,
        type: txData.type || 'expense',
        categoryId: txData.categoryId || categories[0]?.id || 'cat-exp-1',
        accountId: txData.accountId || accounts[0]?.id || 'acc-1',
        creditCardId: txData.creditCardId,
        targetAccountId: txData.targetAccountId,
        date: txData.date || new Date().toISOString().slice(0, 10),
        status: txData.status || 'paid',
        paymentMethod: txData.paymentMethod || 'pix',
        notes: txData.notes,
        tags: txData.tags,
        installment: txData.installment,
        createdAt: new Date().toISOString(),
      };
      updatedTxs = [newTx, ...updatedTxs];

      // Ajustar saldo da conta se 'paid'
      if (newTx.status === 'paid') {
        if (newTx.paymentMethod === 'credit_card' && newTx.creditCardId) {
          // Aumentar fatura do cartão
          setCreditCards((cards) =>
            cards.map((c) =>
              c.id === newTx.creditCardId ? { ...c, currentInvoice: c.currentInvoice + newTx.amount } : c
            )
          );
        } else {
          // Alterar saldo da conta
          setAccounts((accs) =>
            accs.map((a) => {
              if (a.id === newTx.accountId) {
                const diff = newTx.type === 'income' ? newTx.amount : -newTx.amount;
                return { ...a, balance: a.balance + diff };
              }
              return a;
            })
          );
        }
      }
    }

    saveAllTransactions(updatedTxs);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    if (target.status === 'paid') {
      if (target.paymentMethod === 'credit_card' && target.creditCardId) {
        const nextCards = creditCards.map((c) =>
          c.id === target.creditCardId ? { ...c, currentInvoice: Math.max(0, c.currentInvoice - target.amount) } : c
        );
        saveAllCreditCards(nextCards);
      } else {
        const nextAccs = accounts.map((a) => {
          if (a.id === target.accountId) {
            const diff = target.type === 'income' ? -target.amount : target.amount;
            return { ...a, balance: a.balance + diff };
          }
          return a;
        });
        saveAllAccounts(nextAccs);
      }
    }

    const nextTxs = transactions.filter((t) => t.id !== id);
    saveAllTransactions(nextTxs);
    if (currentUser?.id) {
      supabaseService.deleteTransaction(currentUser.id, id);
    }
  };

  // Toggle Pago / Pendente
  const handleToggleStatus = (id: string) => {
    let updatedCards = [...creditCards];
    let updatedAccs = [...accounts];

    const nextTxs = transactions.map((t) => {
      if (t.id === id) {
        const nextStatus: 'paid' | 'pending' = t.status === 'paid' ? 'pending' : 'paid';

        // Atualizar saldos correspondentes
        if (nextStatus === 'paid') {
          // Ficou pago
          if (t.paymentMethod === 'credit_card' && t.creditCardId) {
            updatedCards = updatedCards.map((c) =>
              c.id === t.creditCardId ? { ...c, currentInvoice: c.currentInvoice + t.amount } : c
            );
          } else {
            updatedAccs = updatedAccs.map((a) => {
              if (a.id === t.accountId) {
                const diff = t.type === 'income' ? t.amount : -t.amount;
                return { ...a, balance: a.balance + diff };
              }
              return a;
            });
          }
        } else {
          // Voltou a ser pendente
          if (t.paymentMethod === 'credit_card' && t.creditCardId) {
            updatedCards = updatedCards.map((c) =>
              c.id === t.creditCardId ? { ...c, currentInvoice: Math.max(0, c.currentInvoice - t.amount) } : c
            );
          } else {
            updatedAccs = updatedAccs.map((a) => {
              if (a.id === t.accountId) {
                const diff = t.type === 'income' ? -t.amount : t.amount;
                return { ...a, balance: a.balance + diff };
              }
              return a;
            });
          }
        }

        return { ...t, status: nextStatus };
      }
      return t;
    });

    saveAllCreditCards(updatedCards);
    saveAllAccounts(updatedAccs);
    saveAllTransactions(nextTxs);
  };

  // Account Operations
  const handleSaveAccount = (accountData: Partial<Account>) => {
    if (accountData.id) {
      saveAllAccounts(accounts.map((a) => (a.id === accountData.id ? ({ ...a, ...accountData } as Account) : a)));
    } else {
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        name: accountData.name || 'Nova Conta',
        type: accountData.type || 'checking',
        balance: accountData.balance || 0,
        initialBalance: accountData.balance || 0,
        color: accountData.color || '#10b981',
        icon: accountData.icon || 'Landmark',
        bankName: accountData.bankName,
      };
      saveAllAccounts([...accounts, newAcc]);
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    saveAllAccounts(accounts.filter((a) => a.id !== id));
    if (currentUser?.id) {
      supabaseService.deleteAccount(currentUser.id, id);
    }
  };

  // Credit Card Operations
  const handleSaveCreditCard = (cardData: Partial<CreditCard>) => {
    if (cardData.id) {
      saveAllCreditCards(creditCards.map((c) => (c.id === cardData.id ? ({ ...c, ...cardData } as CreditCard) : c)));
    } else {
      const newCard: CreditCard = {
        id: `card-${Date.now()}`,
        name: cardData.name || 'Novo Cartão',
        limit: cardData.limit || 5000,
        currentInvoice: cardData.currentInvoice || 0,
        closingDay: cardData.closingDay || 5,
        dueDay: cardData.dueDay || 12,
        color: cardData.color || '#820ad1',
        brand: cardData.brand || 'mastercard',
        accountId: cardData.accountId || accounts[0]?.id || 'acc-1',
      };
      saveAllCreditCards([...creditCards, newCard]);
    }
  };

  const handleDeleteCreditCard = (id: string) => {
    const updatedCards = creditCards.filter((c) => c.id !== id);
    const updatedTxs = transactions.filter((t) => t.creditCardId !== id);
    saveAllCreditCards(updatedCards);
    saveAllTransactions(updatedTxs);
    if (currentUser?.id) {
      supabaseService.deleteCreditCard(currentUser.id, id);
    }
  };

  const handleDeleteInvoice = (cardId: string) => {
    const updatedTxs = transactions.filter((t) => t.creditCardId !== cardId);
    const updatedCards = creditCards.map((c) => (c.id === cardId ? { ...c, currentInvoice: 0 } : c));
    saveAllTransactions(updatedTxs);
    saveAllCreditCards(updatedCards);
  };

  const handlePayInvoice = (cardId: string, accountId: string, amount: number) => {
    const card = creditCards.find((c) => c.id === cardId);
    if (!card || amount <= 0) return;

    // Debitar da conta
    setAccounts((accs) =>
      accs.map((a) => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
    );

    // Zerar fatura do cartão
    setCreditCards((cards) =>
      cards.map((c) => (c.id === cardId ? { ...c, currentInvoice: 0 } : c))
    );

    // Registrar lançamento de pagamento de fatura
    const payTx: Transaction = {
      id: `tx-pay-${Date.now()}`,
      description: `Pagamento de Fatura - ${card.name}`,
      amount: amount,
      type: 'expense',
      categoryId: categories.find((c) => c.name.toLowerCase().includes('moradia'))?.id || categories[0]?.id,
      accountId: accountId,
      date: new Date().toISOString().slice(0, 10),
      status: 'paid',
      paymentMethod: 'pix',
      notes: 'Pagamento de fatura de cartão de crédito',
      createdAt: new Date().toISOString(),
    };

    saveAllTransactions([payTx, ...transactions]);
  };

  // Goal Operations
  const handleSaveGoal = (goalData: Partial<Goal>) => {
    if (goalData.id) {
      saveAllGoals(goals.map((g) => (g.id === goalData.id ? ({ ...g, ...goalData } as Goal) : g)));
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: goalData.title || 'Nova Meta',
        targetAmount: goalData.targetAmount || 1000,
        currentAmount: goalData.currentAmount || 0,
        deadline: goalData.deadline || `${new Date().getFullYear() + 1}-12-31`,
        category: goalData.category || 'Geral',
        color: goalData.color || '#0284c7',
        icon: goalData.icon || 'Target',
        status: 'active',
        history: [],
      };
      saveAllGoals([...goals, newGoal]);
    }
  };

  const handleDeleteGoal = (id: string) => {
    saveAllGoals(goals.filter((g) => g.id !== id));
    if (currentUser?.id) {
      supabaseService.deleteGoal(currentUser.id, id);
    }
  };

  const handleUpdateGoalAmount = (
    goalId: string,
    amountChange: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) => {
    saveAllGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const nextAmount =
            type === 'deposit'
              ? g.currentAmount + amountChange
              : Math.max(0, g.currentAmount - amountChange);

          const newHistoryItem = {
            id: `h-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            amount: amountChange,
            type,
            note,
          };

          return {
            ...g,
            currentAmount: nextAmount,
            history: [newHistoryItem, ...(g.history || [])],
            status: nextAmount >= g.targetAmount ? ('completed' as const) : ('active' as const),
          };
        }
        return g;
      })
    );
  };

  // Budget Operations
  const handleSaveBudget = (categoryId: string, limitAmount: number) => {
    const existing = budgets.find((b) => b.categoryId === categoryId);
    if (existing) {
      saveAllBudgets(
        budgets.map((b) => (b.categoryId === categoryId ? { ...b, limitAmount } : b))
      );
    } else {
      const newB: Budget = {
        id: `b-${Date.now()}`,
        categoryId,
        limitAmount,
        period: 'monthly',
      };
      saveAllBudgets([...budgets, newB]);
    }
  };

  // Internal Transfer Operation
  const handleExecuteTransfer = (
    sourceAccountId: string,
    targetAccountId: string,
    amount: number,
    notes?: string
  ) => {
    // Debitar da origem e creditar no destino
    setAccounts((accs) =>
      accs.map((a) => {
        if (a.id === sourceAccountId) return { ...a, balance: a.balance - amount };
        if (a.id === targetAccountId) return { ...a, balance: a.balance + amount };
        return a;
      })
    );

    const sourceAccName = accounts.find((a) => a.id === sourceAccountId)?.name || 'Conta A';
    const targetAccName = accounts.find((a) => a.id === targetAccountId)?.name || 'Conta B';

    const transferTx: Transaction = {
      id: `tx-trf-${Date.now()}`,
      description: `Transferência: ${sourceAccName} ➔ ${targetAccName}`,
      amount,
      type: 'transfer',
      categoryId: categories.find((c) => c.type === 'expense')?.id || 'cat-exp-9',
      accountId: sourceAccountId,
      targetAccountId: targetAccountId,
      date: new Date().toISOString().slice(0, 10),
      status: 'paid',
      paymentMethod: 'bank_transfer',
      notes,
      createdAt: new Date().toISOString(),
    };

    saveAllTransactions([transferTx, ...transactions]);
  };

  // Backup handlers
  const handleExportBackup = () => {
    const json = storageService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fincontrol_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = storageService.importBackupJson(jsonStr);
    if (ok) {
      setTransactions(storageService.getTransactions());
      setAccounts(storageService.getAccounts());
      setCreditCards(storageService.getCreditCards());
      setCategories(storageService.getCategories());
      setGoals(storageService.getGoals());
      setBudgets(storageService.getBudgets());
      setPreferences(storageService.getPreferences());
    }
    return ok;
  };

  const handleResetData = () => {
    storageService.resetAllData();
    setTransactions(storageService.getTransactions());
    setAccounts(storageService.getAccounts());
    setCreditCards(storageService.getCreditCards());
    setCategories(storageService.getCategories());
    setGoals(storageService.getGoals());
    setBudgets(storageService.getBudgets());
    setPreferences(storageService.getPreferences());
  };

  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  const tabTitles: { [key in TabType]: string } = {
    dashboard: 'Visão Geral das Finanças',
    transactions: 'Extrato de Lançamentos',
    accounts: 'Contas Bancárias & Carteiras',
    credit_cards: 'Faturas & Cartões de Crédito',
    goals: 'Caixinhas & Metas Financeiras',
    budgets: 'Orçamentos & Limites de Gastos',
    calendar: 'Calendário de Vencimentos',
    ai_advisor: 'Consultoria Financeira com IA',
    settings: 'Configurações & Backup Offline',
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        userName={preferences.userName}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onOpenNewTransaction={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          activeTabTitle={tabTitles[activeTab]}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          pendingCount={pendingCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              accounts={accounts}
              creditCards={creditCards}
              categories={categories}
              budgets={budgets}
              goals={goals}
              preferences={preferences}
              onOpenNewTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onNavigateToTab={setActiveTab}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              preferences={preferences}
              onOpenNewTransaction={(tx) => {
                setEditingTx(tx || null);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              transactions={transactions}
              preferences={preferences}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
            />
          )}

          {activeTab === 'credit_cards' && (
            <CreditCardsView
              creditCards={creditCards}
              accounts={accounts}
              transactions={transactions}
              preferences={preferences}
              onSaveCreditCard={handleSaveCreditCard}
              onDeleteCreditCard={handleDeleteCreditCard}
              onDeleteInvoice={handleDeleteInvoice}
              onDeleteTransaction={handleDeleteTransaction}
              onPayInvoice={handlePayInvoice}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              preferences={preferences}
              onSaveGoal={handleSaveGoal}
              onDeleteGoal={handleDeleteGoal}
              onUpdateGoalAmount={handleUpdateGoalAmount}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              categories={categories}
              budgets={budgets}
              transactions={transactions}
              preferences={preferences}
              onSaveBudget={handleSaveBudget}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              transactions={transactions}
              categories={categories}
              preferences={preferences}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'ai_advisor' && (
            <AiAdvisorView
              transactions={transactions}
              accounts={accounts}
              creditCards={creditCards}
              categories={categories}
              goals={goals}
              budgets={budgets}
              preferences={preferences}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              preferences={preferences}
              onUpdatePreferences={updatePreferences}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialTransaction={editingTx}
        accounts={accounts}
        categories={categories}
        creditCards={creditCards}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onExecuteTransfer={handleExecuteTransfer}
      />
    </div>
  );
}
