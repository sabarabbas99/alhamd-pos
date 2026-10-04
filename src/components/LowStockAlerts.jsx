import React from 'react';
import { useStore } from '../context/StoreContext';
import { AlertTriangle, Share2, Plus, CheckCircle2 } from 'lucide-react';

export default function LowStockAlerts({ onRestockClick }) {
  const { lowStockProducts, settings } = useStore();

  const handleSendSupplierList = () => {
    if (lowStockProducts.length === 0) return;

    const itemsText = lowStockProducts
      .map((p, idx) => `${idx + 1}. ${p.name} (Bacha Stock: ${p.stock} ${p.unit})`)
      .join('\n');

    const message = `🚨 *ORDER LIST — ${settings.storeName.toUpperCase()}*
Tareekh: ${new Date().toLocaleDateString('en-GB')}
Assalam-o-Alaikum, ye items hamare paas khatam hone ke qareeb hain, meharbani farma kar inka maal deliver karein:

${itemsText}

_Shukriya,_
*${settings.storeName}*
📞 ${settings.phone}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Top Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-black text-lg text-slate-900 flex items-center gap-2">
              <span>Low Stock Alerts</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {lowStockProducts.length} Items Khatam Hone Wale Hain
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Ye wo items hain jinka stock alert limit se kam ho chuka hai. Supplier ko foran order dein.
            </p>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <button
            onClick={handleSendSupplierList}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Supplier Ko WhatsApp Order Bhejein</span>
          </button>
        )}
      </div>

      {/* Low Stock List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {lowStockProducts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {lowStockProducts.map((p) => {
              const isZero = Number(p.stock) <= 0;
              return (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                        isZero ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                      <p className="text-xs text-slate-500">
                        Category: {p.category} • Unit Rate: Rs. {p.salePrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Bacha Stock:</span>
                      <span
                        className={`font-['Outfit'] font-black text-base ${
                          isZero ? 'text-red-600' : 'text-amber-700'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Min Limit:</span>
                      <span className="text-slate-600 font-bold">{p.minStock} {p.unit}</span>
                    </div>

                    <button
                      onClick={() => onRestockClick && onRestockClick(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Stock Barhayein</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-['Outfit'] font-black text-lg text-slate-800">
              Shabash! Tamam Stock Normal Hai
            </h3>
            <p className="text-xs text-slate-400">
              Koi bhi item low stock limit par nahi hai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}