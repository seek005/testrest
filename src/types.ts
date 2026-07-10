export type UserRole = 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen Staff' | 'Delivery Rider' | 'Owner';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning';

export interface RestaurantTable {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  reservationName?: string;
  reservationTime?: string;
  section: 'Main Hall' | 'VIP Room' | 'Garden' | 'Terrace';
}

export interface MenuItemSize {
  name: string; // 'Small' | 'Medium' | 'Large'
  price: number;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameSinhala: string;
  category: string;
  categorySinhala: string;
  basePrice: number;
  sizes?: MenuItemSize[];
  modifiers?: MenuItemModifier[];
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  isChefSpecial?: boolean;
  description?: string;
  descriptionSinhala?: string;
}

export type OrderType = 'Dine In' | 'Take Away' | 'Delivery';

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  nameSinhala: string;
  quantity: number;
  selectedSize?: string;
  selectedModifiers?: MenuItemModifier[];
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number; // e.g. 10%
  tax: number; // e.g. 15% VAT
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod?: 'Cash' | 'Card' | 'QR' | 'Bank Transfer';
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';
  customerPhone?: string;
  customerName?: string;
  cookingNotes?: string;
  createdAt: string;
  updatedAt: string;
  riderId?: string;
  deliveryStatus?: 'Assigned' | 'Picked Up' | 'Near Customer' | 'Delivered';
  otpCode?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  nameSinhala: string;
  stock: number;
  unit: string; // kg, liters, units, etc.
  minStock: number; // Threshold for alert
  costPerUnit: number;
  supplier: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  loyaltyPoints: number;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  orderCount: number;
  totalSpent: number;
}

export interface SalesReportData {
  date: string;
  amount: number;
  orders: number;
}

export interface Expense {
  id: string;
  category: 'Electricity' | 'Water' | 'Gas' | 'Rent' | 'Salary' | 'Ingredients' | 'Other';
  categorySinhala: string;
  amount: number;
  description: string;
  date: string;
}
