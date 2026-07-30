import React from 'react';
import { Eye, EyeOff, Plus, Wifi, Sun, Moon, Bell, Menu } from 'lucide-react';
import { UserPreferences } from '../types';

interface NavbarProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onOpenNewTransaction: () => void;
  activeTabTitle: string;
  onToggleMobileMenu: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  preferences,
  onUpdatePreferences,
  onOpenNewTransaction,
  activeTabTitle,
  onToggleMobileMenu,
  pendingCount,
}) => {
  const toggleHideBalances = () => {
    onUpdatePreferences({ hideBalances: !preferences.hideBalances });
  };

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    onUpdatePreferences({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {activeTabTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Gestão Financeira Pessoal &amp; Empresarial Leve
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline/Online Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium">
          <Wifi className="w-3.5 h-3.5" />
          <span>Sincronizado</span>
        </div>

        {/* Hide/Show Balances Toggle */}
        <button
          onClick={toggleHideBalances}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
          title={preferences.hideBalances ? "Mostrar valores" : "Ocultar valores"}
        >
          {preferences.hideBalances ? (
            <EyeOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Alternar Tema Claro/Escuro"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Notificações & Vencimentos"
          >
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Lançamento</span>
        </button>
      </div>
    </header>
  );
};
