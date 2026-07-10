import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Sparkles, 
  Plus, 
  Minus, 
  Tag, 
  Check, 
  Clock, 
  FileText, 
  UtensilsCrossed 
} from 'lucide-react';
import { TranslationDict } from '../translations.js';
import { MenuItem, MenuItemModifier, RestaurantTable } from '../types.js';

interface NewOrderViewProps {
  t: TranslationDict;
  currentLang: 'en' | 'si';
  onOrderCreated?: () => void;
}

export default function NewOrderView({ t, currentLang, onOrderCreated }: NewOrderViewProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Delivery'>('Dine In');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  // Customization modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSize, setCustomSize] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customModifiers, setCustomModifiers] = useState<MenuItemModifier[]>([]);
  const [customQty, setCustomQty] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cookingNotes, setCookingNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountVal, setDiscountVal] = useState(0);

  // Fetch Menu and Tables
  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, tablesRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/tables')
      ]);
      const menuData = await menuRes.json();
      const tablesData = await tablesRes.json();
      
      setMenu(menuData || []);
      setTables(tablesData || []);
    } catch (e) {
      console.error("Failed to load POS order catalog:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter menu items by category
  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const categoriesSinhala = ['All', ...new Set(menu.map(item => item.categorySinhala))];
  
  const filteredMenu = activeCategory === 'All' 
    ? menu 
    : menu.filter(item => item.category === activeCategory || item.categorySinhala === activeCategory);

  // Start customizing an item
  const startCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setCustomSize(item.sizes ? item.sizes[0].name : '');
    setCustomPrice(item.basePrice);
    setCustomModifiers([]);
    setCustomQty(1);
    setCustomNotes('');
  };

  // Handle Size change
  const handleSizeChange = (sizeName: string) => {
    setCustomSize(sizeName);
    if (customizingItem && customizingItem.sizes) {
      const selected = customizingItem.sizes.find(s => s.name === sizeName);
      if (selected) {
        setCustomPrice(selected.price);
      }
    }
  };

  // Toggle modifiers
  const toggleModifier = (mod: MenuItemModifier) => {
    setCustomModifiers(prev => {
      const exists = prev.find(m => m.id === mod.id);
      if (exists) {
        return prev.filter(m => m.id !== mod.id);
      } else {
        return [...prev, mod];
      }
    });
  };

  // Add customized item to cart
  const addToCart = () => {
    if (!customizingItem) return;

    const modifierPriceTotal = customModifiers.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = customPrice + modifierPriceTotal;
    const totalPrice = unitPrice * customQty;

    const cartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      nameSinhala: customizingItem.nameSinhala,
      quantity: customQty,
      selectedSize: customSize || undefined,
      selectedModifiers: customModifiers.length > 0 ? customModifiers : undefined,
      unitPrice,
      totalPrice,
      notes: customNotes || undefined
    };

    setCart(prev => [...prev, cartItem]);
    setCustomizingItem(null);
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Quick Cart Qty change
  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        // recalculate totals
        const unitPrice = item.unitPrice;
        return {
          ...item,
          quantity: newQty,
          totalPrice: unitPrice * newQty
        };
      }
      return item;
    }));
  };

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const serviceCharge = orderType === 'Dine In' ? Math.round(subtotal * 0.1) : 0; // 10%
  const tax = Math.round(subtotal * 0.15); // 15% VAT
  
  // Apply coupon discount
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME100") {
      setDiscountVal(100);
      alert("Coupon 'WELCOME100' applied! LKR 100 Discount added.");
    } else if (couponCode.toUpperCase() === "PELKOTE20") {
      setDiscountVal(Math.round(subtotal * 0.2));
      alert("Coupon 'PELKOTE20' applied! 20% Discount added.");
    } else {
      alert("Invalid coupon code.");
    }
  };

  const total = Math.max(0, subtotal + serviceCharge + tax - discountVal);

  // Submit Active Order
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Your order cart is empty.");
      return;
    }
    if (orderType === 'Dine In' && !selectedTableId) {
      alert("Please select a table for Dine In orders.");
      return;
    }

    const matchedTable = tables.find(t => t.id === selectedTableId);

    const payload = {
      type: orderType,
      tableId: orderType === 'Dine In' ? selectedTableId : undefined,
      tableName: orderType === 'Dine In' && matchedTable ? `Table ${matchedTable.number}` : undefined,
      items: cart,
      subtotal,
      serviceCharge,
      tax,
      discount: discountVal,
      couponCode: couponCode || undefined,
      total,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "0770000000",
      cookingNotes
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Order created and sent to Kitchen Display System successfully!");
        // Reset states
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setSelectedTableId('');
        setCookingNotes('');
        setCouponCode('');
        setDiscountVal(0);
        if (onOrderCreated) {
          onOrderCreated();
        }
      } else {
        alert("Failed to submit order. Please retry.");
      }
    } catch (e) {
      console.error("Submit order error:", e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="new_order_view">
      {/* Left Menu Selection catalog */}
      <div className="lg:col-span-7 space-y-4">
        {/* Header categories */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-bold font-display text-white">{t.orders}</h1>
          
          {/* Order Type Toggle */}
          <div className="flex items-center gap-1 bg-[#1e222b] p-1 rounded-lg border border-white/5 self-start">
            <button
              onClick={() => {
                setOrderType('Dine In');
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-sans transition-all duration-200 ${
                orderType === 'Dine In' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.dineIn}
            </button>
            <button
              onClick={() => {
                setOrderType('Take Away');
                setSelectedTableId('');
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-sans transition-all duration-200 ${
                orderType === 'Take Away' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.takeAway}
            </button>
            <button
              onClick={() => {
                setOrderType('Delivery');
                setSelectedTableId('');
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-sans transition-all duration-200 ${
                orderType === 'Delivery' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.delivery}
            </button>
          </div>
        </div>

        {/* Categories Tab slider */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin no-scrollbar">
          {categories.map((cat, idx) => {
            const displayCat = currentLang === 'en' ? cat : categoriesSinhala[idx];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition duration-200 ${
                  activeCategory === cat 
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                    : 'bg-[#1e222b]/40 text-gray-400 border-white/5 hover:text-white hover:bg-gray-800'
                }`}
              >
                {displayCat === 'All' ? t.all : displayCat}
              </button>
            );
          })}
        </div>

        {/* Dine In Table select dropdown */}
        {orderType === 'Dine In' && (
          <div className="bg-[#1e222b]/30 p-4 rounded-xl border border-white/5 space-y-2 animate-fadeIn">
            <span className="text-xs text-gray-400 font-sans block font-semibold">{currentLang === 'en' ? "Select Dining Table" : "මේසයක් තෝරන්න"}</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {tables.map(tbl => {
                const isSelected = selectedTableId === tbl.id;
                const isOccupied = tbl.status === 'Occupied';
                const isCleaning = tbl.status === 'Cleaning';
                return (
                  <button
                    key={tbl.id}
                    disabled={isCleaning}
                    onClick={() => setSelectedTableId(tbl.id)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition text-center ${
                      isSelected 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10' 
                        : isOccupied 
                        ? 'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10' 
                        : isCleaning
                        ? 'bg-blue-500/5 text-blue-400 border-blue-500/10 opacity-40 cursor-not-allowed'
                        : 'bg-[#1e222b] text-gray-300 border-white/5 hover:border-white/10'
                    }`}
                  >
                    T-{tbl.number}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 bg-[#1e222b]/40 rounded-xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenu.map(item => (
              <div
                key={item.id}
                onClick={() => item.isAvailable && startCustomize(item)}
                className={`p-3 rounded-xl bg-[#1e222b]/40 border border-white/5 flex gap-3 transition duration-200 cursor-pointer hover:border-white/10 relative ${
                  !item.isAvailable ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {/* Food Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                {/* Badges indicators */}
                <div className="absolute right-2 top-2 flex flex-wrap gap-1">
                  {item.isChefSpecial && (
                    <span className="text-[8px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                      Chef
                    </span>
                  )}
                  {item.isPopular && (
                    <span className="text-[8px] bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                      Hot
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate font-display">
                      {currentLang === 'en' ? item.name : item.nameSinhala}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-sans truncate mt-0.5">
                      {currentLang === 'en' ? item.category : item.categorySinhala}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-400 font-mono">
                      LKR {item.basePrice}
                    </span>
                    {item.isAvailable ? (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                        {t.addToCart}
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded font-sans">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar Cart Overview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass-panel p-5 rounded-xl flex flex-col h-[600px] justify-between">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-white font-display">{t.cart}</h3>
              </div>
              <span className="text-xs bg-orange-500/15 text-orange-400 px-2.5 py-0.5 rounded-full font-bold font-mono">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </div>

            {/* Customer input fields */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.customerName}
                  className="w-full bg-gray-800/60 border border-white/5 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-orange-500 text-xs font-sans"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t.phone}
                  className="w-full bg-gray-800/60 border border-white/5 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-orange-500 text-xs font-sans"
                />
              </div>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="p-3 bg-[#141820]/40 rounded-lg border border-white/5 flex justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <h5 className="font-bold text-white truncate font-display">
                        {currentLang === 'en' ? item.name : item.nameSinhala}
                      </h5>
                      
                      {/* Modifiers & Size subtexts */}
                      <div className="space-y-0.5 mt-1 font-sans">
                        {item.selectedSize && (
                          <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded inline-block mr-1">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedModifiers && item.selectedModifiers.map((m: any) => (
                          <span key={m.id} className="text-[9px] text-gray-400 mr-1 block">
                            + {m.name} (+LKR {m.price})
                          </span>
                        ))}
                        {item.notes && (
                          <span className="text-[9px] text-gray-500 block italic">
                            * {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <span className="font-bold text-white font-mono">LKR {item.totalPrice}</span>
                      
                      <div className="flex items-center gap-2 bg-[#1e222b] rounded p-1 border border-white/5">
                        <button 
                          onClick={() => updateCartQty(item.id, -1)}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs text-white px-1">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-0.5 text-rose-500 hover:text-rose-400 ml-1 border-l border-white/5 pl-1.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                  <span className="text-sm font-sans">{currentLang === 'en' ? "Your order cart is empty." : "වත්මන් ඇණවුම හිස්ව පවතී."}</span>
                </div>
              )}
            </div>

            {/* Cooking notes and Coupons input */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <input 
                type="text" 
                value={cookingNotes}
                onChange={(e) => setCookingNotes(e.target.value)}
                placeholder={t.cookingNotes}
                className="w-full bg-gray-800/60 border border-white/5 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-orange-500 text-xs font-sans"
              />

              {/* Coupon Row */}
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (WELCOME100)"
                    className="w-full bg-gray-800/60 border border-white/5 rounded pl-8 pr-2 py-1.5 text-white focus:outline-none focus:border-orange-500 text-xs font-sans"
                  />
                </div>
                <button 
                  onClick={applyCoupon}
                  className="px-3 bg-gray-800 hover:bg-gray-700 text-orange-400 font-medium text-xs rounded transition border border-white/5 font-sans"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Totals & Settle */}
          <div className="border-t border-white/5 pt-4 space-y-3 bg-[#1e222b]/20 -mx-5 -mb-5 p-5 rounded-b-xl">
            <div className="space-y-1.5 text-xs text-gray-400 font-sans">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-mono text-white">LKR {subtotal}</span>
              </div>
              {orderType === 'Dine In' && (
                <div className="flex justify-between">
                  <span>{t.serviceCharge}</span>
                  <span className="font-mono text-white">LKR {serviceCharge}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.tax}</span>
                <span className="font-mono text-white">LKR {tax}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold">
                  <span>{t.discount}</span>
                  <span className="font-mono">- LKR {discountVal}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-white/5 font-display">
                <span>{t.total}</span>
                <span className="font-mono text-orange-400">LKR {total}</span>
              </div>
            </div>

            <button
              onClick={submitOrder}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs transition shadow-lg shadow-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed font-sans"
            >
              {t.checkout}
            </button>
          </div>
        </div>
      </div>

      {/* Customize Dialog Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel-glow p-6 rounded-2xl max-w-md w-full space-y-5">
            <div className="flex gap-4">
              <img 
                src={customizingItem.image} 
                alt={customizingItem.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover border border-white/5"
              />
              <div>
                <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded font-sans">
                  {currentLang === 'en' ? customizingItem.category : customizingItem.categorySinhala}
                </span>
                <h4 className="text-lg font-bold text-white mt-1 font-display">
                  {currentLang === 'en' ? customizingItem.name : customizingItem.nameSinhala}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 font-sans">
                  {currentLang === 'en' ? customizingItem.description : customizingItem.descriptionSinhala}
                </p>
              </div>
            </div>

            {/* Custom Sizes Selection */}
            {customizingItem.sizes && (
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Choose Size" : "ප්‍රමාණය තෝරන්න"}</span>
                <div className="flex gap-2">
                  {customizingItem.sizes.map(sz => (
                    <button
                      key={sz.name}
                      onClick={() => handleSizeChange(sz.name)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition font-sans ${
                        customSize === sz.name 
                          ? 'bg-orange-500 text-white border-orange-500' 
                          : 'bg-[#1e222b] text-gray-300 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {sz.name} (LKR {sz.price})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Modifiers toggles */}
            {customizingItem.modifiers && (
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 block font-sans">{currentLang === 'en' ? "Extra Toppings & Add-ons" : "අමතර එකතු කිරීම්"}</span>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.modifiers.map(mod => {
                    const isSelected = customModifiers.find(m => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleModifier(mod)}
                        className={`p-2.5 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition ${
                          isSelected 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                            : 'bg-[#1e222b] text-gray-300 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className="font-sans">{mod.name}</span>
                        <span className="font-bold font-mono">+LKR {mod.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item Qty & Specific cooking notes */}
            <div className="flex gap-3 items-center pt-2">
              <div className="space-y-1 flex-1">
                <span className="text-xs text-gray-400 font-sans block">{currentLang === 'en' ? "Cooking Note" : "විශේෂ සටහන්"}</span>
                <input 
                  type="text" 
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. extra spicy, no onions"
                  className="w-full bg-gray-800 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-sans block">{currentLang === 'en' ? "Quantity" : "ප්‍රමාණය"}</span>
                <div className="flex items-center gap-2 bg-[#1e222b] rounded-lg p-1.5 border border-white/5">
                  <button 
                    onClick={() => setCustomQty(q => Math.max(1, q - 1))}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-sm font-bold text-white px-2">{customQty}</span>
                  <button 
                    onClick={() => setCustomQty(q => q + 1)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm & Cancel buttons */}
            <div className="flex gap-2 pt-3">
              <button 
                onClick={addToCart}
                className="flex-1 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition font-sans"
              >
                {t.addToCart}
              </button>
              <button 
                onClick={() => setCustomizingItem(null)}
                className="flex-1 py-3 rounded-lg bg-gray-800 text-gray-300 font-medium text-xs hover:bg-gray-700 transition font-sans"
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
