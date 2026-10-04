import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Settings,
  Store,
  Clock,
  Calendar,
  Printer,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenSettings }) {
  const {
    dbConnected,
    settings,
    todaySale,
    todayCash,
    todayUdhar,
    totalMarketUdhar,
    lowStockProducts,
    todayInvoicesCount,
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'pos', label: 'Billing Counter', icon: ShoppingCart, badge: null },
    { id: 'stock', label: 'Stock & Items', icon: Package, badge: null },
    {
      id: 'alerts',
      label: 'Low Stock Alert',
      icon: AlertTriangle,
      badge: lowStockProducts.length > 0 ? lowStockProducts.length : null,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'khata', label: 'Udhaar Khata', icon: BookOpen, badge: null },
    { id: 'reports', label: 'Daily Reports & Roznamcha', icon: BarChart3, badge: null },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 select-none">
      {/* Top Bar: Brand, Live Clock, Database Badge, and Settings */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/30">
            <Store className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="font-['Outfit'] font-black text-xl tracking-tight text-white flex items-center gap-2">
              <span>{settings.storeName || 'Alhamd Super Store'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                POS &amp; Khata
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {settings.tagline || 'Karyana & General Store'} • {settings.address}
            </p>
          </div>
        </div>

        {/* Live Date, Time & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Central Database Live Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-inner ${
              dbConnected
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
            title={
              dbConnected
                ? 'Central MySQL Database Connected & Real-time Sync Active'
                : 'Connecting to Central Database (Using Local Cache)...'
            }
          >
            <div
              className={`w-2 h-2 rounded-full ${
                dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {dbConnected ? 'Central DB Live' : 'Local Sync Active'}
            </span>
          </div>

          {/* Live Date & Time Widget */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-inner">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {currentTime.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span className="text-slate-600 font-mono">|</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          {/* Store Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Dukan Ki Settings & Thermal Printer Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Business Snapshot Bar (Aaj Ki Sale, Cash, Udhar, Low Stock) */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-3 sm:px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none whitespace-nowrap">
          {/* Stats in Single Row */}
          <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium">
            {/* Today Sale */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Aaj Ki Sale:</span>
              <span className="font-['Outfit'] font-black text-emerald-400 text-base sm:text-lg">
                Rs. {todaySale.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({todayInvoicesCount} Bills)
              </span>
            </div>

            {/* Today Cash */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Cash Jama:</span>
              <span className="font-['Outfit'] font-black text-cyan-400 text-base sm:text-lg">
                Rs. {todayCash.toLocaleString()}
              </span>
            </div>

            {/* Today Udhar */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Aaj Ka Udhaar:</span>
              <span className="font-['Outfit'] font-black text-amber-400 text-base sm:text-lg">
                Rs. {todayUdhar.toLocaleString()}
              </span>
            </div>

            {/* Total Market Udhar */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              <span className="text-slate-400 text-xs font-semibold">Kul Market Baqaya:</span>
              <span className="font-['Outfit'] font-black text-rose-400 text-base sm:text-lg">
                Rs. {totalMarketUdhar.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Low Stock Warning Pill on Right */}
          {lowStockProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('alerts')}
              className="bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{lowStockProducts.length} Items Khatam Hone Wale Hain!</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-900 px-3 sm:px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      tab.badgeColor || 'bg-slate-700 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
