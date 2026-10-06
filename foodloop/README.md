# FoodLoop

**FoodLoop** is a local-first web application for tracking household purchases, stock, consumption and replenishment habits.

🌐 **Demo:** https://www.cristinadeniacarretero.com/foodloop/

## What it does

FoodLoop keeps a movement history instead of simply overwriting stock values. This makes it possible to reconstruct how inventory changes over time and derive useful purchase patterns.

### Main features

- Register purchases and products
- Track stock from movement history
- Record consumption, waste and manual adjustments
- Flag products approaching expiry
- Build a shopping list manually or from learned patterns
- Review purchase history and spending
- Export data to CSV and XLSX
- Create and restore complete backups
- Capture receipt images and extract candidate data with OCR

## Architecture

The application runs entirely in the browser.

- **UI:** HTML, CSS and vanilla JavaScript
- **Persistence:** IndexedDB
- **OCR:** Tesseract.js loaded in the browser
- **Exports:** CSV / XLSX
- **Deployment:** GitHub Pages

There is no application backend. Household data remains in the browser's local database unless the user explicitly exports it.

## Code structure

- `index.html` — application shell and screens
- `css/styles.css` — responsive UI
- `js/app.js` — UI state and interaction logic
- `js/db.js` — IndexedDB persistence and domain operations
- `js/ocr.js` — receipt OCR and parsing
- `js/export.js` — backup/export logic
- `js/xlsx.js` — spreadsheet export support

## Privacy note

Receipt processing happens in the browser and confirmed purchase data is stored locally. The OCR library itself is downloaded from an external CDN when needed.

## Status

FoodLoop is an evolving portfolio project focused on practical local-first data management and household inventory workflows.
