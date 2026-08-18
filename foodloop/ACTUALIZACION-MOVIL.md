# FoodLoop v1.2 - corrección móvil

Sustituye la carpeta `foodloop/` completa por esta versión.

Cambios principales:

- Selector de cámara/galería usando el input nativo directamente (más fiable en iPhone y Android).
- Fallback de decodificación para Safari/iOS cuando `createImageBitmap` falla.
- Menor resolución de preprocesado en móvil para reducir memoria durante OCR.
- Versionado `?v=1.2` en CSS y JavaScript para evitar que Safari use archivos antiguos en caché.
- Mensaje específico para imágenes HEIC/HEIF no decodificables.

Después de desplegar, abre `/foodloop/` en el teléfono y recarga la página. Si estaba abierta como pestaña antigua, ciérrala y vuelve a abrirla.
