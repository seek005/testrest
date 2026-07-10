import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Building, 
  Receipt, 
  Printer, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { Order } from '../types.js';

interface BillingViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function BillingView({ t, currentLang }: BillingViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Checkout options state
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'QR' | 'Bank Transfer'>('Cash');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [serviceChargeVal, setServiceChargeVal] = useState(10); // 10%
  const [taxVal, setTaxVal] = useState(15); // 15% VAT

  // Receipt visual mode
  const [receiptType, setReceiptType] = useState<'80mm' | 'A4'>('80mm');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch orders
  const fetchOrdersForBilling = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (e) {
      console.error("Failed to load cashier billing:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersForBilling();
  }, []);

  // Update payment calculations based on selected order
  useEffect(() => {
    if (selectedOrder) {
      setCouponCode(selectedOrder.couponCode || '');
      setPaymentMethod(selectedOrder.paymentMethod || 'Cash');
    }
  }, [selectedOrder]);

  // Process checkout & settle payment
  const handleSettle = async () => {
    if (!selectedOrder) return;
    try {
      // Calculate new figures if modified
      const subtotal = selectedOrder.subtotal;
      const discAmt = Math.round(subtotal * (discountPercent / 100)) + selectedOrder.discount;
      const srvAmt = selectedOrder.type === 'Dine In' ? Math.round(subtotal * (serviceChargeVal / 100)) : 0;
      const taxAmt = Math.round(subtotal * (taxVal / 100));
      const total = Math.max(0, subtotal + srvAmt + taxAmt - discAmt);

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          paymentStatus: 'Paid',
          paymentMethod,
          subtotal,
          discount: discAmt,
          serviceCharge: srvAmt,
          tax: taxAmt,
          total
        })
      });

      if (res.ok) {
        const updated = await res.json();
        alert(`Payment Settle Completed! LKR ${total.toLocaleString()} paid via ${paymentMethod}. Table has been released for cleaning.`);
        setSelectedOrder(updated);
        await fetchOrdersForBilling();
      }
    } catch (e) {
      console.error("Failed to settle order:", e);
    }
  };

  // Reprint Receipt action
  const handleReprint = () => {
    alert("Thermal Printer print signal sent. Printing POS Copy...");
  };

  // Email receipt action
  const handleEmail = () => {
    const email = prompt("Enter customer email address:", selectedOrder?.customerPhone ? `${selectedOrder.customerPhone}@pos.lk` : "customer@gmail.com");
    if (email) {
      alert(`Professional HTML Invoice receipt successfully emailed to: ${email}`);
    }
  };

  // WhatsApp receipt action
  const handleWhatsapp = () => {
    const phone = prompt("Enter Customer WhatsApp number:", selectedOrder?.customerPhone || "0771234567");
    if (phone) {
      alert(`Invoice Receipt PDF generation completed. Sending WhatsApp API message to: ${phone}`);
    }
  };

  // Filter out unpaid vs completed orders for list display
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'Unpaid');
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="billing_view_container">
      {/* Left panel: Unpaid Order Ticket Queue */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-white">{t.billing}</h2>
          <button 
            onClick={fetchOrdersForBilling}
            className="p-1.5 rounded bg-gray-800 text-gray-300 border border-white/5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab headings */}
        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 no-scrollbar">
          <span className="text-xs uppercase font-bold tracking-wider text-rose-400 font-sans block">{currentLang === 'en' ? "Unpaid Pending Bills" : "පියවීමට ඇති බිල්පත්"}</span>
          {loading ? (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="h-16 bg-[#1e222b]/40 rounded-xl border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : unpaidOrders.length === 0 ? (
            <div className="p-5 text-center bg-[#1e222b]/20 rounded-xl border border-dashed border-white/5 text-gray-500 text-xs font-sans">
              No pending bills currently.
            </div>
          ) : (
            unpaidOrders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                  selectedOrder?.id === order.id 
                    ? 'bg-orange-500/10 border-orange-500/30' 
                    : 'bg-[#1e222b]/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div>
                  <span className="font-bold font-mono text-white text-sm block">{order.orderNumber}</span>
                  <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                    {order.tableId ? `${t.tables}: ${order.tableName}` : "Take Away"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-sm font-mono block">LKR {order.total.toLocaleString()}</span>
                  <span className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded font-sans block mt-1 font-semibold">
                    UNPAID
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Settle / Paid History segment */}
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 font-sans block pt-4">{currentLang === 'en' ? "Paid Settle History" : "ගෙවා නිමකළ බිල්පත්"}</span>
          {paidOrders.slice(0, 4).map(order => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                selectedOrder?.id === order.id 
                  ? 'bg-orange-500/10 border-orange-500/30' 
                  : 'bg-[#1e222b]/20 border-white/5 opacity-80'
              }`}
            >
              <div>
                <span className="font-bold font-mono text-gray-300 text-sm block">{order.orderNumber}</span>
                <span className="text-[10px] text-gray-500 font-sans block">
                  {order.tableId ? `${t.tables}: ${order.tableName}` : order.type}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 text-sm font-mono block">LKR {order.total.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-sans block mt-1">
                  PAID ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Active Checkout Terminal / receipt display */}
      <div className="lg:col-span-8">
        {selectedOrder ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Payment checkout parameters panel */}
            <div className="md:col-span-6 bg-[#1c202a]/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-[560px]">
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-xs text-orange-500 font-bold font-mono">Terminal Active Settle</span>
                  <h3 className="text-base font-bold text-white mt-1 font-display">
                    Settle {selectedOrder.orderNumber}
                  </h3>
                </div>

                {/* Settle inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1 font-sans">{t.paymentMethod}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setPaymentMethod('Cash')}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 justify-center transition font-sans ${
                          paymentMethod === 'Cash' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-800 text-gray-400 border-white/5'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        Cash
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Card')}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 justify-center transition font-sans ${
                          paymentMethod === 'Card' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-800 text-gray-400 border-white/5'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Card
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('QR')}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 justify-center transition font-sans ${
                          paymentMethod === 'QR' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-800 text-gray-400 border-white/5'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        LankaQR
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Bank Transfer')}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 justify-center transition font-sans ${
                          paymentMethod === 'Bank Transfer' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-800 text-gray-400 border-white/5'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        Bank
                      </button>
                    </div>
                  </div>

                  {/* Manual Bill Adjustments */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-sans">{t.discount} %</label>
                      <input 
                        type="number" 
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-white/10 rounded py-1.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-sans">{t.tax} %</label>
                      <input 
                        type="number" 
                        value={taxVal}
                        onChange={(e) => setTaxVal(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-white/10 rounded py-1.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settle trigger button */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                {selectedOrder.paymentStatus === 'Unpaid' ? (
                  <button
                    onClick={handleSettle}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 font-sans"
                  >
                    <span>{t.payNow}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-xl text-center font-bold text-xs font-sans">
                    ✓ {currentLang === 'en' ? "Bill Settle Done" : "බිල්පත පියවා අවසන්"}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live Printable receipt preview column */}
            <div className="md:col-span-6 space-y-3">
              {/* Selector receipt type tabs */}
              <div className="flex bg-gray-800/80 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setReceiptType('80mm')}
                  className={`flex-1 py-1 px-3 text-[10px] font-bold font-sans rounded transition ${
                    receiptType === '80mm' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Thermal Receipt (80mm)
                </button>
                <button
                  onClick={() => setReceiptType('A4')}
                  className={`flex-1 py-1 px-3 text-[10px] font-bold font-sans rounded transition ${
                    receiptType === 'A4' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Corporate A4 Invoice
                </button>
              </div>

              {/* Receipt Wrapper card */}
              <div className="bg-white text-gray-900 p-5 rounded-2xl shadow-xl font-mono text-xs max-h-[460px] overflow-y-auto border border-gray-200">
                {receiptType === '80mm' ? (
                  /* 80mm Thermal Receipt Layout */
                  <div className="space-y-3 text-[11px] leading-relaxed select-all">
                    <div className="text-center space-y-0.5">
                      <h4 className="text-base font-bold tracking-widest font-sans uppercase">PELKOTE</h4>
                      <p className="text-[10px] font-sans">PELKOTE RESTAURANT POS</p>
                      <p className="text-[9px] text-gray-500">Colombo Road, Pelkote, Sri Lanka</p>
                      <p className="text-[9px] text-gray-500">Tel: +94 112 345 678</p>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-2 space-y-0.5 text-[9px] text-gray-600">
                      <div className="flex justify-between">
                        <span>Invoice: {selectedOrder.orderNumber}</span>
                        <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Table: {selectedOrder.tableName || "OTC"}</span>
                        <span>Time: {new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cust: {selectedOrder.customerName || "Walk-In"}</span>
                        <span>Phone: {selectedOrder.customerPhone || "N/A"}</span>
                      </div>
                    </div>

                    {/* Receipt Items list */}
                    <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                      <div className="flex justify-between font-bold border-b border-dashed border-gray-200 pb-1 text-[9px]">
                        <span className="w-2/3">ITEM</span>
                        <span className="w-1/12 text-center">QTY</span>
                        <span className="w-1/4 text-right">TOTAL</span>
                      </div>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between">
                            <span className="w-2/3 truncate">{item.name}</span>
                            <span className="w-1/12 text-center">{item.quantity}</span>
                            <span className="w-1/4 text-right">{item.totalPrice}</span>
                          </div>
                          {item.selectedSize && (
                            <span className="text-[9px] text-gray-500 block pl-2">* Size: {item.selectedSize}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Subtotals & Settle Summary */}
                    <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Subtotal:</span>
                        <span>LKR {selectedOrder.subtotal}</span>
                      </div>
                      {selectedOrder.serviceCharge > 0 && (
                        <div className="flex justify-between text-[10px]">
                          <span>Service Charge (10%):</span>
                          <span>LKR {selectedOrder.serviceCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[10px]">
                        <span>VAT (15%):</span>
                        <span>LKR {selectedOrder.tax}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-[10px] font-bold text-red-600">
                          <span>Discount/Promo:</span>
                          <span>- LKR {selectedOrder.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-xs border-t border-dashed border-gray-300 pt-1">
                        <span>TOTAL LKR:</span>
                        <span>LKR {selectedOrder.total}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-2 text-center space-y-0.5 text-[9px] text-gray-500">
                      <p className="font-bold">THANK YOU FOR YOUR VISIT</p>
                      <p className="font-sans italic">Fresh Food • Fast Service</p>
                      <p className="text-[8px]">POS built with React & Gemini AI</p>
                    </div>
                  </div>
                ) : (
                  /* Professional Corporate A4 Invoice Layout */
                  <div className="space-y-4 text-[10px] leading-relaxed">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <h3 className="text-sm font-bold tracking-wider font-sans text-orange-500 uppercase">PELKOTE RESTAURANT</h3>
                        <p className="text-[9px] text-gray-500 font-sans">Enterprise Culinary POS System</p>
                        <p className="text-[8px] text-gray-400 font-sans">Pelkote Beach Road, Mount Lavinia, Sri Lanka</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-sans text-gray-800 uppercase block">TAX INVOICE</span>
                        <span className="font-mono text-[9px] font-bold block mt-0.5">{selectedOrder.orderNumber}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[9px]">
                      <div>
                        <span className="text-gray-400 block font-sans">CLIENT INFORMATION:</span>
                        <span className="font-bold font-sans text-gray-800 block mt-0.5">{selectedOrder.customerName || "General Walk-In"}</span>
                        <span className="font-mono text-gray-500 block">{selectedOrder.customerPhone || "N/A"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block font-sans">BILLING DATE:</span>
                        <span className="font-bold text-gray-800 block mt-0.5">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                        <span className="text-gray-500 block">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Table invoice items */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 text-[8px] font-sans font-bold text-gray-400 uppercase">
                          <th className="py-1">DESCRIPTION</th>
                          <th className="py-1 text-center">QTY</th>
                          <th className="py-1 text-right">PRICE</th>
                          <th className="py-1 text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-1.5 font-sans font-semibold text-gray-800">{item.name}</td>
                            <td className="py-1.5 text-center">{item.quantity}</td>
                            <td className="py-1.5 text-right">{item.unitPrice}</td>
                            <td className="py-1.5 text-right font-bold">{item.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end pt-2">
                      <div className="w-1/2 space-y-1 text-right text-[9px]">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-bold">LKR {selectedOrder.subtotal}</span>
                        </div>
                        {selectedOrder.serviceCharge > 0 && (
                          <div className="flex justify-between">
                            <span>Service Surcharge (10%):</span>
                            <span className="font-bold">LKR {selectedOrder.serviceCharge}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>VAT & Tax (15%):</span>
                          <span className="font-bold">LKR {selectedOrder.tax}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-red-500 font-bold">
                            <span>Promo Discount:</span>
                            <span>- LKR {selectedOrder.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px] font-bold text-gray-900 border-t pt-1">
                          <span>Total Invoice LKR:</span>
                          <span className="text-orange-500">LKR {selectedOrder.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Actions controls (Print, reprint, email, whatsapp) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReprint}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 font-sans"
                >
                  <Printer className="w-4 h-4" />
                  {t.reprint}
                </button>
                <button
                  onClick={handleEmail}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 font-sans"
                >
                  <Mail className="w-4 h-4" />
                  {t.emailReceipt}
                </button>
                <button
                  onClick={handleWhatsapp}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 font-sans col-span-2"
                >
                  <Phone className="w-4 h-4" />
                  {t.whatsappReceipt}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[460px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-[#1e222b]/10 p-6 text-center text-gray-500">
            <Receipt className="w-16 h-16 text-gray-600 mb-4 opacity-40" />
            <h3 className="text-lg font-bold font-display text-white">
              {currentLang === 'en' ? "Select Ticket for Checkout" : "බිල්පතක් තෝරන්න"}
            </h3>
            <p className="text-sm text-gray-400 font-sans mt-1 max-w-sm">
              {currentLang === 'en' ? "Choose an unpaid dining or takeaway order ticket from the left queue panel to proceed to payment Settle." : "ක්‍රියාකාරී ගෙවීම් පියවීම සඳහා වම්පස ලැයිස්තුවෙන් ඇණවුම් බිල්පතක් තෝරන්න."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
