# FoodLoop v1.1 - Ticket OCR

Esta actualización añade captura/selección de fotografías de tickets y OCR local en el navegador.

## Archivos que cambian

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/ocr.js` (nuevo)

Puedes sustituir directamente la carpeta `foodloop/` completa del repositorio `cdeniaca.github.io` por esta versión.

## Flujo

1. Abrir FoodLoop.
2. Pulsar `Nueva compra`.
3. Elegir `Hacer foto` o `Elegir foto`.
4. Pulsar `Leer ticket`.
5. Revisar el texto detectado y las líneas de productos.
6. Corregir cualquier error de OCR.
7. Guardar la compra.

## Privacidad

FoodLoop no sube la fotografía del ticket a un backend propio ni la guarda en IndexedDB. El OCR se ejecuta en el navegador con Tesseract.js/WebAssembly.

La primera vez que se pulsa `Leer ticket`, el navegador descarga Tesseract.js y los recursos necesarios desde jsDelivr. La versión del script principal está fijada a Tesseract.js 7.0.0.

## Nota de precisión

El OCR no es IA semántica y los tickets varían mucho entre supermercados. El parser intenta detectar fecha, tienda, total, nombres, precios, packs (`6U`, `12UD`) y pesos decimales en kg/g, pero la tabla siempre debe revisarse antes de guardar.
