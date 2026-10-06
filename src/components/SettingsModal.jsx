import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, X, Check } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const { settings, setSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Sticky Header with prominent X button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-base sm:text-lg text-slate-900 leading-tight">
                Store &amp; Printer Settings
              </h3>
              <p className="text-[11px] text-slate-500">Dukaan ki tafseelat, payment accounts aur printer</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Band Karein (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="settings-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Dukaan Ka Naam *</label>
            <input
              type="text"
              required
              value={form.storeName || ''}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-sm text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline || ''}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="e.g. Karyana & General Store"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone / Helpline</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp No</label>
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Address / Pata</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Digital Payment Accounts */}
          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-950 block text-xs">
                💳 Digital Payment Accounts (JazzCash / Easypaisa / Raast)
              </label>
              <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                Counter Accounts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">🔴 JazzCash Number / Till ID</label>
                <input
                  type="text"
                  placeholder="0300-6764066"
                  value={form.jazzcashNumber || ''}
                  onChange={(e) => setForm({ ...form, jazzcashNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">🟢 Easypaisa Number / Account</label>
                <input
                  type="text"
                  placeholder="0300-6764066"
                  value={form.easypaisaNumber || ''}
                  onChange={(e) => setForm({ ...form, easypaisaNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900 focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">🟣 Raast ID / Bank Details</label>
              <input
                type="text"
                placeholder="03006764066"
                value={form.raastId || ''}
                onChange={(e) => setForm({ ...form, raastId: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900 focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Yeh numbers checkout ke waqt screen par show honge taake customer foran online payment bhej sake!
            </p>
          </div>

          {/* ImgBB Cloud API Key */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-950 block text-xs">
                ImgBB Cloud API Key (WhatsApp Image Link Ke Liye)
              </label>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                Free Photo Cloud
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. 7f83a45c9284cb82d..."
              value={form.imgbbApiKey || ''}
              onChange={(e) => setForm({ ...form, imgbbApiKey: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl outline-none font-mono text-xs text-amber-950 focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="text-[10px] text-slate-500 leading-normal">
              ImgBB.com se free API key lekar yahan save karein. Har bill aur khata parchi ka direct link WhatsApp par chala jayega, jise customer foran click kar ke dekh sake ga!
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Thermal Printer Size (Parchi Ka Size)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, printerWidth: '58mm' })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  form.printerWidth === '58mm'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                58mm (Choti Slip / POS-58)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, printerWidth: '80mm' })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  form.printerWidth === '80mm'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                80mm (Standard POS-80)
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Parchi Ke End Ka Message</label>
            <textarea
              rows={2}
              value={form.receiptNote || ''}
              onChange={(e) => setForm({ ...form, receiptNote: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
