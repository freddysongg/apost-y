import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeStoreFromElectron } from './store/sessionStore';
import './index.css';

async function bootstrap(): Promise<void> {
  await initializeStoreFromElectron();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
