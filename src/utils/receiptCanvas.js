// Native 2D Canvas Receipt & Statement Generator for Alhamd Super Store
// Professional Superstore Aesthetic with English Labels & ImgBB Cloud Uploader

export function drawBillReceiptCanvas(invoice, settings = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 640;
  const items = invoice.items || [];
  const itemRowHeight = 36;
  const headerHeight = 175;
  const metaHeight = 110;
  const tableHeaderHeight = 38;
  const itemsHeight = Math.max(1, items.length) * itemRowHeight;
  const totalsHeight = (invoice.discount > 0 ? 30 : 0) + (invoice.udharAmount > 0 ? 65 : 30) + 100;
  const barcodeHeight = 65;
  const footerHeight = 75;

  const totalHeight = headerHeight + metaHeight + tableHeaderHeight + itemsHeight + totalsHeight + barcodeHeight + footerHeight;

  // 2x Retina scale for ultra sharp text
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // Outer Border with double-line accent
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, width - 12, totalHeight - 12);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.strokeRect(9, 9, width - 18, totalHeight - 18);

  // Header Banner - Luxury Dark Slate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 10, width - 20, 140);

  // Top Emerald Accent Strip
  ctx.fillStyle = '#10b981';
  ctx.fillRect(10, 10, width - 20, 5);

  // Store Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((settings.storeName || 'ALHAMD SUPER STORE').toUpperCase(), width / 2, 48);

  // Tagline
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 12px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText((settings.tagline || 'PREMIUM GROCERY & GENERAL STORE').toUpperCase(), width / 2, 70);

  // Address & Helpline
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.fillText(settings.address || 'Main Bazaar, Mohalla Karyana Market', width / 2, 90);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`TEL / HELPLINE: ${settings.phone || '0300-1234567'}`, width / 2, 108);

  // Tax Invoice Pill Badge
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  const badgeW = 220;
  const badgeH = 22;
  const badgeX = (width - badgeW) / 2;
  const badgeY = 120;
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
  } else {
    ctx.rect(badgeX, badgeY, badgeW, badgeH);
  }
  ctx.fill();

  ctx.fillStyle = '#022c22';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('★ OFFICIAL SALES INVOICE ★', width / 2, 135);

  let y = 165;

  // Invoice Metadata Card
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(20, y, width - 40, 68);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, y, width - 40, 68);

  // Left Column
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('INVOICE NO:', 32, y + 24);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText(invoice.id, 115, y + 24);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('CUSTOMER:', 32, y + 48);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText(invoice.customerName || 'Walk-in Customer', 115, y + 48);

  // Right Column
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('DATE & TIME:', width - 190, y + 24);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(invoice.date || '', width - 32, y + 24);

  // Payment Status Badge on Right (Cash, JazzCash, Easypaisa, Raast, Udhar)
  if (invoice.paymentMode === 'cash') {
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(width - 175, y + 36, 143, 24);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(width - 175, y + 36, 143, 24);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAID IN FULL (CASH)', width - 104, y + 52);
  } else if (invoice.paymentMode === 'jazzcash') {
    ctx.fillStyle = '#fef2f2';
    ctx.fillRect(width - 175, y + 36, 143, 24);
    ctx.strokeStyle = '#f87171';
    ctx.strokeRect(width - 175, y + 36, 143, 24);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAID (JAZZCASH)', width - 104, y + 52);
  } else if (invoice.paymentMode === 'easypaisa') {
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(width - 175, y + 36, 143, 24);
    ctx.strokeStyle = '#34d399';
    ctx.strokeRect(width - 175, y + 36, 143, 24);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAID (EASYPAISA)', width - 104, y + 52);
  } else if (invoice.paymentMode === 'raast') {
    ctx.fillStyle = '#faf5ff';
    ctx.fillRect(width - 175, y + 36, 143, 24);
    ctx.strokeStyle = '#c084fc';
    ctx.strokeRect(width - 175, y + 36, 143, 24);

    ctx.fillStyle = '#6b21a8';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAID (RAAST / BANK)', width - 104, y + 52);
  } else {
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(width - 175, y + 36, 143, 24);
    ctx.strokeStyle = '#f43f5e';
    ctx.strokeRect(width - 175, y + 36, 143, 24);

    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CREDIT / KHATA DUE', width - 104, y + 52);
  }

  y += 82;

  // Items Table Header
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, y, width - 40, 32);

  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('#', 30, y + 20);
  ctx.fillText('ITEM DESCRIPTION', 55, y + 20);
  ctx.textAlign = 'center';
  ctx.fillText('QTY / WEIGHT', 375, y + 20);
  ctx.textAlign = 'right';
  ctx.fillText('RATE (PKR)', 485, y + 20);
  ctx.fillText('TOTAL (PKR)', width - 35, y + 20);

  y += 34;

  // Items Rows
  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(20, y, width - 40, itemRowHeight);
    }
    ctx.strokeStyle = '#f1f5f9';
    ctx.strokeRect(20, y, width - 40, itemRowHeight);

    // Index
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`${idx + 1}`, 30, y + 22);

    // Item Name
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    let displayName = item.name || '';
    if (displayName.length > 34) displayName = displayName.substring(0, 32) + '...';
    ctx.fillText(displayName, 55, y + 22);

    // Qty / Weight
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText(item.weightLabel || `${item.qty} ${item.unit || ''}`, 375, y + 22);

    // Rate
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText(`${Number(item.price).toFixed(2)}`, 485, y + 22);

    // Total
    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Rs. ${Number(item.total).toFixed(2)}`, width - 35, y + 22);

    y += itemRowHeight;
  });

  y += 10;

  // Dotted line separator
  ctx.strokeStyle = '#cbd5e1';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(width - 20, y);
  ctx.stroke();
  ctx.setLineDash([]);

  y += 14;

  // Summary Rows
  if (invoice.discount > 0) {
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('Subtotal Amount:', 35, y + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`Rs. ${Number(invoice.subtotal).toFixed(2)}`, width - 35, y + 12);

    y += 22;
    ctx.fillStyle = '#e11d48';
    ctx.textAlign = 'left';
    ctx.fillText('Special Discount:', 35, y + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`- Rs. ${Number(invoice.discount).toFixed(2)}`, width - 35, y + 12);
    y += 24;
  }

  // Grand Total Premium Banner
  ctx.fillStyle = '#022c22';
  ctx.fillRect(20, y, width - 40, 52);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, y, width - 40, 52);

  ctx.font = 'bold 15px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.textAlign = 'left';
  ctx.fillText('GRAND TOTAL PAYABLE:', 38, y + 32);

  ctx.font = 'bold 24px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`Rs. ${Number(invoice.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, width - 38, y + 35);

  y += 62;

  // Payment Breakdown Details
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(20, y, width - 40, invoice.udharAmount > 0 ? 54 : 32);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, y, width - 40, invoice.udharAmount > 0 ? 54 : 32);

  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  const modeLabel =
    invoice.paymentMode === 'jazzcash'
      ? 'Payment Received (JazzCash):'
      : invoice.paymentMode === 'easypaisa'
      ? 'Payment Received (Easypaisa):'
      : invoice.paymentMode === 'raast'
      ? 'Payment Received (Raast / Bank):'
      : 'Payment Received (Cash):';
  ctx.fillText(modeLabel, 35, y + 20);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.fillText(`Rs. ${Number(invoice.paidAmount || 0).toFixed(2)}`, width - 35, y + 20);

  if (invoice.udharAmount > 0) {
    y += 24;
    ctx.fillStyle = '#b91c1c';
    ctx.textAlign = 'left';
    ctx.fillText('Added to Khata (Credit Due):', 35, y + 20);
    ctx.textAlign = 'right';
    ctx.fillText(`Rs. ${Number(invoice.udharAmount).toFixed(2)}`, width - 35, y + 20);
  }

  y += 44;

  // Decorative Barcode Graphic
  const barcodeW = 280;
  const barcodeH = 26;
  const bx = (width - barcodeW) / 2;
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < barcodeW; i += 4) {
    const barWidth = (i % 8 === 0 || i % 12 === 0) ? 2.5 : 1;
    ctx.fillRect(bx + i, y, barWidth, barcodeH);
  }
  ctx.font = '9px "Segoe UI", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText(`* ${invoice.id} *`, width / 2, y + barcodeH + 12);

  y += barcodeH + 20;

  // Footer Note
  ctx.font = 'italic 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'center';
  ctx.fillText('Thank you for shopping at Alhamd Super Store!', width / 2, y + 6);

  ctx.font = '10px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(settings.receiptNote || 'Exchange possible within 3 days with original sales invoice.', width / 2, y + 22);

  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('ALHAMD POS & KHATA SYSTEM • POWERED BY THF NEXUS', width / 2, y + 38);

  return canvas;
}

