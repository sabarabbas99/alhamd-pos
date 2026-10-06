import React from 'react';
import { useStore } from '../context/StoreContext';

export default function ThermalReceipt({ invoice }) {
  const { settings, customers } = useStore();
  if (!invoice) return null;

  // Find customer if Khata
  const customer = invoice.customerId
    ? customers.find((c) => c.id === invoice.customerId)
    : null;

  const is80mm = (settings.printerWidth || '58mm') === '80mm';
  const widthClass = is80mm ? 'w-[72mm] max-w-[72mm] text-[10px]' : 'w-[48mm] max-w-[48mm] text-[8.5px]';

  // Parse Date and Time cleanly
  let datePart = invoice.date || '';
  let timePart = '';
  if (invoice.date && invoice.date.includes('-')) {
    const parts = invoice.date.split('-');
    datePart = parts[0].trim();
    timePart = parts.slice(1).join('-').trim();
  } else if (invoice.timestamp) {
    const d = new Date(invoice.timestamp);
    datePart = d.toLocaleDateString('en-GB');
    timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const itemsList = invoice.items || [];
  const itemsCount = itemsList.length;
  const totalQty = itemsList.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  const paidAmt = Number(invoice.paidAmount || invoice.grandTotal || 0);
  const grandTotalAmt = Number(invoice.grandTotal || 0);
  const changeAmt = paidAmt > grandTotalAmt && invoice.paymentMode === 'cash' ? paidAmt - grandTotalAmt : 0;

  const currentCustomerBalance = customer ? Number(customer.balance || 0) : 0;
  const previousBalance = Math.max(0, currentCustomerBalance - Number(invoice.udharAmount || 0));
  const isUdhar = invoice.paymentMode === 'udhar' || Number(invoice.udharAmount || 0) > 0;

  return (
    <div
      id="thermal-receipt"
      className={`mx-auto p-1 bg-white text-black font-sans leading-tight ${widthClass}`}
    >
      {/* 1. Store Header Box */}
      <div className="border-[1.5px] border-black rounded-xs p-1.5 mb-1.5 text-center bg-white">
        <h2 className="text-xs font-black uppercase tracking-wider leading-tight">
          {settings.storeName || 'ALHAMD SUPER STORE'}
        </h2>
        <p className="text-[8.5px] font-bold mt-0.5">{settings.tagline || 'Karyana & General Store'}</p>
        {settings.address && <p className="text-[8.5px]">{settings.address}</p>}
        <p className="text-[8.5px] font-bold mt-0.5">Helpline: {settings.phone || '0300-6764066'}</p>
        <div className="mt-1">
          <span className="inline-block bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-xs tracking-wider">
            ★ CASH MEMO / SALES RECEIPT ★
          </span>
        </div>
      </div>

      {/* 2. Invoice & Customer Meta Box */}
      <div className="border-[1.5px] border-black rounded-xs p-1.5 mb-1.5 text-[8.5px] space-y-0.5 bg-white">
        <div className="flex justify-between">
          <span>BILL NO: <strong>{invoice.id}</strong></span>
          <span>MODE: <strong>{(invoice.paymentMode || 'cash').toUpperCase()}</strong></span>
        </div>
        <div className="flex justify-between">
          <span>DATE: <strong>{datePart}</strong></span>
          <span>TIME: <strong>{timePart || '12:00 PM'}</strong></span>
        </div>
        {((invoice.customerName && invoice.customerName !== 'Walk-in Customer') || invoice.customerPhone) && (
          <div className="border-t border-dashed border-black pt-1 mt-1 flex justify-between">
            <span>CUSTOMER: <strong>{invoice.customerName || 'Khata Customer'}</strong></span>
            {invoice.customerPhone && <span>PH: <strong>{invoice.customerPhone}</strong></span>}
          </div>
        )}
      </div>

      {/* 3. Items Table Box with Clear Column Grid */}
      <table className="w-full border-collapse border-[1.5px] border-black mb-1.5 text-[8.5px]">
        <thead>
          <tr className="bg-black text-white text-[8px] font-black">
            <th className="w-[8%] py-0.5 text-center border-r border-white">#</th>
            <th className="w-[48%] py-0.5 text-left px-1 border-r border-white">ITEM DESCRIPTION</th>
            <th className="w-[14%] py-0.5 text-center border-r border-white">QTY</th>
            <th className="w-[14%] py-0.5 text-right px-0.5 border-r border-white">RATE</th>
            <th className="w-[16%] py-0.5 text-right px-1">TOTAL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {itemsList.map((item, idx) => (
            <tr key={idx} className="divide-x divide-black">
              <td className="text-center font-bold py-0.5">{idx + 1}</td>
              <td className="text-left font-bold px-1 py-0.5 truncate">{item.name}</td>
              <td className="text-center font-bold py-0.5 whitespace-nowrap">{item.weightLabel || item.qty}</td>
              <td className="text-right py-0.5 px-0.5 whitespace-nowrap">{item.price}</td>
              <td className="text-right font-bold py-0.5 px-1 whitespace-nowrap">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Items Summary */}
      <div className="flex justify-between text-[8px] font-bold px-0.5 mb-1.5">
        <span>Kul Items: <strong>{itemsCount}</strong></span>
        <span>Kul Taadad: <strong>{totalQty}</strong></span>
      </div>

      {/* 4. Calculations Box */}
      <div className="border-[1.5px] border-black rounded-xs p-1.5 mb-1.5 text-[9px] space-y-0.5 bg-white">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-bold">Rs. {Number(invoice.subtotal || invoice.grandTotal).toLocaleString()}</span>
        </div>
        {Number(invoice.discount || 0) > 0 && (
          <>
            <div className="flex justify-between font-bold">
              <span>Special Store Discount:</span>
              <span>- Rs. {Number(invoice.discount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[8px] font-bold border-b border-dotted border-black pb-0.5">
              <span>★ Aap Ki Bachat (You Saved):</span>
              <span>Rs. {Number(invoice.discount).toLocaleString()}</span>
            </div>
          </>
        )}

        {/* High Impact Grand Total Box */}
        <div className="border-2 border-black bg-black text-white p-1 my-1 flex justify-between items-center rounded-xs">
          <span className="text-[9px] font-black tracking-wider">KUL RAKAM / NET TOTAL:</span>
          <span className="text-xs font-black tracking-wider">Rs. {grandTotalAmt.toLocaleString()}</span>
        </div>

        <div className="flex justify-between pt-0.5">
          <span>Wasool Shuda Rakam:</span>
          <span className="font-bold">Rs. {paidAmt.toLocaleString()}</span>
        </div>
        {changeAmt > 0 && (
          <div className="flex justify-between font-bold border-t border-dotted border-black pt-0.5">
            <span>Baqaya Wapsi (Change):</span>
            <span>Rs. {changeAmt.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 5. Khata Customer Ledger Box (If Applicable) */}
      {isUdhar && (
        <div className="border-[1.5px] border-black rounded-xs p-1.5 mb-1.5 text-[9px] space-y-0.5 bg-white">
          <div className="text-[9px] font-black border-b border-black pb-0.5 mb-0.5">
            📒 KHATA RECORD (CUSTOMER LEDGER):
          </div>
          <div className="flex justify-between">
            <span>Grahak:</span>
            <span className="font-bold">{invoice.customerName || 'Khata Customer'}</span>
          </div>
          <div className="flex justify-between">
            <span>Aaj Ka Naya Udhar:</span>
            <span className="font-bold">Rs. {Number(invoice.udharAmount || 0).toLocaleString()}</span>
          </div>
          {currentCustomerBalance > 0 && (
            <>
              <div className="flex justify-between">
                <span>Purana Sabqa Baqaya:</span>
                <span>Rs. {previousBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-black pt-0.5 text-[9.5px]">
                <span>KUL WAJIB-UL-ADA (TOTAL DUE):</span>
                <span>Rs. {currentCustomerBalance.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. Return Policy & Note */}
      <div className="border-y border-dashed border-black py-1 mb-1.5 text-center text-[8px] leading-tight">
        <p className="font-bold">Tashreef aawri ka shukriya!</p>
        <p>{settings.receiptNote || 'Sauda tabdeel ya wapis 3 din me ba-shart-e-parchi.'}</p>
      </div>

      {/* 7. System Branding */}
      <div className="text-center text-[8px] leading-tight">
        <p className="font-black text-[9px] tracking-wider uppercase">
          *** System By THF NEXUS ***
        </p>
        <p className="text-[7.5px] text-gray-700">POS Software Solutions • Helpline: 0300-6764066</p>
      </div>

      {/* 8. Tear Clearance */}
      <div style={{ marginTop: '16mm', textAlign: 'center', color: '#000000' }}>
        <div style={{ borderTop: '1px dashed #000000', fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px', paddingTop: '1px' }}>
          - - - - - - - - - - - - - - - - - - - -
        </div>
      </div>
    </div>
  );
}
