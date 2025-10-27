// ===============================
// 🍽️ Restaurant Mini-Project
// Focus: Objects & Destructuring
// ===============================

// --- 1) Menu (object of objects) ---
const menu = {
  PZ01: { sku: "PZ01", name: "Margherita Pizza", price: 65, category: "pizza" },
  PZ02: { sku: "PZ02", name: "Pepperoni Pizza", price: 75, category: "pizza" },
  PS01: { sku: "PS01", name: "Caesar Salad", price: 42, category: "salad" },
  DR01: {
    sku: "DR01",
    name: "Fresh Lemon Juice",
    price: 18,
    category: "drink",
  },
  DR02: { sku: "DR02", name: "Mineral Water", price: 10, category: "drink" },
  DS01: {
    sku: "DS01",
    name: "Chocolate Mousse",
    price: 28,
    category: "dessert",
  },
};

// --- 2) Helpers (showing destructuring everywhere) ---
const MAD = (n) => `${n.toFixed(2)} MAD`;

const getItem = (sku) => menu[sku] ?? null;

const lineTotal = ({ sku, qty }) => {
  const item = getItem(sku);
  if (!item || qty <= 0) return 0;
  const { price } = item; // destructuring from object
  return price * qty;
};

// Coupon engine using switch + destructuring in params with defaults
function computeDiscount({ subtotal, coupon = null }) {
  switch (coupon) {
    case "WELCOME10":
      return Math.min(10, subtotal * 0.1); // max 10 MAD or 10%
    case "DRINKS5":
      return 5; // flat 5 MAD
    case null:
    case undefined:
      return 0;
    default:
      console.warn(`⚠️ Unknown coupon ${coupon} (ignored)`);
      return 0;
  }
}

const TAX_RATE = 0.1;
const SERVICE_RATE = 0.05;

// --- 3) Order Model (object with nested objects) ---
const createOrder = ({ table, server, coupon = null }) => ({
  id: cryptoRandomId(),
  table,
  server,
  status: "OPEN", // OPEN → SENT_TO_KITCHEN → SERVED → PAID/CANCELLED
  coupon,
  // items: array of { sku, qty }
  items: [],
  createdAt: new Date(),
});

// Random (friendly) id for demo
function cryptoRandomId() {
  return "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// --- 4) Repo (very light in-memory store) ---
const store = { orders: [] };

// --- 5) Core operations (OBJECTS + DESTRUCTURING HEAVY) ---

// Add one line item; if same sku exists, merge qty
function addItem(order, { sku, qty = 1 }) {
  if (!getItem(sku)) throw new Error(`Unknown SKU: ${sku}`);
  const line = order.items.find((l) => l.sku === sku);
  line ? (line.qty += qty) : order.items.push({ sku, qty });
  return order;
}

// Remove or decrement
function removeItem(order, { sku, qty = 1 }) {
  const idx = order.items.findIndex((l) => l.sku === sku);
  if (idx === -1) return order;
  const line = order.items[idx];
  line.qty -= qty;
  if (line.qty <= 0) order.items.splice(idx, 1);
  return order;
}

// Totals using destructuring of line objects
function computeTotals(order) {
  const subtotal = order.items.reduce(
    (sum, { sku, qty }) => sum + lineTotal({ sku, qty }),
    0
  );
  const discount = computeDiscount({ subtotal, coupon: order.coupon });
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxes = afterDiscount * TAX_RATE;
  const service = afterDiscount * SERVICE_RATE;
  const total = afterDiscount + taxes + service;
  return { subtotal, discount, taxes, service, total };
}

// Update status with safety
function setStatus(order, next) {
  const transitions = {
    OPEN: ["SENT_TO_KITCHEN", "CANCELLED"],
    SENT_TO_KITCHEN: ["SERVED", "CANCELLED"],
    SERVED: ["PAID"],
    PAID: [],
    CANCELLED: [],
  };
  const allowed = transitions[order.status] || [];
  if (!allowed.includes(next))
    throw new Error(`Invalid transition ${order.status} → ${next}`);
  order.status = next;
  return order;
}

// Pretty print (object → array of row objects with destructuring)
function orderReport(order) {
  const { subtotal, discount, taxes, service, total } = computeTotals(order);
  const rows = order.items.map(({ sku, qty }) => {
    const { name, price } = getItem(sku);
    return { sku, name, qty, price: MAD(price), line: MAD(price * qty) };
  });
  return {
    rows,
    totals: {
      subtotal: MAD(subtotal),
      discount: `- ${MAD(discount)}`,
      taxes: MAD(taxes),
      service: MAD(service),
      total: MAD(total),
    },
  };
}

// --- 6) Kitchen Queue (objects + destructuring) ---
const kitchenQueue = [];

// Build a compact ticket object using nested destructuring + rest
function toKitchenTicket(order) {
  const { id, table, server, items, ...restMeta } = order; // rest collects remaining meta
  const ticketItems = items.map(({ sku, qty }) => {
    const { name, category } = getItem(sku);
    return { sku, name, category, qty };
  });
  return { id, table, server, ticketItems, meta: restMeta };
}

function sendToKitchen(order) {
  setStatus(order, "SENT_TO_KITCHEN");
  kitchenQueue.push(toKitchenTicket(order));
  return order;
}

function markServed(order) {
  setStatus(order, "SERVED");
  // remove from queue by id
  const idx = kitchenQueue.findIndex((t) => t.id === order.id);
  if (idx !== -1) kitchenQueue.splice(idx, 1);
  return order;
}

// --- 7) Demo Flow ---
const orderA = createOrder({
  table: 12,
  server: "Mariam",
  coupon: "WELCOME10",
});
store.orders.push(orderA);

addItem(orderA, { sku: "PZ02", qty: 2 });
addItem(orderA, { sku: "DR01", qty: 3 });
addItem(orderA, { sku: "DS01", qty: 1 });
removeItem(orderA, { sku: "DR01", qty: 1 }); // customer changed mind (keeps 2)

console.log("Order created:", orderA.id, "status:", orderA.status);

// Print bill preview
let rep = orderReport(orderA);
console.table(rep.rows);
console.log(rep.totals);

// Send to kitchen
sendToKitchen(orderA);
console.log("\nKitchen queue after sending:");
console.table(
  kitchenQueue.flatMap((t) =>
    t.ticketItems.map((i) => ({
      order: t.id,
      table: t.table,
      item: i.name,
      qty: i.qty,
    }))
  )
);

// Mark served, then compute final totals and pay
markServed(orderA);
const { total } = computeTotals(orderA);
setStatus(orderA, "PAID");
console.log(`\nOrder ${orderA.id} is SERVED → PAID. Total = ${MAD(total)}.`);

// --- 8) Bonus: Queries using destructuring ---
// 8.1 Get all drinks ordered today
const drinksOrdered = orderA.items
  .map(({ sku, qty }) => ({ ...getItem(sku), qty }))
  .filter(({ category }) => category === "drink");
console.log("\nDrinks in this order:");
console.table(
  drinksOrdered.map(({ name, qty, price }) => ({
    name,
    qty,
    price: MAD(price),
    line: MAD(price * qty),
  }))
);

// 8.2 Sales by category (simple aggregation)
const salesByCategory = orderA.items.reduce((acc, { sku, qty }) => {
  const { category, price } = getItem(sku);
  acc[category] = (acc[category] ?? 0) + price * qty;
  return acc;
}, {});
console.log("\nSales by category:");
console.table(
  Object.entries(salesByCategory).map(([category, amount]) => ({
    category,
    amount: MAD(amount),
  }))
);
