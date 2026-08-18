(function () {
  'use strict';

  const DB_NAME = 'FoodLoopDB';
  const DB_VERSION = 1;
  const STORE_NAMES = ['products', 'tickets', 'purchaseLines', 'movements', 'shopping', 'settings'];
  let dbPromise = null;

  function uid(prefix) {
    const raw = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${raw}`;
  }

  function normalizeName(value) {
    return String(value || '')
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  function median(values) {
    const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }

  function localDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDate(value) {
    if (!value) return null;
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function daysBetween(a, b) {
    const da = parseDate(a);
    const db = parseDate(b);
    if (!da || !db) return null;
    return Math.round((db - da) / 86400000);
  }

  function open() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('normalizedName', 'normalizedName', { unique: false });
          store.createIndex('location', 'location', { unique: false });
        }

        if (!db.objectStoreNames.contains('tickets')) {
          const store = db.createObjectStore('tickets', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('purchaseLines')) {
          const store = db.createObjectStore('purchaseLines', { keyPath: 'id' });
          store.createIndex('ticketId', 'ticketId', { unique: false });
          store.createIndex('productId', 'productId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('movements')) {
          const store = db.createObjectStore('movements', { keyPath: 'id' });
          store.createIndex('productId', 'productId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('shopping')) {
          db.createObjectStore('shopping', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return dbPromise;
  }

  async function request(storeName, mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let req;
      try {
        req = action(store);
      } catch (err) {
        reject(err);
        return;
      }
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAll(storeName) {
    return request(storeName, 'readonly', store => store.getAll());
  }

  async function get(storeName, key) {
    return request(storeName, 'readonly', store => store.get(key));
  }

  async function put(storeName, value) {
    return request(storeName, 'readwrite', store => store.put(value));
  }

  async function remove(storeName, key) {
    return request(storeName, 'readwrite', store => store.delete(key));
  }

  async function clear(storeName) {
    return request(storeName, 'readwrite', store => store.clear());
  }

  async function setSetting(key, value) {
    await put('settings', { key, value, updatedAt: new Date().toISOString() });
  }

  async function getSetting(key, fallback = null) {
    const row = await get('settings', key);
    return row ? row.value : fallback;
  }

  async function findProductByName(name) {
    const normalized = normalizeName(name);
    const products = await getAll('products');
    return products.find(p => p.normalizedName === normalized) || null;
  }

  async function ensureProduct(input) {
    const name = String(input.name || '').trim();
    if (!name) throw new Error('El producto necesita un nombre.');

    let product = await findProductByName(name);
    if (product) {
      let changed = false;
      ['unit', 'location', 'expiryDate'].forEach(key => {
        if (input[key] && product[key] !== input[key]) {
          product[key] = input[key];
          changed = true;
        }
      });
      if (changed) {
        product.updatedAt = new Date().toISOString();
        await put('products', product);
      }
      return product;
    }

    product = {
      id: uid('product'),
      name,
      normalizedName: normalizeName(name),
      unit: input.unit || 'ud',
      location: input.location || 'Nevera',
      expiryDate: input.expiryDate || '',
      manualReorderThreshold: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await put('products', product);
    return product;
  }

  async function updateProduct(id, patch) {
    const product = await get('products', id);
    if (!product) throw new Error('Producto no encontrado.');
    const next = { ...product, ...patch, updatedAt: new Date().toISOString() };
    if (patch.name) next.normalizedName = normalizeName(patch.name);
    await put('products', next);
    return next;
  }

  async function addMovement(input) {
    const movement = {
      id: input.id || uid('move'),
      productId: input.productId,
      type: input.type,
      qty: Number(input.qty || 0),
      date: input.date || localDateString(),
      ticketId: input.ticketId || null,
      note: input.note || '',
      createdAt: input.createdAt || new Date().toISOString()
    };
    await put('movements', movement);
    return movement;
  }

  async function createPurchase(input) {
    const ticket = {
      id: uid('ticket'),
      date: input.date || localDateString(),
      store: String(input.store || '').trim(),
      total: input.total === '' || input.total == null ? null : Number(input.total),
      note: input.note || '',
      createdAt: new Date().toISOString()
    };
    await put('tickets', ticket);

    const createdLines = [];
    for (const rawLine of input.lines || []) {
      if (!String(rawLine.name || '').trim() || !(Number(rawLine.qty) > 0)) continue;
      const product = await ensureProduct(rawLine);
      const totalPrice = rawLine.totalPrice === '' || rawLine.totalPrice == null ? null : Number(rawLine.totalPrice);
      const line = {
        id: uid('line'),
        ticketId: ticket.id,
        productId: product.id,
        productName: product.name,
        rawName: String(rawLine.rawName || rawLine.name || '').trim(),
        qty: Number(rawLine.qty),
        unit: rawLine.unit || product.unit || 'ud',
        totalPrice,
        date: ticket.date,
        store: ticket.store,
        createdAt: new Date().toISOString()
      };
      await put('purchaseLines', line);
      await addMovement({
        productId: product.id,
        type: 'purchase',
        qty: line.qty,
        date: ticket.date,
        ticketId: ticket.id,
        note: ticket.store ? `Compra en ${ticket.store}` : 'Compra'
      });
      await remove('shopping', product.id);
      createdLines.push(line);
    }

    if (!createdLines.length) {
      await remove('tickets', ticket.id);
      throw new Error('Añade al menos un producto válido.');
    }

    return { ticket, lines: createdLines };
  }

  async function getStockMap() {
    const movements = await getAll('movements');
    const map = {};
    for (const m of movements) {
      map[m.productId] = (map[m.productId] || 0) + Number(m.qty || 0);
    }
    return map;
  }

  async function getStock(productId) {
    const movements = await getAll('movements');
    return movements
      .filter(m => m.productId === productId)
      .reduce((sum, m) => sum + Number(m.qty || 0), 0);
  }

  async function recordConsumption(productId, qty, type = 'consume', note = '') {
    const current = await getStock(productId);
    const amount = Math.max(0, Math.min(Number(qty || 0), Math.max(0, current)));
    if (!(amount > 0)) throw new Error('No hay stock suficiente para registrar ese movimiento.');
    await addMovement({ productId, type, qty: -amount, note });
    await evaluateReorder(productId);
    return getStock(productId);
  }

  async function setActualStock(productId, targetStock, note = 'Corrección manual') {
    const current = await getStock(productId);
    const target = Math.max(0, Number(targetStock || 0));
    const delta = target - current;
    if (Math.abs(delta) < 0.000001) return current;
    await addMovement({ productId, type: 'adjustment', qty: delta, note });
    await evaluateReorder(productId);
    return target;
  }

  async function getProductStats(productId, preloaded) {
    const products = preloaded?.products || await getAll('products');
    const lines = preloaded?.purchaseLines || await getAll('purchaseLines');
    const movements = preloaded?.movements || await getAll('movements');
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const purchases = lines
      .filter(l => l.productId === productId)
      .sort((a, b) => `${a.date}|${a.createdAt}`.localeCompare(`${b.date}|${b.createdAt}`));
    const productMoves = movements
      .filter(m => m.productId === productId)
      .sort((a, b) => `${a.date}|${a.createdAt}`.localeCompare(`${b.date}|${b.createdAt}`));

    let running = 0;
    const prePurchaseStocks = [];
    let purchaseSeen = 0;
    for (const m of productMoves) {
      if (m.type === 'purchase') {
        if (purchaseSeen > 0) prePurchaseStocks.push(Math.max(0, running));
        purchaseSeen += 1;
      }
      running += Number(m.qty || 0);
    }

    const intervals = [];
    for (let i = 1; i < purchases.length; i += 1) {
      const diff = daysBetween(purchases[i - 1].date, purchases[i].date);
      if (Number.isFinite(diff) && diff >= 0) intervals.push(diff);
    }

    const totalQty = purchases.reduce((s, p) => s + Number(p.qty || 0), 0);
    const totalSpent = purchases.reduce((s, p) => s + Number(p.totalPrice || 0), 0);
    const habitual = purchases.length >= 3;
    const status = habitual ? 'habitual' : purchases.length >= 2 ? 'observe' : 'occasional';
    const inferredThreshold = habitual ? Math.max(0, median(prePurchaseStocks)) : null;
    const threshold = product.manualReorderThreshold != null ? Number(product.manualReorderThreshold) : inferredThreshold;

    return {
      product,
      purchaseCount: purchases.length,
      totalQty,
      totalSpent,
      avgInterval: intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null,
      typicalQty: purchases.length ? median(purchases.map(p => Number(p.qty || 0))) : null,
      reorderThreshold: threshold,
      prePurchaseStocks,
      currentStock: running,
      habitual,
      status,
      lastPurchaseDate: purchases.length ? purchases[purchases.length - 1].date : null
    };
  }

  async function getAllProductStats() {
    const preloaded = {
      products: await getAll('products'),
      purchaseLines: await getAll('purchaseLines'),
      movements: await getAll('movements')
    };
    const stats = [];
    for (const p of preloaded.products) {
      stats.push(await getProductStats(p.id, preloaded));
    }
    return stats.filter(Boolean);
  }

  async function evaluateReorder(productId) {
    const stats = await getProductStats(productId);
    if (!stats) return;
    const existing = await get('shopping', productId);

    if (stats.habitual && Number.isFinite(stats.reorderThreshold) && stats.currentStock <= stats.reorderThreshold) {
      if (!existing) {
        await put('shopping', {
          id: productId,
          productId,
          source: 'auto',
          note: `Stock ${formatNumber(stats.currentStock)} · umbral aprendido ${formatNumber(stats.reorderThreshold)}`,
          addedAt: new Date().toISOString()
        });
      } else if (existing.source === 'auto') {
        existing.note = `Stock ${formatNumber(stats.currentStock)} · umbral aprendido ${formatNumber(stats.reorderThreshold)}`;
        existing.updatedAt = new Date().toISOString();
        await put('shopping', existing);
      }
    } else if (existing && existing.source === 'auto') {
      await remove('shopping', productId);
    }
  }

  async function evaluateAllReorders() {
    const products = await getAll('products');
    for (const p of products) await evaluateReorder(p.id);
  }

  function formatNumber(value) {
    const n = Number(value || 0);
    return Number.isInteger(n) ? String(n) : n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  }

  async function addShoppingByName(name, note = '') {
    const product = await ensureProduct({ name, unit: 'ud', location: 'Despensa' });
    await put('shopping', {
      id: product.id,
      productId: product.id,
      source: 'manual',
      note: note || 'Añadido manualmente',
      addedAt: new Date().toISOString()
    });
    return product;
  }

  async function exportAllData() {
    const data = {};
    for (const store of STORE_NAMES) data[store] = await getAll(store);
    return data;
  }

  async function importAllData(data, { replace = true } = {}) {
    const db = await open();
    const source = data || {};

    if (replace) {
      for (const store of STORE_NAMES) await clear(store);
    }

    for (const storeName of STORE_NAMES) {
      const rows = Array.isArray(source[storeName]) ? source[storeName] : [];
      if (!rows.length) continue;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        rows.forEach(row => store.put(row));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Importación cancelada.'));
      });
    }
  }

  async function clearAllData() {
    for (const store of STORE_NAMES) await clear(store);
  }

  window.FoodLoopDB = {
    DB_NAME,
    DB_VERSION,
    STORE_NAMES,
    uid,
    normalizeName,
    localDateString,
    parseDate,
    daysBetween,
    open,
    getAll,
    get,
    put,
    remove,
    clear,
    setSetting,
    getSetting,
    findProductByName,
    ensureProduct,
    updateProduct,
    addMovement,
    createPurchase,
    getStockMap,
    getStock,
    recordConsumption,
    setActualStock,
    getProductStats,
    getAllProductStats,
    evaluateReorder,
    evaluateAllReorders,
    addShoppingByName,
    exportAllData,
    importAllData,
    clearAllData,
    formatNumber
  };
})();
