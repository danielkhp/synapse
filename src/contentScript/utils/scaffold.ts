import createCache from "@emotion/cache"

/**
 * Sets up the entire UI scaffold for the Helm extension.
 * This includes creating a Shadow DOM to isolate styles and the necessary
 * containers for the React application to mount and render its portal.
 */
export function setupUiScaffold(): {
  appContainer: HTMLDivElement
  portalContainer: HTMLDivElement
  emotionCache: ReturnType<typeof createCache>
} {
  // Create a host element for our extension and apply necessary styling
  const shadowHost = document.createElement('div')
  shadowHost.id = 'helm-shadow-host'

  shadowHost.style.position = 'fixed'
  shadowHost.style.top = '0'
  shadowHost.style.left = '0'
  shadowHost.style.width = '100vw'
  shadowHost.style.height = '100vh'

  // Ensure it sits on top of everything else on the page
  shadowHost.style.zIndex = '2147483647'

  // The host element should not block clicks to the underlying webpage
  shadowHost.style.pointerEvents = 'none'

  document.body.appendChild(shadowHost)

  // Create a Shadow DOM on the host to isolate our extension's CSS/JS from global/website code
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' })

  // Create the container for our React app *inside* the Shadow DOM
  const appContainer = document.createElement('div')
  appContainer.id = 'helm-app-container'
  shadowRoot.appendChild(appContainer)

  // Create a React portal container that will house our UI *inside* the Shadow DOM
  const portalContainer = document.createElement('div')
  portalContainer.id = 'helm-portal-container'
  shadowRoot.appendChild(portalContainer)

  // Tell Emotion to inject styles into the Shadow DOM
  const emotionCache = createCache({
    key: 'helm-styles',
    container: shadowRoot, 
  });

  console.log('Helm Content Script: UI scaffold setup complete.');

  return { appContainer, portalContainer, emotionCache }
}
