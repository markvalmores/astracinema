import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress THREE.Clock deprecation warning from libraries
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock') && args[0].includes('deprecated')) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <App />
);
