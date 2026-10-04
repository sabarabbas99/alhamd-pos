# Alhamd Super Store - POS & Khata Management System 🛒

A complete, modern Point-of-Sale (POS) and Digital Khata (Ledger) web application designed specifically for retail grocery stores, karyana shops, and superstores.

---

## 🌟 Key Features

1. **Fast Billing Counter (POS)**:
   - Instant search & barcode scanner support.
   - Grams / Toll weight pricing calculator (half kg, 100g, 250g, etc.).
   - Quick Cash Open Items (unlisted bread, eggs, milk, biscuits).
   - Multi-Payment modes: **Cash**, **JazzCash**, **Easypaisa**, **Raast / Bank**, and **Udhaar (Khata)**.

2. **Digital Khata Book & Customer Ledger**:
   - Automated khata creation upon billing.
   - **Phone Number Deduplication**: Reuses existing accounts and prevents duplicate ledger entries.
   - Full transaction history with debit, credit, and running balance.
   - Cash Wasooli payment recording.

3. **High-Definition Receipts & WhatsApp Sharing**:
   - 100% English professional luxury superstore receipt design.
   - Automatic background upload to **ImgBB Cloud** with direct image preview links on WhatsApp.
   - Instant browser tab preview (`Naye Tab Me Kholain`) without downloading clutter.

4. **Multi-Payment Breakdown & Daily Roznamcha (Reports)**:
   - Separate tracking of physical cash in drawer vs. online digital wallets (JazzCash, Easypaisa, Raast).
   - Real-time gross sales, net collected, and estimated gross margin / profit.

5. **Live MySQL Cloud Sync**:
   - Real-time cloud sync across multiple counters, devices, or branches.

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
node server.cjs
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Live Domain

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Import this repository in [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Point your custom domain in the project settings.

### Backend (Node.js API)
- Deploy `server.cjs` to your VPS, cPanel Node.js Selector, Render, or Railway.
- Ensure the `DB_CONFIG` in `server.cjs` points to your MySQL database.

---

*Alhamd Super Store • Ward no 3 Muslim Town Near Sunbeam School*
