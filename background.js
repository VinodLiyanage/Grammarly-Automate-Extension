chrome.action.disable();

chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onActivated.addListener( async info => {
        const tab = await chrome.tabs.get(info.tabId);
        const isGrammarly = tab.url.startsWith('*://app.grammarly.com/*');
        isGrammarly 
          ? chrome.action.enable(tab.tabId) 
          : chrome.action.disable(tab.tabId);
    });
  });