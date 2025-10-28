for cart :

      Arrow functions: MAD, applyCoupon, computeLineTotal, processOrder.
      
      if/else + guards: Validate lines and customer fields.
      
      Ternary: Free shipping logic and currency fallback.
      
      switch: Coupon handling + regional delivery notes.
      
      Loops:
      
      for...of to iterate items
      
      for...in to inspect object fields
      
      while to progressively apply loyalty discounts
      
      do...while to retry payment at least once
      
      continue/break: Skip invalid items; early abort on fraudulent SKU.
      
      null vs undefined:
      
      email: null → intentionally empty (we print a note).
      
      phone: undefined → missing field (we print a warning).
      
for Student : 

      Creation & mutation: push, splice, property updates
      
      Access/search: find, findIndex, filter
      
      Transforms: map (build report rows), computed fields (avg)
      
      Aggregation: reduce (in average)
      
      Ordering: sort by name and by computed average
      
      Loops: for...of, classic for
      
      Guards/validation: clean handling of invalid inputs

for Order Processor Demo

      This project is a **Node.js educational script** showing how to process a small e-commerce order while demonstrating essential **JavaScript core concepts**.
      ## 🚀 Features
      ✅ Demonstrates:
      - `null` vs `undefined` handling  
      - **Arrow functions** and **ternary operators**  
      - **Switch** statements for coupon logic  
      - **Destructuring**, early returns, and guards  
      - Loops: `for...in`, `for...of`, `while`, `do...while`  
      - Control flow with `continue` and `break`  
      - Optional chaining `?.` and nullish coalescing `?? 
      ✅ Business logic:
      - Coupon engine (`PERCENT10`, `FLAT20`)  
      - Shipping & tax calculation  
      - Loyalty points discount (10 pts → 10 MAD off)  
      - Payment retries simulated with `do...while`
      ## 🧠 How It Works
      1. **Customer data** includes intentional `null` and `undefined` values to show difference.  
      2. **Cart items** include valid and invalid lines (to test guards and `continue`).  
      3. Each valid item is processed:
         - Coupon applied
         - Total computed  
         - Invalid items skipped  
      4. Totals, taxes, and loyalty discounts are applied.  
      5. Payment simulated — success on second attempt.  
      6. Invoice summary printed to console.
      
 




