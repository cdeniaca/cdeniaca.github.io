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
      script.onload = () => window.Tesseract?.createWorker
        ? resolve(window.Tesseract)
        : reject(new Error('El motor OCR se ha descargado pero no se ha inicializado.'));
      script.onerror = () => reject(new Error('No se ha podido descargar el motor OCR. Comprueba la conexión a Internet.'));
      document.head.appendChild(script);
    });
    return tesseractLoadPromise;
  }

  function normalizeWhitespace(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[\t ]+/g, ' ')
      .trim();
  }

  function normalizeOcrLine(value) {
    return normalizeWhitespace(value)
      .replace(/[–—−]/g, '-')
      .replace(/(\d)[,.;:]\s+(\d{2})(?=\D|$)/g, '$1,$2')
      .replace(/(\d)\s+([,.])\s*(\d{2})(?=\D|$)/g, '$1$2$3');
  }

  function titleCase(value) {
    return normalizeWhitespace(value)
      .toLocaleLowerCase('es')
      .replace(/(^|[\s\-/])([\p{L}])/gu, (m, sep, letter) => sep + letter.toLocaleUpperCase('es'));
  }

  function parseMoney(raw) {
    if (raw == null || raw === '') return null;
    const clean = String(raw)
      .replace(/\s/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
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

  function moneyTokens(line) {
    const tokens = [];
    const pattern = /(?:^|\s|[=:])([0-9]{1,5}\s*[.,]\s*[0-9]{2})(?=\s*(?:€|EUR|[A-Z])?(?:\s|$))/gi;
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const raw = match[1];
      const offset = match[0].indexOf(raw);
      const value = parseMoney(raw);
      if (!Number.isFinite(value)) continue;
      tokens.push({ raw, value, index: match.index + Math.max(0, offset), end: match.index + Math.max(0, offset) + raw.length });
    }
    return tokens;
  }

  function detectTotal(lines) {
    const totalWords = /\b(TOTAL(?:\s+A\s+PAGAR)?|IMPORTE(?:\s+TOTAL)?|A\s+PAGAR)\b/i;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!totalWords.test(line)) continue;
      const amounts = moneyTokens(line).map(t => t.value);
      if (amounts.length) return amounts[amounts.length - 1];
    }
    return null;
  }

  const ADMIN_LINE = /\b(TOTAL|SUBTOTAL|IMPORTE|IVA|I\.V\.A|BASE\s+IMPONIBLE|EFECTIVO|TARJETA|CAMBIO|ENTREGADO|PAGO|AHORRO|DESCUENTO|DTO\.?|NIF|CIF|TEL(?:EFONO)?|FECHA|HORA|TICKET|FACTURA|CAJA|OPERACION|AUTORIZACION|GRACIAS|WWW\.|HTTP|VISA|MASTERCARD|CONTACTLESS|REDONDEO|DONACION|APERTURA|PUNTOS|SALDO|CUPON|CUPÓN)\b/i;
  const HEADER_LINE = /\b(DESCRIPCION|DESCRIPCIÓN|ARTICULO|ARTÍCULO|PRODUCTO|CANTIDAD|CANT\.?|UDS?\.?|UNIDADES|PVP|PRECIO|IMPORTE|EUROS?|EUR\/KG|PRECIO\/KG)\b/i;
  const TOTAL_LINE = /(?:^|\s)(TOTAL(?:\s+A\s+PAGAR)?|IMPORTE\s+TOTAL|A\s+PAGAR)(?:\s|$)/i;
  const STORE_LINE = /\b(MERCADONA|LIDL|CARREFOUR|ALDI|CONSUM|ALCAMPO|HIPERCOR|EROSKI|MASYMAS|MAS Y MAS|EL CORTE INGLES|SUPERCOR|BONAREA|FROIZ)\b/i;

  function cleanupName(raw) {
    return normalizeWhitespace(String(raw || '')
      .replace(/^[*#·:;,._\-\s]+/, '')
      .replace(/[*#·:;,._\-\s]+$/, '')
      .replace(/^\d{6,14}\s+/, '')
      .replace(/\s{2,}/g, ' '));
  }

  function letterCount(value) {
    return (String(value || '').match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
  }

  function looksLikeProductName(name) {
    const clean = cleanupName(name);
    if (!clean || clean.length < 2 || clean.length > 100 || ADMIN_LINE.test(clean) || HEADER_LINE.test(clean) || STORE_LINE.test(clean)) return false;
    if (/^\d[\d\s:/.,\-]+$/.test(clean)) return false;
    return letterCount(clean) >= 2;
  }

  function productScore(line) {
    const clean = cleanupName(line);
    if (!looksLikeProductName(clean)) return -100;
    let score = 0;
    const letters = letterCount(clean);
    const digits = (clean.match(/\d/g) || []).length;
    if (letters >= 4) score += 3;
    if (letters >= 8) score += 1;
    if (digits <= letters) score += 1;
    if (/\b(KG|G|ML|CL|L|UD|UDS|U|PAQ|PACK)\b/i.test(clean)) score += 1;
    if (/\b(CALLE|AVDA|AVENIDA|C\/|CP|C\.P\.|CLIENTE|CAJERO|TIENDA|CENTRO|DOMICILIO)\b/i.test(clean)) score -= 4;
    if (/[@]|\.COM\b|WWW\b/i.test(clean)) score -= 5;
    return score;
  }

  function parseQuantityContext(raw) {
    let text = cleanupName(raw);
    let qty = 1;
    let unit = 'ud';

    const weightExplicit = text.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(KG|G|L|ML)\b/i);
    if (weightExplicit) {
      qty = parseMoney(weightExplicit[1]) || 1;
      unit = weightExplicit[2].toLocaleLowerCase('es');
      text = cleanupName(text.replace(weightExplicit[0], ' '));
    }

    const leadingCount = text.match(/^(\d{1,3})\s*(?:[xX*]\s*)?(.+)$/);
    if (unit === 'ud' && leadingCount && looksLikeProductName(leadingCount[2]) && Number(leadingCount[1]) <= 99) {
      qty = Number(leadingCount[1]) || 1;
      text = cleanupName(leadingCount[2]);
    }

    const multiplierWithUnitPrice = raw.match(/\b(\d+(?:[.,]\d+)?)\s*[xX*]\s*\d{1,5}(?:[.,]\d{2})\b/i);
    if (multiplierWithUnitPrice && unit === 'ud') qty = parseMoney(multiplierWithUnitPrice[1]) || qty;

    if (qty === 1) {
      const packUnits = text.match(/\b(\d{1,2})\s*U(?:D|DS)?\b/i);
      const packFormat = text.match(/\b(\d{1,2})\s*[xX]\s*\d+(?:[.,]\d+)?\s*(?:G|ML|CL)\b/i);
      const pack = packUnits || packFormat;
      if (pack) qty = Number(pack[1]) || 1;
    }

    return { name: cleanupName(text), qty, unit };
  }

  function inferUnitFromPriceContext(line, currentUnit) {
    if (currentUnit !== 'ud') return currentUnit;
    if (/€?\s*\/\s*KG\b|EUR\s*\/\s*KG\b/i.test(line)) return 'kg';
    if (/€?\s*\/\s*L\b|EUR\s*\/\s*L\b/i.test(line)) return 'l';
    return currentUnit;
  }

  function stripPricingFragments(raw, lastToken) {
    let text = raw.slice(0, lastToken.index);
    text = text
      .replace(/\b\d+(?:[.,]\d+)?\s*[xX*]\s*\d{1,5}(?:[.,]\d{2})\b/g, ' ')
      .replace(/\b\d{1,5}[.,]\d{2}\b/g, ' ')
      .replace(/\b\d{1,5}(?:[.,]\d{2})\s*(?:€|EUR)?\s*\/\s*(?:KG|L)\b/gi, ' ')
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:KG|G|L|ML)\b/gi, match => match)
      .replace(/\s+[A-Z]$/i, ' ');
    return cleanupName(text);
  }

  function findPreviousProductCandidate(lines, index, consumed) {
    for (let back = 1; back <= 3; back++) {
      const j = index - back;
      if (j < 0 || consumed.has(j)) break;
      const candidate = lines[j];
      if (!candidate || ADMIN_LINE.test(candidate) || HEADER_LINE.test(candidate) || moneyTokens(candidate).length) continue;
      if (productScore(candidate) >= 2) return { index: j, line: candidate };
    }
    return null;
  }

  function parseProductLines(lines) {
    const parsed = [];
    const consumed = new Set();
    const sourceIndexes = [];
    const totalIndex = lines.findIndex(line => TOTAL_LINE.test(line));

    for (let i = 0; i < lines.length; i++) {
      if (consumed.has(i)) continue;
      const line = lines[i];
      if (!line) continue;
      if (TOTAL_LINE.test(line)) break;
      if (ADMIN_LINE.test(line)) continue;

      const tokens = moneyTokens(line);
      if (HEADER_LINE.test(line) && !tokens.length) continue;
      if (!tokens.length) continue;

      const lastPrice = tokens[tokens.length - 1];
      let totalPrice = lastPrice.value;
      let beforePrice = stripPricingFragments(line, lastPrice);
      let context = parseQuantityContext(beforePrice);
      let name = context.name;
      let qty = context.qty;
      let unit = inferUnitFromPriceContext(line, context.unit);
      let sourceIndex = i;
      let confidence = 'high';
      let reviewReason = '';

      // Si la línea es casi solo precio/cálculo, asociarla con un nombre de las líneas anteriores.
      if (!looksLikeProductName(name) || productScore(name) < 1) {
        const previous = findPreviousProductCandidate(lines, i, consumed);
        if (previous) {
          const previousContext = parseQuantityContext(previous.line);
          name = previousContext.name;
          qty = previousContext.qty;
          unit = inferUnitFromPriceContext(line, previousContext.unit);
          sourceIndex = previous.index;
          consumed.add(previous.index);
        }
      }

      // Formatos como "2 x 1,25 2,50" conservan la cantidad aunque el nombre esté en la línea anterior.
      const multiplier = line.match(/\b(\d+(?:[.,]\d+)?)\s*[xX*]\s*\d{1,5}(?:[.,]\d{2})\b/i);
      if (multiplier && unit === 'ud') qty = parseMoney(multiplier[1]) || qty;

      // Formatos de peso en una línea de cálculo: "0,792 kg x 2,49 EUR/kg 1,97".
      const weightCalc = line.match(/\b(\d+(?:[.,]\d+)?)\s*(KG|G|L|ML)\b/i);
      if (weightCalc) {
        qty = parseMoney(weightCalc[1]) || qty;
        unit = weightCalc[2].toLocaleLowerCase('es');
      }

      name = cleanupName(name);
      if (!looksLikeProductName(name)) continue;

      // Si el precio parece extraordinariamente grande para una línea, la dejamos pero marcada.
      if (totalPrice > 1000) {
        confidence = 'low';
        reviewReason = 'Comprueba el precio detectado';
      }

      parsed.push({
        name,
        rawName: name,
        qty: Number(qty || 1),
        unit: unit || 'ud',
        totalPrice,
        confidence,
        reviewReason,
        sourceIndex
      });
      consumed.add(i);
      sourceIndexes.push(sourceIndex, i);
    }

    // Segunda pasada: no ocultar productos que el OCR ha leído pero cuyo precio no ha podido aislar.
    // Solo se consideran líneas dentro de la zona donde ya hemos encontrado artículos.
    if (parsed.length) {
      const minParsed = Math.max(0, Math.min(...sourceIndexes));
      const maxParsed = totalIndex >= 0 ? totalIndex : Math.min(lines.length, Math.max(...sourceIndexes) + 12);

      for (let i = minParsed; i < maxParsed; i++) {
        if (consumed.has(i)) continue;
        const line = lines[i];
        if (!line || ADMIN_LINE.test(line) || HEADER_LINE.test(line) || moneyTokens(line).length) continue;
        if (productScore(line) < 3) continue;

        const context = parseQuantityContext(line);
        if (!looksLikeProductName(context.name)) continue;

        parsed.push({
          name: context.name,
          rawName: context.name,
          qty: Number(context.qty || 1),
          unit: context.unit || 'ud',
          totalPrice: null,
          confidence: 'low',
          reviewReason: 'Precio no detectado; revisa esta línea',
          sourceIndex: i
        });
        consumed.add(i);
      }
    }

    parsed.sort((a, b) => Number(a.sourceIndex || 0) - Number(b.sourceIndex || 0));

    // Agrupa únicamente líneas claramente idénticas. Las filas dudosas sin precio se mantienen separadas.
    const grouped = [];
    const highMap = new Map();
    for (const row of parsed) {
      const canGroup = row.confidence !== 'low' && Number.isFinite(row.totalPrice);
      const key = `${row.name.toLocaleUpperCase('es')}|${row.unit}`;
      if (!canGroup || !highMap.has(key)) {
        const copy = { ...row };
        grouped.push(copy);
        if (canGroup) highMap.set(key, copy);
      } else {
        const current = highMap.get(key);
        current.qty += Number(row.qty || 0);
        current.totalPrice = Number(current.totalPrice || 0) + Number(row.totalPrice || 0);
      }
    }

    return grouped.map(row => ({
      name: row.name,
      rawName: row.rawName,
      qty: Number(Number(row.qty || 1).toFixed(3)),
      unit: row.unit || 'ud',
      totalPrice: Number.isFinite(row.totalPrice) ? Number(row.totalPrice.toFixed(2)) : null,
      confidence: row.confidence || 'high',
      reviewReason: row.reviewReason || ''
    }));
  }

  function parseReceipt(text) {
    const normalized = String(text || '').replace(/\r/g, '\n');
    const lines = normalized.split(/\n+/).map(normalizeOcrLine).filter(Boolean);
    const parsedLines = parseProductLines(lines);
    return {
      date: isoDateFromReceipt(normalized),
      store: detectStore(lines),
      total: detectTotal(lines),
      lines: parsedLines,
      reviewCount: parsedLines.filter(line => line.confidence === 'low').length,
      rawText: normalized
    };
  }

  async function decodeImage(file) {
    if ('createImageBitmap' in window) {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
      } catch (_) {}
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
    const maxDimension = isMobile ? 1900 : 2400;
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(decoded.source, 0, 0, width, height);
    decoded.close();

    const data = ctx.getImageData(0, 0, width, height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.34 + 128));
      px[i] = px[i + 1] = px[i + 2] = contrasted;
    }
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo preparar la imagen.')), 'image/jpeg', 0.94);
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
