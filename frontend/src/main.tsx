import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './Context/UserContext.tsx';
import { DocumentProvider } from './Context/DocumentContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <DocumentProvider>
        <App />
      </DocumentProvider>
    </UserProvider>
  </StrictMode>
)
