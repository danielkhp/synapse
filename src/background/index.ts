import Fuse from 'fuse.js'
import { getLanguageModelSession, resetSessionDestroyTimer } from './aiSession'
import { CommandResult, Message } from '../types'

// Listener for the hotkey command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'OPEN_HELM') {
    console.log('Helm Background: Hotkey pressed')
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }) // get the current active window and tab

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UI' })
    }
  }
})

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message: Message, sender) => {
  console.log('Helm Background: Message received', message)
  if (sender.id !== chrome.runtime.id) return // check that the sender id is this extension's id

  const handleMessage = async () => {
    if (message.type === 'COMMAND_CHANGED') {
      console.log('Helm Background: Command changed', message.payload)
      const { intent, query } = await getIntentFromLLM(message.payload)

      switch (intent) {
        case 'FIND_TAB': {
          console.log('Helm Background: Finding tab', query)
          const results = await findTabs(query)
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              type: 'RESULTS_UPDATED',
              payload: results.slice(0, 10),
            })
          }
          break
        }
        case 'GROUP_TABS': {
          console.log('Helm Background: Grouping tabs', query)
          // TODO: Implement tab grouping logic
          break
        }
        case 'UNKNOWN':
        default:
          console.log('Helm Background: Unknown intent', { intent, query })
          break
      }
    } else if (message.type === 'EXECUTE_ACTION') {
      console.log('Helm Background: Executing action', message.payload)
      const tabId = parseInt(message.payload.id, 10)
      const tab = await chrome.tabs.get(tabId)

      // Switch to the tab
      await chrome.tabs.update(tabId, { active: true })
      // Focus the window the tab is in
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true })
      }
    }
  }

  handleMessage()
})

// Use AI to classify the user's command and call the correct function
async function getIntentFromLLM(text: string): Promise<{ intent: string; query: string }> {
  const currentSession = await getLanguageModelSession()

  if (!currentSession) {
    return { intent: 'FIND_TAB', query: text }
  }

  resetSessionDestroyTimer()

  const prompt = text

  // The JSON schema to constrain the model response
  const schema = {
    type: 'object',
    properties: {
      intent: { type: 'string', enum: ['FIND_TAB', 'GROUP_TABS', 'UNKNOWN'] },
      query: { type: 'string' },
    },
  }

  try {
    const result = await currentSession.prompt(prompt, { responseConstraint: schema })
    const parsed = JSON.parse(result)
    return {
      intent: parsed.intent || 'UNKNOWN',
      query: parsed.query || text,
    }
  } catch (e) {
    console.error('Helm AI: Error during prompt execution.', e)
    return { intent: 'FIND_TAB', query: text }
  }
}

async function findTabs(query: string): Promise<CommandResult[]> {
  const allTabs = await chrome.tabs.query({})

  // Configure Fuse.js for fuzzy searching on tab titles and URLs
  const fuse = new Fuse(allTabs, {
    keys: ['title', 'url'],
    includeScore: true,
    threshold: 0.4,
  })

  const searchResults = fuse.search(query)
  
  // Format the Fuse results into our CommandResult type
  return searchResults.map(({ item: tab }) => ({
    id: String(tab.id),
    type: 'tab',
    title: tab.title || 'Untitled Tab',
    subtitle: tab.url,
    faviconUrl: tab.favIconUrl,
  }))
}
