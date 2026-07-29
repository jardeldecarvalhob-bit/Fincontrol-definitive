export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'paid' | 'pending';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'boleto' | 'other';
export type AccountType = 'checking' | 'savings' | 'investment' | 'cash' | 'credit' | 'other';

export interface InstallmentInfo {
  current: number;
  total: number;
  parentId?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  targetAccountId?: string; // Para transferências
  creditCardId?: string;    // Se for compra no cartão de crédito
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrencePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installment?: InstallmentInfo;
  attachmentName?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  color: string;
  icon: string; // Lucide icon name
  bankName?: string;
  accountNumber?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  currentInvoice: number;
  closingDay: number; // Dia do mês ex: 10
  dueDay: number;     // Dia do mês ex: 17
  color: string;
  brand: 'mastercard' | 'visa' | 'elo' | 'amex' | 'other';
  accountId: string; // Conta vinculada para débito automático de fatura
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  budgetLimit?: number;
  parentId?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  period: 'monthly' | 'yearly';
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  history?: {
    id: string;
    date: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    note?: string;
  }[];
}

export type AppTheme = 'light' | 'dark' | 'amoled' | 'modern';
export type AccentColor = 'emerald' | 'ocean' | 'purple' | 'amber' | 'rose';
export type FontFamily = 'system' | 'inter' | 'serif' | 'accessible';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface UserPreferences {
  currency: 'BRL' | 'USD' | 'EUR';
  theme: AppTheme;
  accentColor?: AccentColor;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  hideBalances: boolean;
  userName: string;
  userEmail: string;
  enableNotifications: boolean;
}

export interface FinancialMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  predictedBalance: number;
  creditCardDebt: number;
  savingsRate: number;
  pendingExpensesCount: number;
  overBudgetCount: number;
}
