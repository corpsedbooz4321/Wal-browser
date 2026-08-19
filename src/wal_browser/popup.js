/**
 * Wal Browser - Popup Script
 * Handles popup UI interactions
 */

let currentColors = null;

/**
 * Initialize popup when DOM is ready
 */
document.addEventListener("DOMContentLoaded", async () => {
  loadColors();
  attachEventListeners();
  checkStatus();
});

/**
 * Load and display colors from background
 */
function loadColors() {
  chrome.runtime.sendMessage({ action: "getColors" }, (response) => {
    if (response && response.colors) {
      currentColors = response.colors;
      displayColors(response.colors);
      updateStatus("Active");
    }
  });
}

/**
 * Display color swatches in the popup
 */
function displayColors(colors) {
  const swatchContainer = document.getElementById("colorSwatches");
  swatchContainer.innerHTML = "";

  const colorMap = [
    { name: "BG", color: colors.background },
    { name: "FG", color: colors.foreground },
    { name: "Pri", color: colors.primary },
    { name: "Acc", color: colors.accent },
    { name: "Err", color: colors.error },
    { name: "Warn", color: colors.warning },
    { name: "Succ", color: colors.success },
    { name: "Tab", color: colors.tabs.active_bg },
  ];

  colorMap.forEach((item) => {
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
  navigator.clipboard.writeText(text).then(() => {
    console.log("[Wal Browser] Copied to clipboard:", text);
    // Optional: Show toast notification
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
 * Check extension status
 */
function checkStatus() {
  chrome.runtime.sendMessage({ action: "getColors" }, (response) => {
    if (chrome.runtime.lastError) {
      updateStatus("Error");
      console.error(
        "[Wal Browser] Status check error:",
        chrome.runtime.lastError,
      );
    } else if (response && response.colors) {
      updateStatus("Active");
    } else {
      updateStatus("Initializing...");
    }
  });
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      refreshBtn.disabled = true;
      try {
        // Send message to background to refresh colors
        chrome.runtime.sendMessage({ action: "startWatching" }, () => {
          loadColors();
          setTimeout(() => {
            refreshBtn.disabled = false;
          }, 500);
        });
      } catch (error) {
        console.error("[Wal Browser] Refresh error:", error);
        refreshBtn.disabled = false;
      }
    });
  }

  // Settings button
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
