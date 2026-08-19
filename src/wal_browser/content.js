// content.js - pywal-injector content script

console.log("[pywal-injector] Content script initialized.");

// Listening for messages from popup or background scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "ready" });
  }
});
