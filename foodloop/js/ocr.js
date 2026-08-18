(function () {
  'use strict';

  const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
  let tesseractLoadPromise = null;

  function ensureTesseract() {
    if (window.Tesseract?.createWorker) return Promise.resolve(window.Tesseract);
    if (tesseractLoadPromise) return tesseractLoadPromise;
    tesseractLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TESSERACT_URL;
      script.crossOrigin = 'anonymous';
      script.onload = () => window.Tesseract?.createWorker ? resolve(window.Tesseract) : reject(new Error('El motor OCR se ha descargado pero no se ha inicializado.'));
      script.onerror = () => reject(new Error('No se ha podido descargar el motor OCR. Comprueba la conexión a Internet.'));
      document.head.appendChild(script);
    });
    return tesseractLoadPromise;
  }

  function normalizeWhitespace(value) {
    return String(value || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
  }

  function titleCase(value) {
    return normalizeWhitespace(value)
      .toLocaleLowerCase('es')
      .replace(/(^|[\s\-/])([\p{L}])/gu, (m, sep, letter) => sep + letter.toLocaleUpperCase('es'));
  }

  function parseMoney(raw) {
    if (raw == null || raw === '') return null;
    const clean = String(raw).replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
    const value = Number(clean.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(value) ? value : null;
  }

  function isoDateFromReceipt(text) {
    const patterns = [
      /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2}|\d{2})\b/,
      /\b(20\d{2})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/
    ];
    for (const pattern of patterns) {
      const match = String(text || '').match(pattern);
      if (!match) continue;
      let y, m, d;
      if (match[1].length === 4) {
        y = Number(match[1]); m = Number(match[2]); d = Number(match[3]);
      } else {
        d = Number(match[1]); m = Number(match[2]); y = Number(match[3]);
        if (y < 100) y += 2000;
      }
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
        return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
    return '';
  }

  function detectStore(lines) {
    const known = [
      ['MERCADONA', 'Mercadona'], ['LIDL', 'Lidl'], ['CARREFOUR', 'Carrefour'], ['ALDI', 'Aldi'],
      ['CONSUM', 'Consum'], ['ALCAMPO', 'Alcampo'], ['HIPERCOR', 'Hipercor'], ['EROSKI', 'Eroski'],
      ['DIA', 'Dia'], ['MASYMAS', 'Masymas'], ['MAS Y MAS', 'Masymas'], ['EL CORTE INGLES', 'El Corte Inglés'],
      ['SUPERCOR', 'Supercor'], ['BONAREA', 'BonÀrea'], ['FROIZ', 'Froiz']
    ];
    const upper = lines.map(l => l.toLocaleUpperCase('es'));
    for (const [needle, label] of known) {
      if (upper.some(l => l.includes(needle))) return label;
    }
    const ignored = /(TICKET|FACTURA|SIMPLIFICADA|CIF|NIF|TEL|WWW|HTTP|CALLE|AVDA|AVENIDA|GRACIAS|FECHA|HORA|CAJA|OPERACION|CLIENTE)/i;
    const candidate = lines.slice(0, 10).find(line => {
      const letters = (line.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
      const digits = (line.match(/\d/g) || []).length;
      return line.length >= 3 && line.length <= 42 && letters >= 3 && letters > digits && !ignored.test(line);
    });
    return candidate ? titleCase(candidate.replace(/[^\p{L}\p{N}&.'\- ]/gu, '')) : '';
  }

  function detectTotal(lines) {
    const totalWords = /(TOTAL(?:\s+A\s+PAGAR)?|IMPORTE(?:\s+TOTAL)?|A\s+PAGAR)/i;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!totalWords.test(line)) continue;
      const amounts = [...line.matchAll(/(\d{1,5}[.,]\d{2})/g)].map(m => parseMoney(m[1])).filter(Number.isFinite);
      if (amounts.length) return amounts[amounts.length - 1];
    }
    return null;
  }

  const IGNORE_LINE = /(TOTAL|SUBTOTAL|IMPORTE|IVA|I\.V\.A|BASE\s+IMPONIBLE|EFECTIVO|TARJETA|CAMBIO|ENTREGADO|PAGO|AHORRO|DESCUENTO|DTO\.?|NIF|CIF|TEL(?:EFONO)?|FECHA|HORA|TICKET|FACTURA|CAJA|OPERACION|AUTORIZACION|GRACIAS|WWW\.|HTTP|VISA|MASTERCARD|CONTACTLESS|REDONDEO|DONACION|APERTURA)/i;

  function cleanupName(raw) {
    return normalizeWhitespace(String(raw || '')
      .replace(/^[*#·:;,.\-\s]+/, '')
      .replace(/[*#·:;,.\-\s]+$/, '')
      .replace(/\s{2,}/g, ' '));
  }

  function looksLikeProductName(name) {
    if (!name || name.length < 2 || name.length > 80 || IGNORE_LINE.test(name)) return false;
    const letters = (name.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
    return letters >= 2;
  }

  function parseProductLines(lines) {
    const parsed = [];
    let pendingName = '';

    for (const original of lines) {
      const line = normalizeWhitespace(original);
      if (!line) continue;

      const priceMatches = [...line.matchAll(/(\d{1,5}[.,]\d{2})(?:\s*€)?/g)];
      const lastPrice = priceMatches.length ? priceMatches[priceMatches.length - 1] : null;

      if (!lastPrice) {
        if (looksLikeProductName(line) && !/^\d[\d\s:/.\-]+$/.test(line)) pendingName = cleanupName(line);
        continue;
      }

      if (IGNORE_LINE.test(line)) {
        pendingName = '';
        continue;
      }

      const totalPrice = parseMoney(lastPrice[1]);
      if (!Number.isFinite(totalPrice)) continue;

      let beforePrice = cleanupName(line.slice(0, lastPrice.index));
      let qty = 1;
      let unit = 'ud';

      // Líneas del tipo "2 x 1,25 2,50" suelen corresponder al nombre de la línea anterior.
      const multiplierOnly = beforePrice.match(/^([0-9]+(?:[.,][0-9]+)?)\s*[xX*]\s*(\d{1,5}[.,]\d{2})\s*$/);
      if (multiplierOnly && pendingName) {
        qty = parseMoney(multiplierOnly[1]) || 1;
        beforePrice = pendingName;
      } else {
        // Si el multiplicador está al inicio pero también hay nombre, retirarlo del nombre.
        const leadingMultiplier = beforePrice.match(/^([0-9]+(?:[.,][0-9]+)?)\s*[xX*]\s*(?:\d{1,5}[.,]\d{2})?\s*(.+)$/);
        if (leadingMultiplier && looksLikeProductName(leadingMultiplier[2])) {
          qty = parseMoney(leadingMultiplier[1]) || 1;
          beforePrice = cleanupName(leadingMultiplier[2]);
        }
      }

      // Peso explícito al principio: "0,842 KG PECHUGA ... 5,72".
      const weight = beforePrice.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(KG|G)\b\s*(.+)$/i);
      if (weight && looksLikeProductName(weight[3])) {
        qty = parseMoney(weight[1]) || 1;
        unit = weight[2].toLocaleLowerCase('es');
        beforePrice = cleanupName(weight[3]);
      }

      let name = beforePrice;
      if (!looksLikeProductName(name) && pendingName) name = pendingName;
      name = cleanupName(name);

      // Packs explícitos: "YOGUR 6U" o "YOGUR 6x125G".
      if (qty === 1) {
        const packUnits = name.match(/\b(\d{1,2})\s*U(?:D|DS)?\b/i);
        const packFormat = name.match(/\b(\d{1,2})\s*[xX]\s*\d+(?:[.,]\d+)?\s*(?:G|ML|CL)\b/i);
        const pack = packUnits || packFormat;
        if (pack) qty = Number(pack[1]) || 1;
      }

      // Peso decimal dentro de la línea: "MANZANA 0,842 KG".
      if (unit === 'ud') {
        const inlineWeight = name.match(/\b(0[.,]\d+|\d+[.,]\d+)\s*(KG|G)\b/i);
        if (inlineWeight) {
          qty = parseMoney(inlineWeight[1]) || qty;
          unit = inlineWeight[2].toLocaleLowerCase('es');
          name = cleanupName(name.replace(inlineWeight[0], ''));
        }
      }

      if (!looksLikeProductName(name)) {
        pendingName = '';
        continue;
      }

      // Evita interpretar códigos largos como parte principal del nombre.
      name = cleanupName(name.replace(/^\d{6,14}\s+/, ''));
      if (!looksLikeProductName(name)) continue;

      parsed.push({ name, rawName: name, qty, unit, totalPrice });
      pendingName = '';
    }

    // Agrupa líneas idénticas para que dos unidades repetidas no ocupen dos filas.
    const grouped = new Map();
    for (const row of parsed) {
      const key = `${row.name.toLocaleUpperCase('es')}|${row.unit}`;
      const current = grouped.get(key);
      if (!current) grouped.set(key, { ...row });
      else {
        current.qty += Number(row.qty || 0);
        current.totalPrice = Number(current.totalPrice || 0) + Number(row.totalPrice || 0);
      }
    }
    return [...grouped.values()].map(row => ({
      ...row,
      qty: Number(row.qty.toFixed(3)),
      totalPrice: Number(row.totalPrice.toFixed(2))
    }));
  }

  function parseReceipt(text) {
    const normalized = String(text || '').replace(/\r/g, '\n');
    const lines = normalized.split(/\n+/).map(normalizeWhitespace).filter(Boolean);
    return {
      date: isoDateFromReceipt(normalized),
      store: detectStore(lines),
      total: detectTotal(lines),
      lines: parseProductLines(lines),
      rawText: normalized
    };
  }

  async function decodeImage(file) {
    // createImageBitmap es rápido, pero algunas versiones de Safari/iOS fallan con
    // determinadas fotos de cámara (especialmente HEIC/HEIF). Si falla, usamos
    // HTMLImageElement como alternativa antes de dar error al usuario.
    if ('createImageBitmap' in window) {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
      } catch (_) {
        // Continuar con el fallback compatible con Safari.
      }
    }
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('El navegador no ha podido abrir esta foto. Si es HEIC/HEIF, prueba con una captura de pantalla o una imagen JPG.'));
        img.src = url;
      });
      return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch (err) {
      URL.revokeObjectURL(url);
      throw err;
    }
  }

  async function imageToOptimizedBlob(file) {
    const decoded = await decodeImage(file);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 900;
    const maxDimension = isMobile ? 1700 : 2200;
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(decoded.source, 0, 0, width, height);
    decoded.close();

    // Conversión suave a escala de grises y aumento de contraste para tickets térmicos.
    const data = ctx.getImageData(0, 0, width, height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.28 + 128));
      px[i] = px[i + 1] = px[i + 2] = contrasted;
    }
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo preparar la imagen.')), 'image/jpeg', 0.92);
    });
  }

  async function recognizeFiles(files, onProgress) {
    const list = Array.from(files || []).filter(file => file && String(file.type || '').startsWith('image/'));
    if (!list.length) throw new Error('Selecciona al menos una imagen del ticket.');
    const Tesseract = await ensureTesseract();

    const worker = await Tesseract.createWorker('spa', 1, {
      logger: message => {
        if (typeof onProgress === 'function') onProgress(message);
      }
    });

    const texts = [];
    try {
      for (let index = 0; index < list.length; index++) {
        if (typeof onProgress === 'function') onProgress({ status: 'foodloop-image', progress: index / list.length, index, total: list.length });
        const optimized = await imageToOptimizedBlob(list[index]);
        const result = await worker.recognize(optimized, { rotateAuto: true });
        texts.push(result?.data?.text || '');
      }
    } finally {
      await worker.terminate();
    }
    if (typeof onProgress === 'function') onProgress({ status: 'done', progress: 1, total: list.length });
    return texts.join('\n\n');
  }

  window.FoodLoopOCR = { parseReceipt, recognizeFiles, isoDateFromReceipt };
})();
