import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  drawBillReceiptCanvas,
  downloadCanvasAsPng,
  copyCanvasToClipboard,
  openCanvasInNewTab,
  uploadCanvasToImgBB,
} from '../utils/receiptCanvas';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Share2,
  CheckCircle,
  CreditCard,
  Banknote,
  User,
  ShoppingBag,
  Sparkles,
  Barcode,
  X,
  Zap,
  Scale,
  Download,
  Copy,
  Edit3,
  Eye,
} from 'lucide-react';

const COMMON_WEIGHT_PRESETS = [
  { label: '50g', grams: 50 },
  { label: '100g', grams: 100 },
  { label: '150g', grams: 150 },
  { label: '200g', grams: 200 },
  { label: '250g (1 Paao)', grams: 250 },
  { label: '500g (Aadha Kilo)', grams: 500 },
  { label: '750g (3 Paao)', grams: 750 },
  { label: '1 Kg', grams: 1000 },
  { label: '1.5 Kg', grams: 1500 },
  { label: '2 Kg', grams: 2000 },
  { label: '5 Kg', grams: 5000 },
];

export default function POS({ onPrintReceipt }) {
  const {
    products,
    categories,
    customers,
    cart,
    addToCart,
    updateCartWeight,
    addQuickOpenItemToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkoutBill,
    isSamePhoneNumber,
    settings,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'udhar'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const [photoCopiedNotice, setPhotoCopiedNotice] = useState(false);

  // Weight / Toll Modal State
  const [weightModalItem, setWeightModalItem] = useState(null);
  const [weightModalMode, setWeightModalMode] = useState('add'); // 'add' | 'edit'
  const [weightCartIndex, setWeightCartIndex] = useState(null);
  const [inputGrams, setInputGrams] = useState(250);
  const [inputRupees, setInputRupees] = useState('');

  // Quick Open Cash Item modal
  const [showQuickItemModal, setShowQuickItemModal] = useState(false);
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemPrice, setQuickItemPrice] = useState('');
  const [quickItemQty, setQuickItemQty] = useState(1);
  const [quickItemUnit, setQuickItemUnit] = useState('item');

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Handle enter key in search
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        handleProductClick(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  // Product Click Handler
  const handleProductClick = (product) => {
    const isWeighed = product.unit === 'kg' || product.unit === 'gm' || product.unit === 'gram';
    if (isWeighed) {
      setWeightModalItem(product);
      setWeightModalMode('add');
      setInputGrams(250);
      const calculatedRs = Math.round((Number(product.salePrice) * 250) / 1000);
      setInputRupees(calculatedRs);
    } else {
      addToCart(product);
    }
  };

  // Open Weight Modal for an existing item in cart
  const handleEditCartWeight = (item, index) => {
    setWeightModalItem(item);
    setWeightModalMode('edit');
    setWeightCartIndex(index);
    const initialGrams = item.weightGrams || Math.round(item.qty * 1000);
    setInputGrams(initialGrams);
    const calculatedRs = Math.round((Number(item.salePrice) * initialGrams) / 1000);
    setInputRupees(calculatedRs);
  };

  // Grams Change
  const handleGramsChange = (val) => {
    const g = Number(val) || 0;
    setInputGrams(val);
    if (weightModalItem && weightModalItem.salePrice) {
      const rs = Math.round((Number(weightModalItem.salePrice) * g) / 1000);
      setInputRupees(rs || '');
    }
  };

  // Rupees Change
  const handleRupeesChange = (val) => {
    const rs = Number(val) || 0;
    setInputRupees(val);
    if (weightModalItem && Number(weightModalItem.salePrice) > 0) {
      const g = Math.round((rs / Number(weightModalItem.salePrice)) * 1000);
      setInputGrams(g || '');
    }
  };

  // Preset chip selected
  const handlePresetSelect = (grams) => {
    setInputGrams(grams);
    if (weightModalItem && weightModalItem.salePrice) {
      const rs = Math.round((Number(weightModalItem.salePrice) * grams) / 1000);
      setInputRupees(rs);
    }
  };

  // Confirm Weight Selection
  const handleConfirmWeight = () => {
    const g = Number(inputGrams);
    if (g <= 0 || !weightModalItem) return;

    if (weightModalMode === 'edit' && weightCartIndex !== null) {
      updateCartWeight(weightCartIndex, g);
    } else {
      addToCart(weightModalItem, 1, { weightGrams: g });
    }
    setWeightModalItem(null);
  };

  // Cart Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + Math.round(item.salePrice * item.qty),
    0
  );
  const grandTotal = Math.max(0, subtotal - Number(discount || 0));

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMode === 'udhar' && !selectedCustomerId && !customCustomerName) {
      alert('Meherbani farma kar Udhar khate ke liye Grahak (Customer) select karein!');
      return;
    }

    let custName = 'Walk-in Customer';
    let custPhone = '';
    let custId = null;

    if (paymentMode === 'udhar') {
      if (selectedCustomerId) {
        const found = customers.find((c) => c.id === selectedCustomerId);
        if (found) {
          custName = found.name;
          custPhone = found.phone;
          custId = found.id;
        }
      } else {
        // Smart Check: Did user enter a phone number belonging to an existing customer? (DEDUPLICATION)
        const matched =
          customCustomerPhone.trim().length >= 7
            ? customers.find((c) => isSamePhoneNumber(c.phone, customCustomerPhone))
            : null;

        if (matched) {
          // REUSE EXISTING CUSTOMER! NEVER DUPLICATE!
          custName = matched.name;
          custPhone = matched.phone;
          custId = matched.id;
        } else {
          custName = customCustomerName.trim() || 'Khata Customer';
          custPhone = customCustomerPhone.trim();
          custId = null; // checkoutBill will create new customer and sync to MySQL!
        }
      }
    }

    const invoice = await checkoutBill({
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      paymentMode,
      discount,
      paidAmount: paymentMode === 'udhar' ? 0 : grandTotal,
    });

    if (invoice) {
      setLastCompletedInvoice(invoice);
      setShowSuccessModal(true);
      setDiscount(0);
      setSelectedCustomerId('');
      setCustomCustomerName('');
      setCustomCustomerPhone('');
      setPaymentMode('cash');
    }
  };

  const handleAddQuickItem = (e) => {
    e.preventDefault();
    if (!quickItemName.trim() || Number(quickItemPrice) <= 0) return;
    addQuickOpenItemToCart(quickItemName, quickItemPrice, quickItemQty, { unit: quickItemUnit });
    setQuickItemName('');
    setQuickItemPrice('');
    setQuickItemQty(1);
    setQuickItemUnit('item');
    setShowQuickItemModal(false);
  };

  // 1. Download Photo using Native Canvas (100% valid standard PNG)
  const handleDownloadReceiptPhoto = async () => {
    if (!lastCompletedInvoice) return;
    try {
      setIsGeneratingPhoto(true);
      const canvas = drawBillReceiptCanvas(lastCompletedInvoice, settings);
      await downloadCanvasAsPng(canvas, `Alhamd_Bill_${lastCompletedInvoice.id}.png`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  // 2. WhatsApp Share with ImgBB Cloud Link & Clipboard Copy
  const handleSendWhatsAppPhoto = async () => {
    if (!lastCompletedInvoice) return;
    try {
      setIsGeneratingPhoto(true);
      const canvas = drawBillReceiptCanvas(lastCompletedInvoice, settings);

      // 1. Copy image to clipboard for instant Ctrl + V
      await copyCanvasToClipboard(canvas);
      setPhotoCopiedNotice(true);
      setTimeout(() => setPhotoCopiedNotice(false), 8000);

      // 2. Upload to ImgBB Cloud if API key is configured
      let imgLink = '';
      if (settings.imgbbApiKey && settings.imgbbApiKey.trim()) {
        try {
          const uploadRes = await uploadCanvasToImgBB(
            canvas,
            settings.imgbbApiKey,
            `Alhamd_Bill_${lastCompletedInvoice.id}`
          );
          if (uploadRes.success && uploadRes.url) {
            imgLink = uploadRes.url;
          }
        } catch (e) {
          console.warn('ImgBB upload error:', e);
        }
      }

      // 3. Open WhatsApp chat with professional English caption
      const phone = lastCompletedInvoice.customerPhone || settings.phone;
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

      const lines = [
        `🧾 *ALHAMD SUPER STORE - SALES INVOICE*`,
        `Invoice No: ${lastCompletedInvoice.id}`,
        `Date & Time: ${lastCompletedInvoice.date}`,
        `Customer Name: ${lastCompletedInvoice.customerName || 'Walk-in Customer'}`,
        `Payment Mode: ${lastCompletedInvoice.paymentMode === 'jazzcash' ? 'Paid via JazzCash' : lastCompletedInvoice.paymentMode === 'easypaisa' ? 'Paid via Easypaisa' : lastCompletedInvoice.paymentMode === 'raast' ? 'Paid via Raast / Bank' : lastCompletedInvoice.paymentMode === 'cash' ? 'Paid in Full (Cash)' : 'Credit (Khata Account)'}`,
        `----------------------------------------`,
        `*GRAND TOTAL: Rs. ${Number(lastCompletedInvoice.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}*`,
      ];

      if (lastCompletedInvoice.udharAmount > 0) {
        lines.push(`💳 *Amount Added to Khata: Rs. ${Number(lastCompletedInvoice.udharAmount).toFixed(2)}*`);
      }

      if (imgLink) {
        lines.push(`----------------------------------------`);
        lines.push(`📸 *View / Download Invoice Photo:*`);
        lines.push(imgLink);
      } else {
        lines.push(`----------------------------------------`);
        lines.push(`📋 *Invoice image copied to clipboard (Press Ctrl + V in WhatsApp).*`);
      }

      lines.push(`----------------------------------------`);
      lines.push(`Store: ${settings.storeName} | Helpline: ${settings.phone}`);
      lines.push(`*Thank you for your visit!*`);

      const encoded = encodeURIComponent(lines.join('\n'));
      const waUrl =
        cleanPhone.length >= 10
          ? `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${encoded}`
          : `https://wa.me/?text=${encoded}`;

      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('WhatsApp error:', err);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  // 3. Open in Browser Tab (instant preview without file association errors)
  const handleOpenReceiptInTab = async () => {
    if (!lastCompletedInvoice) return;
    try {
      setIsGeneratingPhoto(true);
      const canvas = drawBillReceiptCanvas(lastCompletedInvoice, settings);
      await openCanvasInNewTab(canvas);
    } catch (err) {
      console.error('Open tab error:', err);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      {/* LEFT: PRODUCTS BROWSER (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Search Bar + Quick Cash Item Button */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Product Naam, Barcode (Scanner), ya Category likhein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Open Item */}
            <button
              onClick={() => setShowQuickItemModal(true)}
              className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              title="Aam khula sauda jaise nimko, biscuit ya dahi add karein"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">+ Khula Sauda</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories
              .filter((c) => c !== 'All')
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex-1 min-h-[420px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredProducts.map((p) => {
              const isLow = Number(p.stock) <= Number(p.minStock);
              const isOut = Number(p.stock) <= 0;
              const isWeighed = p.unit === 'kg' || p.unit === 'gm' || p.unit === 'gram';

              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => handleProductClick(p)}
                  className={`group relative p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isOut
                      ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : 'bg-white hover:bg-emerald-50/50 hover:border-emerald-400 hover:shadow-sm border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isWeighed
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isWeighed && <Scale className="w-2.5 h-2.5" />}
                        <span>{p.unit || 'item'}</span>
                      </span>
                      {isLow && !isOut && (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Kam Stock ({p.stock})
                        </span>
                      )}
                      {isOut && (
                        <span className="text-[9px] font-extrabold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          Khatam
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight">
                      {p.name}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-['Outfit'] font-black text-sm text-emerald-700">
                        Rs. {p.salePrice}
                      </span>
                      {isWeighed && (
                        <span className="text-[10px] text-slate-400 block font-normal -mt-0.5">
                          / {p.unit} (Toll)
                        </span>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                      {isWeighed ? <Scale className="w-3.5 h-3.5" /> : '+'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <ShoppingBag className="w-8 h-8 stroke-1" />
              <p className="text-xs">Koi item nahi mila.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CART & BILLING DESK (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Cart Header */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs uppercase tracking-wide">
                Current Bill ({cart.length} Items)
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-red-300 hover:text-red-200 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Khali Karein</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-3 flex-1 overflow-y-auto max-h-[320px] divide-y divide-slate-100 space-y-2">
            {cart.map((item, idx) => {
              const isWeighed = !!item.weightGrams || item.unit === 'kg' || item.unit === 'gm';
              const itemTotal = Math.round(item.salePrice * item.qty);

              return (
                <div
                  key={`${item.id}_${idx}`}
                  className="pt-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {isWeighed && (
                        <button
                          type="button"
                          onClick={() => handleEditCartWeight(item, idx)}
                          className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1 cursor-pointer transition-colors border border-amber-300"
                          title="Wazan / Grams Tabdeel Karein"
                        >
                          <Scale className="w-2.5 h-2.5" />
                          <span>{item.weightLabel || `${item.qty} ${item.unit}`}</span>
                          <Edit3 className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Rs. {item.salePrice}
                      {item.unit === 'kg' ? '/kg' : ''} x{' '}
                      {item.weightLabel || item.qty}
                    </div>
                  </div>

                  {/* Qty Controls */}
                  {!isWeighed ? (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQty(idx, item.qty - 1)}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(idx, item.qty + 1)}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditCartWeight(item, idx)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                      title="Grams Change Karein"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Toll</span>
                    </button>
                  )}

                  <div className="w-16 text-right font-['Outfit'] font-bold text-slate-900 text-xs">
                    Rs. {itemTotal}
                  </div>

                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center gap-2">
                <ShoppingBag className="w-8 h-8 text-slate-300 stroke-1" />
                <p className="text-xs">Bill khali hai. Bayen taraf se item click karein ya barcode scan karein.</p>
              </div>
            )}
          </div>

          {/* Payment & Customer Selection */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Multi-Payment Mode Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Payment Mode:</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {paymentMode === 'cash' && '💵 Naqd (Cash Drawer)'}
                  {paymentMode === 'jazzcash' && '🔴 JazzCash Online'}
                  {paymentMode === 'easypaisa' && '🟢 Easypaisa Online'}
                  {paymentMode === 'raast' && '🟣 Raast / Bank'}
                  {paymentMode === 'udhar' && '📕 Khata (Udhaar)'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/90 rounded-xl select-none">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="Naqd Cash"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('jazzcash')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMode === 'jazzcash'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="JazzCash"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-red-700 text-white text-[8px] font-black flex items-center justify-center">J</span>
                  <span>JazzCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('easypaisa')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMode === 'easypaisa'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="Easypaisa"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center">E</span>
                  <span>Easypaisa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('raast')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMode === 'raast'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="Raast / Bank"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-white text-[8px] font-black flex items-center justify-center">R</span>
                  <span>Raast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('udhar')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMode === 'udhar'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="Udhaar Khata"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Khata</span>
                </button>
              </div>

              {/* Online Wallet Helper Banners */}
              {paymentMode === 'jazzcash' && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl space-y-0.5 text-xs animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between font-bold text-red-950">
                    <span className="flex items-center gap-1">🔴 JazzCash Account:</span>
                    <span className="font-mono text-sm font-black text-red-700">{settings.jazzcashNumber || settings.phone || '0300-6764066'}</span>
                  </div>
                  <p className="text-[10px] text-red-800">
                    Customer se JazzCash par <strong>Rs. {grandTotal}</strong> wasool karein.
                  </p>
                </div>
              )}

              {paymentMode === 'easypaisa' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5 text-xs animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1">🟢 Easypaisa Account:</span>
                    <span className="font-mono text-sm font-black text-emerald-700">{settings.easypaisaNumber || settings.phone || '0300-6764066'}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800">
                    Customer se Easypaisa par <strong>Rs. {grandTotal}</strong> wasool karein.
                  </p>
                </div>
              )}

              {paymentMode === 'raast' && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-0.5 text-xs animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between font-bold text-purple-950">
                    <span className="flex items-center gap-1">🟣 Raast ID / Bank:</span>
                    <span className="font-mono text-sm font-black text-purple-700">{settings.raastId || settings.phone || '03006764066'}</span>
                  </div>
                  <p className="text-[10px] text-purple-800">
                    Customer se Raast ya Bank transfer par <strong>Rs. {grandTotal}</strong> wasool karein.
                  </p>
                </div>
              )}
            </div>

            {/* Udhar Customer Selector */}
            {paymentMode === 'udhar' && (
              <div className="space-y-2 p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                <label className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Khata Grahak Chunein:</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (e.target.value) {
                      setCustomCustomerName('');
                      setCustomCustomerPhone('');
                    }
                  }}
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="">-- Mojooda Khata Chunein (Ya Naya Banayein) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} - Baqaya: Rs. {c.balance}
                    </option>
                  ))}
                </select>

                {!selectedCustomerId && (() => {
                  const phoneMatch =
                    customCustomerPhone.trim().length >= 7
                      ? customers.find((c) => isSamePhoneNumber(c.phone, customCustomerPhone))
                      : null;

                  return (
                    <div className="pt-1 space-y-1.5">
                      <p className="text-[10px] text-rose-700 font-semibold flex items-center justify-between">
                        <span>Ya naye grahak ka naam aur phone likhein:</span>
                        <span className="text-[9px] text-slate-500 font-normal">(Auto-save ho kar dropdown me aayega)</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Grahak Ka Naam (e.g. Master Rafiq)"
                        value={customCustomerName}
                        onChange={(e) => setCustomCustomerName(e.target.value)}
                        className="w-full p-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium outline-none"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp Mobile Number (e.g. 03001234567)"
                        value={customCustomerPhone}
                        onChange={(e) => setCustomCustomerPhone(e.target.value)}
                        className="w-full p-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium outline-none"
                      />

                      {phoneMatch && (
                        <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-xs">
                          <div>
                            <span className="font-bold text-emerald-800">✓ Pehle Se Mojood Grahak:</span> {phoneMatch.name}
                            <div className="text-[10px] text-emerald-700">
                              Baqaya: Rs. {phoneMatch.balance} • Naya bill is khate me shamil hoga (Duplicate nahi banega)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(phoneMatch.id);
                              setCustomCustomerName('');
                              setCustomCustomerPhone('');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer shrink-0"
                          >
                            Select Karein
                          </button>
                        </div>
                      )}

                      {!phoneMatch && (customCustomerName.trim() || customCustomerPhone.trim()) && (
                        <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-[10px] text-blue-800 font-medium flex items-center gap-1">
                          <span>✨</span>
                          <span>Naya Khata: Yeh grahak Khata Book me save hoga aur next time dropdown me show hoga.</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Discount & Totals */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">Rs. {subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Discount (Chhoot):</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={discount || ''}
                    placeholder="0"
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-16 p-1 bg-white border rounded text-right font-mono font-bold text-xs outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">
                  Kul Rakam (Total):
                </span>
                <span className="font-['Outfit'] font-black text-xl text-emerald-800">
                  Rs. {grandTotal}
                </span>
              </div>
            </div>

            {/* Final Checkout Button */}
            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-xl font-['Outfit'] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                cart.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : paymentMode === 'cash'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : paymentMode === 'jazzcash'
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                  : paymentMode === 'easypaisa'
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30'
                  : paymentMode === 'raast'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                {paymentMode === 'cash'
                  ? `Naqd Cash Bill Nikalein (Rs. ${grandTotal})`
                  : paymentMode === 'jazzcash'
                  ? `JazzCash Wasool Bill Nikalein (Rs. ${grandTotal})`
                  : paymentMode === 'easypaisa'
                  ? `Easypaisa Wasool Bill Nikalein (Rs. ${grandTotal})`
                  : paymentMode === 'raast'
                  ? `Raast Wasool Bill Nikalein (Rs. ${grandTotal})`
                  : `Khate Me Darj Karein (Rs. ${grandTotal})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* WEIGHT & TOLL CALCULATOR MODAL (Fixed Button Layout & Proportions) */}
      {weightModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-black text-base text-slate-900">
                    {weightModalItem.name}
                  </h3>
                  <p className="text-xs text-emerald-700 font-bold font-mono">
                    Rate: Rs. {weightModalItem.salePrice} / kg
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWeightModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Pakistani Weight Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Pakistani Mashhoor Wazan (Quick Chips):
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                {COMMON_WEIGHT_PRESETS.map((p) => {
                  const isSelected = Number(inputGrams) === p.grams;
                  return (
                    <button
                      key={p.grams}
                      type="button"
                      onClick={() => handlePresetSelect(p.grams)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102 font-extrabold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Live Input Box: Grams OR Rupees */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-1">
                  ⚖️ Kanta / Grams Likhein:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={inputGrams}
                    onChange={(e) => handleGramsChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-black text-base text-slate-900 outline-none focus:border-amber-500 pr-8"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    g
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {inputGrams >= 1000 ? `${inputGrams / 1000} kg` : `${inputGrams || 0} gram`}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-1">
                  💰 Ya Raqam (Rupees) Likhein:
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={inputRupees}
                    onChange={(e) => handleRupeesChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-black text-base text-emerald-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Auto calculate
                </span>
              </div>
            </div>

            {/* Summary Banner */}
            <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Kul Wazan</span>
                <span className="font-['Outfit'] font-black text-base text-amber-400">
                  {inputGrams >= 1000 ? `${inputGrams / 1000} kg` : `${inputGrams || 0} Grams`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Bannay Wali Qeemat</span>
                <span className="font-['Outfit'] font-black text-xl text-emerald-400">
                  Rs. {inputRupees || 0}
                </span>
              </div>
            </div>

            {/* FIXED ACTION BUTTONS: Cancel is neat and compact, Add button has generous full width */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeightModalItem(null)}
                className="w-24 shrink-0 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWeight}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-['Outfit'] font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 min-w-0"
              >
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-200" />
                <span className="truncate">
                  {weightModalMode === 'edit'
                    ? `Wazan Update Karein (Rs. ${inputRupees || 0})`
                    : `Bill Me Add Karein (Rs. ${inputRupees || 0})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK OPEN CASH ITEM MODAL */}
      {showQuickItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-['Outfit'] font-black text-base text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-current" />
                <span>Khula Sauda / Quick Cash Item</span>
              </h3>
              <button
                onClick={() => setShowQuickItemModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Aisi cheezein jo catalog me add nahi hain (maslan Nimko, Loose Biscuit, Dahi, Anday, Barf) direct bill me shamil karein.
            </p>

            <form onSubmit={handleAddQuickItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Ka Naam</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dahi / Khuli Nimko"
                  value={quickItemName}
                  onChange={(e) => setQuickItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-semibold focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qeemat (Price) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Rs."
                    value={quickItemPrice}
                    onChange={(e) => setQuickItemPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl outline-none font-mono font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit / Taadad</label>
                  <select
                    value={quickItemUnit}
                    onChange={(e) => setQuickItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-semibold bg-white"
                  >
                    <option value="item">Item / Pkt</option>
                    <option value="kg">kg (Kilo)</option>
                    <option value="paao">Paao (250g)</option>
                    <option value="half_kg">Aadha Kilo (500g)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickItemModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Bill Me Add Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BILL SUCCESS MODAL WITH PHOTO RECEIPT GENERATION */}
      {showSuccessModal && lastCompletedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 my-auto">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-black text-base text-slate-900">
                    Bill Mukammal Ho Gaya!
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Receipt: {lastCompletedInvoice.id} • {lastCompletedInvoice.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification if copied */}
            {photoCopiedNotice && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Raseed Photo Download Ho Gayi! WhatsApp par Ctrl + V se paste karein.</span>
              </div>
            )}

            {/* Visual Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
              <div className="text-xs text-slate-500 font-semibold uppercase">Kul Bill Rakam</div>
              <div className="font-['Outfit'] font-black text-3xl text-emerald-800">
                Rs. {lastCompletedInvoice.grandTotal}
              </div>
              <div className="text-xs font-bold text-slate-600 pt-1">
                {lastCompletedInvoice.paymentMode === 'cash' && (
                  <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md font-bold">✓ Cash Wasool (Naqd Galle Me)</span>
                )}
                {lastCompletedInvoice.paymentMode === 'jazzcash' && (
                  <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-md font-bold">✓ JazzCash Wasool Shuda (Paid Online)</span>
                )}
                {lastCompletedInvoice.paymentMode === 'easypaisa' && (
                  <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md font-bold">✓ Easypaisa Wasool Shuda (Paid Online)</span>
                )}
                {lastCompletedInvoice.paymentMode === 'raast' && (
                  <span className="text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md font-bold">✓ Raast / Bank Wasool Shuda (Paid Online)</span>
                )}
                {lastCompletedInvoice.paymentMode === 'udhar' && (
                  <span className="text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md font-bold">⚠ Udhaar Khata: {lastCompletedInvoice.customerName}</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Tareekh &amp; Waqt: {lastCompletedInvoice.date}
              </div>
            </div>

            {/* ACTIONS: WhatsApp Photo, Open in Tab, Download Photo, Thermal Print */}
            <div className="space-y-2 pt-1">
              <button
                disabled={isGeneratingPhoto}
                onClick={handleSendWhatsAppPhoto}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {isGeneratingPhoto ? 'Tasweer Tayar Ho Rahi Hai...' : '📸 WhatsApp Par Bhejein (Ctrl + V)'}
                </span>
              </button>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  disabled={isGeneratingPhoto}
                  onClick={handleOpenReceiptInTab}
                  className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-blue-200 cursor-pointer transition-colors"
                  title="Browser ke naye tab me badi tasweer kholen"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Naye Tab Me</span>
                </button>

                <button
                  disabled={isGeneratingPhoto}
                  onClick={handleDownloadReceiptPhoto}
                  className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-200 cursor-pointer transition-colors"
                  title="Computer me PNG file save karein"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Save (PNG)</span>
                </button>

                <button
                  onClick={() => onPrintReceipt && onPrintReceipt(lastCompletedInvoice)}
                  className="py-2.5 px-2 bg-slate-900 hover:bg-black text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                  title="Thermal slip print karein"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Slip Print</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-1 text-center text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Agla Bill Shuru Karein (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
