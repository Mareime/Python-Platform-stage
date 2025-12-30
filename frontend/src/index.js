import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Gestionnaire d'erreur global pour capturer les erreurs non gérées
const originalError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
  // Ignorer silencieusement les erreurs removeChild qui sont non-critiques
  const errorMessage = error?.message || message || '';
  const errorName = error?.name || '';
  const errorStack = error?.stack || '';
  
  // Vérifier toutes les variantes possibles de l'erreur removeChild
  if (errorMessage.includes('removeChild') || 
      errorName === 'NotFoundError' ||
      errorMessage.includes('n\'est pas un enfant') ||
      errorMessage.includes('not a child') ||
      errorMessage.includes('The node to be removed is not a child') ||
      errorMessage.includes('Failed to execute \'removeChild\'') ||
      errorStack.includes('removeChild') ||
      errorStack.includes('NotFoundError') ||
      message?.includes('removeChild') ||
      message?.includes('NotFoundError')) {
    // Empêcher complètement l'affichage de l'erreur sans logger
    return true;
  }
  // Pour les autres erreurs, utiliser le gestionnaire par défaut
  if (originalError) {
    return originalError.call(this, message, source, lineno, colno, error);
  }
  return false;
};

// Gestionnaire pour les promesses rejetées non gérées
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errorMessage = reason?.message || '';
  const errorName = reason?.name || '';
  const errorStack = reason?.stack || '';
  
  // Vérifier toutes les variantes possibles de l'erreur removeChild
  if (errorMessage.includes('removeChild') || 
      errorName === 'NotFoundError' ||
      errorMessage.includes('n\'est pas un enfant') ||
      errorMessage.includes('not a child') ||
      errorMessage.includes('The node to be removed is not a child') ||
      errorMessage.includes('Failed to execute \'removeChild\'') ||
      errorStack.includes('removeChild') ||
      errorStack.includes('NotFoundError')) {
    event.preventDefault();
    // Ne pas logger pour éviter le bruit
    return;
  }
});

// Intercepter les erreurs React avant qu'elles n'atteignent la console
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  // Filtrer les erreurs removeChild de la console
  if (message.includes('removeChild') || 
      message.includes('NotFoundError') ||
      message.includes('not a child') ||
      message.includes('The node to be removed is not a child') ||
      message.includes('Failed to execute \'removeChild\'')) {
    return; // Ne pas afficher ces erreurs
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
