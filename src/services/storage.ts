import { Transaction, Account, CreditCard, Category, Goal, Budget, UserPreferences } from '../types';
import {
  defaultAccounts,
  defaultBudgets,
  defaultCategories,
  defaultCreditCards,
  defaultGoals,
  defaultPreferences,
  defaultTransactions,
} from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'fincontrol_transactions_v2',
  ACCOUNTS: 'fincontrol_accounts_v2',
  CREDIT_CARDS: 'fincontrol_credit_cards_v2',
  CATEGORIES: 'fincontrol_categories_v1',
  GOALS: 'fincontrol_goals_v2',
  BUDGETS: 'fincontrol_budgets_v1',
  PREFERENCES: 'fincontrol_preferences_v1',
};

export const storageService = {
  getTransactions(): Transaction[] {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions));
      return defaultTransactions;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultTransactions;
    }
  },

  saveTransactions(txs: Transaction[]) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  getAccounts(): Account[] {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    if (!data) {
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultAccounts;
    }
  },

  saveAccounts(accounts: Account[]) {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getCreditCards(): CreditCard[] {
    const data = localStorage.getItem(KEYS.CREDIT_CARDS);
    if (!data) {
      localStorage.setItem(KEYS.CREDIT_CARDS, JSON.stringify(defaultCreditCards));
      return defaultCreditCards;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultCreditCards;
    }
  },

  saveCreditCards(cards: CreditCard[]) {
    localStorage.setItem(KEYS.CREDIT_CARDS, JSON.stringify(cards));
  },

  getCategories(): Category[] {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultCategories;
    }
  },

  saveCategories(cats: Category[]) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
  },

  getGoals(): Goal[] {
    const data = localStorage.getItem(KEYS.GOALS);
    if (!data) {
      localStorage.setItem(KEYS.GOALS, JSON.stringify(defaultGoals));
      return defaultGoals;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultGoals;
    }
  },

  saveGoals(goals: Goal[]) {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  getBudgets(): Budget[] {
    const data = localStorage.getItem(KEYS.BUDGETS);
    if (!data) {
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(defaultBudgets));
      return defaultBudgets;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultBudgets;
    }
  },

  saveBudgets(budgets: Budget[]) {
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getPreferences(): UserPreferences {
    const data = localStorage.getItem(KEYS.PREFERENCES);
    if (!data) {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(defaultPreferences));
      return defaultPreferences;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultPreferences;
    }
  },

  savePreferences(prefs: UserPreferences) {
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  },

  resetAllData() {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions));
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
    localStorage.setItem(KEYS.CREDIT_CARDS, JSON.stringify(defaultCreditCards));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    localStorage.setItem(KEYS.GOALS, JSON.stringify(defaultGoals));
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(defaultBudgets));
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(defaultPreferences));
  },

  exportBackupJson(): string {
    const backup = {
      transactions: this.getTransactions(),
      accounts: this.getAccounts(),
      creditCards: this.getCreditCards(),
      categories: this.getCategories(),
      goals: this.getGoals(),
      budgets: this.getBudgets(),
      preferences: this.getPreferences(),
      exportDate: new Date().toISOString(),
      app: 'FinControl',
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.accounts) this.saveAccounts(data.accounts);
      if (data.creditCards) this.saveCreditCards(data.creditCards);
      if (data.categories) this.saveCategories(data.categories);
      if (data.goals) this.saveGoals(data.goals);
      if (data.budgets) this.saveBudgets(data.budgets);
      if (data.preferences) this.savePreferences(data.preferences);
      return true;
    } catch {
      return false;
    }
  }
};
