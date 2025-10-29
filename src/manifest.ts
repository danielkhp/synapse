import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: 'Helm',
  description:
    'Feeling overwhelmed by browser clutter? Helm puts you back in control. A powerful, AI-driven command bar that lets you find, group, and manage tabs, windows, and workspaces with simple, natural language. Stop clicking, start commanding.',
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-32.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  devtools_page: 'devtools.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.tsx'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['tabs'],
  commands: {
    OPEN_HELM: {
      suggested_key: {
        default: 'Ctrl+Shift+L',
        mac: 'MacCtrl+Shift+L',
      },
      description: 'Open the command bar',
    },
  },
})
