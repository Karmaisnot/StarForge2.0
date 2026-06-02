import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/index.js';
import './styles/tokens.css';
import './styles/app.css';
import App from './App.jsx';
import { PreferencesProvider } from './context/PreferencesContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <PreferencesProvider>
        <StoreProvider>
          <ToastProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </ToastProvider>
        </StoreProvider>
      </PreferencesProvider>
    </Suspense>
  </StrictMode>,
);
