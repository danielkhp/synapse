import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setupUiScaffold } from './utils/scaffold'

const { appContainer, portalContainer } = setupUiScaffold()

const root = createRoot(appContainer)

root.render(
  <React.StrictMode>
    <App portalTarget={portalContainer} />
  </React.StrictMode>,
)
