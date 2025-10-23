import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.createElement('div');
rootElement.id = 'helm-root';
document.body.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_UI') {
    if (rootElement.style.display === 'none') {
      rootElement.style.display = 'block';
    } else {
      rootElement.style.display = 'none';
    }
  }
});

// Initially hide the element
rootElement.style.display = 'none';
