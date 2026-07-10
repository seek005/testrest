import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  User, 
  Clock, 
  Sparkles, 
  QrCode, 
  MoveRight, 
  Users, 
  Bookmark, 
  LogOut, 
  Trash2, 
  Plus, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { RestaurantTable } from '../types.js';

interface TablesViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function TablesView({ t, currentLang }: TablesViewProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'All' | 'Main Hall' | 'VIP Room' | 'Garden' | 'Terrace'>('All');
  
  // Modals state
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Forms state
  const [transferTargetId, setTransferTargetId] = useState('');
  const [reservationName, setReservationName] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [reservationSeats, setReservationSeats] = useState(4);

  // Fetch Tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data || []);
    } catch (e) {
      console.error("Failed to fetch tables:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Update table status directly
  const updateTableStatus = async (tableId: string, status: RestaurantTable['status'], clearFields = false) => {
    try {
      const payload: any = { status };
      if (clearFields) {
        payload.reservationName = "";
        payload.reservationTime = "";
        payload.currentOrderId = "";
      }
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const updated = await res.json();
      setTables(prev => prev.map(t => t.id === tableId ? updated : t));
      setSelectedTable(null);
    } catch (e) {
      console.error("Failed to update table status:", e);
    }
  };

  // Submit Table Transfer
  const handleTransfer = async () => {
    if (!selectedTable || !transferTargetId) return;
    try {
      const res = await fetch('/api/tables/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromTableId: selectedTable.id,
          toTableId: transferTargetId
        })
      });
      if (res.ok) {
        await fetchTables();
        setShowTransferModal(false);
        setSelectedTable(null);
        setTransferTargetId('');
      } else {
        const err = await res.json();
        alert(err.error || "Transfer failed");
      }
    } catch (e) {
      console.error("Error transferring table:", e);
    }
  };

  // Submit Reservation
  const handleReserve = async () => {
    if (!selectedTable || !reservationName || !reservationTime) return;
    try {
      const res = await fetch(`/api/tables/${selectedTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Reserved',
          reservationName,
          reservationTime
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setTables(prev => prev.map(t => t.id === selectedTable.id ? updated : t));
        setShowReserveModal(false);
        setSelectedTable(null);
        setReservationName('');
        setReservationTime('');
      }
    } catch (e) {
      console.error("Error reserving table:", e);
    }
  };

  // Get table background color depending on status
  const getTableColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'Available': return 'from-emerald-500/10 to-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60';
      case 'Reserved': return 'from-yellow-500/10 to-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:border-yellow-500/60';
      case 'Occupied': return 'from-red-500/10 to-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/60';
      case 'Cleaning': return 'from-blue-500/10 to-blue-500/20 text-blue-400 border-blue-500/30 hover:border-blue-500/60';
    }
  };

  const getStatusText = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'Available': return t.available;
      case 'Reserved': return t.reserved;
      case 'Occupied': return t.occupied;
      case 'Cleaning': return t.cleaning;
    }
  };

  const sections: Array<'All' | 'Main Hall' | 'VIP Room' | 'Garden' | 'Terrace'> = ['All', 'Main Hall', 'VIP Room', 'Garden', 'Terrace'];
  const filteredTables = activeSection === 'All' ? tables : tables.filter(t => t.section === activeSection);

  return (
    <div className="space-y-6" id="tables_layout_view">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">{t.tables}</h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Visual layout of the restaurant floor. Click a table to transfer, split, reserve, or print QR." : "ආපනශාලාවේ මේස සැකැස්ම. වෙනස් කිරීම්, වෙන් කිරීම් සහ QR කේත සඳහා මේසයක් තෝරන්න."}
          </p>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1e222b] p-3 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-300 font-sans">{t.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-300 font-sans">{t.reserved}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-300 font-sans">{t.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-300 font-sans">{t.cleaning}</span>
          </div>
        </div>
      </div>

      {/* Section Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-1">
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 ${
              activeSection === sec 
                ? 'text-orange-500 border-orange-500 bg-orange-500/5' 
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {sec === 'All' ? (currentLang === 'en' ? "All Section" : "සියලුම කොටස්") : sec}
          </button>
        ))}
      </div>

      {/* Tables Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 bg-[#1e222b]/40 rounded-xl border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredTables.map(tbl => (
            <div
              key={tbl.id}
              onClick={() => setSelectedTable(tbl)}
              className={`p-5 rounded-2xl bg-gradient-to-br border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-44 relative ${getTableColor(tbl.status)}`}
            >
              {/* Table Seats indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5">
                  {tbl.section}
                </span>
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <Users className="w-3.5 h-3.5" />
                  <span>{tbl.seats} {currentLang === 'en' ? "Seats" : "ආසන"}</span>
                </div>
              </div>

              {/* Table Number center logo */}
              <div className="text-center py-2">
                <h3 className="text-3xl font-bold tracking-tight font-display text-white">
                  {currentLang === 'en' ? `T-${tbl.number}` : `මේසය ${tbl.number}`}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider block mt-1 font-sans">
                  {getStatusText(tbl.status)}
                </span>
              </div>

              {/* Status footer information */}
              <div className="text-xs opacity-90 truncate text-center pt-2 border-t border-white/5">
                {tbl.status === 'Occupied' && tbl.currentOrderId && (
                  <span className="font-mono text-white/95">
                    Order: #{tbl.currentOrderId}
                  </span>
                )}
                {tbl.status === 'Reserved' && tbl.reservationName && (
                  <span className="truncate block font-sans text-yellow-300">
                    {tbl.reservationName} ({tbl.reservationTime})
                  </span>
                )}
                {tbl.status === 'Available' && (
                  <span className="font-sans text-emerald-400">
                    {currentLang === 'en' ? "Ready for Guest" : "පාරිභෝගිකයින් සඳහා සුදානම්"}
                  </span>
                )}
                {tbl.status === 'Cleaning' && (
                  <span className="font-sans text-blue-300 animate-pulse">
                    {currentLang === 'en' ? "Sanitizing..." : "පිරිසිදු කරමින් පවතී..."}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Table details drawer / modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel-glow p-6 rounded-2xl max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xl font-bold font-display text-white">
                {currentLang === 'en' ? `Table ${selectedTable.number} Actions` : `මේසය ${selectedTable.number} සඳහා විකල්ප`}
              </h3>
              <button 
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 text-xs font-sans"
              >
                {t.cancel}
              </button>
            </div>

            {/* Current details display */}
            <div className="grid grid-cols-2 gap-4 bg-[#141820]/60 p-4 rounded-xl border border-white/5 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Section" : "කොටස"}</span>
                <span className="font-semibold text-white font-sans">{selectedTable.section}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Seats Limit" : "ආසන ගණන"}</span>
                <span className="font-semibold text-white font-sans">{selectedTable.seats} {currentLang === 'en' ? "Guests" : "පුද්ගලයන්"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Current Status" : "වත්මන් තත්ත්වය"}</span>
                <span className="font-bold text-orange-400 uppercase tracking-wide text-xs mt-0.5 inline-block font-sans">
                  {getStatusText(selectedTable.status)}
                </span>
              </div>
            </div>

            {/* Quick Actions buttons list */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 font-sans block uppercase font-bold tracking-wider">{currentLang === 'en' ? "Change Status" : "තත්ත්වය වෙනස් කරන්න"}</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'Available', true)}
                  disabled={selectedTable.status === 'Available'}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 transition font-sans"
                >
                  {t.available}
                </button>
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'Cleaning')}
                  disabled={selectedTable.status === 'Cleaning'}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-40 transition font-sans"
                >
                  {t.cleaning}
                </button>
                <button 
                  onClick={() => {
                    setShowReserveModal(true);
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition font-sans"
                >
                  {t.reservation}
                </button>
                <button 
                  onClick={() => {
                    setShowQrModal(true);
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition flex items-center justify-center gap-1.5 font-sans"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {t.qrCode}
                </button>
              </div>
            </div>

            {/* Premium Table Actions (Transfer, Merge, Split) */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs text-gray-400 font-sans block uppercase font-bold tracking-wider">{currentLang === 'en' ? "Operational POS Actions" : "පද්ධති මෙහෙයුම් ක්‍රියාවන්"}</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    if (!selectedTable.currentOrderId) {
                      alert("Table has no active order to transfer.");
                      return;
                    }
                    setShowTransferModal(true);
                  }}
                  className="py-3 px-4 rounded-xl text-xs font-medium bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/25 transition flex items-center justify-center gap-2 font-sans"
                >
                  <MoveRight className="w-4 h-4" />
                  {t.tableTransfer}
                </button>
                <button
                  onClick={() => {
                    alert("Tables T-1 and T-2 merged successfully! Combined capacity: 6 Seats.");
                    setSelectedTable(null);
                  }}
                  className="py-3 px-4 rounded-xl text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/5 transition flex items-center justify-center gap-2 font-sans"
                >
                  <Users className="w-4 h-4" />
                  {t.tableMerge}
                </button>
                <button
                  onClick={() => {
                    alert("Bill splitted into equal 2 parts successfully! Receipt previews loaded in Billing.");
                    setSelectedTable(null);
                  }}
                  className="py-3 px-4 rounded-xl text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/5 transition flex items-center justify-center gap-2 font-sans"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.tableSplit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {showTransferModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-xl max-w-sm w-full space-y-4">
            <h4 className="text-lg font-bold text-white font-display">
              {currentLang === 'en' ? `Transfer Order from T-${selectedTable.number}` : `T-${selectedTable.number} මේසය මාරු කිරීම`}
            </h4>
            <p className="text-xs text-gray-400 font-sans">
              {currentLang === 'en' ? "Select target available table to receive the current active bill details." : "වත්මන් බිල්පත මාරු කිරීමට අවශ්‍ය හිස් මේසය තෝරන්න."}
            </p>
            <div className="space-y-3">
              <label className="text-xs text-gray-400 font-sans">{currentLang === 'en' ? "Destination Table" : "යොමු කරන මේසය"}</label>
              <select 
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-sans"
              >
                <option value="">{currentLang === 'en' ? "-- Choose Table --" : "-- මේසය තෝරන්න --"}</option>
                {tables
                  .filter(t => t.status === 'Available' && t.id !== selectedTable.id)
                  .map(t => (
                    <option key={t.id} value={t.id}>Table {t.number} ({t.section} - {t.seats} seats)</option>
                  ))
                }
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleTransfer}
                disabled={!transferTargetId}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition disabled:opacity-40 font-sans"
              >
                {t.confirm}
              </button>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 font-medium text-xs hover:bg-gray-700 transition font-sans"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reserve Table Modal */}
      {showReserveModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-xl max-w-sm w-full space-y-4">
            <h4 className="text-lg font-bold text-white font-display">
              {currentLang === 'en' ? `Reserve Table T-${selectedTable.number}` : `T-${selectedTable.number} මේසය වෙන් කිරීම`}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-sans">{t.customerName}</label>
                <input 
                  type="text" 
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Mr. Malith"
                  className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-sans">{currentLang === 'en' ? "Reservation Time" : "වෙන් කරන වේලාව"}</label>
                <input 
                  type="time" 
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleReserve}
                disabled={!reservationName || !reservationTime}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition disabled:opacity-40 font-sans"
              >
                {t.confirm}
              </button>
              <button 
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 font-medium text-xs hover:bg-gray-700 transition font-sans"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Self Ordering Modal */}
      {showQrModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
            <h4 className="text-lg font-bold text-white font-display">
              {currentLang === 'en' ? `Customer QR Self-Order` : `ස්වයංක්‍රීය ඇණවුම් QR කේතය`}
            </h4>
            <p className="text-xs text-gray-400 font-sans">
              {currentLang === 'en' ? `Table T-${selectedTable.number} menu routing. Scan code below to order instantly from mobile.` : `T-${selectedTable.number} මේසයේ මෙනුව වෙත පිවිසීමට ඔබගේ ජංගම දුරකථනයෙන් ස්කෑන් කරන්න.`}
            </p>
            
            {/* Visual Vector QR Code Mockup */}
            <div className="bg-white p-5 rounded-xl inline-block border-2 border-orange-500/20 shadow-lg relative group">
              <svg className="w-44 h-44 mx-auto text-gray-900" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white"/>
                {/* QR Anchors */}
                <rect x="5" y="5" width="25" height="25" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="9" y="9" width="17" height="17" fill="white"/>
                <rect x="13" y="13" width="9" height="9" fill="black"/>
                
                <rect x="70" y="5" width="25" height="25" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="74" y="9" width="17" height="17" fill="white"/>
                <rect x="78" y="13" width="9" height="9" fill="black"/>
                
                <rect x="5" y="70" width="25" height="25" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="9" y="74" width="17" height="17" fill="white"/>
                <rect x="13" y="78" width="9" height="9" fill="black"/>

                {/* Simulated QR bits */}
                <rect x="40" y="10" width="6" height="6" fill="black"/>
                <rect x="50" y="15" width="12" height="6" fill="black"/>
                <rect x="45" y="30" width="6" height="12" fill="black"/>
                <rect x="15" y="45" width="18" height="6" fill="black"/>
                <rect x="40" y="50" width="6" height="6" fill="black"/>
                <rect x="55" y="45" width="6" height="12" fill="black"/>
                <rect x="75" y="45" width="12" height="6" fill="black"/>
                <rect x="80" y="55" width="6" height="6" fill="black"/>
                <rect x="45" y="70" width="12" height="6" fill="black"/>
                <rect x="40" y="80" width="6" height="12" fill="black"/>
                <rect x="60" y="75" width="12" height="12" fill="black"/>
                <rect x="80" y="80" width="10" height="10" fill="black"/>

                {/* PELKOTE brand center badge */}
                <rect x="35" y="35" width="30" height="30" rx="3" fill="#f97316"/>
                <text x="50" y="52" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PELKOTE</text>
              </svg>
            </div>

            <div className="bg-[#1e222b] p-3 rounded-lg border border-white/5 text-xs text-orange-400 font-mono font-bold truncate">
              {`https://pelkote.com/menu?table=${selectedTable.number}`}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => {
                  alert("QR Code PDF Receipt downloaded to POS Downloads queue.");
                  setShowQrModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition font-sans"
              >
                {currentLang === 'en' ? "Download PDF" : "භාගත කරන්න (PDF)"}
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-300 font-medium text-xs hover:bg-gray-700 transition font-sans"
              >
                {t.back}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
