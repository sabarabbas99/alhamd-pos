import React, { useState, useMemo } from 'react';
import { useStore, normalizeDateToDDMMYYYY } from '../context/StoreContext';
import {
  BarChart3,
  TrendingUp,
  Banknote,
  CreditCard,
  Printer,
  Calendar,
  DollarSign,
  FileText,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Receipt,
  Layers,
} from 'lucide-react';

export default function Reports({ onReprintInvoice }) {
  const { invoices, settings } = useStore();

  // Selected date filter mode: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'all' | 'custom'
  const [dateFilter, setDateFilter] = useState('today');
  // Custom date picker value in YYYY-MM-DD
  const [customDate, setCustomDate] = useState('');
  // Payment mode filter: 'all' | 'cash' | 'jazzcash' | 'easypaisa' | 'raast' | 'udhar'
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  // Search query for customer name or bill no
  const [searchQuery, setSearchQuery] = useState('');
  // Active view: 'invoices' | 'roznamcha'
  const [activeView, setActiveView] = useState('invoices');

  // Today and Yesterday reference dates
  const now = new Date();
  const todayStr = normalizeDateToDDMMYYYY(now);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = normalizeDateToDDMMYYYY(yesterdayDate);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Helper to extract clean Date object from invoice
  const getInvoiceDate = (inv) => {
    if (inv.timestamp) {
      const d = new Date(inv.timestamp);
      if (!isNaN(d.getTime())) return d;
    }
    if (inv.date) {
      const m = inv.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (m) {
        return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      }
    }
    return new Date(0);
  };

  // Filter invoices based on dateFilter
  const dateFilteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDateStr = normalizeDateToDDMMYYYY(inv.date || inv.timestamp);
      const invDateObj = getInvoiceDate(inv);

      if (dateFilter === 'today') {
        return invDateStr === todayStr;
      }
      if (dateFilter === 'yesterday') {
        return invDateStr === yesterdayStr;
      }
      if (dateFilter === 'last7') {
        return invDateObj >= sevenDaysAgo;
      }
      if (dateFilter === 'thisMonth') {
        return (
          invDateObj.getMonth() === now.getMonth() &&
          invDateObj.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === 'custom' && customDate) {
        const customNorm = normalizeDateToDDMMYYYY(customDate);
        return invDateStr === customNorm;
      }
      return true; // 'all'
    });
  }, [invoices, dateFilter, customDate, todayStr, yesterdayStr]);

  // Compute metrics for the selected period
  const metrics = useMemo(() => {
    const list = dateFilteredInvoices;
    const totalSale = list.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const cash = list
      .filter((inv) => inv.paymentMode === 'cash')
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const jazzcash = list
      .filter((inv) => inv.paymentMode === 'jazzcash')
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const easypaisa = list
      .filter((inv) => inv.paymentMode === 'easypaisa')
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const raast = list
      .filter((inv) => inv.paymentMode === 'raast')
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const udhar = list.reduce((sum, inv) => sum + (inv.udharAmount || 0), 0);
    const digitalOnline = jazzcash + easypaisa + raast;
    const totalReceived = cash + digitalOnline;
    const profit = list.reduce((sum, inv) => sum + (inv.profit || 0), 0);
    const count = list.length;

    return {
      totalSale,
      cash,
      jazzcash,
      easypaisa,
      raast,
      digitalOnline,
      totalReceived,
      udhar,
      profit,
      count,
    };
  }, [dateFilteredInvoices]);

  // Further filter for the invoice table (Payment mode + Search)
  const displayInvoices = useMemo(() => {
    return dateFilteredInvoices.filter((inv) => {
      // Payment Mode filter
      if (paymentModeFilter !== 'all' && inv.paymentMode !== paymentModeFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (inv.id || '').toLowerCase().includes(q);
        const matchesName = (inv.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (inv.customerPhone || '').includes(q);
        const matchesItems = (inv.items || []).some((i) =>
          (i.name || '').toLowerCase().includes(q)
        );
        if (!matchesId && !matchesName && !matchesPhone && !matchesItems) {
          return false;
        }
      }
      return true;
    });
  }, [dateFilteredInvoices, paymentModeFilter, searchQuery]);

  // Group ALL invoices by date for the "Daily Roznamcha" table
  const dailyRoznamcha = useMemo(() => {
    const groups = {};
    for (const inv of invoices) {
      const dateKey = normalizeDateToDDMMYYYY(inv.date || inv.timestamp) || 'Baghair Tareekh';
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateStr: dateKey,
          dateObj: getInvoiceDate(inv),
          count: 0,
          totalSale: 0,
          cash: 0,
          jazzcash: 0,
          easypaisa: 0,
          raast: 0,
          udhar: 0,
          profit: 0,
          invoices: [],
        };
      }
      const g = groups[dateKey];
      g.count += 1;
      g.totalSale += inv.grandTotal || 0;
      if (inv.paymentMode === 'cash') g.cash += inv.paidAmount || 0;
      if (inv.paymentMode === 'jazzcash') g.jazzcash += inv.paidAmount || 0;
      if (inv.paymentMode === 'easypaisa') g.easypaisa += inv.paidAmount || 0;
      if (inv.paymentMode === 'raast') g.raast += inv.paidAmount || 0;
      g.udhar += inv.udharAmount || 0;
      g.profit += inv.profit || 0;
      g.invoices.push(inv);
    }

    // Sort by date descending
    return Object.values(groups).sort((a, b) => b.dateObj - a.dateObj);
  }, [invoices]);

  // Label for active filter period
  const getFilterLabel = () => {
    if (dateFilter === 'today') return `Aaj (${todayStr})`;
    if (dateFilter === 'yesterday') return `Kal (${yesterdayStr})`;
    if (dateFilter === 'last7') return 'Pichle 7 Din';
    if (dateFilter === 'thisMonth') return 'Is Mahine Ki Sale';
    if (dateFilter === 'all') return `Kul Record (${invoices.length} Bills)`;
    if (dateFilter === 'custom' && customDate) {
      return `Chuni Hui Tareekh: ${normalizeDateToDDMMYYYY(customDate)}`;
    }
    return 'Tareekh Filter';
  };

  // Thermal Print Daily Closing Summary Slip
  const handlePrintDailyClosingSlip = (dayRecord) => {
    const targetDate = dayRecord ? dayRecord.dateStr : getFilterLabel();
    const dSale = dayRecord ? dayRecord.totalSale : metrics.totalSale;
    const dCash = dayRecord ? dayRecord.cash : metrics.cash;
    const dJazz = dayRecord ? dayRecord.jazzcash : metrics.jazzcash;
    const dEasy = dayRecord ? dayRecord.easypaisa : metrics.easypaisa;
    const dRaast = dayRecord ? dayRecord.raast : metrics.raast;
    const dOnline = dJazz + dEasy + dRaast;
    const dUdhar = dayRecord ? dayRecord.udhar : metrics.udhar;
    const dProfit = dayRecord ? dayRecord.profit : metrics.profit;
    const dCount = dayRecord ? dayRecord.count : metrics.count;
    const dReceived = dCash + dOnline;

    const printWin = window.open('', '_blank', 'width=380,height=600');
    if (!printWin) {
      alert('Popup blocked! Please allow popups to print report slip.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Closing Report - ${targetDate}</title>
          <style>
            @page { margin: 0; size: 58mm auto; }
            body {
              font-family: 'Courier New', monospace;
              width: 58mm;
              margin: 0;
              padding: 6px;
              font-size: 11px;
              color: #000;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
            .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .title { font-size: 14px; font-weight: 900; margin-bottom: 2px; }
            .badge { border: 1px solid #000; padding: 2px 4px; font-size: 10px; display: inline-block; margin: 3px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="text-center">
            <div class="title">${settings.storeName || 'ALHAMD SUPER STORE'}</div>
            <div>${settings.tagline || 'Karyana & General Store'}</div>
            <div>${settings.address || 'Main Bazaar'}</div>
            <div class="badge bold">ROZNAMCHA / DAILY CLOSING REPORT</div>
          </div>
          
          <div class="divider"></div>
          <div class="row"><span>Report Date:</span><span class="bold">${targetDate}</span></div>
          <div class="row"><span>Print Time:</span><span>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div class="row"><span>Total Bills:</span><span class="bold">${dCount} Parchiyan</span></div>
          
          <div class="double-divider"></div>
          <div class="row bold" style="font-size: 13px;">
            <span>KUL SALE:</span>
            <span>Rs. ${dSale.toLocaleString()}</span>
          </div>
          <div class="double-divider"></div>

          <div class="bold" style="margin-top: 4px;">WASOOLI (PAYMENT BREAKDOWN):</div>
          <div class="row"><span>💵 Cash Galle Me:</span><span class="bold">Rs. ${dCash.toLocaleString()}</span></div>
          <div class="row"><span>🔴 JazzCash Online:</span><span>Rs. ${dJazz.toLocaleString()}</span></div>
          <div class="row"><span>🟢 Easypaisa Online:</span><span>Rs. ${dEasy.toLocaleString()}</span></div>
          <div class="row"><span>🟣 Raast / Bank:</span><span>Rs. ${dRaast.toLocaleString()}</span></div>
          <div class="row bold" style="border-top: 1px dotted #000; padding-top: 2px;">
            <span>KUL CASH+ONLINE:</span>
            <span>Rs. ${dReceived.toLocaleString()}</span>
          </div>

          <div class="divider"></div>
          <div class="row"><span>📒 Aaj Ka Udhar:</span><span class="bold">Rs. ${dUdhar.toLocaleString()}</span></div>
          <div class="row bold" style="color: #000;">
            <span>📈 Gross Munafa:</span>
            <span>+Rs. ${dProfit.toLocaleString()}</span>
          </div>

          <div class="double-divider"></div>
          <div class="text-center" style="font-size: 9px; margin-top: 5px;">
            Alhamd Super Store POS • Central Database Verified
          </div>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Top Header Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-['Outfit'] font-black text-xl text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Sales, Roznamcha &amp; Munafa Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kisi bhi din ki sale, wasooli, udhar aur roznamcha history check karein.
          </p>
        </div>

        {/* View Mode Switcher + Print Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveView('invoices')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeView === 'invoices'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Parchiyan Log
            </button>
            <button
              onClick={() => setActiveView('roznamcha')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeView === 'roznamcha'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
              Roznamcha (Day-by-Day)
            </button>
          </div>

          <button
            onClick={() => handlePrintDailyClosingSlip(null)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            title="Is report ka closing parchi slip print karein"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Modern Date Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Tareekh:
            </span>

            {/* Quick Filter Buttons */}
            <button
              onClick={() => {
                setDateFilter('today');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Aaj (Today)
            </button>

            <button
              onClick={() => {
                setDateFilter('yesterday');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'yesterday'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Kal (Yesterday)
            </button>

            <button
              onClick={() => {
                setDateFilter('last7');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'last7'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pichle 7 Din
            </button>

            <button
              onClick={() => {
                setDateFilter('thisMonth');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'thisMonth'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Is Mahine
            </button>

            <button
              onClick={() => {
                setDateFilter('all');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Kul Record (All Time)
            </button>
          </div>

          {/* Custom Date Input */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Koi Bhi Tareekh Chuniye:
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) {
                  setDateFilter('custom');
                }
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            {customDate && (
              <button
                onClick={() => {
                  setCustomDate('');
                  setDateFilter('today');
                }}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Muntakhib Karda Record:</span>
            <strong className="text-slate-800 font-black">{getFilterLabel()}</strong>
          </div>
          <span className="font-mono text-slate-600">
            {metrics.count} Parchiyan • Kul Farokht: Rs. {metrics.totalSale.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Kul Farokht (Total Sale)
          </div>
          <div className="font-['Outfit'] font-black text-2xl text-emerald-600 mt-1">
            Rs. {metrics.totalSale.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {metrics.count} parchiyan ({getFilterLabel()})
          </p>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Cash Collected in Drawer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Naqd Cash Galle Me
          </div>
          <div className="font-['Outfit'] font-black text-2xl text-blue-600 mt-1">
            Rs. {metrics.cash.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Physical Currency Drawer</p>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Banknote className="w-4 h-4" />
          </div>
        </div>

        {/* Digital Mobile Wallets */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Digital Online Wasooli
          </div>
          <div className="font-['Outfit'] font-black text-2xl text-purple-600 mt-1">
            Rs. {metrics.digitalOnline.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">JazzCash, Easypaisa, Raast</p>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        {/* Gross Profit Margin */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Estimated Gross Munafa
          </div>
          <div className="font-['Outfit'] font-black text-2xl text-emerald-700 mt-1">
            Rs. {metrics.profit.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Farokht - Kharid Rate Margin</p>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Payment Modes Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-red-50/80 rounded-xl border border-red-200">
          <div className="text-[10px] font-bold text-red-900 uppercase">🔴 JazzCash Online</div>
          <div className="font-['Outfit'] font-black text-lg text-red-700 mt-0.5">
            Rs. {metrics.jazzcash.toLocaleString()}
          </div>
          <span className="text-[9px] text-red-600">Direct mobile wallet</span>
        </div>

        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-900 uppercase">🟢 Easypaisa Online</div>
          <div className="font-['Outfit'] font-black text-lg text-emerald-700 mt-0.5">
            Rs. {metrics.easypaisa.toLocaleString()}
          </div>
          <span className="text-[9px] text-emerald-600">Direct mobile wallet</span>
        </div>

        <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200">
          <div className="text-[10px] font-bold text-purple-900 uppercase">🟣 Raast / Bank</div>
          <div className="font-['Outfit'] font-black text-lg text-purple-700 mt-0.5">
            Rs. {metrics.raast.toLocaleString()}
          </div>
          <span className="text-[9px] text-purple-600">Instant bank transfer</span>
        </div>

        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
          <div className="text-[10px] font-bold text-amber-900 uppercase">📒 Naya Udhar (Khata)</div>
          <div className="font-['Outfit'] font-black text-lg text-amber-700 mt-0.5">
            Rs. {metrics.udhar.toLocaleString()}
          </div>
          <span className="text-[9px] text-amber-600">Grahak ke hisab me baqaya</span>
        </div>
      </div>

      {/* VIEW 1: DAILY ROZNAMCHA TABLE (DAY-BY-DAY CLOSING SUMMARY) */}
      {activeView === 'roznamcha' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3.5 border-b bg-slate-50 flex items-center justify-between">
            <h3 className="font-['Outfit'] font-bold text-sm text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>Daily Roznamcha (Tareekh Ba Tareekh Mukammal Hisab)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Kul {dailyRoznamcha.length} Din Ka Record Maujood Hai
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tareekh (Date)</th>
                  <th className="p-3">Parchiyan</th>
                  <th className="p-3">Kul Farokht (Sale)</th>
                  <th className="p-3">Naqd Galle Me</th>
                  <th className="p-3">Digital Online</th>
                  <th className="p-3">Naya Udhar</th>
                  <th className="p-3">Gross Munafa</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyRoznamcha.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  const isYesterday = day.dateStr === yesterdayStr;
                  const digital = day.jazzcash + day.easypaisa + day.raast;

                  return (
                    <tr
                      key={day.dateStr}
                      className={`hover:bg-slate-50 ${
                        isToday ? 'bg-emerald-50/40' : isYesterday ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm">{day.dateStr}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              Aaj
                            </span>
                          )}
                          {isYesterday && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black">
                              Kal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-bold">{day.count} Bills</td>
                      <td className="p-3 font-['Outfit'] font-black text-emerald-700 text-sm">
                        Rs. {day.totalSale.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-blue-700">
                        Rs. {day.cash.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-purple-700">
                        Rs. {digital.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-amber-700">
                        Rs. {day.udhar.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        +Rs. {day.profit.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              // Switch to invoices tab and filter to this date
                              setDateFilter('custom');
                              // Convert DD/MM/YYYY to YYYY-MM-DD for date input
                              const parts = day.dateStr.split('/');
                              if (parts.length === 3) {
                                setCustomDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                              }
                              setActiveView('invoices');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg cursor-pointer text-xs"
                          >
                            Tafseel
                          </button>
                          <button
                            onClick={() => handlePrintDailyClosingSlip(day)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer text-xs inline-flex items-center gap-1"
                            title="Is din ka closing paper slip print karein"
                          >
                            <Printer className="w-3 h-3 text-emerald-400" />
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: INVOICES LOG TABLE */}
      {activeView === 'invoices' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Table Controls (Mode filter + Search) */}
          <div className="p-3 border-b flex flex-wrap items-center justify-between gap-2 bg-slate-50">
            <h3 className="font-['Outfit'] font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>
                Parchiyan / Invoices ({displayInvoices.length} of {dateFilteredInvoices.length})
              </span>
            </h3>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Grahak, Bill No ya Sauda..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
              />
            </div>

            {/* Payment Mode Pills */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              {[
                { id: 'all', label: 'Tamam' },
                { id: 'cash', label: 'Cash' },
                { id: 'jazzcash', label: 'JazzCash' },
                { id: 'easypaisa', label: 'Easypaisa' },
                { id: 'raast', label: 'Raast' },
                { id: 'udhar', label: 'Udhaar' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentModeFilter(m.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    paymentModeFilter === m.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items Summary</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Kul Rakam</th>
                  <th className="p-3">Estimated Profit</th>
                  <th className="p-3 text-right">Reprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-8 h-8 text-slate-300" />
                        <span className="font-bold text-sm text-slate-600">
                          Is tareekh / filter me koi parchi nahi mili.
                        </span>
                        <p className="text-xs text-slate-400">
                          Upar "Kal (Yesterday)" ya "Kul Record" daba kar pehle ki sale dekhein.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono text-slate-900">{inv.id}</td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{inv.date}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        <div>{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {inv.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 truncate max-w-[220px]">
                        {(inv.items || [])
                          .map((it) => `${it.name} (${it.qty}${it.unit ? ` ${it.unit}` : ''})`)
                          .join(', ')}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            inv.paymentMode === 'cash'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : inv.paymentMode === 'jazzcash'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : inv.paymentMode === 'easypaisa'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : inv.paymentMode === 'raast'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {inv.paymentMode === 'cash'
                            ? '💵 Cash'
                            : inv.paymentMode === 'jazzcash'
                            ? '🔴 JazzCash'
                            : inv.paymentMode === 'easypaisa'
                            ? '🟢 Easypaisa'
                            : inv.paymentMode === 'raast'
                            ? '🟣 Raast'
                            : '📒 Udhar'}
                        </span>
                      </td>
                      <td className="p-3 font-['Outfit'] font-black text-slate-900 text-sm">
                        Rs. {(inv.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-emerald-600 font-bold font-mono">
                        +Rs. {(inv.profit || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onReprintInvoice && onReprintInvoice(inv)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
