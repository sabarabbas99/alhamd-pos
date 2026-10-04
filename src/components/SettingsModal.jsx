import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Printer, Store, Phone, MapPin, X, Check } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const { settings, setSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="font-['Outfit'] font-black text-lg text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Store &amp; Printer Settings</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Dukaan Ka Naam</label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl outline-none font-bold text-sm text-emerald-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone / Helpline</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp No</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Address / Pata</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>

          {/* Digital Payment Accounts */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-950 block">
                💳 Digital Payment Accounts (JazzCash / Easypaisa / Raast)
              </label>
              <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                Counter Accounts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">🔴 JazzCash Number / Till ID</label>
                <input
                  type="text"
                  placeholder="0300-6764066"
                  value={form.jazzcashNumber || ''}
                  onChange={(e) => setForm({ ...form, jazzcashNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">🟢 Easypaisa Number / Account</label>
                <input
                  type="text"
                  placeholder="0300-6764066"
                  value={form.easypaisaNumber || ''}
                  onChange={(e) => setForm({ ...form, easypaisaNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900"
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
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg outline-none font-mono text-xs text-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Yeh numbers checkout ke waqt screen par show honge taake customer foran online payment bhej sake!
            </p>
          </div>

          {/* ImgBB Cloud API Key */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-950 block">
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
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, printerWidth: '58mm' })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  form.printerWidth === '58mm'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                58mm (Choti Slip / POS-58)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, printerWidth: '80mm' })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  form.printerWidth === '80mm'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
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
              value={form.receiptNote}
              onChange={(e) => setForm({ ...form, receiptNote: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
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
        </form>
      </div>
    </div>
  );
}