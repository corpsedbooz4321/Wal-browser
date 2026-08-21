let currentColors = null;
let colorWatchInterval = null;

/**
 * Initialize the extension when installed or browser starts
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Wal browser] extension installed");
  initializeExtension();
});

/**
 * Listen for color change from content scripts
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getColors") {
    sendResponse({ colors: currentColors });
  } else if (request.action === "updateColors") {
    updateColors(request.colors);
    sendResponse({ success: true });
  } else if (request.action === "startWatching") {
    startColorWatching();
    sendResponse({ success: true });
  }
});

/**
 * Install colors and start watching
 */

async function initializeExtension() {
  await loadColorsFromStorage();
  //start wathching for color chagne
  startColorWatching();

  //now apply to all tabs
  applyColorsToAllTabs();
}

/**
 * Load colors from Chrome storage
 */

async function loadColorsFromStorage() {
  try {
    const data = await chrome.storage.local.get("walColors");
    if (data.walColors) {
      currentColors = data.walColors;
      console.log("[Wal Browser] Loaded colors from storage:", currentColors);
    } else {
      //trying to fetch from pywal config
      await fetchPywalColors();
    }
  } catch (error) {
    console.error("[Wal Browser]) Error loading colors:", error);
  }
}

async function fetchPywalColors() {
  try {
    //i dont its my problem here but i ve found out that we can't
    //directly read files instead i am using a native messaging or fall back to default colors option
    const defaultColors = getDefaultColors();
    currentColors = defaultColors;
    await saveToChromeStorage(defaultColors);
    console.log("[Wal Browser] Using default colors");
  } catch (error) {
    console.error("[Wal Browser] Error fetchign pywal colors");
  }
}

/**
 * Get default color scheme based on the current system theme
 */
function getDefaultColors() {
  return {
    background: "#120a21",
    foreground: "#120a21",
    primary: "#0078d4",
    accent: "#8ab4f8",
    error: "#ff5252",
    warning: "#ffb300",
    success: "#50fa7b",

    //specific Ui colors
    tabs: {
      active_bg: "#0078d4",
      active_fg: "#ffffff",
      inactive_bg: "#2d2d2d",
      inactive_fg: "#a0a0a0",
      hover_bg: "#3a3a3a",
    },

    address_bar: {
      bg: "#2d2d2d",
      fg: "#e0e0e0",
      border: "#404040",
    },

    buttons: {
      bg: "#0078d4",
      fg: "#ffffff",
      active_bg: "#003a7a",
    },
  };
}

/**
 * save colors to chrome storage
 */

async function saveToChromeStorage(colors) {
  try {
    await chrome.storage.local.set({ walColors: colors });
  } catch (error) {
    console.error("[Wal Browser] Colors updated:", error);
  }
}

// Start watching for color changes every 5 seconds
//
function startColorWatching() {
  if (colorWatchInterval) return; //already wathcing

  colorWatchInterval = setInterval(async () => {
    try {
      //in a real implemation this would wathc the pywal config file
      // For now this checks if the colors have been changed in storage
      const data = await chrome.storage.local.get("walColors");
      if (
        data.walColors &&
        JSON.stringify(data.walColors) !== JSON.stringify(currentColors)
      ) {
        currentColors = data.walColors;
        applyColorsToAllTabs();
        console.log("[Wal Browser] Colors changed, updating all tabs");
      }
    } catch (error) {
      console.error("[Wal Browser] Error watching colors:", error);
    }
  }, 5000); // Every 5 seconds
}

// Stop watching for color changes

async function stopColorWatching() {
  if (colorWatchInterval) {
    clearInterval(colorWatchInterval);
    colorWatchInterval = null;
  }
}

// Apply colors to all open tabs

async function applyColorsToAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "applyColors",
          colors: currentColors,
        })
        .catch(() => {});
    }
  } catch (error) {
    console.error("[Wal Browser] Error applying colors to tabs:", error);
  }
}

// Note: Manifest V3 service workers are suspended/terminated without a cleanup hook.
// Use chrome.runtime.onUninstalled for extension-level cleanup if needed.
