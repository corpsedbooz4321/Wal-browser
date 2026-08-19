/**
 * Wal Browser - Popup Script
 * Handles popup UI interactions
 */

let currentColors = null;

/**
 * Initialize popup when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  loadColors();
  attachEventListeners();
});

/**
 * Load and display colors from background
 */
function loadColors() {
  chrome.runtime.sendMessage({ action: "getColors" }, (response) => {
    if (chrome.runtime.lastError) {
      updateStatus("Error");
      console.error(
        "[Wal Browser] Error fetching colors:",
        chrome.runtime.lastError.message,
      );
      return;
    }

    if (response && response.colors) {
      currentColors = response.colors;
      displayColors(response.colors);
      updateStatus("Active");
    } else {
      updateStatus("Initializing...");
    }
  });
}

/**
 * Display color swatches in the popup
 */
function displayColors(colors) {
  // Support both ID variations to prevent null reference errors
  const swatchContainer =
    document.getElementById("colorSwatches") ||
    document.getElementById("colorPallete") ||
    document.getElementById("colorPalette");

  if (!swatchContainer) {
    console.error(
      "[Wal Browser] Could not find swatch container element in DOM",
    );
    return;
  }

  swatchContainer.innerHTML = "";

  const colorMap = [
    { name: "BG", color: colors.background },
    { name: "FG", color: colors.foreground },
    { name: "Pri", color: colors.primary },
    { name: "Acc", color: colors.accent },
    { name: "Err", color: colors.error },
    { name: "Warn", color: colors.warning },
    { name: "Succ", color: colors.success },
    { name: "Tab", color: colors.tabs?.active_bg },
  ];

  colorMap.forEach((item) => {
    if (!item.color) return;

    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = item.color;
    swatch.dataset.name = item.name;
    swatch.title = `${item.name}: ${item.color}`;
    swatch.addEventListener("click", () => copyToClipboard(item.color));
    swatchContainer.appendChild(swatch);
  });
}

/**
 * Copy color to clipboard
 */
function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("[Wal Browser] Copied to clipboard:", text);
    })
    .catch((err) => {
      console.error("[Wal Browser] Copy failed:", err);
    });
}

/**
 * Update status display
 */
function updateStatus(status) {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = status;
  }
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.disabled = true;
      chrome.runtime.sendMessage({ action: "startWatching" }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "[Wal Browser] Refresh failed:",
            chrome.runtime.lastError.message,
          );
        }
        loadColors();
        setTimeout(() => {
          refreshBtn.disabled = false;
        }, 500);
      });
    });
  }

  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

/**
 * Listen for messages from background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "colorsUpdated") {
    loadColors();
    sendResponse({ success: true });
  }
});