export function drawCustomerKhataCanvas(customer, settings = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 680;
  const history = customer.history || [];
  const displayHistory = history.slice(0, 15);
  const rowHeight = 36;

  const headerHeight = 155;
  const profileSectionHeight = 100;
  const metricsSectionHeight = 58;
  const tableHeaderHeight = 36;
  const tableRowsHeight = Math.max(1, displayHistory.length) * rowHeight;
  const summaryBannerHeight = 54;
  const barcodeSectionHeight = 65;
  const footerHeight = 65;

  const totalHeight =
    headerHeight +
    profileSectionHeight +
    metricsSectionHeight +
    tableHeaderHeight +
    tableRowsHeight +
    summaryBannerHeight +
    barcodeSectionHeight +
    footerHeight +
    30;

  const scale = 2;
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  ctx.scale(scale, scale);

  const drawRoundRect = (x, y, w, h, r, fillStyle, strokeStyle, lineWidth = 1) => {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  // Metrics calculation
  let totalPurchases = 0;
  let totalPayments = 0;
  history.forEach((h) => {
    const amt = Number(h.amount) || 0;
    if (h.type === 'payment') {
      totalPayments += amt;
    } else {
      totalPurchases += amt;
    }
  });
  const currentBalance = Number(customer.balance || 0);

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // 2. Outer Border with double-line accent
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, width - 12, totalHeight - 12);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.strokeRect(9, 9, width - 18, totalHeight - 18);

  // 3. Header Banner - Luxury Dark Slate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 10, width - 20, 135);

  // Top Emerald Accent Strip
  ctx.fillStyle = '#10b981';
  ctx.fillRect(10, 10, width - 20, 5);

  // Store Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((settings.storeName || 'ALHAMD SUPER STORE').toUpperCase(), width / 2, 45);

  // Tagline
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 12px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText((settings.tagline || 'PREMIUM GROCERY & GENERAL STORE • DIGITAL KHATA').toUpperCase(), width / 2, 67);

  // Address & Helpline
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.fillText(settings.address || 'Ward no 3 Muslim Town Near Sunbeam School', width / 2, 87);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`TEL / HELPLINE: ${settings.phone || '0300-6764066'}`, width / 2, 104);

  // Statement Pill Badge
  drawRoundRect((width - 340) / 2, 115, 340, 22, 6, '#10b981', null);
  ctx.fillStyle = '#022c22';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('★ OFFICIAL CUSTOMER ACCOUNT STATEMENT / KHATA ★', width / 2, 130);

  let y = 158;

  // 4. Customer Profile & Balance Split Cards
  const leftW = 390;
  const rightW = width - 40 - leftW - 12;
  const cardH = 92;

  // Left Card: Customer Profile
  drawRoundRect(20, y, leftW, cardH, 8, '#f8fafc', '#cbd5e1', 1);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ACCOUNT HOLDER / CUSTOMER:', 34, y + 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(customer.name || 'Valued Customer', 34, y + 43);

  ctx.fillStyle = '#475569';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`📱 Mobile: ${customer.phone || 'N/A'}`, 34, y + 63);
  if (customer.address) {
    ctx.fillText(`📍 Location: ${customer.address}`, 34, y + 80);
  } else {
    drawRoundRect(34, y + 70, 135, 16, 4, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
    ctx.fillText('● VERIFIED KHATA ACCOUNT', 42, y + 82);
  }

  // Right Card: Total Outstanding Balance
  drawRoundRect(20 + leftW + 12, y, rightW, cardH, 8, '#0f172a', '#334155', 1);

  ctx.textAlign = 'center';
  const rightCenterX = 20 + leftW + 12 + rightW / 2;

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TOTAL OUTSTANDING BALANCE', rightCenterX, y + 22);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 22px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rs. ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightCenterX, y + 51);

  if (currentBalance > 0) {
    drawRoundRect(rightCenterX - 75, y + 64, 150, 20, 10, '#881337', null);
    ctx.fillStyle = '#ffe4e6';
    ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
    ctx.fillText('⚠ PAYMENT DUE / BAQAYA', rightCenterX, y + 78);
  } else {
    drawRoundRect(rightCenterX - 75, y + 64, 150, 20, 10, '#064e3b', null);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
    ctx.fillText('✓ ALL DUES CLEARED (NIL)', rightCenterX, y + 78);
  }

  // 5. Financial Summary Metrics (3 Stat Boxes)
  y += cardH + 10;
  const statW = (width - 40 - 16) / 3;
  const statH = 48;

  // Box 1: Total Purchases
  drawRoundRect(20, y, statW, statH, 6, '#f1f5f9', '#e2e8f0', 1);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TOTAL PURCHASES (KHARIDARI):', 30, y + 17);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rs. ${totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 30, y + 36);

  // Box 2: Total Paid Wasooli
  drawRoundRect(20 + statW + 8, y, statW, statH, 6, '#ecfdf5', '#a7f3d0', 1);
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TOTAL PAID (WASOOLI):', 20 + statW + 18, y + 17);
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 14px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rs. ${totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20 + statW + 18, y + 36);

  // Box 3: Net Current Due
  drawRoundRect(20 + (statW + 8) * 2, y, statW, statH, 6, '#fff1f2', '#fecdd3', 1);
  ctx.fillStyle = '#9f1239';
  ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('NET CURRENT DUE (BAQAYA):', 20 + (statW + 8) * 2 + 10, y + 17);
  ctx.fillStyle = '#be123c';
  ctx.font = 'bold 14px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rs. ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20 + (statW + 8) * 2 + 10, y + 36);

  // 6. Transaction Ledger Table Header
  y += statH + 12;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, y, width - 40, 34);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(20, y + 32, width - 40, 2);

  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText('#', 30, y + 21);
  ctx.fillText('DATE & TIME', 55, y + 21);
  ctx.fillText('TRANSACTION PARTICULARS', 200, y + 21);
  ctx.textAlign = 'center';
  ctx.fillText('TYPE / STATUS', 465, y + 21);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (PKR)', width - 35, y + 21);

  y += 34;

  if (displayHistory.length === 0) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(20, y, width - 40, 40);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(20, y, width - 40, 40);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillText('No ledger transactions recorded yet.', width / 2, y + 25);
    y += 40;
  } else {
    displayHistory.forEach((h, idx) => {
      ctx.fillStyle = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(20, y, width - 40, rowHeight);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y, width - 40, rowHeight);

      // Index
      ctx.textAlign = 'left';
      ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${idx + 1}`, 30, y + 22);

      // Date
      ctx.font = '10px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(h.date || '', 55, y + 22);

      // Particulars
      let noteText = h.note || (h.type === 'payment' ? 'Cash Payment Received' : `Bill: ${h.billNo || ''}`);
      if (noteText.length > 34) noteText = noteText.substring(0, 32) + '...';
      ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(noteText, 200, y + 22);

      // Type Badge
      const isPayment = h.type === 'payment';
      const badgeText = isPayment ? '✓ CASH RECEIVED' : '● STORE PURCHASE';
      const badgeBg = isPayment ? '#ecfdf5' : '#fff1f2';
      const badgeBorder = isPayment ? '#a7f3d0' : '#fecdd3';
      const badgeColor = isPayment ? '#047857' : '#b91c1c';

      drawRoundRect(415, y + 7, 100, 21, 4, badgeBg, badgeBorder, 1);
      ctx.textAlign = 'center';
      ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = badgeColor;
      ctx.fillText(badgeText, 465, y + 21);

      // Amount
      ctx.textAlign = 'right';
      ctx.font = 'bold 12px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
      if (isPayment) {
        ctx.fillStyle = '#059669';
        ctx.fillText(`- Rs. ${Number(h.amount).toFixed(2)}`, width - 35, y + 22);
      } else {
        ctx.fillStyle = '#e11d48';
        ctx.fillText(`+ Rs. ${Number(h.amount).toFixed(2)}`, width - 35, y + 22);
      }

      y += rowHeight;
    });
  }

  // 7. Grand Balance Banner
  y += 10;
  drawRoundRect(20, y, width - 40, 48, 8, '#0f172a', '#10b981', 1.5);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('CURRENT NET OUTSTANDING KHATA BALANCE:', 36, y + 29);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 22px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rs. ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, width - 36, y + 32);

  y += 58;

  // 8. Simulated Barcode & Security Stamp
  const barcodeH = 34;
  const barcodeW = 280;
  const startX = (width - barcodeW) / 2;

  ctx.fillStyle = '#0f172a';
  for (let bx = 0; bx < barcodeW; bx += 3) {
    const barWidth = ((bx * 7 + 13) % 4) + 1;
    if ((bx * 11) % 5 !== 0) {
      ctx.fillRect(startX + bx, y, Math.min(barWidth, barcodeW - bx), barcodeH);
    }
  }

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`* KHATA-${customer.id || 'CUST'} *`, width / 2, y + barcodeH + 12);

  y += barcodeH + 20;

  // Official Seal line
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ALHAMD SUPER STORE • POWERED BY THF NEXUS', width / 2, y + 6);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  ctx.font = '10px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Statement Generated: ${dateStr} - ${timeStr} • Authorized System Generated Statement`, width / 2, y + 22);

  ctx.font = '9px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('In case of any discrepancy or query, kindly contact store administration with this statement.', width / 2, y + 36);

  return canvas;
}

