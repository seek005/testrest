import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RestaurantTable, 
  MenuItem, 
  Order, 
  Ingredient, 
  Customer, 
  Expense,
  OrderStatus
} from "./src/types.js"; // Use js extension for relative imports under CJS bundles if needed, but in TS code we can just import

// Initialize Google GenAI Client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Initialized successfully.");
  } else {
    console.log("No valid GEMINI_API_KEY found. AI features will run in mock simulation mode.");
  }
} catch (err) {
  console.error("Error initializing Gemini API:", err);
}

// Global In-Memory Database (Seeds on Startup)
let tables: RestaurantTable[] = [
  { id: "T1", number: 1, seats: 2, status: "Available", section: "Main Hall" },
  { id: "T2", number: 2, seats: 4, status: "Occupied", section: "Main Hall", currentOrderId: "ORD1001" },
  { id: "T3", number: 3, seats: 4, status: "Reserved", section: "Main Hall", reservationName: "Mr. Heshan", reservationTime: "19:30" },
  { id: "T4", number: 4, seats: 6, status: "Available", section: "VIP Room" },
  { id: "T5", number: 5, seats: 8, status: "Cleaning", section: "VIP Room" },
  { id: "T6", number: 6, seats: 4, status: "Available", section: "Garden" },
  { id: "T7", number: 7, seats: 2, status: "Available", section: "Garden" },
  { id: "T8", number: 8, seats: 4, status: "Available", section: "Terrace" },
];

let menuItems: MenuItem[] = [
  {
    id: "M1",
    name: "Classic Chicken Kottu Roti",
    nameSinhala: "සම්භාව්‍ය කුකුළු මස් කොත්තු රොටි",
    category: "Main Dishes",
    categorySinhala: "ප්‍රධාන ආහාර",
    basePrice: 850,
    sizes: [
      { name: "Small", price: 650 },
      { name: "Medium", price: 850 },
      { name: "Large", price: 1200 }
    ],
    modifiers: [
      { id: "mod1", name: "Extra Cheese", price: 150 },
      { id: "mod2", name: "Extra Chicken", price: 200 },
      { id: "mod3", name: "Extra Gravy", price: 50 }
    ],
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    isPopular: true,
    isChefSpecial: true,
    description: "Traditional Sri Lankan shredded flatbread stir-fried with rich vegetables, eggs, aromatic spices, and tender chicken curry.",
    descriptionSinhala: "එළවළු, බිත්තර, කුළුබඩු සහ කුකුළු මස් සමඟ මිශ්‍ර කර පදම් කරන ලද සාම්ප්‍රදායික ශ්‍රී ලාංකික කොත්තු රොටි."
  },
  {
    id: "M2",
    name: "Premium Seafood Lamprais",
    nameSinhala: "ප්‍රිමියම් සීෆුඩ් ලම්ප්‍රයිස්",
    category: "Main Dishes",
    categorySinhala: "ප්‍රධාන ආහාර",
    basePrice: 1650,
    sizes: [
      { name: "Medium", price: 1650 },
      { name: "Large", price: 1950 }
    ],
    modifiers: [
      { id: "mod4", name: "Extra Egg", price: 60 },
      { id: "mod5", name: "Extra Fish Cutlet", price: 100 }
    ],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    isRecommended: true,
    description: "Dutch-burgher influenced delicacy of rice cooked in rich meat stock, served with fish cutlet, brinjal pahi, ash plantain, and shrimp blachan, wrapped and baked in banana leaf.",
    descriptionSinhala: "සුවඳැති මස් සුප් හොද්දෙන් පිසින ලද බත්, මාළු කට්ලට්, වම්බටු පහි, අළු කෙසෙල් සහ ඉස්සන් බලචන් සමඟ කෙසෙල් කොළයක ඔතා පුලුස්සන ලද ලම්ප්‍රයිස්."
  },
  {
    id: "M3",
    name: "Traditional Egg Hoppers (4 pcs)",
    nameSinhala: "සාම්ප්‍රදායික බිත්තර ආප්ප (කෑලි 4)",
    category: "Breakfast & Evening",
    categorySinhala: "උදේ සහ සවස ආහාර",
    basePrice: 450,
    modifiers: [
      { id: "mod6", name: "Lunu Miris", price: 30 },
      { id: "mod7", name: "Seeni Sambol", price: 40 }
    ],
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    isPopular: true,
    description: "Crispy-edged bowl-shaped rice pancakes with soft centers, featuring a perfectly cooked egg in the middle, accompanied by Lunu Miris.",
    descriptionSinhala: "මැද මෘදු ලෙස පිසින ලද බිත්තරයක් සහිත හැපෙනසුළු දාර සහිත ආප්ප, ලුණු මිරිස් සමඟ පිළිගන්වනු ලැබේ."
  },
  {
    id: "M4",
    name: "Devilled Spicy Cuttlefish",
    nameSinhala: "දැල්ලෝ ඩෙවිල්",
    category: "Appetizers",
    categorySinhala: "කෑම රුචිය වඩන ආහාර",
    basePrice: 1250,
    image: "https://images.unsplash.com/photo-1534080391095-71b145466553?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    isChefSpecial: true,
    description: "Stir-fried cuttlefish tossed in a fiery hot pepper sauce, loaded with onions, green chillies, and bell peppers.",
    descriptionSinhala: "ලූණු, අමුමිරිස් සහ බෙල් පෙපර් සමඟ සැර සෝස් එකක මිශ්‍ර කර සාදන ලද දැල්ලෝ ඩෙවිල්."
  },
  {
    id: "M5",
    name: "Rich Cardamom Watalappam",
    nameSinhala: "කරදමුංගු වටලප්පන්",
    category: "Desserts",
    categorySinhala: "පැණිරස කෑම",
    basePrice: 380,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    isPopular: true,
    description: "Traditional steamed coconut custard sweetened with pure Sri Lankan kithul jaggery, nutmeg, and aromatic cardamoms, topped with cashew nuts.",
    descriptionSinhala: "කිතුල් හකුරු, පොල්කිරි, කරදමුංගු සහ සාදික්කා සමඟ හදන ලද සාම්ප්‍රදායික වටලප්පන්, කජු මඟින් සරසා ඇත."
  },
  {
    id: "M6",
    name: "EGB Ginger Beer (Can)",
    nameSinhala: "ඊජීබී ඉඟුරු බීර",
    category: "Beverages",
    categorySinhala: "බීම වර්ග",
    basePrice: 180,
    image: "https://images.unsplash.com/photo-1527960656306-ff37c61793a4?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    description: "Famous Sri Lankan sparkling drink brewed with natural ginger extract. Refreshingly hot and sweet.",
    descriptionSinhala: "ස්වභාවික ඉඟුරු සාරය සහිත ප්‍රබෝධමත් රසයකින් යුත් ලාංකික ඉඟුරු බීර."
  }
];

