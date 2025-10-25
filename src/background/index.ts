import { CommandResult, Message } from '../types';

// Listener for clicking the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_UI" });
  }
});

// Listener for the hotkey command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "OPEN_HELM") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // get the current active window and tab
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_UI" });
    }
  }
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message: Message, sender) => {
  if (sender.id !== chrome.runtime.id) return; // check that the sender id is this extension's id

  if (message.type === 'COMMAND_CHANGED') {
    const mockResults: CommandResult[] = [
      {
        id: 'action-group',
        type: 'action',
        title: `Group tabs matching '${message.payload}'`,
        subtitle: 'This is a mock action',
      },
      {
        id: 'tab-find',
        type: 'tab',
        title: `Find tab: '${message.payload}'`,
        subtitle: 'This is a mock tab result',
      },
    ];

    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'RESULTS_UPDATED', payload: mockResults });
    }
  }
});