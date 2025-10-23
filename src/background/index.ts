chrome.runtime.onInstalled.addListener(() => {
  // Helm extension installed/updated.
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_UI" });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-helm") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_UI" });
    }
  }
});
