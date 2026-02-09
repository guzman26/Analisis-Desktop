import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppBoot } from '@/app/boot';
import './styles/global.css';
import './styles/index.css';
import './styles/theme-v2.css';
import './styles/theme-legacy-aliases.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppBoot />
  </React.StrictMode>
);
