# Wal Browser

Wal Browser is a Chromium Manifest V3 extension that injects a pywal-inspired color theme into web pages. It keeps the active palette in `chrome.storage.local`, applies the palette through a content script, and checks for stored color changes every five seconds.

## Current status

This repository is an early prototype. The extension currently uses a built-in fallback palette when no stored colors exist. The Python bridge in `py_bridge/colors.py` is empty, so the extension does not yet read colors directly from pywal or communicate with a native messaging host.

## Features

- Applies colors to pages matching `<all_urls>`.
- Themes common form controls, buttons, links, scrollbars, selection, and focus outlines.
- Stores the active palette in Chrome local storage.
- Applies the current palette to open tabs when the extension starts or colors change.
- Shows the current palette in the extension popup; click a swatch to copy its value.
- Falls back to a default dark palette if no stored palette is available.

## Requirements

- Google Chrome, Chromium, or another Chromium-based browser with Manifest V3 support.
- No Python dependency is required for the current prototype.

## Installation

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome or Chromium.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository root, the directory containing `manifest.json`.
6. Pin **Wal Browser** to the toolbar and open the popup to inspect the active palette.

After changing extension files, return to the extensions page and select **Reload** for Wal Browser. Reload affected web pages as well so their content scripts are initialized again.

## How it works

```text
Browser startup/install
				|
				v
background.js loads chrome.storage.local
				|
				+--> stored palette, or built-in fallback palette
				|
				v
content.js requests the palette and injects generated CSS
				|
				v
background.js polls storage every 5 seconds and updates open tabs
```

- `manifest.json` declares the extension, permissions, popup, service worker, and content script.
- `src/wal_browser/background.js` owns palette storage, polling, and tab updates.
- `src/wal_browser/content.js` generates CSS and injects it into matching pages.
- `src/wal_browser/popup.js` loads palette values, renders swatches, and handles refresh/copy actions.
- `src/wal_browser/ui/popup.html` and `src/wal_browser/ui/popup.css` define the popup interface.
- `py_bridge/colors.py` is reserved for future pywal integration.

## Palette format

The background service worker expects a palette with these top-level values:

```json
{
	"background": "#1e1e1e",
	"foreground": "#e0e0e0",
	"primary": "#0078d4",
	"accent": "#8ab4f8",
	"error": "#ff5252",
	"warning": "#ffb300",
	"success": "#50fa7b",
	"tabs": {
		"active_bg": "#0078d4"
	},
	"address_bar": {
		"bg": "#2d2d2d",
		"fg": "#e0e0e0",
		"border": "#404040"
	},
	"buttons": {
		"bg": "#0078d4",
		"fg": "#ffffff",
		"hover_bg": "#106ebe",
		"active_bg": "#003a7a"
	}
}
```

To test a custom palette, open the extension's service worker console from `chrome://extensions` and run:

```js
chrome.storage.local.set({ walColors: YOUR_PALETTE });
```

Then reload a web page or click **Refresh Colors** in the popup.

## Permissions

- `storage`: saves the active palette locally.
- `tabs`: finds open tabs to send palette updates.
- `<all_urls>`: allows the content script to apply styles across websites.

The broad host permission is required by the current design, but it means the extension can inject CSS into every matching page. Review the generated CSS before using this prototype on sensitive sites.

## Known limitations

- There is no direct pywal file reader or native messaging host yet.
- The five-second watcher checks extension storage, not the pywal configuration file.
- The popup's auto-update and interval fields are currently visual controls; their values are not persisted or used.
- The **Reset to Default** button is present in the popup but is not wired up yet.
- Browser chrome such as the actual address bar and tab strip cannot be styled by a normal content script; only page content is affected.
- The manifest declares `theme.css` and `colors.json` as web-accessible resources, but those files are not currently present in the repository.

## Development

There is currently no build system, test suite, or dependency setup. The JavaScript and CSS files are loaded directly by the browser, so development consists of editing the source files, reloading the extension, and refreshing test pages.

Useful debugging locations:

- Service worker logs: `chrome://extensions` -> Wal Browser -> **Service worker**.
- Popup logs: open the popup, right-click it, and choose **Inspect**.
- Page injection logs: open the target page's DevTools console.

## License

No license has been specified yet.
