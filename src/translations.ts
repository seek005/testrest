export interface TranslationDict {
  appName: string;
  tagline: string;
  dashboard: string;
  orders: string;
  tables: string;
  kitchen: string;
  billing: string;
  inventory: string;
  customers: string;
  expenses: string;
  settings: string;
  languages: string;
  logout: string;
  todaySales: string;
  monthlySales: string;
  ordersToday: string;
  openTables: string;
  occupiedTables: string;
  kitchenPending: string;
  topSelling: string;
  recentActivities: string;
  lowStockAlert: string;
  liveClock: string;
  available: string;
  reserved: string;
  occupied: string;
  cleaning: string;
  tableMerge: string;
  tableSplit: string;
  tableTransfer: string;
  reservation: string;
  qrCode: string;
  dineIn: string;
  takeAway: string;
  delivery: string;
  cookingNotes: string;
  pending: string;
  accepted: string;
  preparing: string;
  ready: string;
  served: string;
  completed: string;
  cancelled: string;
  total: string;
  subtotal: string;
  discount: string;
  tax: string;
  serviceCharge: string;
  paymentMethod: string;
  payNow: string;
  printReceipt: string;
  reprint: string;
  emailReceipt: string;
  whatsappReceipt: string;
  customerName: string;
  phone: string;
  loyaltyPoints: string;
  membership: string;
  activeRiders: string;
  deliveryStatus: string;
  otpCode: string;
  aiSalesPrediction: string;
  aiPredictBtn: string;
  aiSinhalaSummary: string;
  popular: string;
  chefSpecial: string;
  recommended: string;
  categories: string;
  all: string;
  addToCart: string;
  cart: string;
  checkout: string;
  addExpense: string;
  amount: string;
  description: string;
  date: string;
  addBtn: string;
  stock: string;
  unit: string;
  minStock: string;
  supplier: string;
  cost: string;
  back: string;
  confirm: string;
  cancel: string;
}

