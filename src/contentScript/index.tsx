import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import css from './App.css?raw';

const rootElement = document.createElement('div');
rootElement.id = 'helm-root';
document.body.appendChild(rootElement);

// Create a shadow DOM to isolate the extension's css and js from global/website rules
const shadowRoot = rootElement.attachShadow({ mode: 'open' });

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);
shadowRoot.adoptedStyleSheets = [sheet];

const appContainer = document.createElement('div');
shadowRoot.appendChild(appContainer);

const root = ReactDOM.createRoot(appContainer);
root.render(<App />);