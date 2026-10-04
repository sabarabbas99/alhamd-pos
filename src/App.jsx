import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import POS from './components/POS';
import StockManager from './components/StockManager';
import LowStockAlerts from './components/LowStockAlerts';
import KhataBook from './components/KhataBook';
import Reports from './components/Reports';
import ThermalReceipt from './components/ThermalReceipt';
import { printThermalReceiptDirect } from './utils/thermalPrinter';
import SettingsModal from './components/SettingsModal';

function MainApp() {
  const { settings, customers } = useStore();
  const [activeTab, setActiveTab] = useState('pos');
  const [showSettings, setShowSettings] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  const handlePrintReceipt = (invoice) => {
    if (!invoice || typeof invoice !== 'object') {
      console.warn('handlePrintReceipt received invalid invoice:', invoice);
      return;
    }
    const customer = invoice.customerId
      ? customers.find((c) => c.id === invoice.customerId)
      : null;
    printThermalReceiptDirect(invoice, settings, customer);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 1. Top Header & Stats */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 2. Main Content Tab Router */}
      <main className="flex-1 pb-10">
        {activeTab === 'pos' && (
          <POS onPrintReceipt={handlePrintReceipt} />
        )}
        {activeTab === 'stock' && (
          <StockManager />
        )}
        {activeTab === 'alerts' && (
          <LowStockAlerts
            onRestockClick={(product) => {
              setActiveTab('stock');
            }}
          />
        )}
        {activeTab === 'khata' && (
          <KhataBook />
        )}
        {activeTab === 'reports' && (
          <Reports onReprintInvoice={handlePrintReceipt} />
        )}
      </main>

      {/* 3. Dedicated Off-screen Thermal Receipt (Activated only during window.print()) */}
      {receiptToPrint && (
        <ThermalReceipt invoice={receiptToPrint} />
      )}

      {/* 4. Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}