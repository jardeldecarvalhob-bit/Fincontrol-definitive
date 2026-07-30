import { Account, CreditCard, Category, Transaction, Goal, Budget, UserPreferences } from '../types';

export const defaultCategories: Category[] = [
  // Receitas
  { id: 'cat-inc-1', name: 'Salário / Prolabore', type: 'income', color: '#10b981', icon: 'Briefcase' },
  { id: 'cat-inc-2', name: 'Investimentos / Dividendos', type: 'income', color: '#059669', icon: 'TrendingUp' },
  { id: 'cat-inc-3', name: 'Freelance / Serviços', type: 'income', color: '#34d399', icon: 'Laptop' },
  { id: 'cat-inc-4', name: 'Outras Receitas', type: 'income', color: '#6ee7b7', icon: 'PlusCircle' },

  // Despesas
  { id: 'cat-exp-1', name: 'Alimentação & Mercado', type: 'expense', color: '#ef4444', icon: 'ShoppingCart', budgetLimit: 1800 },
  { id: 'cat-exp-2', name: 'Moradia & Contas', type: 'expense', color: '#f97316', icon: 'Home', budgetLimit: 2500 },
  { id: 'cat-exp-3', name: 'Transporte & Combustível', type: 'expense', color: '#eab308', icon: 'Car', budgetLimit: 800 },
  { id: 'cat-exp-4', name: 'Lazer & Restaurantes', type: 'expense', color: '#8b5cf6', icon: 'Utensils', budgetLimit: 600 },
  { id: 'cat-exp-5', name: 'Saúde & Farmácia', type: 'expense', color: '#ec4899', icon: 'HeartPulse', budgetLimit: 500 },
  { id: 'cat-exp-6', name: 'Educação & Cursos', type: 'expense', color: '#3b82f6', icon: 'GraduationCap', budgetLimit: 400 },
  { id: 'cat-exp-7', name: 'Assinaturas & Serviços', type: 'expense', color: '#06b6d4', icon: 'Tv', budgetLimit: 300 },
  { id: 'cat-exp-8', name: 'Compras & Vestuário', type: 'expense', color: '#a855f7', icon: 'ShoppingBag', budgetLimit: 700 },
  { id: 'cat-exp-9', name: 'Transferência / Ajuste', type: 'expense', color: '#64748b', icon: 'ArrowRightLeft' },
];

export const defaultAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Conta Principal',
    type: 'checking',
    balance: 0,
    initialBalance: 0,
    color: '#820ad1',
    icon: 'Building2',
    bankName: 'Banco Principal',
  },
];

export const defaultCreditCards: CreditCard[] = [];

export const defaultTransactions: Transaction[] = [];

export const defaultGoals: Goal[] = [];

export const defaultBudgets: Budget[] = [
  { id: 'b-1', categoryId: 'cat-exp-1', limitAmount: 1800.00, period: 'monthly' },
  { id: 'b-2', categoryId: 'cat-exp-2', limitAmount: 2500.00, period: 'monthly' },
  { id: 'b-3', categoryId: 'cat-exp-3', limitAmount: 800.00, period: 'monthly' },
  { id: 'b-4', categoryId: 'cat-exp-4', limitAmount: 600.00, period: 'monthly' },
  { id: 'b-5', categoryId: 'cat-exp-5', limitAmount: 500.00, period: 'monthly' },
  { id: 'b-6', categoryId: 'cat-exp-6', limitAmount: 400.00, period: 'monthly' },
  { id: 'b-7', categoryId: 'cat-exp-7', limitAmount: 300.00, period: 'monthly' },
  { id: 'b-8', categoryId: 'cat-exp-8', limitAmount: 700.00, period: 'monthly' },
];

export const defaultPreferences: UserPreferences = {
  currency: 'BRL',
  theme: 'light',
  accentColor: 'emerald',
  fontFamily: 'inter',
  fontSize: 'medium',
  hideBalances: false,
  userName: 'Jardel de Carvalho',
  userEmail: 'jardeldecarvalhob@gmail.com',
  enableNotifications: true,
};
