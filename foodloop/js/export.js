(function () {
  'use strict';

  const DB = () => window.FoodLoopDB;

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function safeDatePart(value) {
    return String(value || '').replace(/[^0-9-]/g, '') || 'sin-fecha';
  }

  function inRange(date, from, to) {
    const value = String(date || '').slice(0, 10);
    if (!value) return false;
    if (from && value < from) return false;
    if (to && value > to) return false;
    return true;
  }

  async function downloadFullBackup() {
    const data = await DB().exportAllData();
    const exportedAt = new Date().toISOString();
    const payload = {
      app: 'FoodLoop',
      schemaVersion: DB().DB_VERSION,
      kind: 'full-backup',
      exportedAt,
      description: 'Copia completa y restaurable de FoodLoop.',
      data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `foodloop-backup-completo-${DB().localDateString()}.json`);
    await DB().setSetting('lastFullBackupAt', exportedAt);
    return payload;
  }

  function csvEscape(value) {
    if (value == null) return '';
    const text = String(value).replace(/\r?\n/g, ' ');
    return `"${text.replace(/"/g, '""')}"`;
  }

  async function downloadPeriodCSV(from, to) {
    const [products, purchaseLines, movements] = await Promise.all([
      DB().getAll('products'),
      DB().getAll('purchaseLines'),
      DB().getAll('movements')
    ]);
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    const rows = [];

    purchaseLines.filter(l => inRange(l.date, from, to)).forEach(line => {
      rows.push({
        date: line.date,
        type: 'COMPRA',
        product: line.productName || productMap[line.productId]?.name || 'Producto',
        qty: Number(line.qty || 0),
        unit: line.unit || productMap[line.productId]?.unit || '',
        store: line.store || '',
        amount: line.totalPrice == null ? '' : Number(line.totalPrice),
        note: line.rawName && line.rawName !== line.productName ? `Ticket: ${line.rawName}` : ''
      });
    });

    movements
      .filter(m => m.type !== 'purchase' && inRange(m.date, from, to))
      .forEach(m => {
        const typeMap = { consume: 'CONSUMO', waste: 'DESPERDICIO', adjustment: 'AJUSTE' };
        const p = productMap[m.productId] || {};
        rows.push({
          date: m.date,
          type: typeMap[m.type] || String(m.type || '').toUpperCase(),
          product: p.name || 'Producto',
          qty: Number(m.qty || 0),
          unit: p.unit || '',
          store: '',
          amount: '',
          note: m.note || ''
        });
      });

    rows.sort((a, b) => `${a.date}|${a.type}|${a.product}`.localeCompare(`${b.date}|${b.type}|${b.product}`));

    const headers = ['Fecha', 'Tipo', 'Producto', 'Cantidad', 'Unidad', 'Tienda', 'Importe EUR', 'Nota'];
    const lines = [headers.map(csvEscape).join(';')];
    rows.forEach(r => {
      lines.push([
        r.date,
        r.type,
        r.product,
        r.qty,
        r.unit,
        r.store,
        r.amount,
        r.note
      ].map(csvEscape).join(';'));
    });

    const content = '\ufeff' + lines.join('\r\n');
    downloadBlob(new Blob([content], { type: 'text/csv;charset=utf-8' }), `foodloop-historico-${safeDatePart(from)}_${safeDatePart(to)}.csv`);
    return rows.length;
  }

  async function buildPeriodArchive(from, to) {
    if (!from || !to) throw new Error('Selecciona fecha inicial y final.');
    if (from > to) throw new Error('La fecha inicial no puede ser posterior a la final.');

    const all = await DB().exportAllData();
    const productMap = Object.fromEntries(all.products.map(p => [p.id, p]));
    const openingStock = {};

    for (const m of all.movements) {
      if (String(m.date || '').slice(0, 10) < from) {
        openingStock[m.productId] = (openingStock[m.productId] || 0) + Number(m.qty || 0);
      }
    }

    const movementsInRange = all.movements.filter(m => inRange(m.date, from, to));
    const linesInRange = all.purchaseLines.filter(l => inRange(l.date, from, to));
    const ticketsInRange = all.tickets.filter(t => inRange(t.date, from, to));
    const productIds = new Set();

    movementsInRange.forEach(m => productIds.add(m.productId));
    linesInRange.forEach(l => productIds.add(l.productId));
    Object.entries(openingStock).forEach(([productId, qty]) => {
      if (Math.abs(qty) > 0.000001) productIds.add(productId);
    });

    const syntheticOpening = Object.entries(openingStock)
      .filter(([productId, qty]) => productIds.has(productId) && Math.abs(qty) > 0.000001)
      .map(([productId, qty]) => ({
        id: `archive-opening-${productId}-${from}`,
        productId,
        type: 'adjustment',
        qty,
        date: from,
        ticketId: null,
        note: `Saldo inicial reconstruido para el archivo ${from} → ${to}`,
        createdAt: `${from}T00:00:00.000Z`
      }));

    const closingStock = {};
    [...syntheticOpening, ...movementsInRange].forEach(m => {
      closingStock[m.productId] = (closingStock[m.productId] || 0) + Number(m.qty || 0);
    });

    return {
      app: 'FoodLoop',
      schemaVersion: DB().DB_VERSION,
      kind: 'period-archive',
      exportedAt: new Date().toISOString(),
      range: { from, to },
      description: 'Archivo autocontenido del periodo. Incluye saldos iniciales para poder restaurar el stock al cierre del periodo.',
      closingStock,
      data: {
        products: all.products.filter(p => productIds.has(p.id)),
        tickets: ticketsInRange,
        purchaseLines: linesInRange,
        movements: [...syntheticOpening, ...movementsInRange],
        shopping: [],
        settings: [{ key: 'restoredArchiveRange', value: { from, to }, updatedAt: new Date().toISOString() }]
      }
    };
  }

  async function downloadPeriodArchive(from, to) {
    const payload = await buildPeriodArchive(from, to);
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }),
      `foodloop-archivo-${safeDatePart(from)}_${safeDatePart(to)}.json`
    );
    return payload;
  }

  async function parseBackupFile(file) {
    const text = await file.text();
    const payload = JSON.parse(text);
    if (!payload || payload.app !== 'FoodLoop' || !payload.data) {
      throw new Error('El archivo no parece un backup válido de FoodLoop.');
    }
    if (!['full-backup', 'period-archive'].includes(payload.kind)) {
      throw new Error('Tipo de backup no compatible.');
    }
    return payload;
  }

  async function restorePayload(payload) {
    await DB().importAllData(payload.data, { replace: true });
    await DB().setSetting('lastRestoreAt', new Date().toISOString());
    await DB().setSetting('lastRestoreKind', payload.kind);
    return true;
  }

  window.FoodLoopExport = {
    downloadFullBackup,
    downloadPeriodCSV,
    buildPeriodArchive,
    downloadPeriodArchive,
    parseBackupFile,
    restorePayload,
    inRange
  };
})();
