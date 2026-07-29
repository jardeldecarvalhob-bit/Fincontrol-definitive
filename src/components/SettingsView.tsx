import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  User,
  ShieldCheck,
  Check,
  Type,
  Maximize2,
  Eye,
  Sparkles,
  Palette,
  Sun,
  Moon,
  Zap,
  Monitor,
} from 'lucide-react';
import { UserPreferences, AppTheme, AccentColor, FontFamily, FontSize } from '../types';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  const [nameInput, setNameInput] = useState(preferences.userName);
  const [emailInput, setEmailInput] = useState(preferences.userEmail);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({ userName: nameInput, userEmail: emailInput });
    setImportStatus('Perfil atualizado com sucesso!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportBackup(content);
        if (ok) {
          setImportStatus('Backup importado com sucesso!');
        } else {
          setImportStatus('Erro ao importar arquivo. Verifique se o formato JSON é válido.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const themesList: { id: AppTheme; name: string; desc: string; icon: React.ReactNode; bgPreview: string }[] = [
    {
      id: 'light',
      name: 'Tema Claro',
      desc: 'Interface limpa e de alto contraste',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      bgPreview: 'bg-slate-100 border-slate-300',
    },
    {
      id: 'dark',
      name: 'Tema Escuro',
      desc: 'Tons escuros para conforto visual noturno',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
      bgPreview: 'bg-slate-900 border-slate-700',
    },
    {
      id: 'amoled',
      name: 'Tema AMOLED',
      desc: 'Preto puro (#000000) ideal para telas OLED',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      bgPreview: 'bg-black border-neutral-800',
    },
    {
      id: 'modern',
      name: 'Tema Moderno',
      desc: 'Design futurista em tons azul e teal profundo',
      icon: <Monitor className="w-5 h-5 text-cyan-400" />,
      bgPreview: 'bg-[#0b1120] border-[#1e2d4a]',
    },
  ];

  const accentColorsList: { id: AccentColor; name: string; colorHex: string; badgeBg: string }[] = [
    { id: 'emerald', name: 'Esmeralda (Padrão)', colorHex: '#10b981', badgeBg: 'bg-emerald-500' },
    { id: 'ocean', name: 'Oceano', colorHex: '#0284c7', badgeBg: 'bg-sky-500' },
    { id: 'purple', name: 'Ametista', colorHex: '#9333ea', badgeBg: 'bg-purple-600' },
    { id: 'amber', name: 'Ouro Quente', colorHex: '#d97706', badgeBg: 'bg-amber-500' },
    { id: 'rose', name: 'Rubi', colorHex: '#e11d48', badgeBg: 'bg-rose-500' },
  ];

  const fontFamiliesList: { id: FontFamily; name: string; desc: string; previewClass: string }[] = [
    { id: 'system', name: 'Fonte padrão do sistema', desc: 'Tipografia nativa do seu dispositivo', previewClass: 'font-sans' },
    { id: 'inter', name: 'Fonte moderna', desc: 'Plus Jakarta Sans - Limpa e legível', previewClass: "font-['Plus_Jakarta_Sans',sans-serif]" },
    { id: 'serif', name: 'Fonte elegante', desc: 'Playfair Display - Estilo refinado e clássico', previewClass: "font-['Playfair_Display',serif]" },
    { id: 'accessible', name: 'Fonte de alta legibilidade', desc: 'Lexend - Otimizada para facilidade de leitura', previewClass: "font-['Lexend',sans-serif]" },
  ];

  const fontSizesList: { id: FontSize; name: string; sizeLabel: string }[] = [
    { id: 'small', name: 'Pequena', sizeLabel: '14px' },
    { id: 'medium', name: 'Média', sizeLabel: '16px' },
    { id: 'large', name: 'Grande', sizeLabel: '18px' },
    { id: 'xlarge', name: 'Muito grande', sizeLabel: '20px' },
  ];

  const activeTheme = preferences.theme || 'light';
  const activeAccent = preferences.accentColor || 'emerald';
  const activeFont = preferences.fontFamily || 'inter';
  const activeFontSize = preferences.fontSize || 'medium';

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações &amp; Dados</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize temas visuais, esquemas de cores, tipografia, perfil do usuário e backups
        </p>
      </div>

      {importStatus && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> {importStatus}
        </div>
      )}

      {/* 1. Aparência e Personalização */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Aparência e Personalização
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Escolha entre temas visuais, esquemas de cores, estilos de fontes e tamanhos para todo o aplicativo
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Sincronizado
          </span>
        </div>

        {/* 1.1 Escolha de Temas do Aplicativo */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-600" /> Tema de Cores do Aplicativo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {themesList.map((tm) => {
              const isSelected = activeTheme === tm.id;
              return (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ theme: tm.id })}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{tm.icon}</div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{tm.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight">{tm.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.2 Esquema de Cores de Destaque */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Cor de Destaque (Accent)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            {accentColorsList.map((ac) => (
              <button
                key={ac.id}
                type="button"
                onClick={() => onUpdatePreferences({ accentColor: ac.id })}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  activeAccent === ac.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-slate-800 font-bold ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${ac.badgeBg} flex-shrink-0 shadow-xs`} />
                <span className="truncate">{ac.name}</span>
                {activeAccent === ac.id && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* 1.3 Escolha de Fonte e Tamanho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Estilo de Fonte */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-600" /> Estilo da Fonte
            </label>
            <div className="space-y-2">
              {fontFamiliesList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ fontFamily: f.id })}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activeFont === f.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <span className={`block text-xs ${f.previewClass}`}>{f.name}</span>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{f.desc}</span>
                  </div>
                  {activeFont === f.id && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho da Fonte */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" /> Tamanho do Texto
            </label>
            <div className="space-y-2">
              {fontSizesList.map((fs) => (
                <button
                  key={fs.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ fontSize: fs.id })}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activeFontSize === fs.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs">{fs.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{fs.sizeLabel}</span>
                    {activeFontSize === fs.id && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1.4 Prévia Visual do Tema */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-600" /> Prévia Visual do Tema Aplicado
          </label>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">FinControl - Visão Geral</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Exemplo de card adaptado com o tema ativo</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">Ativo</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Saldo em Contas</span>
                <span className="text-base font-black text-slate-900 dark:text-white">R$ 18.270,50</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Faturas do Mês</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">R$ 1.840,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Profile Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" /> Perfil do Usuário
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome Completo</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-mail</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            Salvar Alterações do Perfil
          </button>
        </form>
      </div>

      {/* 3. Preferências Gerais */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" /> Moeda e Notificações
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Moeda Principal</span>
              <span className="text-slate-400">Moeda padrão exibida nas telas</span>
            </div>
            <select
              value={preferences.currency}
              onChange={(e) => onUpdatePreferences({ currency: e.target.value as any })}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
            >
              <option value="BRL">BRL (R$ - Real)</option>
              <option value="USD">USD ($ - Dólar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Backup & Storage */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Backup Offline &amp; Sincronização
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Seus dados são salvos localmente no seu dispositivo (Offline-First). Você pode exportar um arquivo JSON de backup a qualquer momento ou restaurá-lo.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <button
            onClick={onExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Exportar Backup JSON
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer transition-all border border-slate-300 dark:border-slate-700">
            <Upload className="w-4 h-4" /> Restaurar Backup
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja restaurar os dados de demonstração originais? Essa ação não pode ser desfeita.')) {
                onResetData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition-all ml-auto"
          >
            <RefreshCw className="w-4 h-4" /> Resetar para Dados Iniciais
          </button>
        </div>
      </div>
    </div>
  );
};