let orders: Order[] = [
  {
    id: "ORD1001",
    orderNumber: "PEL-1001",
    type: "Dine In",
    tableId: "T2",
    tableName: "Table 2",
    status: "Preparing",
    items: [
      {
        id: "item1",
        menuItemId: "M1",
        name: "Classic Chicken Kottu Roti",
        nameSinhala: "සම්භාව්‍ය කුකුළු මස් කොත්තු රොටි",
        quantity: 2,
        selectedSize: "Medium",
        selectedModifiers: [{ id: "mod1", name: "Extra Cheese", price: 150 }],
        unitPrice: 850,
        totalPrice: 2000
      },
      {
        id: "item2",
        menuItemId: "M6",
        name: "EGB Ginger Beer (Can)",
        nameSinhala: "ඊජීබී ඉඟුරු බීර",
        quantity: 2,
        unitPrice: 180,
        totalPrice: 360
      }
    ],
    subtotal: 2360,
    serviceCharge: 236, // 10%
    tax: 354, // 15% VAT
    discount: 100,
    couponCode: "WELCOME100",
    total: 2850,
    paymentStatus: "Unpaid",
    customerPhone: "0771234567",
    customerName: "Heshan Alwis",
    cookingNotes: "Make Kottu spicy, double gravy.",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ORD1002",
    orderNumber: "PEL-1002",
    type: "Take Away",
    status: "Ready",
    items: [
      {
        id: "item3",
        menuItemId: "M3",
        name: "Traditional Egg Hoppers (4 pcs)",
        nameSinhala: "සාම්ප්‍රදායික බිත්තර ආප්ප (කෑලි 4)",
        quantity: 1,
        selectedModifiers: [{ id: "mod7", name: "Seeni Sambol", price: 40 }],
        unitPrice: 450,
        totalPrice: 490
      }
    ],
    subtotal: 490,
    serviceCharge: 0,
    tax: 73.5,
    discount: 0,
    total: 563.5,
    paymentStatus: "Unpaid",
    customerPhone: "0719876543",
    customerName: "Priyantha Perera",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ORD1003",
    orderNumber: "PEL-1003",
    type: "Delivery",
    status: "Completed",
    items: [
      {
        id: "item4",
        menuItemId: "M2",
        name: "Premium Seafood Lamprais",
        nameSinhala: "ප්‍රිමියම් සීෆුඩ් ලම්ප්‍රයිස්",
        quantity: 1,
        selectedSize: "Large",
        unitPrice: 1950,
        totalPrice: 1950
      }
    ],
    subtotal: 1950,
    serviceCharge: 0,
    tax: 292.5,
    discount: 200,
    total: 2042.5,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    customerPhone: "0725556667",
    customerName: "Dilani Fernando",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    riderId: "RIDER-01",
    deliveryStatus: "Delivered",
    otpCode: "3892"
  },
  {
    id: "ORD1004",
    orderNumber: "PEL-1004",
    type: "Dine In",
    tableId: "T6",
    tableName: "Table 6",
    status: "Completed",
    items: [
      {
        id: "item5",
        menuItemId: "M1",
        name: "Classic Chicken Kottu Roti",
        nameSinhala: "සම්භාව්‍ය කුකුළු මස් කොත්තු රොටි",
        quantity: 2,
        unitPrice: 850,
        totalPrice: 1700
      },
      {
        id: "item6",
        menuItemId: "M5",
        name: "Rich Cardamom Watalappam",
        nameSinhala: "කරදමුංගු වටලප්පන්",
        quantity: 2,
        unitPrice: 380,
        totalPrice: 760
      }
    ],
    subtotal: 2460,
    serviceCharge: 246,
    tax: 369,
    discount: 0,
    total: 3075,
    paymentMethod: "Card",
    paymentStatus: "Paid",
    customerPhone: "0751112223",
    customerName: "Nihal Jayasinghe",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

let ingredients: Ingredient[] = [
  { id: "ING1", name: "Basmati Rice", nameSinhala: "බාස්මතී සහල්", stock: 120, unit: "kg", minStock: 25, costPerUnit: 420, supplier: "Ceylon Agro Trading" },
  { id: "ING2", name: "Fresh Chicken Breast", nameSinhala: "නැවුම් කුකුළු මස්", stock: 15, unit: "kg", minStock: 20, costPerUnit: 1450, supplier: "Keells Foods" },
  { id: "ING3", name: "Wheat Flour", nameSinhala: "තිරිඟු පිටි", stock: 80, unit: "kg", minStock: 15, costPerUnit: 280, supplier: "Prima Ceylon" },
  { id: "ING4", name: "Farm Eggs", nameSinhala: "බිත්තර", stock: 150, unit: "units", minStock: 50, costPerUnit: 40, supplier: "Arogya Farms" },
  { id: "ING5", name: "EGB Ginger Beer Can", nameSinhala: "ඊජීබී ඉඟුරු බීර කෑන්", stock: 12, unit: "units", minStock: 24, costPerUnit: 120, supplier: "Elephant House" },
  { id: "ING6", name: "Fresh Cuttlefish", nameSinhala: "නැවුම් දැල්ලෝ", stock: 8, unit: "kg", minStock: 5, costPerUnit: 2100, supplier: "Negombo Harbor" },
  { id: "ING7", name: "Kithul Jaggery", nameSinhala: "කිතුල් හකුරු", stock: 25, unit: "kg", minStock: 8, costPerUnit: 1800, supplier: "Kotmale Organic Traders" },
];

let customers: Customer[] = [
  { id: "C1", name: "Heshan Alwis", phone: "0771234567", email: "heshanadz@gmail.com", birthday: "1994-08-25", loyaltyPoints: 245, membershipLevel: "Gold", orderCount: 18, totalSpent: 42500 },
  { id: "C2", name: "Priyantha Perera", phone: "0719876543", email: "priyantha@pos.lk", loyaltyPoints: 85, membershipLevel: "Silver", orderCount: 6, totalSpent: 12800 },
  { id: "C3", name: "Dilani Fernando", phone: "0725556667", birthday: "1996-12-05", loyaltyPoints: 480, membershipLevel: "Platinum", orderCount: 32, totalSpent: 89000 },
  { id: "C4", name: "Nihal Jayasinghe", phone: "0751112223", loyaltyPoints: 30, membershipLevel: "Bronze", orderCount: 2, totalSpent: 5200 },
];

let expenses: Expense[] = [
  { id: "EXP1", category: "Electricity", categorySinhala: "විදුලිය", amount: 45000, description: "Monthly power bill for Main Kitchen & Hall", date: "2026-07-01" },
  { id: "EXP2", category: "Water", categorySinhala: "ජලය", amount: 12000, description: "Water board supply bill", date: "2026-07-02" },
  { id: "EXP3", category: "Gas", categorySinhala: "ගෑස්", amount: 35000, description: "Litro Gas commercial cylinder refill (5 units)", date: "2026-07-04" },
  { id: "EXP4", category: "Rent", categorySinhala: "කුලිය", amount: 150000, description: "Restaurant building lease rent", date: "2026-07-01" },
  { id: "EXP5", category: "Salary", categorySinhala: "වැටුප්", amount: 380000, description: "Kitchen Staff and Waiting Staff basic salaries", date: "2026-07-05" },
];

// Helper functions for inventory auto reduction
function deductIngredientsForOrder(order: Order) {
  try {
    order.items.forEach(item => {
      // Basic recipe deduction maps
      if (item.menuItemId === "M1") { // Kottu Roti
        const flour = ingredients.find(i => i.id === "ING3");
        const chicken = ingredients.find(i => i.id === "ING2");
        const eggs = ingredients.find(i => i.id === "ING4");
        
        if (flour) flour.stock = Math.max(0, flour.stock - 0.25 * item.quantity); // 250g flour per Kottu
        if (chicken) chicken.stock = Math.max(0, chicken.stock - 0.15 * item.quantity); // 150g chicken
        if (eggs) eggs.stock = Math.max(0, eggs.stock - 1 * item.quantity); // 1 egg
      } else if (item.menuItemId === "M3") { // Hoppers
        const flour = ingredients.find(i => i.id === "ING3");
        const eggs = ingredients.find(i => i.id === "ING4");
        
        if (flour) flour.stock = Math.max(0, flour.stock - 0.1 * item.quantity); // 100g flour
        if (eggs) eggs.stock = Math.max(0, eggs.stock - 4 * item.quantity); // 4 eggs for 4 hoppers
      } else if (item.menuItemId === "M4") { // Cuttlefish
        const cuttlefish = ingredients.find(i => i.id === "ING6");
        if (cuttlefish) cuttlefish.stock = Math.max(0, cuttlefish.stock - 0.3 * item.quantity); // 300g
      } else if (item.menuItemId === "M5") { // Watalappam
        const eggs = ingredients.find(i => i.id === "ING4");
        const jaggery = ingredients.find(i => i.id === "ING7");
        
        if (eggs) eggs.stock = Math.max(0, eggs.stock - 0.5 * item.quantity); // 0.5 egg per serving
        if (jaggery) jaggery.stock = Math.max(0, jaggery.stock - 0.05 * item.quantity); // 50g jaggery
      } else if (item.menuItemId === "M6") { // Ginger Beer Cans
        const can = ingredients.find(i => i.id === "ING5");
        if (can) can.stock = Math.max(0, can.stock - 1 * item.quantity); // 1 can
      }
    });
  } catch (e) {
    console.error("Failed to execute inventory auto-deduction:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Get active user sessions (mock list of employees)
  app.get("/api/employees", (req, res) => {
    res.json([
      { id: "E1", name: "Heshan Alwis", role: "Admin", active: true },
      { id: "E2", name: "Janaka Perera", role: "Manager", active: true },
      { id: "E3", name: "Suresh Perera", role: "Cashier", active: true },
      { id: "E4", name: "Kamal Gamage", role: "Waiter", active: true },
      { id: "E5", name: "Chef Ranjith", role: "Kitchen Staff", active: true },
      { id: "E6", name: "Pradeep Bandara", role: "Delivery Rider", active: true },
    ]);
  });

  // Get Tables
  app.get("/api/tables", (req, res) => {
    res.json(tables);
  });

  // Update Table
  app.put("/api/tables/:id", (req, res) => {
    const { id } = req.params;
    const { status, currentOrderId, reservationName, reservationTime } = req.body;
    
    const tableIndex = tables.findIndex(t => t.id === id);
    if (tableIndex !== -1) {
      tables[tableIndex] = {
        ...tables[tableIndex],
        status: status !== undefined ? status : tables[tableIndex].status,
        currentOrderId: currentOrderId !== undefined ? currentOrderId : tables[tableIndex].currentOrderId,
        reservationName: reservationName !== undefined ? reservationName : tables[tableIndex].reservationName,
        reservationTime: reservationTime !== undefined ? reservationTime : tables[tableIndex].reservationTime,
      };
      res.json(tables[tableIndex]);
    } else {
      res.status(404).json({ error: "Table not found" });
    }
  });

  // Transfer Table
  app.post("/api/tables/transfer", (req, res) => {
    const { fromTableId, toTableId } = req.body;
    const fromIdx = tables.findIndex(t => t.id === fromTableId);
    const toIdx = tables.findIndex(t => t.id === toTableId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const orderId = tables[fromIdx].currentOrderId;
      if (!orderId) {
        return res.status(400).json({ error: "Source table has no active order" });
      }
      
      // Update tables
      tables[fromIdx].status = "Available";
      tables[fromIdx].currentOrderId = undefined;
      
      tables[toIdx].status = "Occupied";
      tables[toIdx].currentOrderId = orderId;

      // Update Order Table Details
      const orderIdx = orders.findIndex(o => o.id === orderId);
      if (orderIdx !== -1) {
        orders[orderIdx].tableId = toTableId;
        orders[orderIdx].tableName = `Table ${tables[toIdx].number}`;
      }

      res.json({ success: true, tables });
    } else {
      res.status(404).json({ error: "Tables not found" });
    }
  });

  // Get Menu Items
  app.get("/api/menu", (req, res) => {
    res.json(menuItems);
  });

  // Toggle Menu Availability
  app.put("/api/menu/:id", (req, res) => {
    const { id } = req.params;
    const { isAvailable, basePrice } = req.body;
    const itemIndex = menuItems.findIndex(m => m.id === id);
    if (itemIndex !== -1) {
      menuItems[itemIndex] = {
        ...menuItems[itemIndex],
        isAvailable: isAvailable !== undefined ? isAvailable : menuItems[itemIndex].isAvailable,
        basePrice: basePrice !== undefined ? basePrice : menuItems[itemIndex].basePrice,
      };
      res.json(menuItems[itemIndex]);
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  });

  // Get Orders
  app.get("/api/orders", (req, res) => {
    res.json(orders);
  });

  // Create Order
  app.post("/api/orders", (req, res) => {
    const orderData = req.body;
    const orderNumber = `PEL-${1000 + orders.length + 1}`;
    
    const newOrder: Order = {
      id: `ORD${1000 + orders.length + 1}`,
      orderNumber,
      type: orderData.type,
      tableId: orderData.tableId,
      tableName: orderData.tableName,
      status: "Pending",
      items: orderData.items,
      subtotal: orderData.subtotal,
      serviceCharge: orderData.serviceCharge,
      tax: orderData.tax,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      total: orderData.total,
      paymentStatus: "Unpaid",
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      cookingNotes: orderData.cookingNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If Delivery order, set Rider and Delivery Status
    if (newOrder.type === "Delivery") {
      newOrder.riderId = "RIDER-01";
      newOrder.deliveryStatus = "Assigned";
      newOrder.otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // generate 4 digit OTP
    }

    orders.push(newOrder);

    // If Dine In, update the Table status to Occupied
    if (orderData.tableId) {
      const tblIndex = tables.findIndex(t => t.id === orderData.tableId);
      if (tblIndex !== -1) {
        tables[tblIndex].status = "Occupied";
        tables[tblIndex].currentOrderId = newOrder.id;
      }
    }

    // Adjust CRM customer count if exists
    if (orderData.customerPhone) {
      const custIndex = customers.findIndex(c => c.phone === orderData.customerPhone);
      if (custIndex !== -1) {
        customers[custIndex].orderCount += 1;
        customers[custIndex].totalSpent += newOrder.total;
        // loyalty points: 10 points per 1000 LKR
        const earnedPoints = Math.floor(newOrder.total / 100);
        customers[custIndex].loyaltyPoints += earnedPoints;

        // update membership level
        if (customers[custIndex].totalSpent >= 80000) {
          customers[custIndex].membershipLevel = "Platinum";
        } else if (customers[custIndex].totalSpent >= 40000) {
          customers[custIndex].membershipLevel = "Gold";
        } else if (customers[custIndex].totalSpent >= 15000) {
          customers[custIndex].membershipLevel = "Silver";
        }
      } else {
        // Create new customer
        const earnedPoints = Math.floor(newOrder.total / 100);
        customers.push({
          id: `C${customers.length + 1}`,
          name: orderData.customerName || "Walk-in Customer",
          phone: orderData.customerPhone,
          loyaltyPoints: earnedPoints,
          membershipLevel: "Bronze",
          orderCount: 1,
          totalSpent: newOrder.total
        });
      }
    }

    res.status(201).json(newOrder);
  });

  // Update Order (Status change, payment processing, split billing)
  app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
      const oldStatus = orders[orderIndex].status;
      const updatedOrder = {
        ...orders[orderIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Automatic stock reduction when order becomes Prepared/Completed
      if (updatedOrder.status === "Completed" && oldStatus !== "Completed") {
        deductIngredientsForOrder(updatedOrder);

        // If Dine In, mark table as Cleaning
        if (updatedOrder.tableId) {
          const tblIndex = tables.findIndex(t => t.id === updatedOrder.tableId);
          if (tblIndex !== -1) {
            tables[tblIndex].status = "Cleaning";
            tables[tblIndex].currentOrderId = undefined;
          }
        }
      }

      orders[orderIndex] = updatedOrder;
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Get Inventory / Ingredients
  app.get("/api/inventory", (req, res) => {
    res.json(ingredients);
  });

  // Update Inventory Item
  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { stock, costPerUnit } = req.body;
    const idx = ingredients.findIndex(i => i.id === id);
    if (idx !== -1) {
      if (stock !== undefined) ingredients[idx].stock = stock;
      if (costPerUnit !== undefined) ingredients[idx].costPerUnit = costPerUnit;
      res.json(ingredients[idx]);
    } else {
      res.status(404).json({ error: "Inventory item not found" });
    }
  });

  // Get CRM Customers
  app.get("/api/customers", (req, res) => {
    res.json(customers);
  });

  // Get Expenses
  app.get("/api/expenses", (req, res) => {
    res.json(expenses);
  });

  // Add Expense
  app.post("/api/expenses", (req, res) => {
    const { category, categorySinhala, amount, description } = req.body;
    const newExpense: Expense = {
      id: `EXP${expenses.length + 1}`,
      category,
      categorySinhala,
      amount: Number(amount),
      description,
      date: new Date().toISOString().split('T')[0]
    };
    expenses.push(newExpense);
    res.status(201).json(newExpense);
  });

  // Get Dashboard Analytics Report
  app.get("/api/reports", (req, res) => {
    // Calculate total sales
    const completedOrders = orders.filter(o => o.status === "Completed" && o.paymentStatus === "Paid");
    const todaySales = completedOrders
      .filter(o => o.createdAt.startsWith(new Date().toISOString().split('T')[0]))
      .reduce((sum, o) => sum + o.total, 0);

    const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Count open/occupied tables
    const openTables = tables.filter(t => t.status === "Available").length;
    const occupiedTables = tables.filter(t => t.status === "Occupied").length;
    const reservedTables = tables.filter(t => t.status === "Reserved").length;
    const cleaningTables = tables.filter(t => t.status === "Cleaning").length;

    // Kitchen pending count
    const kitchenPending = orders.filter(o => ["Pending", "Accepted", "Preparing"].includes(o.status)).length;

    // Top selling foods calculation
    const foodCounts: { [key: string]: { name: string, nameSinhala: string, count: number, revenue: number } } = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!foodCounts[item.menuItemId]) {
          foodCounts[item.menuItemId] = {
            name: item.name,
            nameSinhala: item.nameSinhala,
            count: 0,
            revenue: 0
          };
        }
        foodCounts[item.menuItemId].count += item.quantity;
        foodCounts[item.menuItemId].revenue += item.totalPrice;
      });
    });

    const topSelling = Object.values(foodCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Mock weekly chart data (last 7 days including today)
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySales = weekdays.map((day, idx) => {
      // Seed a realistic random curves of sales
      const seedAmounts = [125000, 148000, 95000, 112000, 134000, 185000, 224000];
      return {
        day,
        amount: seedAmounts[idx] + (idx === new Date().getDay() ? todaySales : 0),
        orders: 12 + idx
      };
    });

    // Expenses total
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      metrics: {
        todaySales: todaySales || 58450, // default placeholder if no sales today yet
        monthlySales: totalSales + 845000, // seed a realistic monthly base
        ordersToday: orders.filter(o => o.createdAt.startsWith(new Date().toISOString().split('T')[0])).length + 14,
        openTables,
        occupiedTables,
        reservedTables,
        cleaningTables,
        kitchenPending,
        totalExpenses
      },
      topSelling,
      weeklySales,
      recentActivity: orders.slice(-5).reverse().map(o => ({
        id: o.id,
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        orderNumber: o.orderNumber,
        type: o.type,
        total: o.total,
        status: o.status
      }))
    });
  });

  // --- GEMINI AI SALES PREDICTOR ---
  app.post("/api/ai/predict", async (req, res) => {
    try {
      const completedOrders = orders.filter(o => o.status === "Completed");
      const currentInventory = ingredients.map(i => ({ name: i.name, stock: i.stock, unit: i.unit }));
      
      const salesDataSummary = completedOrders.map(o => ({
        type: o.type,
        total: o.total,
        items: o.items.map(it => `${it.quantity}x ${it.name}`)
      }));

      const systemPrompt = `You are a world-class restaurant revenue optimizer and AI operations executive for 'Pelkote Restaurant' in Sri Lanka.
Using the provided inventory, menus, and current orders, formulate a concise, professional analytics prediction for tomorrow's business.
You MUST output your response strictly in JSON format matching the schema requested below.
Do not wrap in any extra text or markdown formatting except the raw JSON itself.
Ensure currency details use 'LKR' (Sri Lankan Rupees). Include:
1. predictedSales LKR value
2. busyHours (top 2 peak hour predictions)
3. recommendedPromo (promotional idea for excess inventory or slow items)
4. inventoryWarning (list of items at risk of running out)
5. sinhalaSummary (a beautiful 1-2 sentence summary in Sinhala language so local staff can read it)`;

      const userMessage = `Current Inventory:\n${JSON.stringify(currentInventory, null, 2)}\n\nRecent Sales Logs:\n${JSON.stringify(salesDataSummary, null, 2)}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                predictedSales: { type: Type.NUMBER, description: "Predicted sales in LKR for tomorrow." },
                busyHours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of peak hours e.g. '12:00 PM - 2:00 PM'" },
                recommendedPromo: { type: Type.STRING, description: "Promotional strategy based on inventory levels." },
                inventoryWarning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alerts for items running low." },
                sinhalaSummary: { type: Type.STRING, description: "Beautiful Sinhala summary for Sri Lankan staff." }
              },
              required: ["predictedSales", "busyHours", "recommendedPromo", "inventoryWarning", "sinhalaSummary"]
            }
          }
        });

        const textResult = response.text;
        res.json(JSON.parse(textResult.trim()));
      } else {
        // Mock fallback prediction if no API key is specified
        res.json({
          predictedSales: 168500,
          busyHours: ["12:30 PM - 2:00 PM", "7:00 PM - 9:30 PM"],
          recommendedPromo: "Offer 10% discount on 'Traditional Egg Hoppers' paired with 'EGB Ginger Beer' during evening hours to use excess egg stocks.",
          inventoryWarning: ["Fresh Chicken Breast (stock at 15kg - below 20kg threshold)", "EGB Ginger Beer Can (stock at 12 units - below 24 threshold)"],
          sinhalaSummary: "හෙට දින විකුණුම් රු. 168,500ක් දක්වා ඉහළ යා හැකි අතර, බිත්තර ආප්ප සහ ඉඟුරු බීර ප්‍රවර්ධන වැඩසටහන් මඟින් වැඩි ලාභයක් ලබාගත හැකිය."
        });
      }
    } catch (e: any) {
      console.error("AI Sales Predict error:", e);
      res.status(500).json({ error: "AI Prediction Service failed: " + e.message });
    }
  });

  // Serve static assets in production, setup Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pelkote Restaurant POS Server listening on http://localhost:${PORT}`);
  });
}

startServer();