export const translations: { en: TranslationDict; si: TranslationDict } = {
  en: {
    appName: "Pelkote Restaurant POS",
    tagline: "Fresh Food • Fast Service",
    dashboard: "Dashboard",
    orders: "New Order",
    tables: "Tables Layout",
    kitchen: "Kitchen (KDS)",
    billing: "Cashier Billing",
    inventory: "Inventory",
    customers: "CRM & Riders",
    expenses: "Expenses Tracker",
    settings: "POS Settings",
    languages: "Language Settings",
    logout: "Logout",
    todaySales: "Today's Sales",
    monthlySales: "Monthly Sales",
    ordersToday: "Orders Today",
    openTables: "Open Tables",
    occupiedTables: "Occupied Tables",
    kitchenPending: "Kitchen Pending",
    topSelling: "Top Selling Foods",
    recentActivities: "Recent Activities",
    lowStockAlert: "Low Stock Alert",
    liveClock: "Live POS Clock",
    available: "Available",
    reserved: "Reserved",
    occupied: "Occupied",
    cleaning: "Cleaning",
    tableMerge: "Merge Tables",
    tableSplit: "Split Bill",
    tableTransfer: "Transfer Table",
    reservation: "Reservation",
    qrCode: "Table QR Code",
    dineIn: "Dine In",
    takeAway: "Take Away",
    delivery: "Delivery",
    cookingNotes: "Cooking Notes",
    pending: "Pending",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served",
    completed: "Completed",
    cancelled: "Cancelled",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "VAT (15%)",
    serviceCharge: "Service Charge (10%)",
    paymentMethod: "Payment Method",
    payNow: "Settle & Settle Pay",
    printReceipt: "Print Receipt (80mm)",
    reprint: "Reprint",
    emailReceipt: "Email Receipt",
    whatsappReceipt: "WhatsApp Receipt",
    customerName: "Customer Name",
    phone: "Phone Number",
    loyaltyPoints: "Loyalty Points",
    membership: "Membership Level",
    activeRiders: "Active Riders",
    deliveryStatus: "Delivery Status",
    otpCode: "Delivery OTP",
    aiSalesPrediction: "AI Sales Predictor & Insights",
    aiPredictBtn: "Ask Gemini AI to Predict Tomorrow",
    aiSinhalaSummary: "AI Sinhala Translation",
    popular: "Popular",
    chefSpecial: "Chef's Special",
    recommended: "Recommended",
    categories: "Categories",
    all: "All Items",
    addToCart: "Add to Order",
    cart: "Current Cart",
    checkout: "Process Order",
    addExpense: "Log Expense",
    amount: "Amount (LKR)",
    description: "Description",
    date: "Date",
    addBtn: "Add Item",
    stock: "Stock In Hand",
    unit: "Unit",
    minStock: "Min Stock Alert Level",
    supplier: "Supplier",
    cost: "Unit Cost",
    back: "Go Back",
    confirm: "Confirm",
    cancel: "Cancel"
  },
  si: {
    appName: "පෙල්කොටේ POS පද්ධතිය",
    tagline: "නැවුම් ආහාර • වේගවත් සේවය",
    dashboard: "උපකරණ පුවරුව",
    orders: "නව ඇණවුම",
    tables: "මේස සැකැස්ම",
    kitchen: "මුළුතැන්ගෙය (KDS)",
    billing: "මුදල් අයකැමි",
    inventory: "තොග කළමනාකරණය",
    customers: "පාරිභෝගිකයින් & රයිඩර්ස්",
    expenses: "වියදම් සටහන",
    settings: "සැකසුම්",
    languages: "භාෂා සැකසුම්",
    logout: "පද්ධතියෙන් ඉවත් වන්න",
    todaySales: "අද දින විකුණුම්",
    monthlySales: "මාසික විකුණුම්",
    ordersToday: "අද දින ඇණවුම්",
    openTables: "හිස් මේස ගණන",
    occupiedTables: "පිරුණු මේස ගණන",
    kitchenPending: "මුළුතැන්ගෙයි ඇණවුම්",
    topSelling: "වැඩිපුරම අලෙවි වූ කෑම",
    recentActivities: "මෑතකාලීන ක්‍රියාකාරකම්",
    lowStockAlert: "අඩු තොග අනතුරු ඇඟවීම්",
    liveClock: "සජීවී POS ඔරලෝසුව",
    available: "ඇත",
    reserved: "වෙන් කර ඇත",
    occupied: "භාවිතයේ පවතී",
    cleaning: "පිරිසිදු කරමින්",
    tableMerge: "මේස ඒකාබද්ධ කිරීම",
    tableSplit: "බිල්පත බෙදීම",
    tableTransfer: "මේස මාරු කිරීම",
    reservation: "වෙන් කිරීම්",
    qrCode: "මේසයේ QR කේතය",
    dineIn: "මෙතැනින් අනුභවය (Dine In)",
    takeAway: "රැගෙන යාම (Take Away)",
    delivery: "නිවසටම ගෙන්වා ගැනීම",
    cookingNotes: "පිසීමේ උපදෙස්",
    pending: "පොරොත්තු ලැයිස්තුවේ",
    accepted: "පිළිගෙන ඇත",
    preparing: "සූදානම් කරමින්",
    ready: "සූදානම් කර ඇත",
    served: "පිළිගන්වා ඇත",
    completed: "නිම කරන ලදී",
    cancelled: "අවලංගු කරන ලදී",
    total: "එකතුව",
    subtotal: "අනු එකතුව",
    discount: "වට්ටම්",
    tax: "වැට් බද්ද (15%)",
    serviceCharge: "සේවා ගාස්තුව (10%)",
    paymentMethod: "ගෙවීම් ක්‍රමය",
    payNow: "බිල පියවන්න",
    printReceipt: "බිල්පත මුද්‍රණය (80mm)",
    reprint: "නැවත මුද්‍රණය",
    emailReceipt: "විද්‍යුත් තැපෑලෙන් යවන්න",
    whatsappReceipt: "WhatsApp මඟින් යවන්න",
    customerName: "පාරිභෝගිකයාගේ නම",
    phone: "දුරකථන අංකය",
    loyaltyPoints: "ලෝයල්ටි ලකුණු",
    membership: "සාමාජික මට්ටම",
    activeRiders: "සක්‍රීය රයිඩර්ස්",
    deliveryStatus: "බෙදාහැරීමේ තත්ත්වය",
    otpCode: "OTP කේතය",
    aiSalesPrediction: "Gemini AI විකුණුම් අනාවැකිය",
    aiPredictBtn: "හෙට දින අනාවැකිය Gemini AI මඟින් අසන්න",
    aiSinhalaSummary: "AI සිංහල පරිවර්තනය",
    popular: "ජනප්‍රිය",
    chefSpecial: "චෙෆ්ගේ විශේෂ කෑම",
    recommended: "නිර්දේශිත",
    categories: "වර්ගීකරණයන්",
    all: "සියලුම කෑම වර්ග",
    addToCart: "ඇණවුමට එක් කරන්න",
    cart: "වත්මන් ඇණවුම",
    checkout: "ඇණවුම තහවුරු කරන්න",
    addExpense: "වියදමක් එක් කරන්න",
    amount: "මුදල (රු.)",
    description: "විස්තරය",
    date: "දිනය",
    addBtn: "එක් කරන්න",
    stock: "වත්මන් තොගය",
    unit: "ඒකකය",
    minStock: "අවම තොග මට්ටම",
    supplier: "සැපයුම්කරු",
    cost: "ඒකක පිරිවැය",
    back: "ආපසු",
    confirm: "තහවුරු කරන්න",
    cancel: "අවලංගු කරන්න"
  }
};
