// -------------------- Mock Data --------------------
const customer = {
  id: 101,
  name: "Hamza",
  email: null,           // <- Intentionally no email (null on purpose)
  phone: undefined,      // <- Missing value (never set)
  loyaltyPoints: 37,     // Every 10 points = 10 MAD discount (simple rule)
  address: {
    line1: "123 Avenue EMSI",
    city: "Rabat",
    zip: "10000"
  }
};

const cart = [
  { sku: "BK-100", name: "JS Book", price: 120, qty: 1, coupon: "PERCENT10" },
  { sku: "HD-500", name: "Headphones", price: 300, qty: 1, coupon: undefined },
  { sku: "CS-200", name: "Course Voucher", price: 0,   qty: 1, coupon: "FLAT20" }, // invalid line (price 0)
  { sku: "KB-220", name: "Keyboard",    price: 210, qty: 0, coupon: "UNKNOWN" },  // invalid line (qty 0)
];

// -------------------- Helper (Arrow) Functions --------------------
// Format currency (arrow + ternary inside)
const MAD = n => `${(n ?? 0).toFixed(2)} MAD`;

// Coupon logic using switch
const applyCoupon = (base, coupon) => {
  switch (coupon) {
    case "PERCENT10":
      return base * 0.10;               // 10% off
    case "FLAT20":
      return Math.min(20, base);         // 20 MAD off max base
    case undefined:
    case null:
      return 0;                          // no coupon provided
    default:
      // Unknown coupon => warn but no discount
      console.warn(`⚠️ Unknown coupon: ${coupon} (ignored)`);
      return 0;
  }
};

// Compute each line total (uses conditions and early returns)
const computeLineTotal = (item) => {
  if (item == null) return 0; // guard if null/undefined item
  const { price, qty } = item;

  // Reject invalid lines (use continue later, but here we also protect)
  if (typeof price !== "number" || typeof qty !== "number") return 0;
  if (price <= 0 || qty <= 0) return 0;

  const base = price * qty;
  const discount = applyCoupon(base, item.coupon);
  return base - discount;
};

// -------------------- Core Processor --------------------
const processOrder = (customer, cart) => {
  console.log("=== ORDER PROCESSOR ===");

  // Show difference: null vs undefined
  // - null email = intentionally empty -> we might allow checkout but recommend fix
  // - undefined phone = missing data -> we may enforce a default or mark as required
  console.log(`Email is ${customer.email === null ? "INTENTIONALLY empty (null)" : "provided"}`);
  console.log(`Phone is ${customer.phone === undefined ? "MISSING (undefined)" : "provided"}`);

  // Inspect customer fields via for...in
  console.log("\nCustomer fields overview (for...in):");
  for (const key in customer) {
    if (typeof customer[key] === "object" && customer[key] !== null) {
      console.log(`  ${key}: [object]`);
      continue; // show skip via continue
    }
    console.log(`  ${key}: ${customer[key]}`);
  }

  // Iterate cart with for...of; skip bad lines with continue
  let itemsTotal = 0;
  console.log("\nLine items:");
  for (const item of cart) {
    if (!item || item.price <= 0 || item.qty <= 0) {
      console.warn(`  Skipped invalid line: ${JSON.stringify(item)}`);
      continue; // demonstrate continue
    }
    const line = computeLineTotal(item);
    console.log(`  - ${item.name} x${item.qty}: ${MAD(line)}`);
    itemsTotal += line;

    // Example break: if a suspicious SKU is found, stop (demo)
    if (item.sku === "FRAUD-999") {
      console.error("  Fraudulent SKU detected. Abort.");
      break;
    }
  }

  // Shipping rule with ternary
  const shipping = itemsTotal >= 200 ? 0 : 30; // free shipping threshold
  // Taxes simple flat 10%
  const taxes = itemsTotal * 0.10;

  // Apply loyalty via a while loop: every 10 points => 10 MAD discount (cap so total doesn't go below 0)
  let loyaltyDiscount = 0;
  let points = customer.loyaltyPoints | 0; // ensure number
  while (points >= 10 && (itemsTotal - loyaltyDiscount) > 0) {
    loyaltyDiscount += 10;
    points -= 10;
  }

  // Simulate payment retries with do...while (runs at least once)
  let attempt = 0;
  let paid = false;
  do {
    attempt++;
    // Fake rule: if attempt >= 2, succeed (just to show do...while)
    paid = attempt >= 2;
    console.log(`Payment attempt #${attempt}: ${paid ? "SUCCESS" : "FAILED"}`);
  } while (!paid && attempt < 3);

  const grandTotal = Math.max(0, itemsTotal + shipping + taxes - loyaltyDiscount);

  // Pretty invoice
  console.log("\n=== INVOICE ===");
  console.log(`Items total:        ${MAD(itemsTotal)}`);
  console.log(`Shipping (rule):    ${shipping === 0 ? "FREE" : MAD(shipping)}`);
  console.log(`Taxes (10%):        ${MAD(taxes)}`);
  console.log(`Loyalty discount:  -${MAD(loyaltyDiscount)} (used ${customer.loyaltyPoints - points} pts)`);
  console.log(`--------------------------------`);
  console.log(`Grand Total:        ${MAD(grandTotal)}`);

  // Post-check recommendations using if/else
  if (customer.email === null) {
    console.log("Note: Add an email to receive your invoice.");
  } else if (customer.email === undefined) {
    console.log("Warning: Email field missing entirely.");
  }

  // Use switch on city for regional note
  switch (customer.address?.city) {
    case "Rabat":
      console.log("Delivery note: Rabat hub — next-day delivery available.");
      break;
    case "Casablanca":
      console.log("Delivery note: Casa hub — same-day pickup possible.");
      break;
    default:
      console.log("Delivery note: Standard region.");
  }

  return {
    ok: paid,
    totals: { itemsTotal, shipping, taxes, loyaltyDiscount, grandTotal },
    remainingPoints: points,
    attempts: attempt
  };
};

// -------------------- Run Demo --------------------
processOrder(customer, cart);
