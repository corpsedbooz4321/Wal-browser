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
  const css = generateThemecss(colors);

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
funciton generateThemecss(colors) {
  const c = colors;
  return `
:root {
--wal-background: ${c.background};
--wal-forground: ${c.foreground};
--wal-primary: ${c.primary};
--wal-accent: ${c.accent};
--wal-errro: ${c.error};
--wal-warning: ${c.warning};
--wal-success: ${c.success};
}
/*Chromium address bar */
input[type="text"],
input[type="search"],
input[type="url"],
textarea {
background-color: ${c.address_bar.bg} !importand;
color: ${c.address_bar.fg} !important;
border-color: ${c.address_bar.border} !important;
caret-color: ${c.address_bar.fg} !important;
}
input[type="text"]:focus,
input[type="search]:focus,
input[type="url"]:focus,
textarea:focus {
border-color: ${c.primary} !important;
box-shadow: 0 0 0 2px ${c.primary}20 !important;
}
/*Buttons */
button,
input[type="button"],
input[type="submit"],
input[type="reset"] {
background-color: ${c.buttons.bg} !important;
color: ${c.buttons.fg} !imprtant;
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

/* links *
a {
color: ${c.primary} !important;
text-decoration: none;
}


a:visited {
color: ${c.accent} !imprtant;
}

a:hover {
text-decoration: underline;
}

/* Scrollbars (webkit) */
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

::selection {
  background-color: ${c.primary}80 !imprtant;
  color: ${c.foreground} !important;
} 

/* Form elements */

select {
  background-color: ${c.address_bar.bg} !imprtant;
  color: ${c.address_bar.fg} !important;
  border-color: ${c.address_bar.border} !imprtant;
}




}`
}
