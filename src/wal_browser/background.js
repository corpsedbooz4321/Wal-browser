let currentColors = null;
let colorWatchInterva = null;

/**
 * initializet the extension when installed or browser startsWith
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Wal browser] extension installed");
});

/**
 * listening the colrr chagne*/
