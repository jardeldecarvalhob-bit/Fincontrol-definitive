import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Landmark,
  CreditCard as CreditCardIcon,
  Target,
  PieChart,
  Calendar as CalendarIcon,
  Sparkles,
  Settings,
  ShieldCheck,
  X,
  LogOut,
} from 'lucide-react';

const pwaLogo = '/android-chrome-192x192.png';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'credit_cards'
  | 'goals'
  | 'budgets'
  | 'calendar'
  | 'ai_advisor'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userName: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userName,
  onLogout,
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Lançamentos', icon: <ArrowRightLeft className="w-5 h-5" /> },
    { id: 'accounts', label: 'Contas & Bancos', icon: <Landmark className="w-5 h-5" /> },
    { id: 'credit_cards', label: 'Cartões de Crédito', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'goals', label: 'Metas & Caixinhas', icon: <Target className="w-5 h-5" /> },
    { id: 'budgets', label: 'Orçamentos', icon: <PieChart className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendário', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'ai_advisor', label: 'FinControl AI', icon: <Sparkles className="w-5 h-5 text-amber-500" />, badge: 'IA' },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleTabClick = (tab: TabType) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 border border-emerald-500/30">
              <img
                src={pwaLogo}
                alt="FinControl Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/apple-touch-icon.png';
                }}
              />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide block">FinControl</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Pro Edition</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 flex-shrink-0">
              {userName ? userName.substring(0, 2).toUpperCase() : 'FC'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{userName || 'Usuário FinControl'}</p>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Dados Protegidos
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors flex-shrink-0"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">FinControl v2.5 • Offline First</p>
        </div>
      </aside>
    </>
  );
};
