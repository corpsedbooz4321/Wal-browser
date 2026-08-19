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

  // Generate CSS from colors
  const css = generateThemeCSS(colors);

  // Inject or update the style element
  let styleEl = document.getElementById("wal-browser-theme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "wal-browser-theme";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = css;
  console.log("[Wal Browser] Colors applied");
}

function generateThemeCSS(colors) {
  const c = colors;

  return `
    /* Wal Browser Theme - Generated CSS */
    
    /* Root color variables */
    :root {
      --wal-background: ${c.background};
      --wal-foreground: ${c.foreground};
      --wal-primary: ${c.primary};
      --wal-accent: ${c.accent};
      --wal-error: ${c.error};
      --wal-warning: ${c.warning};
      --wal-success: ${c.success};
    }
    
    /* Browser UI Elements */
    
    /* Chromium address bar */
    input[type="text"],
    input[type="search"],
    input[type="url"],
    textarea {
      background-color: ${c.address_bar.bg} !important;
      color: ${c.address_bar.fg} !important;
      border-color: ${c.address_bar.border} !important;
      caret-color: ${c.address_bar.fg} !important;
    }
    
    input[type="text"]:focus,
    input[type="search"]:focus,
    input[type="url"]:focus,
    textarea:focus {
      border-color: ${c.primary} !important;
      box-shadow: 0 0 0 2px ${c.primary}20 !important;
    }
    
    /* Buttons */
    button,
    input[type="button"],
    input[type="submit"],
    input[type="reset"] {
      background-color: ${c.buttons.bg} !important;
      color: ${c.buttons.fg} !important;
      border: 1px solid ${c.buttons.bg} !important;
      cursor: pointer;
    }
    
    button:hover,
    input[type="button"]:hover,
    input[type="submit"]:hover,
    input[type="reset"]:hover {
      background-color: ${c.buttons.hover_bg} !important;
    }
    
    button:active,
    input[type="button"]:active,
    input[type="submit"]:active,
    input[type="reset"]:active {
      background-color: ${c.buttons.active_bg} !important;
    }
    
    /* Links */
    a {
      color: ${c.primary} !important;
      text-decoration: none;
    }
    
    a:visited {
      color: ${c.accent} !important;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Scrollbars (Webkit browsers) */
    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${c.background};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${c.primary};
      border-radius: 6px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${c.accent};
    }
    
    /* Selection highlight */
    ::selection {
      background-color: ${c.primary}80 !important;
      color: ${c.foreground} !important;
    }
    
    /* Focus outline */
    *:focus-visible {
      outline-color: ${c.primary} !important;
    }
    
    /* Form elements */
    select {
      background-color: ${c.address_bar.bg} !important;
      color: ${c.address_bar.fg} !important;
      border-color: ${c.address_bar.border} !important;
    }
    
    input[type="checkbox"],
    input[type="radio"] {
      accent-color: ${c.primary} !important;
    }
    
    /* Disabled elements */
    input:disabled,
    button:disabled,
    select:disabled,
    textarea:disabled {
      opacity: 0.5;
    }
    
    /* Browser search suggestions (Chromium) */
    .suggestions-popup,
    .suggestion-popup {
      background-color: ${c.background} !important;
      color: ${c.foreground} !important;
      border-color: ${c.address_bar.border} !important;
    }
    
    .suggestion-item:hover {
      background-color: ${c.address_bar.bg} !important;
    }
  `;
}

function applyColors(colors) {
  if (JSON.stringify(colors) === JSON.stringigy(appliedColors)) {
    return;
  }
}
