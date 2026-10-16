import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import App from './App';
import './i18n';

// Font imports via CSS @import (loaded before render)
import './styles/fonts.css';


ReactDOM.createRoot(document.getElementById('root')!).render(

  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>
);
