import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCw, 
  TrendingDown, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Lightbulb,
  Briefcase
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { Expense } from '../types.js';

interface ExpensesViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function ExpensesView({ t, currentLang }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form input states
  const [category, setCategory] = useState<'Rent' | 'Utilities' | 'Salaries' | 'Inventory' | 'Marketing' | 'Other'>('Utilities');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().substr(0, 10));

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data || []);
    } catch (e) {
      console.error("Failed to load POS finance expenses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      alert("Please enter amount and description.");
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          description,
          date: expenseDate
        })
      });

      if (res.ok) {
        alert("Expense record saved successfully to ledger!");
        setAmount('');
        setDescription('');
        await fetchExpenses();
      }
    } catch (err) {
      console.error("Error creating expense log:", err);
    }
  };

  // Group by category for visual analytics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Rent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Utilities': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Salaries': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Inventory': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Marketing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6" id="expenses_finance_view">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">{t.expenses}</h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Log monthly restaurant overheads, salaries, water/gas utility bills, and marketing invoices." : "ආපනශාලාවේ මාසික කුලී, වැටුප්, විදුලි/ජල බිල්පත් සහ අනෙකුත් මෙහෙයුම් වියදම් සටහන් කිරීම."}
          </p>
        </div>
        <button 
          onClick={fetchExpenses}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e222b] text-gray-300 border border-white/5 self-start hover:bg-gray-800 transition"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {currentLang === 'en' ? "Refresh Ledger" : "පොත් තැබීම් යාවත්කාලීන කරන්න"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Create expense ledger form */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Plus className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-white font-display">
              {currentLang === 'en' ? "Log New Overhead Cost" : "නව වියදමක් එක් කරන්න"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Expense Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Rent">Rent & Lease</option>
                <option value="Utilities">Utilities (Gas / Water / Electric)</option>
                <option value="Salaries">Employee Salaries</option>
                <option value="Inventory">Raw Material Procurement</option>
                <option value="Marketing">Marketing / Advertisement</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Amount (LKR)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="LKR 15,000"
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                min="1"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Date</label>
              <input 
                type="date" 
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Cost Description</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Paid Monthly Litro Gas cylinder refills"
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition shadow"
            >
              Log Expense Cost
            </button>
          </form>
        </div>

        {/* Right Side: Ledger history & totals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Total stats card */}
          <div className="bg-gradient-to-r from-[#1c202a] to-[#141820] p-6 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-sans">{currentLang === 'en' ? "Total Operating Expenses" : "මුළු මෙහෙයුම් වියදම"}</span>
              <h2 className="text-3xl font-bold text-rose-500 font-mono">
                LKR {totalExpenses.toLocaleString()}
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>

          {/* Ledger history list */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white font-display border-b border-white/5 pb-2">
              {currentLang === 'en' ? "Overhead Cost Ledger" : "වියදම් ලේඛනය"}
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-xs font-sans">
              {loading ? (
                <div className="space-y-2 py-4">
                  {[1,2].map(i => (
                    <div key={i} className="h-10 bg-gray-800/40 rounded animate-pulse" />
                  ))}
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No expenses logged.</div>
              ) : (
                expenses.map(exp => (
                  <div key={exp.id} className="p-3 rounded-lg bg-[#141820]/50 border border-white/5 flex justify-between items-center hover:border-white/10 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase ${getCategoryColor(exp.category)}`}>
                          {exp.category}
                        </span>
                        <span className="text-gray-500 text-[10px] font-mono">{exp.date}</span>
                      </div>
                      <span className="text-white font-semibold text-[11px] block">{exp.description}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-rose-400 font-mono text-sm block">- LKR {exp.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
