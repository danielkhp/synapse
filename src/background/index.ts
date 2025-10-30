import Fuse from 'fuse.js'
import { getIntentFromLLM, findBestTabSemantically } from './ai'
import { CommandResult, Message } from '../types'

let aiDebounceTimer: NodeJS.Timeout | null = null
const AI_DEBOUNCE_DELAY_MS = 350 // A good delay for user pauses
let queryAbortController = new AbortController()

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
chrome.runtime.onMessage.addListener(async(message: Message, sender) => {
  if (sender.id !== chrome.runtime.id) return // check that the sender id is this extension's id
  console.log('Helm Background: Message received', message)

  if (message.type === 'COMMAND_CHANGED') {
    const command = message.payload
    if (command.trim() === '') return

    // Instant, fuzzy tab search
    findTabs(command).then((fuseResults) => {
      if (fuseResults.length === 0) return

      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'RESULTS_UPDATED',
          payload: fuseResults.slice(0, 10),
        })
      }
    })

    // Debounced AI pipeline
    if (aiDebounceTimer) clearTimeout(aiDebounceTimer) // Clear any previous debounce
    queryAbortController.abort() // Abort any in-flight AI request
    aiDebounceTimer = setTimeout(() => handleDebouncedLogic(command, sender), AI_DEBOUNCE_DELAY_MS)

  } else if (message.type === 'EXECUTE_ACTION') {
    console.log(`Helm Background: Executing action '${message.payload}'`)
    const tabId = parseInt(message.payload.id, 10)
    const tab = await chrome.tabs.get(tabId)

    // Switch to the tab
    await chrome.tabs.update(tabId, { active: true })
    // Focus the window the tab is in
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true })
    }
  }
})

async function findTabs(query: string): Promise<CommandResult[]> {
  console.log(`Helm background: Fuzzy searching for '${query}'`)
  const allTabs = await chrome.tabs.query({})

  // Configure Fuse.js for fuzzy searching on tab titles and URLs
  const fuse = new Fuse(allTabs, {
    keys: ['title', 'url'],
    includeScore: true,
    threshold: 0.4,
  })

  const searchResults = fuse.search(query)
  console.log(`Helm background: Fuzzy search found ${searchResults.length} results`)

  // Format the Fuse results into our CommandResult type
  return searchResults.map(({ item: tab }) => ({
    id: String(tab.id),
    type: 'tab',
    title: tab.title || 'Untitled Tab',
    subtitle: tab.url,
    faviconUrl: tab.favIconUrl,
  }))
}

async function handleDebouncedLogic(command: string, sender: chrome.runtime.MessageSender) {
  // Create a new controller for this specific, debounced request.
  const signal = (queryAbortController = new AbortController()).signal

  try {
    // 1. --- Re-run the Fuse search with the most recent, debounced query ---
    const currentFuseResults = await findTabs(command)
    if (signal.aborted || currentFuseResults.length > 0) return

    // 2. --- If the Fuse search fails, the AI takes over for intelligent, semantic routing ---
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'AI_SEARCH_STARTED' })
    }
    // Classify the user's intent and extract the query
    const { intent, query } = await getIntentFromLLM(command, signal)
    if (signal.aborted) return

    let finalResults: CommandResult[] = []

    switch (intent) {
      case 'FIND_TAB': {
        const allTabs = await chrome.tabs.query({})
        const semanticMatch = await findBestTabSemantically(query, allTabs, signal)

        if (semanticMatch) {
          // We found a smart result! Create a special result object for it.
          const smartResult: CommandResult = {
            id: `tab-${semanticMatch.id}`,
            type: 'tab',
            // Prepend a sparkle to the title for the UI
            title: `✨ ${semanticMatch.title || 'Untitled Tab'}`,
            // Use the subtitle to explain *why* this result was shown
            subtitle: `Suggested for "${query}"`,
            faviconUrl: semanticMatch.favIconUrl,
          }
          finalResults.push(smartResult)
        }
        break
      }

      case 'GROUP_TABS': {
        console.log(`Helm Background: Grouping tabs '${query}'`)
        // TODO: Implement tab grouping logic
        break
      }

      case 'UNKNOWN':
      default:
        console.log('Helm Background: Unknown intent', { intent, query })
        break
    }

    // Send the results to the content script
    if (sender.tab?.id && !signal.aborted) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'RESULTS_UPDATED',
        payload: finalResults,
      })
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      console.error('Helm AI: Error during AI pipeline', e)
    }
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'AI_SEARCH_FINISHED' })
    }
  }
}
