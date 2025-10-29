import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setupUiScaffold } from './utils/scaffold'
import { CacheProvider } from '@emotion/react'

// Create the DOM elements necessary for mounting our React app and portal, and styling with Emotion
const { appContainer, portalContainer, emotionCache } = setupUiScaffold()

const root = createRoot(appContainer)

console.log('Helm Content Script: Rendering React application.')
root.render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <App portalTarget={portalContainer} />
    </CacheProvider>
  </React.StrictMode>,
)
