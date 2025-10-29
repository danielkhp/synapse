import Fuse from 'fuse.js'
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
      const query = message.payload
      const allTabs = await chrome.tabs.query({})

      // Configure Fuse.js for fuzzy searching on tab titles and URLs
      const fuse = new Fuse(allTabs, {
        keys: ['title', 'url'],
        includeScore: true,
        threshold: 0.4,
      })

      const searchResults = fuse.search(query)

      // Format the Fuse results into our CommandResult type
      const formattedResults: CommandResult[] = searchResults.map(({ item: tab }) => ({
        id: String(tab.id), // Ensure ID is a string
        type: 'tab',
        title: tab.title || 'Untitled Tab',
        subtitle: tab.url,
        faviconUrl: tab.favIconUrl,
      }))

      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'RESULTS_UPDATED',
          payload: formattedResults.slice(0, 10),
        }) // Send top 10 results
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
  // Return true to indicate you will send a response asynchronously.
  // This is crucial because our handleMessage function is now async.
  return true
})
