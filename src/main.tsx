import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker with automatic updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do FinControl disponível.');
  },
  onOfflineReady() {
    console.log('FinControl pronto para funcionamento offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
