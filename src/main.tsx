
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Console welcome message
console.log(
  "%cTeleLocator Admin Dashboard",
  "color: #8B5CF6; font-size: 24px; font-weight: bold;"
);
console.log(
  "%cMulti-user role system enabled. Available roles: admin, manager, user",
  "color: #4B5563; font-size: 14px;"
);

createRoot(document.getElementById("root")!).render(<App />);
