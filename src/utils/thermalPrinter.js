// Dedicated High-Definition Thermal Receipt Printer for 58mm & 80mm POS Printers
// Modern Superstore Boxed Grid Design with Crystal Clear Section Dividers & Ultra-Sharp Readability

export function printThermalReceiptDirect(invoice, settings = {}, customer = null) {
  if (!invoice) return;

  const is80mm = (settings.printerWidth || '58mm') === '80mm';
  const widthMm = is80mm ? '72mm' : '48mm';

  // Sizing parameters optimized for 203 DPI thermal heads
  const titleSize = is80mm ? '15px' : '13px';
  const subtitleSize = is80mm ? '10px' : '8.5px';
  const headerBadgeSize = is80mm ? '9.5px' : '8px';
  const tableHeaderSize = is80mm ? '9px' : '8px';
  const itemRowSize = is80mm ? '10px' : '8.5px';
  const subtotalSize = is80mm ? '10.5px' : '9px';
  const grandTotalSize = is80mm ? '14px' : '12px';
  const footerSize = is80mm ? '9px' : '8px';
  const brandingSize = is80mm ? '10px' : '9px';

  // Parse Date and Time cleanly
  let datePart = invoice.date || '';
  let timePart = '';
  if (invoice.date && invoice.date.includes('-')) {
    const parts = invoice.date.split('-');
    datePart = parts[0].trim();
    timePart = parts.slice(1).join('-').trim();
  } else if (invoice.timestamp) {
    const d = new Date(invoice.timestamp);
    datePart = d.toLocaleDateString('en-GB');
    timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Items count and total quantity
  const itemsList = invoice.items || [];
  const itemsCount = itemsList.length;
  const totalQty = itemsList.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  // Change returned if cash paid > grandTotal
  const paidAmt = Number(invoice.paidAmount || invoice.grandTotal || 0);
  const grandTotalAmt = Number(invoice.grandTotal || 0);
  const changeAmt = paidAmt > grandTotalAmt && invoice.paymentMode === 'cash' ? paidAmt - grandTotalAmt : 0;

  // Previous customer balance calculation
  const currentCustomerBalance = customer ? Number(customer.balance || 0) : 0;
  const previousBalance = Math.max(0, currentCustomerBalance - Number(invoice.udharAmount || 0));

  // Payment mode label with clean icon/badge
  const paymentModeLabel = (invoice.paymentMode || 'cash').toUpperCase();
  const isUdhar = invoice.paymentMode === 'udhar' || Number(invoice.udharAmount || 0) > 0;

  // Remove any previous print iframes
  const oldIframes = document.querySelectorAll('.pos-print-iframe');
  oldIframes.forEach((el) => {
    try { el.remove(); } catch (e) {}
  });

  const iframe = document.createElement('iframe');
  iframe.className = 'pos-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = widthMm;
  iframe.style.height = '100%';
  iframe.style.zIndex = '-9999';
  iframe.style.opacity = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt-${invoice.id || 'Bill'}</title>
      <style>
        @page {
          margin: 0mm !important;
          size: auto;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: ${widthMm};
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff;
          color: #000000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: ${itemRowSize};
          line-height: 1.2;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt-box {
          width: ${widthMm};
          padding: 1.5mm 1mm 0 1mm;
          margin: 0 auto;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        tr, td, th, div, p {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .bolder { font-weight: 900; }

        /* Modern Crisp Box Containers */
        .box-framed {
          border: 1.5px solid #000000;
          border-radius: 2px;
          padding: 1.5mm 1mm;
          margin-bottom: 1.8mm;
          background: #ffffff;
        }

        /* Store Header */
        .store-name {
          font-size: ${titleSize};
          font-weight: 900;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.15;
        }
        .store-sub {
          font-size: ${subtitleSize};
          margin-top: 1px;
          color: #000000;
        }
        .memo-badge {
          display: inline-block;
          background: #000000;
          color: #ffffff;
          font-size: ${headerBadgeSize};
          font-weight: 900;
          padding: 1px 5px;
          margin-top: 2px;
          letter-spacing: 0.5px;
          border-radius: 2px;
        }

        /* Invoice Meta Box */
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: ${subtitleSize};
          line-height: 1.25;
          margin-bottom: 1px;
        }
        .meta-divider {
          border-top: 1px dashed #000000;
          margin: 1.5px 0;
        }

        /* Full Grid Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000000;
          margin-bottom: 1.5mm;
        }
        .items-table th {
          background: #000000;
          color: #ffffff;
          font-size: ${tableHeaderSize};
          font-weight: 900;
          padding: 2.5px 1px;
          border-right: 1px solid #ffffff;
          text-align: center;
          letter-spacing: 0.2px;
        }
        .items-table th:last-child {
          border-right: none;
        }
        .items-table td {
          border-bottom: 1px solid #000000;
          border-right: 1px solid #000000;
          padding: 2px 1.5px;
          font-size: ${itemRowSize};
          vertical-align: middle;
        }
        .items-table td:last-child {
          border-right: none;
        }
        .items-table tr:last-child td {
          border-bottom: none;
        }

        /* Summary Badges */
        .items-summary-bar {
          display: flex;
          justify-content: space-between;
          font-size: ${subtitleSize};
          font-weight: bold;
          padding: 0 1mm;
          margin-bottom: 1.8mm;
        }

        /* Grand Total Box */
        .grand-total-box {
          border: 2px solid #000000;
          background: #000000;
          color: #ffffff;
          padding: 3px 2px;
          margin: 2px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 2px;
        }
        .grand-total-box .gt-label {
          font-size: ${subtotalSize};
          font-weight: 900;
          letter-spacing: 0.3px;
        }
        .grand-total-box .gt-val {
          font-size: ${grandTotalSize};
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        /* Summary Key-Value Rows */
        .sum-row {
          display: flex;
          justify-content: space-between;
          font-size: ${subtotalSize};
          padding: 1px 0;
        }

        /* Khata Section Box */
        .khata-box {
          border: 1.5px solid #000000;
          border-radius: 2px;
          padding: 2px 1.5mm;
          margin-bottom: 1.8mm;
          background: #ffffff;
        }
        .khata-header {
          font-size: ${subtotalSize};
          font-weight: 900;
          border-bottom: 1px solid #000000;
          padding-bottom: 1px;
          margin-bottom: 2px;
        }

        /* Return Policy Box */
        .notes-box {
          border-top: 1px dashed #000000;
          border-bottom: 1px dashed #000000;
          padding: 2px 0;
          margin-bottom: 2mm;
          text-align: center;
          font-size: ${footerSize};
          line-height: 1.25;
        }

        /* System Branding */
        .branding-box {
          text-align: center;
          padding-top: 1px;
        }
        .branding-title {
          font-size: ${brandingSize};
          font-weight: 900;
          letter-spacing: 0.4px;
        }
        .branding-sub {
          font-size: ${footerSize};
          margin-top: 1px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-box">
        <!-- 1. Store Header Box -->
        <div class="box-framed text-center">
          <div class="store-name">${settings.storeName || 'ALHAMD SUPER STORE'}</div>
          <div class="store-sub bold">${settings.tagline || 'Karyana & General Store'}</div>
          ${settings.address ? `<div class="store-sub">${settings.address}</div>` : ''}
          <div class="store-sub bold" style="margin-top: 1px;">
            Helpline: ${settings.phone || '0300-6764066'}
          </div>
          <div>
            <span class="memo-badge">★ CASH MEMO / SALES RECEIPT ★</span>
          </div>
        </div>

        <!-- 2. Invoice & Customer Meta Box -->
        <div class="box-framed">
          <div class="meta-row">
            <span>BILL NO: <strong>${invoice.id}</strong></span>
            <span>MODE: <strong>${paymentModeLabel}</strong></span>
          </div>
          <div class="meta-row">
            <span>DATE: <strong>${datePart}</strong></span>
            <span>TIME: <strong>${timePart || '12:00 PM'}</strong></span>
          </div>
          ${(invoice.customerName && invoice.customerName !== 'Walk-in Customer') || invoice.customerPhone ? `
          <div class="meta-divider"></div>
          <div class="meta-row">
            <span>CUSTOMER: <strong>${invoice.customerName || 'Khata Customer'}</strong></span>
            ${invoice.customerPhone ? `<span>PH: <strong>${invoice.customerPhone}</strong></span>` : ''}
          </div>` : ''}
        </div>

        <!-- 3. Items Table Box with Clear Column Grid -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 8%;">#</th>
              <th style="width: 48%;" class="text-left">&nbsp;ITEM DESCRIPTION</th>
              <th style="width: 14%;">QTY</th>
              <th style="width: 14%;" class="text-right">RATE</th>
              <th style="width: 16%;" class="text-right">TOTAL&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList.map((item, idx) => `
              <tr>
                <td class="text-center bold">${idx + 1}</td>
                <td class="text-left bold" style="word-break: break-word;">
                  ${item.name}
                </td>
                <td class="text-center bold whitespace-nowrap">
                  ${item.weightLabel || item.qty}
                </td>
                <td class="text-right whitespace-nowrap">
                  ${item.price}
                </td>
                <td class="text-right bold whitespace-nowrap">
                  ${item.total}&nbsp;
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary Bar (Item Count & Total Pieces) -->
        <div class="items-summary-bar">
          <span>Kul Items: <strong>${itemsCount}</strong></span>
          <span>Kul Taadad (Qty): <strong>${totalQty}</strong></span>
        </div>

        <!-- 4. Calculations & Grand Total Box -->
        <div class="box-framed">
          <div class="sum-row">
            <span>Subtotal:</span>
            <span class="bold">Rs. ${Number(invoice.subtotal || invoice.grandTotal).toLocaleString()}</span>
          </div>
          ${Number(invoice.discount || 0) > 0 ? `
          <div class="sum-row bold">
            <span>Special Store Discount:</span>
            <span>- Rs. ${Number(invoice.discount).toLocaleString()}</span>
          </div>
          <div class="sum-row" style="font-size: ${subtitleSize}; font-weight: bold; border-bottom: 1px dotted #000; padding-bottom: 2px;">
            <span>★ Aap Ki Bachat (You Saved):</span>
            <span>Rs. ${Number(invoice.discount).toLocaleString()}</span>
          </div>` : ''}

          <!-- High-Impact Grand Total Highlight Box -->
          <div class="grand-total-box">
            <span class="gt-label">KUL RAKAM / NET TOTAL:</span>
            <span class="gt-val">Rs. ${grandTotalAmt.toLocaleString()}</span>
          </div>

          <div class="sum-row" style="margin-top: 1px;">
            <span>Wasool Shuda Rakam:</span>
            <span class="bold">Rs. ${paidAmt.toLocaleString()}</span>
          </div>
          ${changeAmt > 0 ? `
          <div class="sum-row bold" style="border-top: 1px dotted #000; padding-top: 1px;">
            <span>Baqaya Wapsi (Change):</span>
            <span>Rs. ${changeAmt.toLocaleString()}</span>
          </div>` : ''}
        </div>

        <!-- 5. Udhar / Khata Customer Ledger Box (If Applicable) -->
        ${isUdhar ? `
        <div class="khata-box">
          <div class="khata-header">
            📒 KHATA RECORD (CUSTOMER LEDGER):
          </div>
          <div class="sum-row">
            <span>Grahak:</span>
            <span class="bold">${invoice.customerName || 'Khata Customer'}</span>
          </div>
          <div class="sum-row">
            <span>Aaj Ka Naya Udhar:</span>
            <span class="bold">Rs. ${Number(invoice.udharAmount || 0).toLocaleString()}</span>
          </div>
          ${currentCustomerBalance > 0 ? `
          <div class="sum-row">
            <span>Purana Sabqa Baqaya:</span>
            <span>Rs. ${previousBalance.toLocaleString()}</span>
          </div>
          <div class="sum-row bold" style="border-top: 1px solid #000000; padding-top: 1.5px; font-size: ${subtotalSize};">
            <span>KUL WAJIB-UL-ADA (TOTAL DUE):</span>
            <span>Rs. ${currentCustomerBalance.toLocaleString()}</span>
          </div>` : ''}
        </div>` : ''}

        <!-- 6. Return Policy & Note Box -->
        <div class="notes-box">
          <div class="bold">Tashreef aawri ka shukriya!</div>
          <div>${settings.receiptNote || 'Sauda tabdeel ya wapis 3 din me ba-shart-e-parchi.'}</div>
        </div>

        <!-- 7. Software Branding -->
        <div class="branding-box">
          <div class="branding-title">*** System By THF NEXUS ***</div>
          <div class="branding-sub">POS Software Solutions • Helpline: 0300-6764066</div>
        </div>

        <!-- 8. Clean Blade Clearance: Feeds System By THF NEXUS comfortably past the tear-off blade -->
        <div style="margin-top: 16mm; text-align: center; color: #000000;">
          <div style="border-top: 1px dashed #000000; font-size: 8px; font-weight: bold; letter-spacing: 1px; padding-top: 1px;">
            - - - - - - - - - - - - - - - - - - - -
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
  }, 250);

  iframe.contentWindow.onafterprint = () => {
    try { iframe.remove(); } catch (e) {}
  };
  setTimeout(() => {
    try { iframe.remove(); } catch (e) {}
  }, 120000);
}
