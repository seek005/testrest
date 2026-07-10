import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCw, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  Truck, 
  PlusCircle,
  HelpCircle,
  Activity,
  Calculator
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { Ingredient } from '../types.js';

interface InventoryViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
}

export default function InventoryView({ t, currentLang }: InventoryViewProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingItem, setAdjustingItem] = useState<Ingredient | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  
  // Recipe Cost Calculator state
  const [recipeItemCost, setRecipeItemCost] = useState(0);
  const [calculatedRecipeName, setCalculatedRecipeName] = useState('Chicken Kottu');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setIngredients(data || []);
    } catch (e) {
      console.error("Failed to load POS inventory:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async () => {
    if (!adjustingItem) return;
    try {
      const res = await fetch(`/api/inventory/${adjustingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(newStock) })
      });
      if (res.ok) {
        alert("Stock levels updated successfully!");
        setAdjustingItem(null);
        await fetchInventory();
      }
    } catch (e) {
      console.error("Error adjusting stock:", e);
    }
  };

  // Recipe cost simulation calculator
  const calculateFoodCost = (recipe: string) => {
    setCalculatedRecipeName(recipe);
    if (recipe === 'Chicken Kottu') {
      // 250g flour (70 LKR) + 150g chicken (220 LKR) + 1 egg (40 LKR) + spices/veg (100 LKR)
      setRecipeItemCost(70 + 217 + 40 + 100);
    } else if (recipe === 'Seafood Lamprais') {
      // Large portion: fish/shrimp blachan (500 LKR) + basmati rice (150 LKR) + egg (40 LKR) + banana leaf (50 LKR) + veg (150 LKR)
      setRecipeItemCost(500 + 150 + 40 + 50 + 150);
    } else if (recipe === 'Egg Hoppers') {
      // 4 Hoppers: 100g flour (28 LKR) + 4 eggs (160 LKR) + yeast/coconut milk (60 LKR)
      setRecipeItemCost(28 + 160 + 60);
    } else if (recipe === 'Watalappam') {
      // Coconut milk (50 LKR) + Kithul jaggery (120 LKR) + eggs (40 LKR) + cashews (80 LKR)
      setRecipeItemCost(50 + 120 + 40 + 80);
    }
  };

  useEffect(() => {
    calculateFoodCost('Chicken Kottu');
  }, []);

  // Filter low stock
  const lowStockItems = ingredients.filter(i => i.stock <= i.minStock);

  return (
    <div className="space-y-6" id="inventory_view_panel">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">{t.inventory}</h1>
          <p className="text-sm text-gray-400 font-sans">
            {currentLang === 'en' ? "Raw material stocks, recipes food cost calculators, and supplier purchase orders." : "අමුද්‍රව්‍ය තොග, කෑම වර්ග සඳහා පිරිවැය ගණක යන්ත්‍ර සහ සැපයුම්කරුවන්ගේ තොරතුරු."}
          </p>
        </div>
        <button 
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e222b] text-gray-300 border border-white/5 self-start hover:bg-gray-800 transition"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {currentLang === 'en' ? "Refresh Stocks" : "තොග යාවත්කාලීන කරන්න"}
        </button>
      </div>

      {/* Low Stock Banner Alert */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-6 h-6 animate-pulse text-rose-400 flex-shrink-0" />
          <div className="text-sm font-sans">
            <strong className="font-bold">{t.lowStockAlert}! </strong> 
            <span>
              {currentLang === 'en' ? 
                `${lowStockItems.length} ingredients are running below safe alert limits. Reorder from supplier immediately to prevent stockout.` :
                `අමුද්‍රව්‍ය ${lowStockItems.length}ක් අවම තොග මට්ටමට වඩා අඩු වී ඇත. වහාම සැපයුම්කරු අමතන්න.`
              }
            </span>
          </div>
        </div>
      )}

      {/* Grid: Stocks List and cost calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ingredients Table */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Package className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-white font-display">
              {currentLang === 'en' ? "Raw Materials Registry" : "අමුද්‍රව්‍ය ලේඛනය"}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-2 py-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 bg-gray-800/40 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-gray-400 font-sans tracking-wider uppercase">
                    <th className="py-2.5 px-2">{currentLang === 'en' ? "Material" : "අමුද්‍රව්‍ය"}</th>
                    <th className="py-2.5 px-2 text-center">{t.stock}</th>
                    <th className="py-2.5 px-2 text-right">{t.cost}</th>
                    <th className="py-2.5 px-2">{currentLang === 'en' ? "Supplier" : "සැපයුම්කරු"}</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {ingredients.map(item => {
                    const isLow = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-gray-800/20 transition">
                        <td className="py-3 px-2 font-semibold">
                          <span className="block text-white">{currentLang === 'en' ? item.name : item.nameSinhala}</span>
                          <span className="text-[10px] text-gray-500">ID: {item.id}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold font-mono px-2.5 py-0.5 rounded-full ${isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-white">LKR {item.costPerUnit}</td>
                        <td className="py-3 px-2 text-gray-400 max-w-[120px] truncate">{item.supplier}</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setNewStock(item.stock);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 rounded border border-orange-500/20 hover:bg-orange-500/20 transition"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Cost calculator and Purchase Simulator */}
        <div className="space-y-6">
          {/* Recipe Cost Calculator */}
          <div className="glass-panel p-5 rounded-xl border border-orange-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500 animate-bounce" />
              <h3 className="text-base font-semibold text-white font-display">
                {currentLang === 'en' ? "Food Cost Calculator" : "පිරිවැය ගණනය කිරීම"}
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              {currentLang === 'en' ? 
                "Estimate the exact margins of Sri Lankan recipes using live material price calculations." :
                "සජීවී අමුද්‍රව්‍ය මිල ගණන් අනුව එක් එක් කෑම වේලෙහි සැබෑ නිෂ්පාදන පිරිවැය සහ ලාභය ගණනය කරන්න."
              }
            </p>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-wider">Select Dish Recipe</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                {['Chicken Kottu', 'Seafood Lamprais', 'Egg Hoppers', 'Watalappam'].map(dish => (
                  <button
                    key={dish}
                    onClick={() => calculateFoodCost(dish)}
                    className={`py-2 px-2.5 rounded-lg border text-left transition font-semibold ${
                      calculatedRecipeName === dish 
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
                        : 'bg-gray-800 text-gray-300 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {dish}
                  </button>
                ))}
              </div>

              {/* Calculated output metrics display */}
              <div className="bg-[#141820]/80 p-4 rounded-xl border border-white/5 text-xs space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 font-sans">Calculated Dish:</span>
                  <span className="font-bold text-white font-display">{calculatedRecipeName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400 font-sans">Production Cost:</span>
                  <span className="text-white font-semibold">LKR {recipeItemCost}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400 font-sans">POS Menu Price:</span>
                  <span className="text-white font-semibold">
                    LKR {calculatedRecipeName === 'Chicken Kottu' ? 850 : calculatedRecipeName === 'Seafood Lamprais' ? 1650 : calculatedRecipeName === 'Egg Hoppers' ? 450 : 380}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-emerald-400 border-t border-white/5 pt-2 text-sm font-bold">
                  <span className="font-sans">Net Profit Margin:</span>
                  <span>
                    LKR {
                      (calculatedRecipeName === 'Chicken Kottu' ? 850 : calculatedRecipeName === 'Seafood Lamprais' ? 1650 : calculatedRecipeName === 'Egg Hoppers' ? 450 : 380) - recipeItemCost
                    } 
                    ({
                      Math.round(((calculatedRecipeName === 'Chicken Kottu' ? 850 : calculatedRecipeName === 'Seafood Lamprais' ? 1650 : calculatedRecipeName === 'Egg Hoppers' ? 450 : 380) - recipeItemCost) / (calculatedRecipeName === 'Chicken Kottu' ? 850 : calculatedRecipeName === 'Seafood Lamprais' ? 1650 : calculatedRecipeName === 'Egg Hoppers' ? 450 : 380) * 100)
                    }%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier reorders purchase simulate */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-white font-display">
                {currentLang === 'en' ? "Supplier Purchase Orders" : "සැපයුම්කරුවන්ගේ ඇණවුම්"}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              {currentLang === 'en' ? "Automated procurement. Simulates creating a reorder receipt request to local suppliers." : "අමුද්‍රව්‍ය හිඟ වූ විට සැපයුම්කරුවන් වෙත ස්වයංක්‍රීයව ඇණවුම් යොමුකිරීමේ පහසුකම."}
            </p>
            <button
              onClick={() => {
                alert("Purchase orders generated successfully for ingredients: 'Fresh Chicken' and 'EGB Ginger Beer'. PDF transmitted to suppliers!");
              }}
              className="w-full py-2.5 rounded-lg bg-gray-800 text-gray-300 border border-white/5 font-semibold text-xs transition hover:bg-gray-700 font-sans"
            >
              {currentLang === 'en' ? "Trigger Low-Stock Auto Procurement" : "හිඟ අමුද්‍රව්‍ය මිලදී ගැනීමට ඇණවුම් කරන්න"}
            </button>
          </div>
        </div>
      </div>

      {/* Adjust Stock Dialog Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-xl max-w-sm w-full space-y-4">
            <h4 className="text-lg font-bold text-white font-display">
              {currentLang === 'en' ? `Adjust Stock - ${adjustingItem.name}` : `තොග මට්ටම සංශෝධනය`}
            </h4>
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-sans">{currentLang === 'en' ? `Adjust stock quantity in hand (${adjustingItem.unit})` : `තොගයේ ප්‍රමාණය ඇතුළත් කරන්න`}</label>
              <input 
                type="number" 
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleAdjustStock}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition font-sans"
              >
                {t.confirm}
              </button>
              <button 
                onClick={() => setAdjustingItem(null)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 font-medium text-xs hover:bg-gray-700 transition font-sans"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
