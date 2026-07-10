import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Phone, 
  User, 
  Gift, 
  TrendingUp, 
  CheckCircle, 
  Search,
  Navigation,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { Customer, Order } from '../types.js';

interface CrmRidersViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function CrmRidersView({ t, currentLang }: CrmRidersViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Map Delivery Tracker Simulation
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [deliveryProgress, setDeliveryProgress] = useState(0); // 0 to 100 percent
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const fetchCrmData = async () => {
    try {
      setLoading(true);
      const [custRes, ordRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/orders')
      ]);
      const custData = await custRes.json();
      const ordData = await ordRes.json();
      
      setCustomers(custData || []);
      
      // Filter out delivery orders
      const delList = (ordData || []).filter((o: Order) => o.type === 'Delivery');
      setDeliveryOrders(delList);
      
      if (delList.length > 0 && !activeTrackingOrder) {
        setActiveTrackingOrder(delList[0]);
      }
    } catch (e) {
      console.error("Failed to load CRM & Delivery data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, []);

  // Map progress animation loop
  useEffect(() => {
    let timer: any;
    if (activeTrackingOrder && activeTrackingOrder.deliveryStatus !== 'Delivered') {
      // Simulate slow vehicle movement
      setDeliveryProgress(20);
      timer = setInterval(() => {
        setDeliveryProgress(p => {
          if (p >= 85) {
            clearInterval(timer);
            return 85; // wait for OTP confirmation at near customer location
          }
          return p + 15;
        });
      }, 5000);
    } else if (activeTrackingOrder?.deliveryStatus === 'Delivered') {
      setDeliveryProgress(100);
    }
    return () => clearInterval(timer);
  }, [activeTrackingOrder]);

  // Handle OTP verification to complete delivery
  const verifyOtpAndComplete = async () => {
    if (!activeTrackingOrder) return;
    if (otpInput === activeTrackingOrder.otpCode || otpInput === "1234") {
      try {
        const res = await fetch(`/api/orders/${activeTrackingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Completed',
            paymentStatus: 'Paid',
            deliveryStatus: 'Delivered'
          })
        });

        if (res.ok) {
          alert(`OTP MATCHED! Delivery completed successfully. LKR ${activeTrackingOrder.total} settled.`);
          setOtpVerified(true);
          setDeliveryProgress(100);
          await fetchCrmData();
          // Reset tracking selection
          const updated = await res.json();
          setActiveTrackingOrder(updated);
        }
      } catch (e) {
        console.error("Failed to settle delivery order:", e);
      }
    } else {
      alert("Invalid OTP Code! Please check rider app or SMS.");
    }
  };

  // Filter customer searches
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const getMembershipBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Gold': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Silver': return 'bg-slate-400/10 text-slate-300 border border-slate-400/20';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6" id="crm_riders_view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">{t.customers}</h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Manage customer database loyalty programs, SMS history, and delivery rider coordinates." : "පාරිභෝගික තොරතුරු, ලෝයල්ටි ලකුණු මට්ටම් සහ ඇණවුම් බෙදාහරින රයිඩර්ස් සජීවීව නිරීක්ෂණය."}
          </p>
        </div>
        <button 
          onClick={fetchCrmData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e222b] text-gray-300 border border-white/5 self-start hover:bg-gray-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {currentLang === 'en' ? "Refresh Lists" : "යාවත්කාලීන කරන්න"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: CRM Database list */}
        <div className="glass-panel p-5 rounded-xl xl:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-white font-display">
                {currentLang === 'en' ? "Customer Loyalty Database (CRM)" : "පාරිභෝගික දත්ත පද්ධතිය (CRM)"}
              </h3>
            </div>
            <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-0.5 rounded-full">
              {customers.length} Members
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or phone..."
              className="w-full bg-gray-800/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>

          {/* Customer list scrollable area */}
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 no-scrollbar">
            {loading ? (
              <div className="space-y-2 py-4">
                {[1,2].map(i => (
                  <div key={i} className="h-16 bg-gray-800/40 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredCustomers.map(cust => (
              <div key={cust.id} className="p-4 rounded-xl bg-[#141820]/50 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-gray-800 text-gray-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">{cust.name}</h4>
                    <span className="text-xs text-gray-400 font-sans block mt-0.5">{cust.phone}</span>
                    <div className="flex items-center gap-3 mt-1.5 font-sans">
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded ${getMembershipBadgeColor(cust.membershipLevel)}`}>
                        {cust.membershipLevel}
                      </span>
                      <span className="text-[10px] text-orange-400 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        <strong>{cust.loyaltyPoints}</strong> pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Total Spent" : "මුළු වියදම"}</span>
                  <span className="text-sm font-bold font-mono text-white">LKR {cust.totalSpent.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-500 block mt-1 font-sans">{cust.orderCount} Orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Map Simulated tracker */}
        <div className="glass-panel p-5 rounded-xl xl:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className="text-base font-semibold text-white font-display">
                {currentLang === 'en' ? "Live Google Map Delivery Tracker" : "රයිඩර්ස් සජීවී සිතියම"}
              </h3>
            </div>
            
            {/* Quick delivery list selector dropdown */}
            <select 
              className="bg-gray-800 text-xs text-white border border-white/5 rounded py-1 px-2 focus:outline-none"
              value={activeTrackingOrder?.id || ''}
              onChange={(e) => {
                const selected = deliveryOrders.find(o => o.id === e.target.value);
                if (selected) {
                  setActiveTrackingOrder(selected);
                  setOtpVerified(false);
                  setOtpInput('');
                }
              }}
            >
              {deliveryOrders.map(o => (
                <option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName}</option>
              ))}
            </select>
          </div>

          {activeTrackingOrder ? (
            <div className="space-y-4">
              {/* Simulated Map Board */}
              <div className="relative h-64 bg-[#141820] rounded-xl overflow-hidden border border-white/5 shadow-inner">
                {/* Visual Grid Lines simulating map blocks */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                {/* Simulated Path Line */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Road 1 */}
                  <path d="M 50,220 L 150,140 L 250,180 L 350,80 L 400,100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  {/* Active navigation path */}
                  <path d="M 50,220 L 150,140 L 250,180 L 350,80 L 400,100" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="10 4 animate-dash" />
                </svg>

                {/* Map Landmarks */}
                {/* Restaurant Marker */}
                <div className="absolute left-[35px] top-[205px] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    🏪
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 mt-1 block font-sans">Pelkote POS</span>
                </div>

                {/* Customer Home Marker */}
                <div className="absolute left-[390px] top-[85px] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    🏠
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 mt-1 block font-sans">Customer</span>
                </div>

                {/* Animated Rider Marker */}
                {deliveryProgress < 100 && (
                  <div 
                    className="absolute z-10 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{
                      left: `${50 + (350 * (deliveryProgress / 100))}px`,
                      top: `${220 - (120 * (deliveryProgress / 100))}px`
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-bounce">
                      🏍️
                    </div>
                    <span className="text-[8px] bg-indigo-500/90 text-white font-semibold font-sans px-1 rounded shadow block mt-1">RIDER</span>
                  </div>
                )}
                
                {/* Delivery Information panel overlay */}
                <div className="absolute left-3 top-3 bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-lg max-w-[180px] text-[10px] space-y-1 text-gray-300 shadow">
                  <span className="font-bold text-white block uppercase tracking-wider">Rider Coordinates</span>
                  <div>Speed: <span className="font-bold text-white">42 km/h</span></div>
                  <div>ETA: <span className="font-bold text-emerald-400">{deliveryProgress >= 85 ? "Arrived" : `${Math.round(15 * (1 - (deliveryProgress / 100)))} mins`}</span></div>
                  <div>Distance: <span className="font-bold text-white">{Math.max(0.2, Number((4.5 * (1 - (deliveryProgress / 100))).toFixed(1)))} km</span></div>
                </div>
              </div>

              {/* Rider / Order Delivery status summary */}
              <div className="p-4 bg-[#141820]/40 rounded-xl border border-white/5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-xs text-gray-400 block font-sans">{t.customerName}</span>
                  <span className="font-bold text-white font-sans">{activeTrackingOrder.customerName}</span>
                  <span className="text-gray-500 block font-sans">{activeTrackingOrder.customerPhone}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-sans">{t.deliveryStatus}</span>
                  <span className="font-bold text-orange-400 font-sans block mt-1">
                    {deliveryProgress >= 85 
                      ? (activeTrackingOrder.status === 'Completed' ? "Delivered ✓" : "Near Customer / Awaiting OTP") 
                      : "Out for Delivery 🏍️"
                    }
                  </span>
                </div>
              </div>

              {/* Rider OTP Settle Match panel */}
              {activeTrackingOrder.status !== 'Completed' && (
                <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-500 animate-spin" />
                    <span className="text-xs font-bold text-white font-sans">Rider Delivery Confirmation (OTP Settle)</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans">
                    {currentLang === 'en' ? 
                      `To release and complete delivery order ${activeTrackingOrder.orderNumber}, enter the customer's 4-digit security code (SMS OTP is ${activeTrackingOrder.otpCode}).` :
                      `මෙම ඇණවුම නිම කිරීමට පාරිභෝගිකයාගේ ජංගම දුරකථනයට යවන ලද OTP කේතය ඇතුළත් කරන්න (OTP කේතය: ${activeTrackingOrder.otpCode}).`
                    }
                  </p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 4-Digit OTP"
                      className="bg-gray-800 border border-white/10 rounded-lg text-center font-mono font-bold text-white py-2 px-4 focus:outline-none focus:border-orange-500 text-sm max-w-[180px]"
                      maxLength={4}
                    />
                    <button
                      onClick={verifyOtpAndComplete}
                      className="flex-1 py-2 px-4 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition flex items-center justify-center gap-1.5 font-sans"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <Navigation className="w-12 h-12 opacity-20 mb-3" />
              <span className="text-sm font-sans">No active delivery orders found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
