import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Check, 
  ChefHat, 
  RotateCw, 
  Volume2,
  FileText
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { Order } from '../types.js';

interface KitchenViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function KitchenView({ t, currentLang }: KitchenViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch pending/preparing/ready orders
  const fetchKitchenOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      // Filter out completed and cancelled orders
      const kitchenList = (data || []).filter((o: Order) => 
        ['Pending', 'Accepted', 'Preparing', 'Ready'].includes(o.status)
      );
      setOrders(kitchenList);
    } catch (e) {
      console.error("Failed to fetch kitchen tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    // Auto refresh kitchen every 10 seconds
    const interval = setInterval(fetchKitchenOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update order status from KDS
  const updateStatus = async (orderId: string, nextStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        // play simulated beep
        if (soundEnabled) {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high pitched beep
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        }
        await fetchKitchenOrders();
      }
    } catch (e) {
      console.error("Failed to update KDS order state:", e);
    }
  };

  // Check how long ago order was created
  const getElapsedTime = (isoString: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (minutes < 0) return "Just now";
    return `${minutes} mins`;
  };

  // Get ticket color based on wait duration
  const getTicketHeaderColor = (isoString: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (minutes > 20) return "bg-rose-500/25 border-rose-500/40 text-rose-300 animate-pulse"; // Priority Red alert
    if (minutes > 10) return "bg-amber-500/25 border-amber-500/40 text-amber-300"; // Warn Yellow alert
    return "bg-[#1e222b] border-white/10 text-gray-200"; // default slate
  };

  return (
    <div className="space-y-6" id="kds_view">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            {t.kitchen}
          </h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Real-time kitchen order display with timer metrics and preparation statuses." : "මුළුතැන්ගෙයි ඇණවුම් ලැයිස්තුව, පොරොත්තු කාලය සහ ක්‍රියාකාරී ඇණවුම් තත්ත්වයන්."}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-lg border text-xs font-semibold font-sans transition-all duration-200 flex items-center gap-1.5 ${
              soundEnabled ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-800 text-gray-400 border-white/5'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{currentLang === 'en' ? `Beep Sound: ${soundEnabled ? 'ON' : 'OFF'}` : `ශබ්දය: ${soundEnabled ? 'ක්‍රියාත්මකයි' : 'අක්‍රියයි'}`}</span>
          </button>

          {/* Refresh Button */}
          <button 
            onClick={fetchKitchenOrders}
            className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/5 transition"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Kitchen Tickets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-[#1e222b]/40 rounded-xl border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl max-w-lg mx-auto">
          <Check className="w-16 h-16 mx-auto text-emerald-500 mb-4 opacity-80" />
          <h3 className="text-lg font-bold font-display text-white">
            {currentLang === 'en' ? "All caught up! No active cooking orders." : "සියලුම ඇණවුම් සූදානම් කර අවසන්!"}
          </h3>
          <p className="text-sm text-gray-400 font-sans mt-1">
            {currentLang === 'en' ? "New orders submitted by cashiers/waiters will pop up here instantly." : "මුදල් අයකැමි හෝ වේටර්වරුන් ඇතුළත් කරන නව ඇණවුම් මෙහි සජීවීව දිස්වනු ඇත."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map(order => (
            <div 
              key={order.id} 
              className={`rounded-2xl border bg-[#1c202a]/80 shadow-lg flex flex-col justify-between overflow-hidden transition duration-300 hover:shadow-2xl hover:border-white/10`}
            >
              {/* Ticket header */}
              <div className={`p-4 border-b flex justify-between items-center ${getTicketHeaderColor(order.createdAt)}`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm font-mono text-white">{order.orderNumber}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 uppercase font-sans">
                      {order.type === 'Dine In' ? t.dineIn : order.type === 'Take Away' ? t.takeAway : t.delivery}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 block mt-1 font-sans font-medium">
                    {order.tableId ? `${t.tables}: ${order.tableName}` : "Over-The-Counter"}
                  </span>
                </div>
                
                {/* Timer metrics */}
                <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{getElapsedTime(order.createdAt)}</span>
                </div>
              </div>

              {/* Ticket items list */}
              <div className="p-4 flex-1 space-y-3 min-h-[160px]">
                {order.items.map((item, idx) => (
                  <div key={item.id} className="flex justify-between items-start text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-400 font-mono text-base">{item.quantity}x</span>
                        <span className="font-semibold text-white font-display">
                          {currentLang === 'en' ? item.name : item.nameSinhala}
                        </span>
                      </div>
                      
                      {/* Sub-modifiers custom sizes */}
                      {item.selectedSize && (
                        <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.2 rounded font-sans inline-block mt-1">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      
                      {item.selectedModifiers && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedModifiers.map(m => (
                            <span key={m.id} className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.2 rounded font-sans">
                              + {m.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Item-specific cooking notes */}
                      {item.notes && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-300 mt-1.5 font-sans">
                          <FileText className="w-3 h-3" />
                          <span>Note: {item.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Main order cooking notes */}
                {order.cookingNotes && (
                  <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/10 text-xs text-orange-300 mt-3 font-sans">
                    <strong>{t.cookingNotes}:</strong> {order.cookingNotes}
                  </div>
                )}
              </div>

              {/* Action ticket status progression */}
              <div className="p-4 bg-[#141820]/40 border-t border-white/5 flex gap-2">
                {order.status === 'Pending' && (
                  <button
                    onClick={() => updateStatus(order.id, 'Preparing')}
                    className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 font-sans"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {currentLang === 'en' ? "Accept & Start Cook" : "පිළිගෙන පිසීම අරඹන්න"}
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    onClick={() => updateStatus(order.id, 'Ready')}
                    className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 font-sans"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {currentLang === 'en' ? "Mark as Ready" : "ඇණවුම සූදානම් කරන්න"}
                  </button>
                )}

                {order.status === 'Ready' && (
                  <button
                    onClick={() => updateStatus(order.id, 'Served')}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 font-sans"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {currentLang === 'en' ? "Mark as Served" : "පිළිගන්වන ලදී"}
                  </button>
                )}

                {order.status === 'Served' && (
                  <div className="w-full text-center py-2 bg-emerald-500/10 rounded-lg text-emerald-400 font-bold text-xs border border-emerald-500/20 font-sans">
                    ✓ {currentLang === 'en' ? "Served to Table" : "පිළිගන්වා ඇත"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
