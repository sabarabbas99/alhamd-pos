const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function normalizePhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  if (clean.startsWith('92') && clean.length >= 11) {
    clean = '0' + clean.slice(2);
  }
  return clean.replace(/^0+/, '');
}

const app = express();
const PORT = 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const DB_CONFIG = {
  host: 'elitestarx.xyz',
  port: 3306,
  user: 'elitestarx_alhamd_user',
  password: 'Adnan@486',
  database: 'elitestarx_alhamd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 7000,
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

// Local cache file for instant offline resilience
const CACHE_FILE = path.join(__dirname, 'local_db_cache.json');

function saveLocalCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Cache save error:', err.message);
  }
}

function loadLocalCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Cache read error:', err.message);
  }
  return null;
}

// 1. Health / Status check
app.get('/api/status', async (req, res) => {
  try {
    const p = getPool();
    await p.query('SELECT 1');
    res.json({ online: true, database: 'elitestarx_alhamd', host: 'elitestarx.xyz' });
  } catch (err) {
    res.json({ online: false, error: err.message });
  }
});

// 2. GET /api/all-data
app.get('/api/all-data', async (req, res) => {
  try {
    const p = getPool();

    // Fetch settings
    const [sRows] = await p.query('SELECT * FROM store_settings WHERE id = 1');
    const settings = sRows.length > 0 ? sRows[0] : {
      storeName: 'Alhamd Super Store',
      tagline: 'Karyana & General Store',
      phone: '0300-1234567',
      whatsapp: '03001234567',
      address: 'Main Bazaar, Mohalla Karyana Market',
      receiptNote: 'Tashreef aawri ka shukriya! Sauda tabdeel ya wapis 3 din me ba-shart-e-parchi.',
      printerWidth: '58mm',
      imgbbApiKey: '',
    };

    // Fetch categories
    const [cRows] = await p.query('SELECT name FROM categories ORDER BY id ASC');
    const categories = ['All', ...cRows.map(r => r.name)];

    // Fetch products
    const [pRows] = await p.query('SELECT * FROM products ORDER BY name ASC');
    const products = pRows.map(r => ({
      ...r,
      purchasePrice: Number(r.purchasePrice || 0),
      salePrice: Number(r.salePrice || 0),
      stock: Number(r.stock || 0),
      minStock: Number(r.minStock || 5),
    }));

    // Fetch customers
    const [custRows] = await p.query('SELECT * FROM customers ORDER BY name ASC');
    const customers = custRows.map(r => {
      let history = [];
      try {
        history = typeof r.history === 'string' ? JSON.parse(r.history) : (r.history || []);
      } catch {}
      return {
        ...r,
        balance: Number(r.balance || 0),
        history,
      };
    });

    // Fetch invoices (ordered by id DESC or created_at DESC)
    const [invRows] = await p.query('SELECT * FROM invoices ORDER BY id DESC LIMIT 1000');
    const invoices = invRows.map(r => {
      let items = [];
      try {
        items = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []);
      } catch {}
      return {
        ...r,
        subtotal: Number(r.subtotal || 0),
        discount: Number(r.discount || 0),
        grandTotal: Number(r.grandTotal || 0),
        paidAmount: Number(r.paidAmount || 0),
        udharAmount: Number(r.udharAmount || 0),
        profit: Number(r.profit || 0),
        items,
      };
    });

    const fullData = { settings, categories, products, customers, invoices };
    saveLocalCache(fullData);
    res.json(fullData);
  } catch (err) {
    console.error('Error fetching all-data from MySQL:', err.message);
    const cached = loadLocalCache();
    if (cached) {
      return res.json(cached);
    }
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/settings
app.post('/api/settings', async (req, res) => {
  try {
    const {
      storeName,
      tagline,
      phone,
      whatsapp,
      address,
      receiptNote,
      printerWidth,
      imgbbApiKey,
      jazzcashNumber,
      easypaisaNumber,
      raastId,
    } = req.body;
    const p = getPool();
    await p.query(
      `INSERT INTO store_settings (id, storeName, tagline, phone, whatsapp, address, receiptNote, printerWidth, imgbbApiKey, jazzcashNumber, easypaisaNumber, raastId)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       storeName = VALUES(storeName),
       tagline = VALUES(tagline),
       phone = VALUES(phone),
       whatsapp = VALUES(whatsapp),
       address = VALUES(address),
       receiptNote = VALUES(receiptNote),
       printerWidth = VALUES(printerWidth),
       imgbbApiKey = VALUES(imgbbApiKey),
       jazzcashNumber = VALUES(jazzcashNumber),
       easypaisaNumber = VALUES(easypaisaNumber),
       raastId = VALUES(raastId)`,
      [
        storeName,
        tagline,
        phone,
        whatsapp,
        address,
        receiptNote,
        printerWidth,
        imgbbApiKey || '',
        jazzcashNumber || '',
        easypaisaNumber || '',
        raastId || '',
      ]
    );

    // Update local cache
    const cached = loadLocalCache() || {};
    cached.settings = { ...(cached.settings || {}), ...req.body };
    saveLocalCache(cached);

    res.json({ success: true, settings: req.body });
  } catch (err) {
    console.error('Settings save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/categories
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const p = getPool();
    await p.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name.trim()]);

    const cached = loadLocalCache() || {};
    if (!cached.categories) cached.categories = ['All'];
    if (!cached.categories.includes(name.trim())) {
      cached.categories.push(name.trim());
      saveLocalCache(cached);
    }

    res.json({ success: true, name: name.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/products
app.post('/api/products', async (req, res) => {
  try {
    const prod = req.body;
    const p = getPool();
    const id = prod.id || ('p_' + Date.now());
    await p.query(
      `INSERT INTO products (id, name, category, barcode, purchasePrice, salePrice, stock, minStock, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        prod.name,
        prod.category || 'Miscellaneous',
        prod.barcode || '',
        Number(prod.purchasePrice || 0),
        Number(prod.salePrice || 0),
        Number(prod.stock || 0),
        Number(prod.minStock || 5),
        prod.unit || 'unit',
      ]
    );

    const fullProd = { ...prod, id };
    const cached = loadLocalCache() || {};
    cached.products = [fullProd, ...(cached.products || []).filter(x => x.id !== id)];
    saveLocalCache(cached);

    res.json({ success: true, product: fullProd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/products/bulk
app.post('/api/products/bulk', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }
    const p = getPool();
    const inserted = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.name || !it.salePrice) continue;
      const id = it.id || ('p_' + Date.now() + '_' + i);
      await p.query(
        `INSERT INTO products (id, name, category, barcode, purchasePrice, salePrice, stock, minStock, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         category = VALUES(category),
         barcode = VALUES(barcode),
         purchasePrice = VALUES(purchasePrice),
         salePrice = VALUES(salePrice),
         stock = VALUES(stock),
         minStock = VALUES(minStock),
         unit = VALUES(unit)`,
        [
          id,
          it.name.trim(),
          it.category || 'Miscellaneous',
          it.barcode || '',
          Number(it.purchasePrice || 0),
          Number(it.salePrice || 0),
          Number(it.stock || 0),
          Number(it.minStock || 5),
          it.unit || 'unit',
        ]
      );
      inserted.push({ ...it, id });
    }

    const cached = loadLocalCache() || {};
    const existingIds = new Set(inserted.map(x => x.id));
    cached.products = [...inserted, ...(cached.products || []).filter(x => !existingIds.has(x.id))];
    saveLocalCache(cached);

    res.json({ success: true, count: inserted.length, products: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PUT /api/products/:id
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prod = req.body;
    const p = getPool();
    await p.query(
      `UPDATE products SET
         name = ?,
         category = ?,
         barcode = ?,
         purchasePrice = ?,
         salePrice = ?,
         stock = ?,
         minStock = ?,
         unit = ?
       WHERE id = ?`,
      [
        prod.name,
        prod.category,
        prod.barcode || '',
        Number(prod.purchasePrice || 0),
        Number(prod.salePrice || 0),
        Number(prod.stock || 0),
        Number(prod.minStock || 5),
        prod.unit || 'unit',
        id,
      ]
    );

    const cached = loadLocalCache() || {};
    if (cached.products) {
      cached.products = cached.products.map(x => x.id === id ? { ...x, ...prod } : x);
      saveLocalCache(cached);
    }

    res.json({ success: true, product: { ...prod, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = getPool();
    await p.query('DELETE FROM products WHERE id = ?', [id]);

    const cached = loadLocalCache() || {};
    if (cached.products) {
      cached.products = cached.products.filter(x => x.id !== id);
      saveLocalCache(cached);
    }

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. POST /api/customers
app.post('/api/customers', async (req, res) => {
  try {
    const cust = req.body;
    const p = getPool();
    const cleanPhone = normalizePhone(cust.phone);

    // Check if customer with same phone already exists (DEDUPLICATION)
    if (cleanPhone && cleanPhone.length >= 7) {
      const [allCusts] = await p.query('SELECT * FROM customers');
      const matched = allCusts.find(c => normalizePhone(c.phone) === cleanPhone);

      if (matched) {
        const addBal = Number(cust.initialBalance || cust.balance || 0);
        let history = [];
        try {
          history = typeof matched.history === 'string' ? JSON.parse(matched.history) : (matched.history || []);
        } catch {}

        if (addBal > 0) {
          history = [
            {
              date: new Date().toLocaleDateString('en-GB'),
              type: 'bill',
              billNo: 'INITIAL',
              amount: addBal,
              note: cust.note || 'Purana Sabqa Baqaya (Initial Ledger)',
            },
            ...history,
          ];
        }

        const updatedBal = Number(matched.balance) + addBal;
        await p.query(
          'UPDATE customers SET balance = ?, history = ?, name = COALESCE(NULLIF(?, ""), name) WHERE id = ?',
          [updatedBal, JSON.stringify(history), cust.name || '', matched.id]
        );

        const updatedCust = { ...matched, name: cust.name || matched.name, balance: updatedBal, history };
        const cached = loadLocalCache() || {};
        if (cached.customers) {
          cached.customers = cached.customers.map(c => c.id === matched.id ? updatedCust : c);
          saveLocalCache(cached);
        }

        return res.json({
          success: true,
          customer: updatedCust,
          isExisting: true,
        });
      }
    }

    const id = cust.id || ('c_' + Date.now());
    const initialBal = Number(cust.initialBalance || cust.balance || 0);
    const history = cust.history || (initialBal > 0 ? [{
      date: new Date().toLocaleDateString('en-GB'),
      type: 'bill',
      billNo: 'INITIAL',
      amount: initialBal,
      note: 'Purana Sabqa Baqaya (Initial Ledger)',
    }] : []);

    await p.query(
      `INSERT INTO customers (id, name, phone, address, balance, history)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), balance = VALUES(balance), history = VALUES(history)`,
      [id, cust.name || 'Khata Customer', cust.phone || '', cust.address || '', initialBal, JSON.stringify(history)]
    );

    const savedCust = { ...cust, id, balance: initialBal, history };
    const cached = loadLocalCache() || {};
    cached.customers = [savedCust, ...(cached.customers || []).filter(c => c.id !== id)];
    saveLocalCache(cached);

    res.json({ success: true, customer: savedCust });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. POST /api/customers/:id/payment (Wasooli)
app.post('/api/customers/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const payNum = Number(amount);
    if (payNum <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const p = getPool();
    const [cRows] = await p.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (cRows.length === 0) return res.status(404).json({ error: 'Customer not found' });

    const cust = cRows[0];
    let history = [];
    try {
      history = typeof cust.history === 'string' ? JSON.parse(cust.history) : (cust.history || []);
    } catch {}

    const newBalance = Math.max(0, Number(cust.balance) - payNum);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formattedDate = `${dateStr} - ${timeStr}`;

    const newEntry = {
      date: formattedDate,
      type: 'payment',
      amount: payNum,
      note: note || 'Cash Payment Wasool',
    };
    const updatedHistory = [newEntry, ...history];

    await p.query(
      'UPDATE customers SET balance = ?, history = ? WHERE id = ?',
      [newBalance, JSON.stringify(updatedHistory), id]
    );

    const cached = loadLocalCache() || {};
    if (cached.customers) {
      cached.customers = cached.customers.map(c => c.id === id ? { ...c, balance: newBalance, history: updatedHistory } : c);
      saveLocalCache(cached);
    }

    res.json({ success: true, id, balance: newBalance, history: updatedHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. POST /api/invoices (Checkout Bill + Stock deduction + Udhar Ledger)
app.post('/api/invoices', async (req, res) => {
  const invoice = req.body;
  if (!invoice || !invoice.id) {
    return res.status(400).json({ error: 'Invoice data with id is required' });
  }

  const isUdhar = invoice.paymentMode === 'udhar';
  const udharAmt = isUdhar ? Number(invoice.udharAmount || 0) : 0;
  const paidAmt = isUdhar ? Number(invoice.paidAmount || 0) : Number(invoice.grandTotal || 0);

  // Always update local cache immediately so no data is ever lost
  try {
    const cached = loadLocalCache() || {};
    const existing = (cached.invoices || []).find(i => i.id === invoice.id);
    // If invoice ID collides with an older record, auto re-assign next unique ID
    if (existing && existing.timestamp && existing.timestamp !== invoice.timestamp) {
      let maxNum = 1000;
      (cached.invoices || []).forEach(i => {
        const m = String(i.id).match(/^INV-(\d+)$/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxNum && n < 10000000) maxNum = n;
        }
      });
      let nextNum = maxNum + 1;
      while ((cached.invoices || []).some(i => i.id === `INV-${nextNum}`)) {
        nextNum++;
      }
      const safeId = `INV-${nextNum}`;
      console.warn(`[Anti-Collision] Invoice ${invoice.id} collision resolved -> ${safeId}`);
      invoice.id = safeId;
    }

    cached.invoices = [invoice, ...(cached.invoices || []).filter(i => i.id !== invoice.id)];

    // Deduct stock in cache
    if (Array.isArray(invoice.items) && cached.products) {
      for (const item of invoice.items) {
        if (!item.isQuickItem && item.id) {
          cached.products = cached.products.map(p =>
            p.id === item.id ? { ...p, stock: Math.max(0, Number((p.stock - item.qty).toFixed(2))) } : p
          );
        }
      }
    }
    saveLocalCache(cached);
  } catch (cacheErr) {
    console.warn('Cache invoice update warning:', cacheErr.message);
  }

  try {
    const p = getPool();

    // 1. Insert Invoice into MySQL
    await p.query(
      `INSERT INTO invoices (id, date, timestamp, customerId, customerName, customerPhone, paymentMode, items, subtotal, discount, grandTotal, paidAmount, udharAmount, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       date = VALUES(date),
       timestamp = VALUES(timestamp),
       grandTotal = VALUES(grandTotal),
       paidAmount = VALUES(paidAmount),
       udharAmount = VALUES(udharAmount),
       profit = VALUES(profit)`,
      [
        invoice.id,
        invoice.date,
        invoice.timestamp || new Date().toISOString(),
        invoice.customerId || null,
        invoice.customerName || 'Walk-in Customer',
        invoice.customerPhone || '',
        invoice.paymentMode,
        JSON.stringify(invoice.items || []),
        Number(invoice.subtotal || 0),
        Number(invoice.discount || 0),
        Number(invoice.grandTotal || 0),
        paidAmt,
        udharAmt,
        Number(invoice.profit || 0),
      ]
    );

    // 2. Deduct Stock for each cart item
    if (Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        if (!item.isQuickItem && item.id) {
          await p.query(
            'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
            [Number(item.qty || 1), item.id]
          );
        }
      }
    }

    // 3. Update or Create customer ledger if Udhar
    if (isUdhar && udharAmt > 0) {
      let matchedCust = null;

      if (invoice.customerId) {
        const [cRows] = await p.query('SELECT * FROM customers WHERE id = ?', [invoice.customerId]);
        if (cRows.length > 0) matchedCust = cRows[0];
      }

      const cleanInvPhone = normalizePhone(invoice.customerPhone);
      if (!matchedCust && cleanInvPhone && cleanInvPhone.length >= 7) {
        const [allCusts] = await p.query('SELECT * FROM customers');
        matchedCust = allCusts.find(c => normalizePhone(c.phone) === cleanInvPhone);
      }

      const itemNote = (invoice.items || []).map(i => i.name).slice(0, 3).join(', ');
      const newHistoryEntry = {
        date: invoice.date,
        type: 'bill',
        billNo: invoice.id,
        amount: Number(invoice.udharAmount),
        note: itemNote + ((invoice.items || []).length > 3 ? '...' : ''),
      };

      if (matchedCust) {
        let history = [];
        try {
          history = typeof matchedCust.history === 'string' ? JSON.parse(matchedCust.history) : (matchedCust.history || []);
        } catch {}

        const updatedBal = Number(matchedCust.balance) + Number(invoice.udharAmount);
        const updatedHistory = [newHistoryEntry, ...history];

        await p.query(
          'UPDATE customers SET balance = ?, history = ? WHERE id = ?',
          [updatedBal, JSON.stringify(updatedHistory), matchedCust.id]
        );
      } else {
        const newCustId = invoice.customerId || ('c_' + Date.now());
        await p.query(
          `INSERT INTO customers (id, name, phone, address, balance, history)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance), history = VALUES(history)`,
          [
            newCustId,
            invoice.customerName || 'Khata Customer',
            invoice.customerPhone || '',
            '',
            Number(invoice.udharAmount),
            JSON.stringify([newHistoryEntry]),
          ]
        );
      }
    }

    res.json({ success: true, invoice });
  } catch (err) {
    console.error('Invoice checkout MySQL error (saved in local cache):', err.message);
    // Return success with offline flag so the user's checkout completes smoothly
    res.json({ success: true, invoice, offline: true, warning: 'Saved to local cache; MySQL will sync' });
  }
});

// Serve frontend dist bundle if available
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});
}

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('ALHAMD POS API SERVER IS RUNNING ON http://localhost:' + PORT);
  });
}

module.exports = app;
