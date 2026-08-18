(function () {
  'use strict';

  const DB = () => window.FoodLoopDB;
  const EX = () => window.FoodLoopExport;
  const encoder = new TextEncoder();

  function xmlEscape(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function colName(index) {
    let n = index + 1;
    let out = '';
    while (n > 0) {
      n -= 1;
      out = String.fromCharCode(65 + (n % 26)) + out;
      n = Math.floor(n / 26);
    }
    return out;
  }

  function sheetXml(rows) {
    const body = rows.map((row, r) => {
      const cells = row.map((value, c) => {
        const ref = `${colName(c)}${r + 1}`;
        const headerStyle = r === 0 ? ' s="1"' : '';
        if (typeof value === 'number' && Number.isFinite(value)) {
          return `<c r="${ref}"${headerStyle}><v>${value}</v></c>`;
        }
        return `<c r="${ref}" t="inlineStr"${headerStyle}><is><t>${xmlEscape(value)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}">${cells}</row>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
  }

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (const b of bytes) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function u16(value) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, value, true);
    return b;
  }

  function u32(value) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, value >>> 0, true);
    return b;
  }

  function concat(parts) {
    const length = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(length);
    let offset = 0;
    parts.forEach(p => { out.set(p, offset); offset += p.length; });
    return out;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosTime, dosDate };
  }

  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const { dosTime, dosDate } = dosDateTime();

    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
      const crc = crc32(data);

      const localHeader = concat([
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name
      ]);
      localParts.push(localHeader, data);

      const centralHeader = concat([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset), name
      ]);
      centralParts.push(centralHeader);
      offset += localHeader.length + data.length;
    }

    const central = concat(centralParts);
    const end = concat([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(central.length), u32(offset), u16(0)
    ]);
    return concat([...localParts, central, end]);
  }

  function save(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  async function downloadPeriodXLSX(from, to) {
    if (!from || !to || from > to) throw new Error('Selecciona un periodo válido.');

    const [products, tickets, purchaseLines, movements, stats] = await Promise.all([
      DB().getAll('products'),
      DB().getAll('tickets'),
      DB().getAll('purchaseLines'),
      DB().getAll('movements'),
      DB().getAllProductStats()
    ]);
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    const stockMap = await DB().getStockMap();
    const lines = purchaseLines.filter(l => EX().inRange(l.date, from, to));
    const periodTickets = tickets.filter(t => EX().inRange(t.date, from, to));
    const periodMovements = movements.filter(m => m.type !== 'purchase' && EX().inRange(m.date, from, to));
    const spent = lines.reduce((s, l) => s + Number(l.totalPrice || 0), 0);

    const grouped = {};
    for (const line of lines) {
      if (!grouped[line.productId]) grouped[line.productId] = { qty: 0, spent: 0, purchases: 0, unit: line.unit || '' };
      grouped[line.productId].qty += Number(line.qty || 0);
      grouped[line.productId].spent += Number(line.totalPrice || 0);
      grouped[line.productId].purchases += 1;
    }
    const statsMap = Object.fromEntries(stats.map(s => [s.product.id, s]));

    const sheets = [
      {
        name: 'Resumen', rows: [
          ['Métrica', 'Valor'],
          ['Periodo', `${from} a ${to}`],
          ['Generado', new Date().toLocaleString('es-ES')],
          ['Gasto total EUR', spent],
          ['Tickets', periodTickets.length],
          ['Productos distintos', new Set(lines.map(l => l.productId)).size],
          ['Movimientos de consumo', periodMovements.filter(m => m.type === 'consume').length],
          ['Movimientos de desperdicio', periodMovements.filter(m => m.type === 'waste').length]
        ]
      },
      {
        name: 'Tickets', rows: [
          ['Fecha', 'Tienda', 'Total EUR', 'ID'],
          ...periodTickets.sort((a,b) => a.date.localeCompare(b.date)).map(t => [t.date, t.store || '', t.total == null ? '' : Number(t.total), t.id])
        ]
      },
      {
        name: 'Compras', rows: [
          ['Fecha', 'Tienda', 'Producto', 'Cantidad', 'Unidad', 'Importe EUR', 'Ticket ID'],
          ...lines.sort((a,b) => a.date.localeCompare(b.date)).map(l => [l.date, l.store || '', l.productName || productMap[l.productId]?.name || '', Number(l.qty || 0), l.unit || '', l.totalPrice == null ? '' : Number(l.totalPrice), l.ticketId])
        ]
      },
      {
        name: 'Movimientos', rows: [
          ['Fecha', 'Tipo', 'Producto', 'Cantidad', 'Unidad', 'Nota'],
          ...periodMovements.sort((a,b) => a.date.localeCompare(b.date)).map(m => [m.date, m.type, productMap[m.productId]?.name || '', Number(m.qty || 0), productMap[m.productId]?.unit || '', m.note || ''])
        ]
      },
      {
        name: 'Productos', rows: [
          ['Producto', 'Compras periodo', 'Cantidad periodo', 'Gasto periodo EUR', 'Stock actual', 'Unidad', 'Ubicación', 'Clasificación', 'Frecuencia días'],
          ...products
            .filter(p => grouped[p.id] || Number(stockMap[p.id] || 0) !== 0)
            .sort((a,b) => a.name.localeCompare(b.name, 'es'))
            .map(p => {
              const g = grouped[p.id] || { purchases: 0, qty: 0, spent: 0 };
              const s = statsMap[p.id];
              const classification = s?.habitual ? 'Habitual' : s?.purchaseCount >= 2 ? 'Aprendiendo' : 'Ocasional';
              return [p.name, g.purchases, g.qty, g.spent, Number(stockMap[p.id] || 0), p.unit || '', p.location || '', classification, s?.avgInterval == null ? '' : Number(s.avgInterval.toFixed(1))];
            })
        ]
      }
    ];

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
    const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${xmlEscape(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`;
    const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

    const files = [
      { name: '[Content_Types].xml', data: contentTypes },
      { name: '_rels/.rels', data: rootRels },
      { name: 'xl/workbook.xml', data: workbook },
      { name: 'xl/_rels/workbook.xml.rels', data: workbookRels },
      { name: 'xl/styles.xml', data: styles },
      ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows) }))
    ];

    save(makeZip(files), `foodloop-historico-${from}_${to}.xlsx`);
    return { sheets: sheets.length, rows: lines.length + periodMovements.length };
  }

  window.FoodLoopXLSX = { downloadPeriodXLSX };
})();
