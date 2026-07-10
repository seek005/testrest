import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  TableProperties, 
  ChefHat, 
  ReceiptText, 
  Boxes, 
  UsersRound, 
  TrendingDown, 
  Settings, 
  Menu, 
  X, 
  Sparkles, 
  Globe, 
  Clock 
} from 'lucide-react';
import { translations } from './translations.js';

// Views
import DashboardView from './components/DashboardView.js';
import NewOrderView from './components/NewOrderView.js';
import TablesView from './components/TablesView.js';
import KitchenView from './components/KitchenView.js';
import BillingView from './components/BillingView.js';
import InventoryView from './components/InventoryView.js';
import CrmRidersView from './components/CrmRidersView.js';
import ExpensesView from './components/ExpensesView.js';
import SettingsView from './components/SettingsView.js';

export default function App() {
  const [currentLang, setCurrentLang] = useState<'en' | 'si'>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const t = translations[currentLang];

  // Update real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tabs layout navigation
  const navItems = [
    { id: 'dashboard', name: t.dashboard, icon: LayoutDashboard },
    { id: 'orders', name: t.orders, icon: ShoppingBag },
    { id: 'tables', name: t.tables, icon: TableProperties },
    { id: 'kitchen', name: t.kitchen, icon: ChefHat },
    { id: 'billing', name: t.billing, icon: ReceiptText },
    { id: 'inventory', name: t.inventory, icon: Boxes },
    { id: 'customers', name: t.customers, icon: UsersRound },
    { id: 'expenses', name: t.expenses, icon: TrendingDown },
    { id: 'settings', name: t.settings, icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView t={t} currentLang={currentLang} />;
      case 'orders':
        return <NewOrderView t={t} currentLang={currentLang} onOrderCreated={() => setActiveTab('kitchen')} />;
      case 'tables':
        return <TablesView t={t} currentLang={currentLang} />;
      case 'kitchen':
        return <KitchenView t={t} currentLang={currentLang} />;
      case 'billing':
        return <BillingView t={t} currentLang={currentLang} />;
      case 'inventory':
        return <InventoryView t={t} currentLang={currentLang} />;
      case 'customers':
        return <CrmRidersView t={t} currentLang={currentLang} />;
      case 'expenses':
        return <ExpensesView t={t} currentLang={currentLang} />;
      case 'settings':
        return (
          <SettingsView 
            t={t} 
            currentLang={currentLang} 
            onChangeLang={(lang) => setCurrentLang(lang)} 
          />
        );
      default:
        return <DashboardView t={t} currentLang={currentLang} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 flex relative overflow-x-hidden font-sans">
      {/* Sidebar background design accent */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Sidebar for Desktop navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#141724]/90 border-r border-white/5 p-5 justify-between flex-shrink-0 backdrop-blur-md sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Brand Logo text and tagline */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-widest font-display text-white uppercase">PELKOTE</h2>
              <span className="text-[10px] text-gray-400 font-sans block">{t.tagline}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 font-sans ${
                    isActive 
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10 shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User footer profile card */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-xs text-orange-400">
              AD
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-display">Malith POS</h4>
              <span className="text-[9px] text-gray-400 block font-sans">Role: Admin</span>
            </div>
          </div>

          {/* Quick Lang Switch */}
          <button 
            onClick={() => setCurrentLang(l => l === 'en' ? 'si' : 'en')}
            className="p-1.5 rounded-lg bg-gray-800 border border-white/5 hover:text-white transition text-xs text-gray-400 flex items-center gap-1 font-mono font-bold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{currentLang}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop blur */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
          
          <aside className="relative flex flex-col w-64 bg-[#141724] border-r border-white/5 p-5 justify-between h-full z-10 animate-slideRight">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <h2 className="text-sm font-black font-display text-white uppercase tracking-wider">PELKOTE</h2>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition font-sans ${
                        isActive 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-gray-500">Pelkote POS Sri Lanka</span>
              <button 
                onClick={() => setCurrentLang(l => l === 'en' ? 'si' : 'en')}
                className="p-1 px-2.5 rounded bg-gray-800 text-orange-400 font-bold font-mono text-xs uppercase border border-white/5"
              >
                {currentLang === 'en' ? 'සිංහල' : 'English'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main viewport Container area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="bg-[#141724]/60 border-b border-white/5 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 backdrop-blur-md z-40">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 border border-white/5 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick logo for mobile */}
            <h1 className="lg:hidden text-sm font-black font-display text-white uppercase tracking-wider">PELKOTE</h1>
          </div>

          {/* Right Header indicators (Clock, Sales summary etc.) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-time Clock indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-[#1e222b]/50 border border-white/5 py-1.5 px-3.5 rounded-xl text-xs font-bold text-orange-400 font-mono">
              <Clock className="w-4 h-4 text-orange-500 animate-spin-slow" />
              <span>{currentTime || "00:00:00 PM"}</span>
            </div>

            {/* Language Switch header button */}
            <button 
              onClick={() => setCurrentLang(l => l === 'en' ? 'si' : 'en')}
              className="sm:hidden p-2 rounded bg-[#1e222b]/50 text-orange-400 font-bold text-xs uppercase"
            >
              {currentLang}
            </button>

            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold font-sans border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
              System Live
            </span>
          </div>
        </header>

        {/* Active main content workspace */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto animate-fadeIn pb-16">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
