import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

interface LoginViewProps {
  onLogin: (userName: string, userEmail: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Digite novamente.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const data = await supabaseService.signUp(email.trim(), password, name.trim());
        const user = data.user;
        const displayName = name.trim();
        
        if (data.session) {
          onLogin(displayName, email.trim());
        } else if (user) {
          setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail ou faça login para continuar.');
          setIsRegister(false);
        } else {
          onLogin(displayName, email.trim());
        }
      } else {
        const data = await supabaseService.signIn(email.trim(), password);
        const user = data.user;
        const displayName = user?.user_metadata?.full_name || name.trim() || email.split('@')[0] || 'Usuário';
        onLogin(displayName, email.trim());
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      let msg = err?.message || 'Ocorreu um erro ao processar sua solicitação.';
      
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos. Por favor, verifique os dados digitados.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado. Tente fazer login ou escolha outro e-mail.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve conter pelo menos 6 caracteres.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'E-mail ainda não confirmado. Por favor, verifique sua caixa de entrada.';
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-700/60 shadow-xl mb-1">
            <img
              src="/logo.png"
              alt="FinControl Logo"
              className="w-20 h-20 object-contain rounded-xl"
              draggable={false}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">FinControl</h1>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Crie sua conta para sincronizar suas finanças no Supabase' : 'Acesse seu painel financeiro sincronizado no Supabase'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/50 text-xs font-bold">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsRegister(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              !isRegister
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsRegister(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              isRegister
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required={isRegister}
                  placeholder="Seu nome"
                  value={name}
                  disabled={isLoading}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Confirmar Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required={isRegister}
                  placeholder="••••••••"
                  value={confirmPassword}
                  disabled={isLoading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Concluir Cadastro e Entrar' : 'Acessar FinControl'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Banco Supabase Nuvem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autenticação Segura</span>
          </div>
        </div>
      </div>
    </div>
  );
};
