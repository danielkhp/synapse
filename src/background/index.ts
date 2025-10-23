chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-command-bar') {
    console.log('Helm invoked!')
  }
})
