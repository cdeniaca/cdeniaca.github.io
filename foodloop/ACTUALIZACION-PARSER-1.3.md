# FoodLoop v1.3 — parser de tickets más completo

Esta versión cambia la conversión OCR → productos.

- Conserva líneas de producto aunque no pueda detectar su precio.
- Entiende mejor tickets donde el nombre y el precio aparecen en líneas separadas.
- Entiende formatos de cantidad como `2 x 1,25 2,50`.
- Entiende mejor pesos como `0,792 kg x 2,49 EUR/kg 1,97`.
- Las líneas dudosas aparecen en amarillo para revisión en vez de desaparecer.
- Mantiene siempre el texto OCR original editable.

Para publicar, sustituye la carpeta `foodloop/` existente por esta versión.
