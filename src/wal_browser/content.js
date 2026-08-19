let appliedColors = null;

function init() {
  console.log("[Wal Browser] Content script initialized");

  // Request current colors from background
  chrome.runtime.sendMessage({ action: "getColors" }, (response) => {
    if (response && response.colors) {
      applyColors(response.colors);
    }
  });

  // Listen for color updates from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applyColors") {
      applyColors(request.colors);
      sendResponse({ success: true });
    }
  });
}

function applyColors(colors) {
  if (JSON.stringify(colors) === JSON.stringify(appliedColors)) {
    return; // Colors already applied
  }

  appliedColors = colors;

  // Generate css from colors
  const css = generateThemeCSS(colors);

  //injecting
  let styleEl = document.getElementById("wal-browser-theme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "wal-browser-theme";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = css;
  console.log("[Wal Browser] Colors applied");
}

//generate css for the theme
