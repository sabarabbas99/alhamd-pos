// Dedicated Thermal Receipt Printer for 58mm & 80mm POS Printers
// Flawless single-page printing with automatic feed clearance for easy tear-off!

export function printThermalReceiptDirect(invoice, settings = {}, customer = null) {
  if (!invoice) return;

  // 80mm vs 58mm dimensions
  const is80mm = (settings.printerWidth || '58mm') === '80mm';
  const widthMm = is80mm ? '72mm' : '48mm';
  const titleSize = is80mm ? '14px' : '12px';
  const bodySize = is80mm ? '10.5px' : '9.5px';
  const subSize = is80mm ? '9.5px' : '8.5px';
  const grandTotalSize = is80mm ? '13px' : '11px';

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
          font-family: 'Courier New', Courier, monospace;
          font-size: ${bodySize};
          line-height: 1.15;
          -webkit-print-color-adjust: exact;
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
        .border-dashed-b {
          border-bottom: 1px dashed #000000;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .border-dotted-t {
          border-top: 1px dotted #000000;
          padding-top: 2px;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td, th {
          padding: 1.5px 0;
          font-size: ${bodySize};
          vertical-align: top;
        }
      </style>
    </head>
    <body>
      <div class="receipt-box">
        <!-- Store Header -->
        <div class="text-center border-dashed-b">
          <div style="font-size: ${titleSize}; font-weight: 900; letter-spacing: 0.5px;">
            ${settings.storeName || 'ALHAMD SUPER STORE'}
          </div>
          <div style="font-size: ${subSize}; margin-top: 1px;">
            ${settings.tagline || 'Karyana & General Store'}
          </div>
          ${settings.address ? `<div style="font-size: ${subSize};">${settings.address}</div>` : ''}
          <div style="font-size: ${subSize}; font-weight: bold; margin-top: 1px;">
            Helpline: ${settings.phone || '0300-6764066'}
          </div>
        </div>

        <!-- Bill Meta -->
        <div class="border-dashed-b" style="font-size: ${subSize};">
          <table>
            <tr>
              <td class="text-left">Bill #: <strong>${invoice.id}</strong></td>
              <td class="text-right">Mode: <strong>${(invoice.paymentMode || 'cash').toUpperCase()}</strong></td>
            </tr>
            <tr>
              <td colspan="2" class="text-left">Tareekh: <strong>${invoice.date}</strong></td>
            </tr>
            ${invoice.customerName && invoice.customerName !== 'Walk-in Customer' ? `
            <tr>
              <td colspan="2" class="text-left bold">Customer: ${invoice.customerName}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Items Table -->
        <table class="border-dashed-b">
          <tr style="border-bottom: 1px dashed #000000;">
            <th class="text-left" style="width: 50%;">Item</th>
            <th class="text-center" style="width: 25%;">Qty</th>
            <th class="text-right" style="width: 25%;">Total</th>
          </tr>
          ${(invoice.items || []).map((item) => `
            <tr>
              <td class="text-left" style="word-break: break-all; padding-right: 2px;">
                ${item.name}${item.weightLabel ? ` (${item.weightLabel})` : ''}
              </td>
              <td class="text-center whitespace-nowrap">${item.weightLabel || item.qty}x${item.price}</td>
              <td class="text-right bold">Rs.${item.total}</td>
            </tr>
          `).join('')}
        </table>

        <!-- Calculations -->
        <div class="border-dashed-b">
          <table>
            <tr>
              <td class="text-left">Subtotal:</td>
              <td class="text-right">Rs. ${invoice.subtotal}</td>
            </tr>
            ${invoice.discount > 0 ? `
            <tr style="color: #b91c1c; font-weight: bold;">
              <td class="text-left">Discount:</td>
              <td class="text-right">- Rs. ${invoice.discount}</td>
            </tr>` : ''}
            <tr class="border-dotted-t" style="font-size: ${grandTotalSize}; font-weight: 900;">
              <td class="text-left">TOTAL:</td>
              <td class="text-right">Rs. ${invoice.grandTotal}</td>
            </tr>
            <tr>
              <td class="text-left">Paid (Wasool):</td>
              <td class="text-right">Rs. ${invoice.paidAmount}</td>
            </tr>
            ${invoice.udharAmount > 0 ? `
            <tr class="border-dotted-t" style="font-weight: bold; color: #b91c1c;">
              <td class="text-left">AJ KA UDHAR:</td>
              <td class="text-right">Rs. ${invoice.udharAmount}</td>
            </tr>` : ''}
            ${customer && customer.balance > 0 ? `
            <tr style="font-weight: 900; background: #f1f5f9;">
              <td class="text-left">KUL SABQA BAQAYA:</td>
              <td class="text-right">Rs. ${customer.balance}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Return Policy & Branding -->
        <div class="text-center" style="font-size: ${subSize}; padding-top: 2px;">
          <div>${settings.receiptNote || 'Tashreef aawri ka shukriya! Sauda wapsi 3 din me ba-shart-e-parchi.'}</div>
          <div style="font-size: ${bodySize}; font-weight: 900; padding-top: 2px; letter-spacing: 0.5px;">
            *** System By THF NEXUS ***
          </div>
        </div>

        <!-- Clean Blade Clearance: Feeds System By THF NEXUS comfortably past the tear teeth, zero extra dots -->
        <div style="margin-top: 16mm; text-align: center; color: #000000;">
          <div style="border-top: 1px dashed #000000; font-size: 8px; font-weight: bold; letter-spacing: 1px; padding-top: 1px;">
            - - - - - - - - - - - - - - - -
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

  // Clean up only after user finishes printing (never delete while spooling!)
  iframe.contentWindow.onafterprint = () => {
    try { iframe.remove(); } catch (e) {}
  };
  setTimeout(() => {
    try { iframe.remove(); } catch (e) {}
  }, 120000); // 2 minute safety fallback
}
