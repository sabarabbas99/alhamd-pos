import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  drawCustomerKhataCanvas,
  downloadCanvasAsPng,
  copyCanvasToClipboard,
  openCanvasInNewTab,
  uploadCanvasToImgBB,
} from '../utils/receiptCanvas';
import {
  BookOpen,
  User,
  Plus,
  Search,
  Share2,
  Banknote,
  Calendar,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  CheckCircle,
  FileText,
  Eye,
} from 'lucide-react';

export default function KhataBook() {
  const { customers, addCustomer, recordKhataPayment, settings, isSamePhoneNumber } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showWasooliModal, setShowWasooliModal] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [statementNotice, setStatementNotice] = useState(false);

  // New Customer Form
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    address: '',
    initialBalance: '',
  });

  // Wasooli Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('Cash Wasool Kiya');

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const totalMarketUdhar = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim()) return;
    const savedCust = await addCustomer(newCust);
    if (savedCust) {
      setSelectedCustomer(savedCust);
    }
    setNewCust({ name: '', phone: '', address: '', initialBalance: '' });
    setShowAddCustomerModal(false);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;
    recordKhataPayment(selectedCustomer.id, paymentAmount, paymentNote);
    setShowWasooliModal(false);
    setPaymentAmount('');
    setPaymentNote('Cash Wasool Kiya');
  };

  // Download Khata Statement PNG directly
  const handleDownloadStatementCard = async (customer) => {
    if (!customer) return;
    try {
      setIsGeneratingCard(true);
      const canvas = drawCustomerKhataCanvas(customer, settings);
      const safeName = customer.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadCanvasAsPng(canvas, `Alhamd_Khata_${safeName}.png`);
    } catch (err) {
      console.error('Download Khata card error:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // Raat Ka Hisab / WhatsApp Khata Share (Statement Image on Clipboard + ImgBB Cloud Link + WhatsApp)
  const handleSendStatementWhatsApp = async (customer) => {
    if (!customer) return;
    try {
      setIsGeneratingCard(true);
      const canvas = drawCustomerKhataCanvas(customer, settings);

      // 1. Copy image to clipboard for instant Ctrl + V in WhatsApp
      const copied = await copyCanvasToClipboard(canvas);
      if (copied) {
        setStatementNotice(true);
        setTimeout(() => setStatementNotice(false), 8000);
      }

      // 2. Upload to ImgBB Cloud if API key is configured
      let imgLink = '';
      if (settings.imgbbApiKey && settings.imgbbApiKey.trim()) {
        try {
          const safeName = customer.name.replace(/[^a-zA-Z0-9_-]/g, '_');
          const uploadRes = await uploadCanvasToImgBB(
            canvas,
            settings.imgbbApiKey,
            `Alhamd_Khata_${safeName}`
          );
          if (uploadRes.success && uploadRes.url) {
            imgLink = uploadRes.url;
          }
        } catch (e) {
          console.warn('ImgBB khata upload error:', e);
        }
      }

      // 3. Format message in professional English
      const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');

      const historyItems = (customer.history || [])
        .slice(0, 5)
        .map((h) => {
          const typeStr = h.type === 'payment' ? '[PAYMENT RECEIVED]' : '[INVOICE PURCHASE]';
          return `• ${h.date} - ${typeStr}: Rs. ${Number(h.amount).toFixed(2)} (${h.note || ''})`;
        })
        .join('\n');

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      const lines = [
        `🧾 *ALHAMD SUPER STORE - CUSTOMER ACCOUNT STATEMENT*`,
        `Dear *${customer.name}*,`,
        `Your current ledger balance details are as follows:`,
        ``,
        `💰 *TOTAL OUTSTANDING BALANCE: Rs. ${Number(customer.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}*`,
        `📅 *Statement Timestamp:* ${dateStr} - ${timeStr}`,
        ``,
        `📋 *Recent Ledger Entries:*`,
        historyItems || 'No recent transactions recorded',
        ``,
      ];

      if (imgLink) {
        lines.push(`📸 *View / Download Your Official Statement Card:*`);
        lines.push(imgLink);
        lines.push(``);
      } else {
        lines.push(`📋 *Statement card copied to clipboard (Press Ctrl + V in WhatsApp).*`);
        lines.push(``);
      }

      lines.push(`_Kindly verify your ledger statement and settle pending dues. Thank you!_`);
      lines.push(``);
      lines.push(`*${settings.storeName || 'Alhamd Super Store'}*`);
      lines.push(`Helpline: ${settings.phone || ''}`);

      const encoded = encodeURIComponent(lines.join('\n'));
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;

      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('WhatsApp Khata error:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // View Khata Statement in a new browser tab (No download, no file association issues)
  const handleViewStatementInTab = async (customer) => {
    if (!customer) return;
    try {
      setIsGeneratingCard(true);
      const canvas = drawCustomerKhataCanvas(customer, settings);
      await openCanvasInNewTab(canvas);
    } catch (err) {
      console.error('View Khata card error:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Notification Toast */}
      {statementNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Customer ka Khata Card download ho gaya aur Clipboard me Copy ho chuka hai! WhatsApp khul gaya hai, wahan sirf <strong>Ctrl + V (Paste)</strong> daba kar Send kar dein!
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-['Outfit'] font-black text-xl text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Digital Udhaar Khata (Customer Ledger)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Market me Kul Udhaar Baqaya:{' '}
            <strong className="text-purple-700 font-bold font-mono">
              Rs. {totalMarketUdhar.toLocaleString()}
            </strong>{' '}
            | Kul Khata Customers: {customers.length}
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Naya Khata Customer Banayein</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Customer Search Karein (Naam, Mobile Number, ya Mohalla)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Kul Baqaya:
                  </span>
                  <span
                    className={`font-['Outfit'] font-black text-lg ${
                      c.balance > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    Rs. {c.balance}
                  </span>
                </div>
              </div>

              {c.address && (
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {c.address}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => {
                  setSelectedCustomer(c);
                  setShowWasooliModal(true);
                }}
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Wasooli</span>
              </button>

              <button
                disabled={isGeneratingCard}
                onClick={() => handleSendStatementWhatsApp(c)}
                className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Raat Ka Hisab / WhatsApp Parchi Bhejein"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Hisab</span>
              </button>

              <button
                onClick={() => setSelectedCustomer(c)}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Tafseel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Ledger Modal */}
      {selectedCustomer && !showWasooliModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-black text-lg text-slate-900">
                    {selectedCustomer.name} Ka Khata
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mobile: {selectedCustomer.phone || 'N/A'} {selectedCustomer.address ? ` | ${selectedCustomer.address}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                  Kul Baqaya Udhaar Rakam:
                </span>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Dukan ko yeh rakam wasool karni hai
                </p>
              </div>
              <span className="font-['Outfit'] font-black text-2xl text-rose-700">
                Rs. {selectedCustomer.balance}
              </span>
            </div>

            {/* Quick Actions (WhatsApp Card + View in Tab + Download) */}
            <div className="space-y-2">
              <button
                disabled={isGeneratingCard}
                onClick={() => handleSendStatementWhatsApp(selectedCustomer)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer transition-all text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {isGeneratingCard ? 'Photo Ban Rahi Hai...' : '📸 WhatsApp Par Khata Bhejein (Ctrl + V)'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  disabled={isGeneratingCard}
                  onClick={() => handleViewStatementInTab(selectedCustomer)}
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer transition-colors"
                  title="Browser ke naye tab me parchi kholen"
                >
                  <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Naye Tab Me Dekhein</span>
                </button>

                <button
                  disabled={isGeneratingCard}
                  onClick={() => handleDownloadStatementCard(selectedCustomer)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                  title="Computer me PNG file save karein"
                >
                  <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Save Karein (PNG)</span>
                </button>
              </div>
            </div>

            {/* History Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs uppercase text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hisaab Kitab Record (Len Den History)</span>
                </h4>
                <button
                  onClick={() => setShowWasooliModal(true)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
                >
                  + Cash Wasooli Entry
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs max-h-64 overflow-y-auto">
                {(selectedCustomer.history || []).map((h, i) => (
                  <div key={i} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          h.type === 'payment'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {h.type === 'payment' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {h.type === 'payment' ? 'Cash Wasooli' : `Bill Sauda: ${h.billNo || ''}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {h.date} {h.note ? ` | ${h.note}` : ''}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-['Outfit'] font-black text-sm text-right shrink-0 ${
                        h.type === 'payment' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {h.type === 'payment' ? `- Rs. ${h.amount}` : `+ Rs. ${h.amount}`}
                    </div>
                  </div>
                ))}

                {(!selectedCustomer.history || selectedCustomer.history.length === 0) && (
                  <div className="p-8 text-center text-slate-400">
                    Is customer ki abhi tak koi len den entry darj nahi hai.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Band Karein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wasooli Entry Modal */}
      {showWasooliModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-['Outfit'] font-black text-base text-slate-900">
                  Cash Wasooli Entry
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setShowWasooliModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Mojooda Baqaya:</span>
                <span className="font-['Outfit'] font-black text-rose-600 text-base">
                  Rs. {selectedCustomer.balance}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Wasool Ki Gai Rakam (Amount in Rupees) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Rs."
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-emerald-300 rounded-xl text-base font-black font-mono text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tafseel / Note</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-semibold focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWasooliModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Wasooli Save Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-['Outfit'] font-black text-base text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-600" />
                <span>Naya Udhaar Grahak (Customer)</span>
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Ka Naam *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Rashid Sahab"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-semibold focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-semibold focus:border-purple-500"
                />
                {(() => {
                  const dup = (newCust.phone && newCust.phone.trim().length >= 7 && typeof isSamePhoneNumber === 'function')
                    ? customers.find((c) => isSamePhoneNumber(c.phone, newCust.phone))
                    : null;
                  if (!dup) return null;
                  return (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 font-medium">
                      ⚠️ Yeh number pehle se <strong>{dup.name}</strong> (Baqaya: Rs. {dup.balance}) ke khate me darj hai. Duplicate nahi banega balkeh purana khata hi update hoga.
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pata / Mohalla</label>
                <input
                  type="text"
                  placeholder="Gali No 2, Main Mohalla"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-semibold focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Purana / Sabqa Udhar (Agar koi ho)
                </label>
                <input
                  type="number"
                  placeholder="Rs. 0"
                  value={newCust.initialBalance}
                  onChange={(e) => setNewCust({ ...newCust, initialBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-semibold font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Customer Save Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
