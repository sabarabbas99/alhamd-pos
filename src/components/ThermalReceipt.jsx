import React from 'react';
import { useStore } from '../context/StoreContext';

export default function ThermalReceipt({ invoice }) {
  const { settings, customers } = useStore();
  if (!invoice) return null;

  // Find customer if Khata
  const customer = invoice.customerId
    ? customers.find((c) => c.id === invoice.customerId)
    : null;

  const is58mm = (settings.printerWidth || '58mm') === '58mm';
  const widthClass = is58mm ? 'w-[48mm] max-w-[48mm] text-[10px]' : 'w-[72mm] max-w-[72mm] text-xs';

  return (
    <div
      id="thermal-receipt"
      className={`mx-auto p-1 bg-white text-black font-mono leading-tight ${widthClass}`}
    >
      {/* Store Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h2 className="text-sm font-black uppercase tracking-wider">
          {settings.storeName || 'ALHAMD SUPER STORE'}
        </h2>
        <p className="text-[10px] mt-0.5">{settings.tagline || 'Karyana & General Store'}</p>
        <p className="text-[10px]">{settings.address}</p>
        <p className="text-[10px] font-bold">Helpline: {settings.phone}</p>
      </div>

      {/* Bill Meta */}
      <div className="py-1.5 border-b border-dashed border-black text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>Bill #: <strong>{invoice.id}</strong></span>
          <span>Mode: <strong>{(invoice.paymentMode || 'cash').toUpperCase()}</strong></span>
        </div>
        <div className="flex justify-between">
          <span>Tareekh: <strong>{invoice.date}</strong></span>
        </div>
        {invoice.customerName && invoice.customerName !== 'Walk-in Customer' && (
          <div className="flex justify-between font-bold">
            <span>Customer:</span>
            <span>{invoice.customerName}</span>
          </div>
        )}
      </div>

      {/* Items Table Header */}
      <div className="py-1 border-b border-dashed border-black text-[10px] font-bold flex justify-between">
        <span className="w-1/2 text-left">Item</span>
        <span className="w-1/4 text-center">Qty</span>
        <span className="w-1/4 text-right">Total</span>
      </div>

      {/* Items List */}
      <div className="py-1 space-y-1 text-[10px] border-b border-dashed border-black">
        {(invoice.items || []).map((item, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <span className="w-1/2 text-left truncate">
              {item.name}
              {item.weightLabel ? ` (${item.weightLabel})` : ''}
            </span>
            <span className="w-1/4 text-center whitespace-nowrap">
              {item.weightLabel || item.qty} x {item.price}
            </span>
            <span className="w-1/4 text-right font-bold">Rs.{item.total}</span>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="py-1.5 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rs. {invoice.subtotal}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-red-600 font-bold">
            <span>Discount:</span>
            <span>- Rs. {invoice.discount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-1 border-t border-dotted border-black">
          <span>TOTAL:</span>
          <span>Rs. {invoice.grandTotal}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Paid (Wasool):</span>
          <span>Rs. {invoice.paidAmount}</span>
        </div>

        {invoice.udharAmount > 0 && (
          <div className="flex justify-between text-[11px] font-bold border-t border-dotted border-black pt-1">
            <span>AJ KA UDHAR:</span>
            <span>Rs. {invoice.udharAmount}</span>
          </div>
        )}

        {customer && customer.balance > 0 && (
          <div className="flex justify-between text-[11px] font-black bg-gray-100 p-0.5 mt-0.5">
            <span>KUL SABQA BAQAYA:</span>
            <span>Rs. {customer.balance}</span>
          </div>
        )}
      </div>

      {/* Footer Return Policy & Branding */}
      <div className="text-center pt-2 text-[9px] leading-tight space-y-1">
        <p>{settings.receiptNote || 'Tashreef aawri ka shukriya! Sauda wapsi 3 din me ba-shart-e-parchi.'}</p>
        <p className="font-black text-[10px] tracking-wider uppercase pt-1">
          *** System By THF NEXUS ***
        </p>
      </div>

      {/* Clean Blade Clearance: Feeds System By THF NEXUS comfortably past the blade, zero dots */}
      <div style={{ marginTop: '16mm', textAlign: 'center', color: '#000000' }}>
        <div style={{ borderTop: '1px dashed #000000', fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px', paddingTop: '1px' }}>
          - - - - - - - - - - - - - - - -
        </div>
      </div>
    </div>
  );
}
