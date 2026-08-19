let currentColors = null;
let colorWatchInterval = null;

/**
 * initializet the extension when installed or browser startsWith
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Wal browser] extension installed");
  initializeExtension();
});

/**
 * listening the colrr chagne from content scripts
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
 * install colors and start start wathching
 */

async function initializeExtension() {
  await loadColorsFromStorage();
  //start wathching for color chagne
  startColorWatching();

  //now apply to all tabs
  applyColorsToAllTabs();
}

/**
 * load colors from chrome
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
 * Get default color scheme based on te currne system theme
 */
function getDefaultColors() {
  return {
    background: "#1e1e1e",
    foreground: "#e0e0e0",
    primary: "#0078d4",
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

// start wathcing for color changes every 5 seg
//
function startColorWatching() {
  if (colorWatchInterval) return; //already wathcing

  colorWatchInterval = setInterval(async () => {
    try {
      //in a real implemation this would wathc the pywal config file
      //for now it i ve set it to check if the colors have been chagned in storage
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
  }, 5000); //every 5 secods
}

//stop watching for color chagnes

async function stopColorWatching() {
  if (colorWatchInterval) {
    clearInterval(colorWatchInterval);
    colorWatchInterval = null;
  }
}

//now apply colors to all open tabs
//
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

//finally cleaning up all the shii when the extension is disabled
//
chrome.runtime.onSuspend.addListener(() => {
  stopColorWatching();
});
