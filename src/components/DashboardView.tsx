import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  DollarSign, 
  UtensilsCrossed, 
  UserCheck,
  RotateCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TranslationDict } from '../translations.js';

interface DashboardViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function DashboardView({ t, currentLang }: DashboardViewProps) {
  const [metrics, setMetrics] = useState<any>({
    todaySales: 58450,
    monthlySales: 845000,
    ordersToday: 14,
    openTables: 5,
    occupiedTables: 2,
    kitchenPending: 2,
    totalExpenses: 252000
  });
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any | null>(null);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data) {
        setMetrics(data.metrics);
        setWeeklySales(data.weeklySales || []);
        setTopSelling(data.topSelling || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (e) {
      console.error("Failed to load dashboard statistics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Run AI Sales prediction
  const runAiPrediction = async () => {
    try {
      setAiLoading(true);
      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setAiPrediction(data);
    } catch (e) {
      console.error("Failed to fetch AI insights:", e);
    } finally {
      setAiLoading(false);
    }
  };

  // Status colors for recent activity indicators
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Preparing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Ready': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  const COLORS = ['#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-6" id="dashboard_container">
      {/* Top Banner and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-white">
            {t.dashboard}
          </h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Overview of restaurant performance, sales charts, and operational analytics." : "ආපනශාලාවේ කාර්ය සාධනය, විකුණුම් ප්‍රස්ථාර සහ මෙහෙයුම් දත්ත පිළිබඳ දළ විශ්ලේෂණයක්."}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e222b] hover:bg-gray-800 text-gray-300 transition border border-white/5 self-start"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {currentLang === 'en' ? "Refresh Data" : "දත්ත යාවත්කාලීන කරන්න"}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none group-hover:bg-orange-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">{t.todaySales}</p>
              <h3 className="text-2xl font-bold mt-1 text-white font-mono">LKR {metrics.todaySales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-sans">
            <span>↑ 12%</span>
            <span className="text-gray-500">{currentLang === 'en' ? "vs. yesterday" : "ඊයේට සාපේක්ෂව"}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:bg-red-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">{t.monthlySales}</p>
              <h3 className="text-2xl font-bold mt-1 text-white font-mono">LKR {metrics.monthlySales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-sans">
            <span>↑ 8.5%</span>
            <span className="text-gray-500">{currentLang === 'en' ? "vs. last month" : "පසුගිය මාසයට සාපේක්ෂව"}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">{t.ordersToday}</p>
              <h3 className="text-2xl font-bold mt-1 text-white font-mono">{metrics.ordersToday}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-sans">
            <span>{metrics.openTables} {t.openTables}</span> • <span>{metrics.occupiedTables} {t.occupiedTables}</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">{t.kitchenPending}</p>
              <h3 className="text-2xl font-bold mt-1 text-white font-mono">{metrics.kitchenPending}</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1 font-sans">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{currentLang === 'en' ? "Average prep: 14 mins" : "සාමාන්‍ය කාලය: විනාඩි 14"}</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Area Chart */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white font-display">
              {currentLang === 'en' ? "Weekly Revenue Analysis" : "සතිපතා විකුණුම් විශ්ලේෂණය"}
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              LKR
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales.length > 0 ? weeklySales : [
                { day: 'Sun', amount: 125000 },
                { day: 'Mon', amount: 148000 },
                { day: 'Tue', amount: 95000 },
                { day: 'Wed', amount: 112000 },
                { day: 'Thu', amount: 134000 },
                { day: 'Fri', amount: 185000 },
                { day: 'Sat', amount: 224000 }
              ]}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(val) => `${val/1000}k`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e222b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area type="monotone" dataKey="amount" name="Revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Foods Chart */}
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-base font-semibold text-white font-display mb-4">
            {t.topSelling}
          </h3>
          <div className="h-72 w-full">
            {topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling} layout="vertical" margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey={currentLang === 'en' ? 'name' : 'nameSinhala'} stroke="#9ca3af" fontSize={10} tickLine={false} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e222b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]}>
                    {topSelling.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
                <span>{currentLang === 'en' ? "Gathering sales data..." : "විකුණුම් දත්ත රැස් කරමින්..."}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gemini AI Sales Predictor & Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini AI Predictor */}
        <div className="glass-panel-glow p-5 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded text-white animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  {t.aiSalesPrediction}
                </h3>
              </div>
              <span className="text-xs bg-orange-500/10 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/20 font-sans">
                Powered by Gemini 3.5
              </span>
            </div>
            <p className="text-sm text-gray-300 font-sans leading-relaxed mb-4">
              {currentLang === 'en' ? 
                "Leverage real-time checkout metrics, active table status, and ingredients levels. Gemini generates daily sales forecasts, inventory warning alerts, and custom high-converting promotions." :
                "සජීවී ඇණවුම් විස්තර සහ අමුද්‍රව්‍ය මට්ටම් විශ්ලේෂණය කර හෙට දින විකුණුම් අනාවැකි, අවම තොග අනතුරු ඇඟවීම් සහ ප්‍රවර්ධන යෝජනා Gemini මඟින් ලබාගන්න."
              }
            </p>

            {aiPrediction ? (
              <div className="space-y-3 bg-[#13161d] p-4 rounded-lg border border-white/5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-sans block">{currentLang === 'en' ? "Forecasted Revenue" : "හෙට දින විකුණුම් අනාවැකිය"}</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">LKR {aiPrediction.predictedSales.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-sans block">{currentLang === 'en' ? "Predicted Peak Hours" : "උච්චතම වේලාවන්"}</span>
                    <span className="text-xs font-semibold text-white font-mono block mt-1">{aiPrediction.busyHours.join(', ')}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-orange-400 font-semibold flex items-center gap-1 mb-1 font-sans">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentLang === 'en' ? "Recommended Promotion" : "නිර්දේශිත ප්‍රවර්ධන වැඩසටහන"}
                  </span>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">{aiPrediction.recommendedPromo}</p>
                </div>

                {aiPrediction.inventoryWarning && aiPrediction.inventoryWarning.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 mb-1 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {currentLang === 'en' ? "Inventory Warnings" : "අමුද්‍රව්‍ය හිඟවීමේ අනතුරු ඇඟවීම්"}
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-400 font-sans">
                      {aiPrediction.inventoryWarning.map((warn: string, idx: number) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 bg-orange-500/5 p-2 rounded">
                  <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider font-sans block mb-1">
                    {t.aiSinhalaSummary}
                  </span>
                  <p className="text-xs text-gray-300 italic font-sans leading-relaxed">
                    {aiPrediction.sinhalaSummary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-white/10 rounded-lg bg-[#141820]">
                <Sparkles className="w-10 h-10 mx-auto text-gray-500 mb-2 opacity-40" />
                <span className="text-xs text-gray-400 block font-sans">
                  {currentLang === 'en' ? "Run AI Predictor to query Gemini with live data" : "සජීවී දත්ත සමඟ Gemini විමසීමට 'අනාවැකිය අසන්න' බටනය ඔබන්න"}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button 
              onClick={runAiPrediction}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium text-sm transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {aiLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{currentLang === 'en' ? "Gemini is thinking..." : "Gemini විශ්ලේෂණය කරමින්..."}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.aiPredictBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Activities list */}
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-base font-semibold text-white font-display mb-4">
            {t.recentActivities}
          </h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-[#141820]/50 border border-white/5 hover:border-white/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white font-mono">{act.orderNumber}</span>
                        <span className="text-xs text-gray-400 font-sans">({act.type === 'Dine In' ? t.dineIn : act.type === 'Take Away' ? t.takeAway : t.delivery})</span>
                      </div>
                      <span className="text-xs text-gray-500 font-sans block mt-0.5">{currentLang === 'en' ? `Placed at ${act.time}` : `${act.time} ට ඇණවුම් කරන ලදී`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white font-mono block">LKR {act.total.toLocaleString()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-mono font-semibold ${getStatusColor(act.status)}`}>
                      {act.status === 'Completed' ? t.completed : act.status === 'Preparing' ? t.preparing : act.status === 'Ready' ? t.ready : act.status === 'Cancelled' ? t.cancelled : t.pending}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <span className="text-sm font-sans">{currentLang === 'en' ? "No recent activities recorded." : "මෑතකාලීන ක්‍රියාකාරකම් කිසිවක් සටහන් වී නැත."}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
