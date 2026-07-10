import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Sliders, 
  HelpCircle, 
  Receipt, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { TranslationDict } from '../translations.js';

interface SettingsViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
  onChangeLang: (lang: 'en' | 'si') => void;
}

export default function SettingsView({ t, currentLang, onChangeLang }: SettingsViewProps) {
  // Config states
  const [restaurantName, setRestaurantName] = useState('Pelkote Restaurant');
  const [tagline, setTagline] = useState('Fresh Food • Fast Service');
  const [phone, setPhone] = useState('+94 112 345 678');
  const [address, setAddress] = useState('Colombo Road, Pelkote, Sri Lanka');
  const [receiptFooter, setReceiptFooter] = useState('THANK YOU FOR YOUR VISIT! VISIT AGAIN!');
  const [taxRate, setTaxRate] = useState(15);
  const [serviceRate, setServiceRate] = useState(10);
  const [isResetting, setIsResetting] = useState(false);

  // Seed / Reset Database
  const triggerDatabaseReset = async () => {
    const confirm = window.confirm(currentLang === 'en' ? 
      "Are you sure you want to reset POS database to original seed state? This will clear all active checkout orders." :
      "ඔබට සියලුම ඇණවුම් සහ මේස සැකසුම් මුල් තත්ත්වයට පත් කිරීමට අවශ්‍යද?"
    );
    if (!confirm) return;

    try {
      setIsResetting(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        alert("POS database reset seed completed successfully!");
        window.location.reload();
      } else {
        alert("Seed trigger failed.");
      }
    } catch (e) {
      console.error("Database seed error:", e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6" id="settings_view_panel">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">{t.settings}</h1>
        <p className="text-sm text-gray-400 font-sans">
          {currentLang === 'en' ? "Configure POS system parameters, tax rates, printer settings, and local database seedings." : "පද්ධති සැකසුම්, බදු අනුපාත, මුද්‍රණ යන්ත්‍ර සහ මුල් දත්ත නැවත පිහිටුවීම."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Restaurant Identity & Printer details */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-white font-display">
              {currentLang === 'en' ? "Restaurant Core Profile" : "ආපනශාලා තොරතුරු සැකසීම"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-gray-400">Restaurant Name</label>
              <input 
                type="text" 
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Tagline / Slogan</label>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Contact Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Tax Registration Address</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Surtax settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white font-display border-b border-white/5 pb-2">
              {currentLang === 'en' ? "Taxation & Service Charges Rates" : "බදු සහ සේවා ගාස්තු ප්‍රතිශත"}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-gray-400">VAT Tax Surtax (%)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Service Charge (%)</label>
                <input 
                  type="number" 
                  value={serviceRate}
                  onChange={(e) => setServiceRate(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Receipt Customizer footer */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white font-display border-b border-white/5 pb-2">
              {currentLang === 'en' ? "Receipt Footnotes Customizer" : "බිල්පත අවසානයේ මුද්‍රණය වන සටහන්"}
            </h4>
            <div className="space-y-1 text-xs font-sans">
              <label className="text-gray-400">Receipt Footer Text</label>
              <textarea 
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Right column: Language toggle and Developer operations reset */}
        <div className="space-y-6 lg:col-span-4">
          {/* Language Selection */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-white font-display">
                {t.languages}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              {currentLang === 'en' ? "Switch the entire POS operator interface between English and Sinhala." : "සම්පූර්ණ පද්ධති භාෂාව සිංහල හෝ ඉංග්‍රීසි භාෂාවට වෙනස් කරන්න."}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <button
                onClick={() => onChangeLang('en')}
                className={`py-2 px-3 rounded-lg border font-semibold text-center transition ${
                  currentLang === 'en' 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-[#1e222b] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                English (US)
              </button>
              <button
                onClick={() => onChangeLang('si')}
                className={`py-2 px-3 rounded-lg border font-semibold text-center transition ${
                  currentLang === 'si' 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-[#1e222b] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                සිංහල (ශ්‍රී ලංකා)
              </button>
            </div>
          </div>

          {/* Database seeding recovery */}
          <div className="glass-panel p-5 rounded-xl border border-red-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-red-400 animate-pulse" />
              <h3 className="text-base font-semibold text-white font-display">
                {currentLang === 'en' ? "Maintenance & Seeding" : "නඩත්තු කටයුතු"}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              {currentLang === 'en' ? 
                "Reset POS arrays to template seed defaults. Ideal if you want to wipe test billing logs." : 
                "පද්ධතියේ පරීක්ෂණ දත්ත සියල්ල මකා දමා මුල් සැකසුම් ස්ථාපනය කිරීමට මෙය භාවිතා කරන්න."
              }
            </p>
            <button
              onClick={triggerDatabaseReset}
              disabled={isResetting}
              className="w-full py-2.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 border border-red-600/25 font-bold text-xs transition disabled:opacity-40 font-sans"
            >
              {isResetting ? "Resetting data..." : (currentLang === 'en' ? "Seed / Reset POS Arrays" : "දත්ත මකා මුල් තත්ත්වයට පත් කරන්න")}
            </button>
          </div>

          {/* System info badge */}
          <div className="bg-[#1e222b]/40 p-4 rounded-xl border border-white/5 text-[10px] space-y-1.5 text-gray-400 font-sans">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Info className="w-4 h-4 text-orange-500" />
              <span>POS Core Engine Meta</span>
            </div>
            <div>Runtime Version: <span className="font-mono text-white">v4.18.2-enterprise</span></div>
            <div>Database Mode: <span className="font-mono text-white">In-Memory Sync</span></div>
            <div>AI Service: <span className="font-mono text-white">Gemini 2.5 Flash</span></div>
            <div className="text-orange-400 font-semibold pt-1">Pelkote Restaurant POS • Sri Lanka</div>
          </div>
        </div>
      </div>
    </div>
  );
}
