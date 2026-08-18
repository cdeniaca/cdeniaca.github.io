(function () {
  'use strict';

  const DB = window.FoodLoopDB;
  const EX = window.FoodLoopExport;
  const XLSX = window.FoodLoopXLSX;
  const OCR = window.FoodLoopOCR;
  const $ = id => document.getElementById(id);
  let toastTimer = null;
  let historyRange = { from: '', to: '' };
  let receiptFiles = [];
  let receiptPreviewUrl = null;

  function money(value) {
    return Number(value || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }

  function number(value) {
    return DB.formatNumber(value);
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(value) {
    if (!value) return '—';
    const d = DB.parseDate(value);
    return d ? d.toLocaleDateString('es-ES') : value;
  }

  function daysUntil(value) {
    if (!value) return null;
    return DB.daysBetween(DB.localDateString(), value);
  }

  function defaultConsumeStep(unit) {
    if (unit === 'kg' || unit === 'l') return 0.1;
    if (unit === 'g' || unit === 'ml') return 100;
    return 1;
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function metricCard(label, value, note) {
    return `<article class="metric-card"><small>${escapeHtml(label)}</small><div class="metric-value">${escapeHtml(value)}</div><div class="metric-note">${escapeHtml(note || '')}</div></article>`;
  }

  function navigate(screen) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
    document.querySelectorAll('.nav-button').forEach(el => el.classList.toggle('active', el.dataset.nav === screen));
    history.replaceState(null, '', `#${screen}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (screen === 'history') renderHistory();
    if (screen === 'data') renderDataStatus();
  }

  function openDialog(id) {
    const dialog = $(id);
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closeDialog(id) {
    const dialog = $(id);
    if (dialog && dialog.open) dialog.close();
  }

  async function preload() {
    const [products, tickets, purchaseLines, movements, shopping] = await Promise.all([
      DB.getAll('products'),
      DB.getAll('tickets'),
      DB.getAll('purchaseLines'),
      DB.getAll('movements'),
      DB.getAll('shopping')
    ]);
    const stockMap = {};
    movements.forEach(m => { stockMap[m.productId] = (stockMap[m.productId] || 0) + Number(m.qty || 0); });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    return { products, tickets, purchaseLines, movements, shopping, stockMap, productMap };
  }

  async function refreshKnownProducts(data) {
    const loaded = data || await preload();
    $('knownProducts').innerHTML = loaded.products
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map(p => `<option value="${escapeHtml(p.name)}"></option>`)
      .join('');
  }

  async function renderHome(data) {
    const loaded = data || await preload();
    const active = loaded.products.filter(p => (loaded.stockMap[p.id] || 0) > 0);
    const expiring = active.filter(p => {
      const d = daysUntil(p.expiryDate);
      return Number.isFinite(d) && d <= 3;
    });
    const today = DB.localDateString();
    const monthStart = `${today.slice(0, 7)}-01`;
    const monthSpent = loaded.purchaseLines
      .filter(l => l.date >= monthStart && l.date <= today)
      .reduce((s, l) => s + Number(l.totalPrice || 0), 0);

    $('homeMetrics').innerHTML = [
      metricCard('Con stock', String(active.length), 'productos activos'),
      metricCard('Consumir pronto', String(expiring.length), 'caduca en 3 días o menos'),
      metricCard('Próxima compra', String(loaded.shopping.length), 'productos en la lista'),
      metricCard('Gastado este mes', money(monthSpent), 'según compras registradas')
    ].join('');

    const stats = await DB.getAllProductStats();
    const quick = stats
      .filter(s => s.currentStock > 0)
      .sort((a, b) => Number(b.habitual) - Number(a.habitual) || b.purchaseCount - a.purchaseCount || b.currentStock - a.currentStock)
      .slice(0, 6);

    $('quickConsumeList').innerHTML = quick.length ? quick.map(s => {
      const step = Math.min(defaultConsumeStep(s.product.unit), s.currentStock);
      return `<div class="list-row">
        <div class="list-main"><strong>${escapeHtml(s.product.name)}</strong><small>Quedan ${number(s.currentStock)} ${escapeHtml(s.product.unit || 'ud')} · ${s.habitual ? 'habitual' : 'aprendiendo'}</small></div>
        <div class="row-actions"><button class="mini-button" data-quick-consume="${s.product.id}" data-qty="${step}">− ${number(step)}</button></div>
      </div>`;
    }).join('') : `<div class="empty-state">Registra tu primera compra para empezar el ciclo.</div>`;

    const shoppingRows = loaded.shopping.map(item => {
      const p = loaded.productMap[item.productId];
      if (!p) return '';
      const stock = loaded.stockMap[p.id] || 0;
      return `<div class="list-row"><div class="list-main"><strong>${escapeHtml(p.name)}</strong><small>${item.source === 'auto' ? 'Sugerido por el histórico' : 'Añadido manualmente'} · stock ${number(stock)} ${escapeHtml(p.unit || 'ud')}</small></div><span class="badge ${item.source === 'auto' ? 'habitual' : ''}">${item.source === 'auto' ? 'AUTO' : 'MANUAL'}</span></div>`;
    }).filter(Boolean);
    $('homeShoppingList').innerHTML = shoppingRows.length ? shoppingRows.slice(0, 6).join('') : `<div class="empty-state">Tu lista de compra está vacía.</div>`;

    const expiry = active
      .filter(p => p.expiryDate)
      .map(p => ({ product: p, days: daysUntil(p.expiryDate) }))
      .filter(x => Number.isFinite(x.days))
      .sort((a, b) => a.days - b.days)
      .slice(0, 4);
    $('expiryPriority').innerHTML = expiry.length ? expiry.map(x => {
      const cls = x.days < 0 ? 'danger' : x.days <= 3 ? 'warning' : '';
      const label = x.days < 0 ? `Caducó hace ${Math.abs(x.days)} d.` : x.days === 0 ? 'Caduca hoy' : x.days === 1 ? 'Caduca mañana' : `Quedan ${x.days} días`;
      return `<article class="expiry-card ${cls}"><strong>${escapeHtml(x.product.name)}</strong><small>${escapeHtml(label)} · ${number(loaded.stockMap[x.product.id] || 0)} ${escapeHtml(x.product.unit || 'ud')}</small></article>`;
    }).join('') : `<div class="empty-state" style="grid-column:1/-1">Añade fechas de caducidad al ajustar productos para ver prioridades.</div>`;
  }

  async function renderStock(data) {
    const loaded = data || await preload();
    const q = $('stockSearch').value.trim().toLocaleLowerCase('es');
    const location = $('stockLocationFilter').value;
    const state = $('stockStateFilter').value;
    const stats = await DB.getAllProductStats();
    const statsMap = Object.fromEntries(stats.map(s => [s.product.id, s]));

    const products = loaded.products
      .filter(p => !q || p.name.toLocaleLowerCase('es').includes(q))
      .filter(p => !location || p.location === location)
      .filter(p => {
        const stock = loaded.stockMap[p.id] || 0;
        return state === 'all' || (state === 'positive' && stock > 0) || (state === 'zero' && stock <= 0);
      })
      .sort((a, b) => (loaded.stockMap[b.id] || 0) - (loaded.stockMap[a.id] || 0) || a.name.localeCompare(b.name, 'es'));

    $('stockList').innerHTML = products.length ? products.map(p => {
      const stock = loaded.stockMap[p.id] || 0;
      const s = statsMap[p.id];
      const d = daysUntil(p.expiryDate);
      let expiryBadge = '';
      if (Number.isFinite(d) && d <= 3) expiryBadge = `<span class="badge expiry">${d < 0 ? 'CADUCADO' : d === 0 ? 'HOY' : `${d} DÍAS`}</span>`;
      const habitBadge = s?.habitual ? `<span class="badge habitual">HABITUAL</span>` : s?.purchaseCount >= 2 ? `<span class="badge observe">APRENDIENDO</span>` : `<span class="badge">OCASIONAL</span>`;
      return `<article class="stock-card">
        <div class="stock-card-head"><div><h3>${escapeHtml(p.name)}</h3><div class="location">${escapeHtml(p.location || 'Sin ubicación')}${p.expiryDate ? ` · cad. ${formatDate(p.expiryDate)}` : ''}</div></div><div>${habitBadge} ${expiryBadge}</div></div>
        <div class="stock-qty">${number(stock)} <small>${escapeHtml(p.unit || 'ud')}</small></div>
        <div class="stock-card-actions">
          <button class="mini-button" data-open-consume="${p.id}">Consumir</button>
          <button class="mini-button danger" data-open-waste="${p.id}">Tirar</button>
          <button class="mini-button light" data-adjust="${p.id}">Ajustar</button>
          <button class="mini-button light" data-add-shopping="${p.id}">Comprar</button>
        </div>
      </article>`;
    }).join('') : `<div class="empty-state" style="grid-column:1/-1">No hay productos que coincidan con estos filtros.</div>`;
  }

  async function renderShopping(data) {
    const loaded = data || await preload();
    const stats = await DB.getAllProductStats();
    const statsMap = Object.fromEntries(stats.map(s => [s.product.id, s]));

    $('shoppingList').innerHTML = loaded.shopping.length ? loaded.shopping.map(item => {
      const p = loaded.productMap[item.productId];
      if (!p) return '';
      const s = statsMap[p.id];
      return `<div class="list-row"><div class="list-main"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(item.note || '')}${s?.typicalQty ? ` · compra habitual ${number(s.typicalQty)} ${escapeHtml(p.unit || 'ud')}` : ''}</small></div><div class="row-actions"><span class="badge ${item.source === 'auto' ? 'habitual' : ''}">${item.source === 'auto' ? 'AUTO' : 'MANUAL'}</span><button class="mini-button light" data-remove-shopping="${p.id}">✓</button></div></div>`;
    }).filter(Boolean).join('') : `<div class="empty-state">Nada pendiente. Cuando un producto habitual alcance su umbral aprendido aparecerá aquí.</div>`;

    const habits = stats
      .filter(s => s.purchaseCount > 0)
      .sort((a, b) => b.purchaseCount - a.purchaseCount || b.totalSpent - a.totalSpent)
      .slice(0, 12);
    $('habitList').innerHTML = habits.length ? habits.map(s => {
      const label = s.habitual ? 'Habitual' : s.purchaseCount >= 2 ? 'Aprendiendo' : 'Ocasional';
      const badgeClass = s.habitual ? 'habitual' : s.purchaseCount >= 2 ? 'observe' : '';
      return `<article class="habit-card"><div class="habit-card-top"><strong>${escapeHtml(s.product.name)}</strong><span class="badge ${badgeClass}">${label.toUpperCase()}</span></div><div class="habit-facts"><div><small>Compras</small><b>${s.purchaseCount}</b></div><div><small>Frecuencia</small><b>${s.avgInterval == null ? '—' : `${number(s.avgInterval)} d.`}</b></div><div><small>Reponer con</small><b>${s.reorderThreshold == null ? '—' : `${number(s.reorderThreshold)} ${escapeHtml(s.product.unit || 'ud')}`}</b></div></div></article>`;
    }).join('') : `<div class="empty-state">Todavía no hay histórico suficiente para aprender patrones.</div>`;
  }

  async function renderHistory() {
    const loaded = await preload();
    const from = historyRange.from || $('historyFrom').value;
    const to = historyRange.to || $('historyTo').value;
    const lines = loaded.purchaseLines.filter(l => EX.inRange(l.date, from, to));
    const tickets = loaded.tickets.filter(t => EX.inRange(t.date, from, to));
    const movements = loaded.movements.filter(m => m.type !== 'purchase' && EX.inRange(m.date, from, to));
    const spent = lines.reduce((s, l) => s + Number(l.totalPrice || 0), 0);
    const consumed = movements.filter(m => m.type === 'consume').length;
    const waste = movements.filter(m => m.type === 'waste').length;

    $('historyMetrics').innerHTML = [
      metricCard('Gastado', money(spent), `${formatDate(from)} → ${formatDate(to)}`),
      metricCard('Tickets', String(tickets.length), 'compras registradas'),
      metricCard('Productos distintos', String(new Set(lines.map(l => l.productId)).size), 'en el periodo'),
      metricCard('Movimientos', String(consumed + waste), `${consumed} consumos · ${waste} desperdicios`)
    ].join('');

    const grouped = {};
    lines.forEach(l => {
      const key = l.productId;
      if (!grouped[key]) grouped[key] = { name: l.productName || loaded.productMap[key]?.name || 'Producto', purchases: 0, qty: 0, spent: 0, unit: l.unit || loaded.productMap[key]?.unit || '' };
      grouped[key].purchases += 1;
      grouped[key].qty += Number(l.qty || 0);
      grouped[key].spent += Number(l.totalPrice || 0);
    });
    const productRows = Object.values(grouped).sort((a, b) => b.spent - a.spent || b.purchases - a.purchases);
    $('historyProductsTable').innerHTML = productRows.length ? productRows.map(r => `<tr><td>${escapeHtml(r.name)}</td><td>${r.purchases}</td><td>${number(r.qty)} ${escapeHtml(r.unit)}</td><td>${money(r.spent)}</td></tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--muted)">Sin compras en el periodo.</td></tr>`;

    const timelineItems = [];
    lines.forEach(l => timelineItems.push({ date: l.date, type: 'purchase', name: l.productName || 'Producto', detail: `+${number(l.qty)} ${l.unit || ''}${l.totalPrice != null ? ` · ${money(l.totalPrice)}` : ''}${l.store ? ` · ${l.store}` : ''}`, createdAt: l.createdAt }));
    movements.forEach(m => {
      const p = loaded.productMap[m.productId];
      const labels = { consume: 'Consumido', waste: 'Desperdiciado', adjustment: 'Ajuste' };
      timelineItems.push({ date: m.date, type: m.type, name: p?.name || 'Producto', detail: `${labels[m.type] || m.type}: ${m.qty > 0 ? '+' : ''}${number(m.qty)} ${p?.unit || ''}${m.note ? ` · ${m.note}` : ''}`, createdAt: m.createdAt });
    });
    timelineItems.sort((a, b) => `${b.date}|${b.createdAt}`.localeCompare(`${a.date}|${a.createdAt}`));
    $('historyMovements').innerHTML = timelineItems.length ? timelineItems.slice(0, 80).map(i => `<div class="timeline-item"><div class="timeline-date">${formatDate(i.date)}</div><div class="timeline-dot ${i.type === 'adjustment' ? 'adjust' : i.type}"></div><div class="timeline-content"><strong>${escapeHtml(i.name)}</strong><small>${escapeHtml(i.detail)}</small></div></div>`).join('') : `<div class="empty-state">No hay movimientos en este periodo.</div>`;
  }

  async function renderDataStatus() {
    const data = await preload();
    const lastBackup = await DB.getSetting('lastFullBackupAt', null);
    const lastRestore = await DB.getSetting('lastRestoreAt', null);
    $('backupStatus').innerHTML = `<strong>Última copia completa:</strong> ${lastBackup ? new Date(lastBackup).toLocaleString('es-ES') : 'todavía ninguna'}<br><strong>Última restauración:</strong> ${lastRestore ? new Date(lastRestore).toLocaleString('es-ES') : 'ninguna'}<br><strong>Registros:</strong> ${data.tickets.length} tickets · ${data.purchaseLines.length} líneas · ${data.movements.length} movimientos`;

    let estimateText = 'No disponible';
    let persistentText = 'No disponible';
    if (navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const used = Number(est.usage || 0) / 1024 / 1024;
        const quota = Number(est.quota || 0) / 1024 / 1024;
        estimateText = `${used.toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB usados de ${quota.toLocaleString('es-ES', { maximumFractionDigits: 0 })} MB`;
      } catch (_) {}
    }
    if (navigator.storage?.persisted) {
      try { persistentText = (await navigator.storage.persisted()) ? 'Sí' : 'No'; } catch (_) {}
    }
    $('storageStatus').innerHTML = `<div class="data-fact"><span>Base</span><strong>IndexedDB local</strong></div><div class="data-fact"><span>Persistencia concedida</span><strong>${persistentText}</strong></div><div class="data-fact"><span>Uso estimado</span><strong>${estimateText}</strong></div><div class="data-fact"><span>Sincronización automática</span><strong>No</strong></div>`;
  }

  async function refreshAll() {
    await DB.evaluateAllReorders();
    const data = await preload();
    await refreshKnownProducts(data);
    await Promise.all([renderHome(data), renderStock(data), renderShopping(data)]);
    if (document.querySelector('[data-screen="history"]').classList.contains('active')) await renderHistory();
    if (document.querySelector('[data-screen="data"]').classList.contains('active')) await renderDataStatus();
  }

  function makePurchaseLine(values = {}) {
    const row = document.createElement('div');
    row.className = 'purchase-line';
    row.innerHTML = `<input class="line-name" type="text" list="knownProducts" placeholder="Producto" value="${escapeHtml(values.name || '')}" required>
      <input class="line-qty" type="number" min="0.01" step="0.01" value="${escapeHtml(values.qty || 1)}" aria-label="Cantidad">
      <select class="line-unit" aria-label="Unidad"><option>ud</option><option>kg</option><option>g</option><option>l</option><option>ml</option><option>paquete</option><option>bote</option><option>lata</option></select>
      <input class="line-price" type="number" min="0" step="0.01" placeholder="Total €" value="${values.totalPrice ?? ''}" aria-label="Precio total">
      <button class="line-remove" type="button" aria-label="Eliminar línea">×</button>`;
    row.querySelector('.line-unit').value = values.unit || 'ud';
    row.querySelector('.line-remove').addEventListener('click', () => row.remove());
    $('purchaseLines').appendChild(row);
  }

  function resetReceiptImport() {
    receiptFiles = [];
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    receiptPreviewUrl = null;
    $('receiptCameraInput').value = '';
    $('receiptGalleryInput').value = '';
    $('receiptPreviewWrap').hidden = true;
    $('receiptPreview').removeAttribute('src');
    $('receiptFileLabel').textContent = 'Ticket seleccionado';
    $('runReceiptOcrBtn').disabled = true;
    $('receiptOcrProgressWrap').hidden = true;
    $('receiptOcrProgressBar').style.width = '0%';
    $('receiptOcrProgressText').textContent = 'Preparando OCR…';
    $('receiptOcrDetails').hidden = true;
    $('receiptOcrDetails').open = false;
    $('receiptOcrText').value = '';
  }

  function setReceiptFiles(fileList) {
    const files = Array.from(fileList || []).filter(file => file && String(file.type || '').startsWith('image/'));
    if (!files.length) return;
    receiptFiles = files;
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    receiptPreviewUrl = URL.createObjectURL(files[0]);
    $('receiptPreview').src = receiptPreviewUrl;
    $('receiptPreviewWrap').hidden = false;
    $('receiptFileLabel').textContent = files.length === 1 ? files[0].name || '1 imagen seleccionada' : `${files.length} imágenes seleccionadas`;
    $('runReceiptOcrBtn').disabled = false;
    $('receiptOcrDetails').hidden = true;
    $('receiptOcrProgressWrap').hidden = true;
    toast(files.length === 1 ? 'Ticket listo para leer' : `${files.length} fotos listas para leer`);
  }

  function ocrProgress(message) {
    const wrap = $('receiptOcrProgressWrap');
    const bar = $('receiptOcrProgressBar');
    const label = $('receiptOcrProgressText');
    wrap.hidden = false;
    const status = String(message?.status || '');
    const progress = Number(message?.progress);
    const pct = Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress * 100))) : 8;
    if (status === 'foodloop-image') {
      const current = Number(message.index || 0) + 1;
      const total = Number(message.total || receiptFiles.length || 1);
      bar.style.width = `${Math.round((current - 1) / total * 100)}%`;
      label.textContent = `Preparando imagen ${current} de ${total}…`;
      return;
    }
    const labels = {
      'loading tesseract core': 'Cargando motor OCR…',
      'initializing tesseract': 'Inicializando OCR…',
      'loading language traineddata': 'Cargando modelo de español…',
      'initializing api': 'Preparando reconocimiento…',
      'recognizing text': 'Leyendo el ticket…',
      'done': 'Lectura completada'
    };
    bar.style.width = `${status === 'done' ? 100 : pct}%`;
    label.textContent = `${labels[status] || 'Procesando ticket…'}${Number.isFinite(progress) && status !== 'done' ? ` ${pct}%` : ''}`;
  }

  function currentPurchaseHasContent() {
    return [...$('purchaseLines').querySelectorAll('.purchase-line')].some(row => row.querySelector('.line-name')?.value.trim());
  }

  function applyReceiptResult(result, askBeforeReplace = true) {
    if (!result) return 0;
    if (result.date) $('purchaseDate').value = result.date;
    if (result.store) $('purchaseStore').value = result.store;
    if (result.total != null) $('purchaseTicketTotal').value = Number(result.total).toFixed(2);

    const lines = Array.isArray(result.lines) ? result.lines : [];
    if (!lines.length) return 0;
    if (askBeforeReplace && currentPurchaseHasContent() && !confirm('El OCR sustituirá las líneas de producto que ya has escrito. ¿Continuar?')) return 0;
    $('purchaseLines').innerHTML = '';
    lines.forEach(line => makePurchaseLine(line));
    return lines.length;
  }

  function parseReceiptText(askBeforeReplace = true) {
    const text = $('receiptOcrText').value.trim();
    if (!text) return toast('No hay texto del ticket para convertir');
    const result = OCR?.parseReceipt(text);
    const count = applyReceiptResult(result, askBeforeReplace);
    if (count) toast(`${count} producto${count === 1 ? '' : 's'} detectado${count === 1 ? '' : 's'} · revísalos antes de guardar`);
    else toast('No he podido separar productos automáticamente; puedes editar el texto o añadir líneas manualmente');
  }

  async function runReceiptOcr() {
    if (!receiptFiles.length) return toast('Selecciona una foto del ticket');
    const button = $('runReceiptOcrBtn');
    button.disabled = true;
    button.textContent = 'Leyendo…';
    $('receiptOcrProgressWrap').hidden = false;
    $('receiptOcrProgressBar').style.width = '2%';
    $('receiptOcrProgressText').textContent = 'Preparando OCR…';
    try {
      const text = await OCR.recognizeFiles(receiptFiles, ocrProgress);
      $('receiptOcrText').value = text.trim();
      $('receiptOcrDetails').hidden = false;
      $('receiptOcrDetails').open = true;
      const result = OCR.parseReceipt(text);
      const count = applyReceiptResult(result, false);
      if (count) toast(`Ticket leído: ${count} producto${count === 1 ? '' : 's'} · revisa la tabla`);
      else toast('Texto leído, pero no he separado productos. Revisa el texto detectado.');
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo leer el ticket. Puedes introducir la compra manualmente.');
    } finally {
      button.disabled = receiptFiles.length === 0;
      button.textContent = 'Leer ticket';
    }
  }

  async function openPurchase() {
    $('purchaseForm').reset();
    resetReceiptImport();
    $('purchaseDate').value = DB.localDateString();
    $('purchaseLines').innerHTML = '';
    makePurchaseLine();
    openDialog('purchaseDialog');
  }

  async function submitPurchase(e) {
    e.preventDefault();
    const lines = [...$('purchaseLines').querySelectorAll('.purchase-line')].map(row => ({
      name: row.querySelector('.line-name').value.trim(),
      qty: Number(row.querySelector('.line-qty').value || 0),
      unit: row.querySelector('.line-unit').value,
      totalPrice: row.querySelector('.line-price').value,
      rawName: row.querySelector('.line-name').value.trim()
    })).filter(l => l.name && l.qty > 0);

    try {
      await DB.createPurchase({ date: $('purchaseDate').value, store: $('purchaseStore').value, total: $('purchaseTicketTotal').value, lines });
      closeDialog('purchaseDialog');
      toast(`Compra guardada: ${lines.length} producto${lines.length === 1 ? '' : 's'}`);
      await refreshAll();
    } catch (err) {
      alert(err.message || 'No se pudo guardar la compra.');
    }
  }

  async function quickConsume(productId, qty) {
    const p = await DB.get('products', productId);
    if (!p) return;
    try {
      await DB.recordConsumption(productId, qty, 'consume');
      toast(`${p.name}: −${number(qty)} ${p.unit || 'ud'}`);
      await refreshAll();
    } catch (err) { toast(err.message); }
  }

  async function openConsume(productId, type = 'consume') {
    const p = await DB.get('products', productId);
    if (!p) return;
    const stock = await DB.getStock(productId);
    $('consumeProductId').value = productId;
    $('consumeDialogTitle').textContent = p.name;
    $('consumeType').value = type;
    $('consumeQuantity').step = p.unit === 'kg' || p.unit === 'l' ? '0.1' : p.unit === 'g' || p.unit === 'ml' ? '10' : '1';
    $('consumeQuantity').value = Math.min(defaultConsumeStep(p.unit), Math.max(stock, defaultConsumeStep(p.unit)));
    $('consumeQuantity').max = Math.max(0, stock);
    $('consumeNote').value = '';
    openDialog('consumeDialog');
  }

  async function submitConsume(e) {
    e.preventDefault();
    const id = $('consumeProductId').value;
    try {
      await DB.recordConsumption(id, Number($('consumeQuantity').value), $('consumeType').value, $('consumeNote').value.trim());
      closeDialog('consumeDialog');
      toast('Movimiento registrado');
      await refreshAll();
    } catch (err) { alert(err.message || 'No se pudo registrar.'); }
  }

  async function openAdjust(productId = '') {
    $('adjustForm').reset();
    $('adjustProductId').value = productId;
    $('adjustNote').value = 'Corrección manual';
    if (productId) {
      const p = await DB.get('products', productId);
      if (!p) return;
      $('adjustProductName').value = p.name;
      $('adjustTargetStock').value = await DB.getStock(productId);
      $('adjustUnit').value = p.unit || 'ud';
      $('adjustLocation').value = p.location || 'Nevera';
      $('adjustExpiry').value = p.expiryDate || '';
    } else {
      $('adjustProductName').value = '';
      $('adjustTargetStock').value = 1;
      $('adjustUnit').value = 'ud';
      $('adjustLocation').value = 'Nevera';
      $('adjustExpiry').value = '';
    }
    openDialog('adjustDialog');
  }

  async function submitAdjust(e) {
    e.preventDefault();
    try {
      let product;
      const fixedId = $('adjustProductId').value;
      if (fixedId) {
        product = await DB.updateProduct(fixedId, { name: $('adjustProductName').value.trim(), unit: $('adjustUnit').value, location: $('adjustLocation').value, expiryDate: $('adjustExpiry').value });
      } else {
        product = await DB.ensureProduct({ name: $('adjustProductName').value.trim(), unit: $('adjustUnit').value, location: $('adjustLocation').value, expiryDate: $('adjustExpiry').value });
        await DB.updateProduct(product.id, { unit: $('adjustUnit').value, location: $('adjustLocation').value, expiryDate: $('adjustExpiry').value });
      }
      await DB.setActualStock(product.id, Number($('adjustTargetStock').value), $('adjustNote').value.trim());
      closeDialog('adjustDialog');
      toast('Stock corregido');
      await refreshAll();
    } catch (err) { alert(err.message || 'No se pudo ajustar el producto.'); }
  }

  async function addProductToShopping(productId) {
    const p = await DB.get('products', productId);
    if (!p) return;
    await DB.put('shopping', { id: p.id, productId: p.id, source: 'manual', note: 'Añadido manualmente', addedAt: new Date().toISOString() });
    toast(`${p.name} añadido a la compra`);
    await refreshAll();
  }

  async function submitShopping(e) {
    e.preventDefault();
    try {
      await DB.addShoppingByName($('shoppingProductName').value.trim(), $('shoppingNote').value.trim());
      closeDialog('shoppingDialog');
      toast('Añadido a la lista');
      await refreshAll();
    } catch (err) { alert(err.message); }
  }

  async function exportCSV() {
    const count = await EX.downloadPeriodCSV($('historyFrom').value, $('historyTo').value);
    toast(`CSV generado con ${count} filas`);
  }

  async function exportPeriodArchive() {
    try {
      await EX.downloadPeriodArchive($('historyFrom').value, $('historyTo').value);
      toast('Archivo restaurable generado');
    } catch (err) { alert(err.message); }
  }

  async function restoreBackup(file) {
    try {
      const payload = await EX.parseBackupFile(file);
      const rangeText = payload.kind === 'period-archive' ? ` del periodo ${formatDate(payload.range?.from)} → ${formatDate(payload.range?.to)}` : ' completo';
      if (!confirm(`Vas a restaurar un backup${rangeText}. Esto sustituirá los datos de este navegador. ¿Continuar?`)) return;
      await EX.restorePayload(payload);
      toast('Backup restaurado correctamente');
      await refreshAll();
    } catch (err) { alert(err.message || 'No se pudo restaurar el archivo.'); }
  }

  async function requestPersistence() {
    if (!navigator.storage?.persist) {
      toast('Este navegador no expone esta función');
      return;
    }
    try {
      const granted = await navigator.storage.persist();
      toast(granted ? 'Persistencia concedida' : 'El navegador no la ha concedido');
      await renderDataStatus();
    } catch (_) { toast('No se pudo solicitar persistencia'); }
  }

  function initHistoryDates() {
    const today = DB.localDateString();
    const from = `${today.slice(0, 7)}-01`;
    $('historyFrom').value = from;
    $('historyTo').value = today;
    historyRange = { from, to: today };
  }

  function bindEvents() {
    document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', e => {
      if (el.tagName === 'A') e.preventDefault();
      navigate(el.dataset.nav);
    }));
    document.querySelectorAll('[data-close-dialog]').forEach(el => el.addEventListener('click', () => closeDialog(el.dataset.closeDialog)));

    $('newPurchaseTopBtn').addEventListener('click', openPurchase);
    $('newPurchaseHeroBtn').addEventListener('click', openPurchase);
    $('addPurchaseLineBtn').addEventListener('click', () => makePurchaseLine());
    $('receiptCameraInput').addEventListener('click', e => { e.currentTarget.value = ''; });
    $('receiptGalleryInput').addEventListener('click', e => { e.currentTarget.value = ''; });
    $('receiptCameraInput').addEventListener('change', e => setReceiptFiles(e.target.files));
    $('receiptGalleryInput').addEventListener('change', e => setReceiptFiles(e.target.files));
    $('runReceiptOcrBtn').addEventListener('click', runReceiptOcr);
    $('parseReceiptTextBtn').addEventListener('click', () => parseReceiptText(true));
    $('purchaseForm').addEventListener('submit', submitPurchase);
    $('consumeForm').addEventListener('submit', submitConsume);
    $('adjustForm').addEventListener('submit', submitAdjust);
    $('shoppingForm').addEventListener('submit', submitShopping);
    $('addAdjustmentBtn').addEventListener('click', () => openAdjust());
    $('manualShoppingBtn').addEventListener('click', () => { $('shoppingForm').reset(); openDialog('shoppingDialog'); });
    $('privacyInfoBtn').addEventListener('click', () => openDialog('privacyDialog'));

    ['stockSearch', 'stockLocationFilter', 'stockStateFilter'].forEach(id => {
      $(id).addEventListener('input', () => renderStock());
      $(id).addEventListener('change', () => renderStock());
    });

    document.body.addEventListener('click', async e => {
      const quick = e.target.closest('[data-quick-consume]');
      if (quick) return quickConsume(quick.dataset.quickConsume, Number(quick.dataset.qty));
      const consume = e.target.closest('[data-open-consume]');
      if (consume) return openConsume(consume.dataset.openConsume, 'consume');
      const waste = e.target.closest('[data-open-waste]');
      if (waste) return openConsume(waste.dataset.openWaste, 'waste');
      const adjust = e.target.closest('[data-adjust]');
      if (adjust) return openAdjust(adjust.dataset.adjust);
      const addShop = e.target.closest('[data-add-shopping]');
      if (addShop) return addProductToShopping(addShop.dataset.addShopping);
      const removeShop = e.target.closest('[data-remove-shopping]');
      if (removeShop) {
        await DB.remove('shopping', removeShop.dataset.removeShopping);
        toast('Marcado como resuelto');
        return refreshAll();
      }
    });

    $('applyHistoryRangeBtn').addEventListener('click', async () => {
      const from = $('historyFrom').value;
      const to = $('historyTo').value;
      if (!from || !to || from > to) return alert('Selecciona un periodo válido.');
      historyRange = { from, to };
      await renderHistory();
    });
    $('exportXlsxBtn').addEventListener('click', async () => {
      try {
        const result = await XLSX.downloadPeriodXLSX($('historyFrom').value, $('historyTo').value);
        toast(`Excel generado · ${result.sheets} hojas`);
      } catch (err) { alert(err.message || 'No se pudo generar el Excel.'); }
    });
    $('exportCsvBtn').addEventListener('click', exportCSV);
    $('exportPeriodArchiveBtn').addEventListener('click', exportPeriodArchive);
    $('fullBackupBtn').addEventListener('click', async () => { await EX.downloadFullBackup(); toast('Backup completo descargado'); await renderDataStatus(); });
    $('restoreBackupBtn').addEventListener('click', () => { $('backupFileInput').value = ''; $('backupFileInput').click(); });
    $('backupFileInput').addEventListener('change', e => { const file = e.target.files?.[0]; if (file) restoreBackup(file); });
    $('requestPersistenceBtn').addEventListener('click', requestPersistence);
    $('clearAllDataBtn').addEventListener('click', async () => {
      if (!confirm('Esto borrará toda la base FoodLoop de ESTE navegador. ¿Continuar?')) return;
      if (!confirm('Última confirmación: los datos solo podrán recuperarse si tienes un backup JSON. ¿Borrar?')) return;
      await DB.clearAllData();
      toast('Datos locales borrados');
      await refreshAll();
    });
  }

  async function init() {
    await DB.open();
    initHistoryDates();
    bindEvents();
    const requested = location.hash.replace('#', '');
    const valid = ['home', 'stock', 'shopping', 'history', 'data'];
    navigate(valid.includes(requested) ? requested : 'home');
    await refreshAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