// ImgBB Cloud Uploader - Uploads canvas directly and returns live image link
export async function uploadCanvasToImgBB(canvas, apiKey = '', filename = 'invoice') {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve({ success: false, error: 'Could not generate image' });
        return;
      }
      const key = (apiKey && apiKey.trim()) || '66ae21f98ba47ce3114d55d2f9e3904a';
      if (!key) {
        resolve({ success: false, error: 'NO_KEY' });
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', blob, `${filename}.png`);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data && data.success && data.data) {
          resolve({
            success: true,
            url: data.data.url, // Direct link to image
            displayUrl: data.data.display_url,
            viewerUrl: data.data.url_viewer,
          });
        } else {
          resolve({
            success: false,
            error: data?.error?.message || 'ImgBB upload error',
          });
        }
      } catch (err) {
        console.error('ImgBB upload error:', err);
        resolve({ success: false, error: err.message });
      }
    }, 'image/png');
  });
}

// Download Helper using standard Blob
export function downloadCanvasAsPng(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename.endsWith('.png') ? filename : filename + '.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve(true);
    }, 'image/png');
  });
}

// Copy Helper using ClipboardItem
export async function copyCanvasToClipboard(canvas) {
  if (!navigator.clipboard || !window.ClipboardItem) return false;
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        resolve(true);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
        resolve(false);
      }
    }, 'image/png');
  });
}

// Open in new browser tab for instant full-resolution preview without Windows app issues
export function openCanvasInNewTab(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      resolve(true);
    }, 'image/png');
  });
}
