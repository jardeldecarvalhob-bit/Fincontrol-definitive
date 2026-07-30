-- =====================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS SUPABASE PARA O FINCONTROL
-- Cole todo este código no SQL Editor do seu Dashboard no Supabase
-- =====================================================================

-- 1. Tabela de Contas Bancárias / Carteiras (accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    initial_balance NUMERIC NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    bank_name TEXT,
    account_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Cartões de Crédito (credit_cards)
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "limit" NUMERIC NOT NULL DEFAULT 0,
    current_invoice NUMERIC DEFAULT 0,
    closing_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    color TEXT NOT NULL,
    brand TEXT NOT NULL,
    account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Transações / Lançamentos (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    target_account_id TEXT,
    credit_card_id TEXT,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_period TEXT,
    installment JSONB,
    attachment_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Metas Financeiras (goals)
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    deadline TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Orçamentos por Categoria (budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL,
    period TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Preferências e Configurações de Usuário (user_preferences)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'BRL',
    theme TEXT DEFAULT 'light',
    accent_color TEXT DEFAULT 'emerald',
    font_family TEXT DEFAULT 'inter',
    font_size TEXT DEFAULT 'medium',
    hide_balances BOOLEAN DEFAULT FALSE,
    user_name TEXT,
    user_email TEXT,
    enable_notifications BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- REGRA DE SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
-- Garante que cada usuário só acesse e modifique os seus próprios dados
-- =====================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para public.accounts
CREATE POLICY "Usuários acessam apenas suas contas" ON public.accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para public.credit_cards
CREATE POLICY "Usuários acessam apenas seus cartões" ON public.credit_cards
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para public.transactions
CREATE POLICY "Usuários acessam apenas suas transações" ON public.transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para public.goals
CREATE POLICY "Usuários acessam apenas suas metas" ON public.goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para public.budgets
CREATE POLICY "Usuários acessam apenas seus orçamentos" ON public.budgets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para public.user_preferences
CREATE POLICY "Usuários acessam apenas suas preferências" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
