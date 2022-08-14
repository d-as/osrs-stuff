import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/views/app/app.view';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
