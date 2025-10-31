import { onMessage } from './router'

console.log('Helm Background Script: Initializing...')

// Register the main message listener and delegate to our events module.
chrome.runtime.onMessage.addListener((message, sender) => {
  onMessage(message, sender)
})

// Register listeners for the hotkey command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'OPEN_HELM') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UI' })
    }
  }
})
