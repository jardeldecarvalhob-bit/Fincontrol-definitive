import { supabase } from '../lib/supabase';
import { Transaction, Account, CreditCard, Category, Goal, Budget, UserPreferences } from '../types';

export const supabaseService = {
  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  async signUp(email: string, pass: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out of Supabase:', error);
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },

  // -------------------------------------------------------------
  // TRANSACTIONS
  // -------------------------------------------------------------
  async fetchTransactions(userId: string): Promise<Transaction[] | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (!data) return null;

      return data.map((item) => ({
        id: item.id,
        description: item.description,
        amount: Number(item.amount),
        type: item.type,
        categoryId: item.category_id,
        accountId: item.account_id,
        targetAccountId: item.target_account_id,
        creditCardId: item.credit_card_id,
        date: item.date,
        status: item.status,
        paymentMethod: item.payment_method,
        notes: item.notes,
        tags: item.tags,
        isRecurring: item.is_recurring,
        recurrencePeriod: item.recurrence_period,
        installment: item.installment,
        attachmentName: item.attachment_name,
        createdAt: item.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Supabase fetchTransactions warning:', err);
      return null;
    }
  },

  async saveTransactions(userId: string, txs: Transaction[]) {
    try {
      if (!userId) return;
      const rows = txs.map((tx) => ({
        id: tx.id,
        user_id: userId,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category_id: tx.categoryId,
        account_id: tx.accountId,
        target_account_id: tx.targetAccountId || null,
        credit_card_id: tx.creditCardId || null,
        date: tx.date,
        status: tx.status,
        payment_method: tx.paymentMethod,
        notes: tx.notes || null,
        tags: tx.tags || [],
        is_recurring: tx.isRecurring || false,
        recurrence_period: tx.recurrencePeriod || null,
        installment: tx.installment || null,
        attachment_name: tx.attachmentName || null,
        created_at: tx.createdAt,
      }));

      const { error } = await supabase.from('transactions').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase saveTransactions error:', error);
    } catch (err) {
      console.warn('Supabase saveTransactions failed:', err);
    }
  },

  async deleteTransaction(userId: string, txId: string) {
    try {
      if (!userId) return;
      const { error } = await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
      if (error) console.warn('Supabase deleteTransaction error:', error);
    } catch (err) {
      console.warn('Supabase deleteTransaction failed:', err);
    }
  },

  // -------------------------------------------------------------
  // ACCOUNTS
  // -------------------------------------------------------------
  async fetchAccounts(userId: string): Promise<Account[] | null> {
    try {
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId);
      if (error) throw error;
      if (!data) return null;

      return data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        balance: Number(item.balance),
        initialBalance: Number(item.initial_balance ?? item.balance),
        color: item.color,
        icon: item.icon,
        bankName: item.bank_name,
        accountNumber: item.account_number,
      }));
    } catch (err) {
      console.warn('Supabase fetchAccounts warning:', err);
      return null;
    }
  },

  async saveAccounts(userId: string, accounts: Account[]) {
    try {
      if (!userId) return;
      const rows = accounts.map((acc) => ({
        id: acc.id,
        user_id: userId,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        initial_balance: acc.initialBalance,
        color: acc.color,
        icon: acc.icon,
        bank_name: acc.bankName || null,
        account_number: acc.accountNumber || null,
      }));

      const { error } = await supabase.from('accounts').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase saveAccounts error:', error);
    } catch (err) {
      console.warn('Supabase saveAccounts failed:', err);
    }
  },

  async deleteAccount(userId: string, accountId: string) {
    try {
      if (!userId) return;
      const { error } = await supabase.from('accounts').delete().eq('id', accountId).eq('user_id', userId);
      if (error) console.warn('Supabase deleteAccount error:', error);
    } catch (err) {
      console.warn('Supabase deleteAccount failed:', err);
    }
  },

  // -------------------------------------------------------------
  // CREDIT CARDS
  // -------------------------------------------------------------
  async fetchCreditCards(userId: string): Promise<CreditCard[] | null> {
    try {
      const { data, error } = await supabase.from('credit_cards').select('*').eq('user_id', userId);
      if (error) throw error;
      if (!data) return null;

      return data.map((item) => ({
        id: item.id,
        name: item.name,
        limit: Number(item.limit),
        currentInvoice: Number(item.current_invoice ?? 0),
        closingDay: Number(item.closing_day),
        dueDay: Number(item.due_day),
        color: item.color,
        brand: item.brand,
        accountId: item.account_id,
      }));
    } catch (err) {
      console.warn('Supabase fetchCreditCards warning:', err);
      return null;
    }
  },

  async saveCreditCards(userId: string, cards: CreditCard[]) {
    try {
      if (!userId) return;
      const rows = cards.map((c) => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        limit: c.limit,
        current_invoice: c.currentInvoice,
        closing_day: c.closingDay,
        due_day: c.dueDay,
        color: c.color,
        brand: c.brand,
        account_id: c.accountId,
      }));

      const { error } = await supabase.from('credit_cards').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase saveCreditCards error:', error);
    } catch (err) {
      console.warn('Supabase saveCreditCards failed:', err);
    }
  },

  async deleteCreditCard(userId: string, cardId: string) {
    try {
      if (!userId) return;
      const { error } = await supabase.from('credit_cards').delete().eq('id', cardId).eq('user_id', userId);
      if (error) console.warn('Supabase deleteCreditCard error:', error);
    } catch (err) {
      console.warn('Supabase deleteCreditCard failed:', err);
    }
  },

  // -------------------------------------------------------------
  // GOALS
  // -------------------------------------------------------------
  async fetchGoals(userId: string): Promise<Goal[] | null> {
    try {
      const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId);
      if (error) throw error;
      if (!data) return null;

      return data.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        deadline: g.deadline,
        category: g.category,
        color: g.color,
        icon: g.icon,
        status: g.status,
        notes: g.notes,
        history: g.history || [],
      }));
    } catch (err) {
      console.warn('Supabase fetchGoals warning:', err);
      return null;
    }
  },

  async saveGoals(userId: string, goals: Goal[]) {
    try {
      if (!userId) return;
      const rows = goals.map((g) => ({
        id: g.id,
        user_id: userId,
        title: g.title,
        target_amount: g.targetAmount,
        current_amount: g.currentAmount,
        deadline: g.deadline,
        category: g.category,
        color: g.color,
        icon: g.icon,
        status: g.status,
        notes: g.notes || null,
        history: g.history || [],
      }));

      const { error } = await supabase.from('goals').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase saveGoals error:', error);
    } catch (err) {
      console.warn('Supabase saveGoals failed:', err);
    }
  },

  async deleteGoal(userId: string, goalId: string) {
    try {
      if (!userId) return;
      const { error } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
      if (error) console.warn('Supabase deleteGoal error:', error);
    } catch (err) {
      console.warn('Supabase deleteGoal failed:', err);
    }
  },

  // -------------------------------------------------------------
  // BUDGETS
  // -------------------------------------------------------------
  async fetchBudgets(userId: string): Promise<Budget[] | null> {
    try {
      const { data, error } = await supabase.from('budgets').select('*').eq('user_id', userId);
      if (error) throw error;
      if (!data) return null;

      return data.map((b) => ({
        id: b.id,
        categoryId: b.category_id,
        limitAmount: Number(b.limit_amount),
        period: b.period,
      }));
    } catch (err) {
      console.warn('Supabase fetchBudgets warning:', err);
      return null;
    }
  },

  async saveBudgets(userId: string, budgets: Budget[]) {
    try {
      if (!userId) return;
      const rows = budgets.map((b) => ({
        id: b.id,
        user_id: userId,
        category_id: b.categoryId,
        limit_amount: b.limitAmount,
        period: b.period,
      }));

      const { error } = await supabase.from('budgets').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase saveBudgets error:', error);
    } catch (err) {
      console.warn('Supabase saveBudgets failed:', err);
    }
  },

  // -------------------------------------------------------------
  // USER PREFERENCES
  // -------------------------------------------------------------
  async fetchPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
      if (error) throw error;
      if (!data) return null;

      return {
        currency: data.currency,
        theme: data.theme,
        accentColor: data.accent_color,
        fontFamily: data.font_family,
        fontSize: data.font_size,
        hideBalances: data.hide_balances,
        userName: data.user_name,
        userEmail: data.user_email,
        enableNotifications: data.enable_notifications,
      };
    } catch (err) {
      console.warn('Supabase fetchPreferences warning:', err);
      return null;
    }
  },

  async savePreferences(userId: string, prefs: UserPreferences) {
    try {
      if (!userId) return;
      const row = {
        user_id: userId,
        currency: prefs.currency,
        theme: prefs.theme,
        accent_color: prefs.accentColor || 'emerald',
        font_family: prefs.fontFamily || 'inter',
        font_size: prefs.fontSize || 'medium',
        hide_balances: prefs.hideBalances,
        user_name: prefs.userName,
        user_email: prefs.userEmail,
        enable_notifications: prefs.enableNotifications,
      };

      const { error } = await supabase.from('user_preferences').upsert(row, { onConflict: 'user_id' });
      if (error) console.warn('Supabase savePreferences error:', error);
    } catch (err) {
      console.warn('Supabase savePreferences failed:', err);
    }
  },
};
