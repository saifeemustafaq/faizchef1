# Custom Items Data Structure - Integration Specification

## Overview
This document defines the data structure for custom items added by users in the User Portal that need to be reviewed and approved by administrators in the Admin Portal.

---

## System Behavior & Workflow

### User Portal - Current Flow

1. **User searches for an item** in the main inventory (Items tab with ~50 predefined items)
2. **If item doesn't exist** in the master inventory, user navigates to the Extra Items tab
3. **User adds a custom item** by providing:
   - Item Name (required)
   - Store (optional - may be left blank)
   - Quantity (required - for adding to cart)
   - Unit (required - selected from dropdown)
   - Category (optional - may be left blank)
4. **Custom item is saved** in the `extraItemsHistory` array in the database
5. **Item is added to the user's current cart** with the specified quantity
6. **Item remains in history** for future quick-add reference

### Admin Portal - Desired Workflow

1. **Admin Portal reads** from the same database that User Portal writes to
2. **Custom items appear** as "pending items to review" from the `extraItemsHistory` array
3. **Admin reviews each custom item** and sees:
   - ✅ Item Name (always provided by user)
   - ⚠️ Store (might be blank/undefined)
   - ✅ Unit (always provided by user)
   - ⚠️ Category (might be blank/undefined)
4. **Admin fills in missing information**:
   - If Store is blank, admin selects/enters appropriate store
   - If Category is blank, admin selects appropriate category
5. **Admin approves the item**
6. **Item is added to the master inventory list** (the main Items array)
7. **Master inventory syncs** back to User Portal automatically
8. **All users can now see** the new item in their Items tab

### Technical Setup

- **Both portals point to the same database** (currently JSON, will migrate to MongoDB)
- **User Portal writes** new custom items → `extraItemsHistory` array
- **Admin Portal reads** custom items ← `extraItemsHistory` array
- **Admin Portal writes** approved items → `items` array (master inventory)
- **User Portal reads** updated inventory ← `items` array
- **Quantity is NOT part of item definition** - it's cart-specific, not item-specific
  - Quantity is used when adding to cart but is NOT saved in `extraItemsHistory`
  - Quantity is NOT sent to Admin Portal
  - Quantity changes every time a user adds an item to their cart

### Why Quantity is Excluded

**Important**: The `extraItemsHistory` is about **item definitions**, not cart transactions.

- ❌ Quantity is NOT included in custom item data
- ✅ Quantity is used when adding the item to the user's cart
- ✅ Item definition (name, store, unit, category) is what gets reviewed and approved
- Example: If 5 different users add "Organic Quinoa" with quantities of 2, 5, 10, 3, and 8 respectively, the Admin only sees ONE item definition for "Organic Quinoa" to review and approve.

---

## Data Flow

```
User Portal (Write) → Shared Database (JSON) → Admin Portal (Read) → Review & Approve → Master Inventory
```

1. **User Portal**: Adds custom items to `extraItemsHistory` array
2. **Admin Portal**: Reads from `extraItemsHistory` array
3. **Admin Portal**: Reviews, fills missing data, and approves items
4. **Admin Portal**: Adds approved items to master `items` array
5. **User Portal**: Reads updated master inventory from `items` array
6. **Users see the approved item** in their Items tab and can add it to their cart like any other item

---

## JSON File Structure

Both portals access the same `items.json` file (or equivalent database structure).

### File Location
```
data/items.json
```

### Root Structure
```json
{
  "stores": [...],
  "units": [...],
  "items": [...],
  "publishedCarts": [...],
  "extraItemsHistory": [...]
}
```

---

## Custom Items Schema

### Array Location
```
extraItemsHistory
```

### Field Definitions

| Field Name | Data Type | Required | Description | Example |
|------------|-----------|----------|-------------|---------|
| `id` | `string` | Yes | Unique identifier for the custom item | `"extra-1732647281234-a7f3k2m9"` |
| `name` | `string` | Yes | Name of the item as entered by user | `"Organic Quinoa"` |
| `store` | `string` or `undefined` | No | Store name (may be blank/undefined) | `"Trader Joe's"` or `undefined` |
| `unit` | `string` | Yes | Measurement unit abbreviation | `"lbs"` |
| `category` | `string` or `undefined` | No | Category name (may be blank/undefined) | `"Dry goods & grains"` or `undefined` |
| `addedAt` | `string` (ISO 8601) | Yes | Timestamp when item was added | `"2025-11-26T18:30:00.000Z"` |

### Data Types Detail

```typescript
type ExtraItem = {
  id: string;                    // Format: "extra-{timestamp}-{random}"
  name: string;                  // Min length: 1, Max length: 255
  store?: string;                // Optional, can be undefined or empty string
  unit: string;                  // Must match one of the valid unit abbreviations
  category?: string;             // Optional, can be undefined or empty string
  addedAt: string;               // ISO 8601 date string
};
```

---

## Valid Unit Values

The `unit` field must be one of these abbreviations:

| Abbreviation | Full Name |
|--------------|-----------|
| `lbs` | Pounds |
| `pkt` | Packets |
| `bunch` | Bunches |
| `case` | Cases |
| `gal` | Gallons |
| `oz` | Ounces |
| `g` | Grams |
| `btl` | Bottles |
| `can` | Cans |
| `pc` | Pieces |
| `box` | Boxes |
| `ct` | Count |
| `kg` | Kilograms |

---

## Valid Category Values

The `category` field (when provided) should be one of these:

1. `Produce (veg & fruit)`
2. `Dairy and Eggs`
3. `Bakery`
4. `Dry goods & grains`
5. `Legumes & pulses (dry)`
6. `Oils & fats`
7. `Spices (whole)`
8. `Spices & masalas (ground)`
9. `Condiments & sauces`
10. `Nuts & baking`
11. `Frozen`
12. `Canned & jarred`

**Note**: Category may be `undefined` or an empty string if the user didn't specify it.

---

## Valid Store Values

Common store values (user can enter any text):

- `Costco`
- `Walmart`
- `Safeway`
- `Trader Joe's`
- `Whole Foods`

**Note**: Store may be `undefined` or an empty string if the user didn't specify it. Users can also enter custom store names.

---

## Example JSON Data

### Complete Example
```json
{
  "id": "extra-1732647281234-a7f3k2m9",
  "name": "Organic Quinoa",
  "store": "Trader Joe's",
  "unit": "lbs",
  "category": "Dry goods & grains",
  "addedAt": "2025-11-26T18:30:00.000Z"
}
```

### Minimal Example (Required Fields Only)
```json
{
  "id": "extra-1732647350123-b8g4m3n1",
  "name": "Special Spice Mix",
  "unit": "oz",
  "addedAt": "2025-11-26T18:35:00.000Z"
}
```

### Multiple Items Array
```json
{
  "extraItemsHistory": [
    {
      "id": "extra-1732647281234-a7f3k2m9",
      "name": "Organic Quinoa",
      "store": "Trader Joe's",
      "unit": "lbs",
      "category": "Dry goods & grains",
      "addedAt": "2025-11-26T18:30:00.000Z"
    },
    {
      "id": "extra-1732647350123-b8g4m3n1",
      "name": "Special Spice Mix",
      "unit": "oz",
      "addedAt": "2025-11-26T18:35:00.000Z"
    },
    {
      "id": "extra-1732647400456-c9h5n4p2",
      "name": "Saffron Threads",
      "store": "Whole Foods",
      "unit": "g",
      "addedAt": "2025-11-26T18:40:00.000Z"
    }
  ]
}
```

---

## Admin Portal Integration Requirements

### 1. Reading Custom Items

The Admin Portal should:
- Connect to the same JSON file (`data/items.json`)
- Read the `extraItemsHistory` array
- Display items that are pending review

### 2. Expected Data Scenarios

Be prepared to handle:
- ✅ Complete items (all fields filled)
- ✅ Items with missing `store` (undefined or empty)
- ✅ Items with missing `category` (undefined or empty)
- ✅ Items with both `store` and `category` missing
- ✅ User-entered custom store names (not from the standard list)

### 3. Review & Approval Workflow

Admin should be able to:
1. View all items in `extraItemsHistory`
2. Fill in missing `store` if undefined
3. Fill in missing `category` if undefined
4. Approve the item

### 4. Approval Action

When an item is approved:
1. Create a new item in the master `items` array with this structure:

```json
{
  "id": "51",
  "name": "Organic Quinoa",
  "category": "Dry goods & grains",
  "store": "Trader Joe's",
  "unit": "lbs"
}
```

**Note**: 
- `id` should be a new unique ID for the master inventory (string format)
- Do NOT include `addedAt` in the master inventory
- Do NOT include quantity (quantity is cart-specific, not item-specific)

2. Optionally remove the item from `extraItemsHistory` (or mark it as processed)

---

## Master Inventory Item Schema

For reference, here's what items look like in the master `items` array after approval:

```typescript
type MasterItem = {
  id: string;           // Unique ID in master inventory
  name: string;         // Item name
  category: string;     // Must have a category (admin fills if missing)
  store: string;        // Must have a store (admin fills if missing)
  unit: string;         // Default unit for this item
};
```

### Example Master Inventory Item
```json
{
  "id": "51",
  "name": "Organic Quinoa",
  "category": "Dry goods & grains",
  "store": "Trader Joe's",
  "unit": "lbs"
}
```

---

## Important Notes

### 1. Quantity is NOT Included
- Custom items in `extraItemsHistory` do NOT contain quantity information
- Quantity is cart-specific and changes each time the item is added
- Only item definition metadata is shared between portals

### 2. ID Format
- User Portal IDs: `extra-{timestamp}-{random}`
- Master Inventory IDs: Simple incrementing numbers as strings (`"1"`, `"2"`, etc.)
- When approving, generate a new ID for the master inventory

### 3. Timestamp Format
- All dates use ISO 8601 format: `"YYYY-MM-DDTHH:mm:ss.sssZ"`
- Example: `"2025-11-26T18:30:00.000Z"`
- Parse using: `new Date(dateString)`

### 4. Optional Fields
- Always check if `store` and `category` exist before using
- Handle `undefined`, `null`, and empty string `""` cases
- Display placeholders like "Not Specified" or "Pending" in UI

### 5. Data Synchronization
- Both portals read from the same JSON file
- User Portal writes to `extraItemsHistory`
- Admin Portal writes to `items` (master inventory)
- Changes to `items` are immediately visible to User Portal users

---

## API Endpoints (Future)

If you migrate from JSON to a database with API endpoints:

### Get Custom Items (Admin Portal)
```
GET /api/extra-items
Response: Array of ExtraItem objects
```

### Approve Item (Admin Portal)
```
POST /api/items/approve
Body: {
  extraItemId: string,
  name: string,
  category: string,
  store: string,
  unit: string
}
Response: MasterItem object
```

---

## Testing Data

Here's sample data for testing the Admin Portal:

```json
{
  "extraItemsHistory": [
    {
      "id": "extra-1732647281234-a7f3k2m9",
      "name": "Organic Quinoa",
      "store": "Trader Joe's",
      "unit": "lbs",
      "category": "Dry goods & grains",
      "addedAt": "2025-11-26T18:30:00.000Z"
    },
    {
      "id": "extra-1732647350123-b8g4m3n1",
      "name": "Special Spice Mix",
      "unit": "oz",
      "addedAt": "2025-11-26T18:35:00.000Z"
    },
    {
      "id": "extra-1732647400456-c9h5n4p2",
      "name": "Saffron Threads",
      "store": "Whole Foods",
      "unit": "g",
      "addedAt": "2025-11-26T18:40:00.000Z"
    },
    {
      "id": "extra-1732647450789-d1i6o5q3",
      "name": "Ghee",
      "category": "Oils & fats",
      "unit": "btl",
      "addedAt": "2025-11-26T18:45:00.000Z"
    }
  ]
}
```

---

## Questions for Admin Portal Developer?

If you have questions, please confirm:
1. How to handle duplicate item names (should admin be alerted?)
2. Should approved items be removed from `extraItemsHistory` or marked with a status?
3. What should happen if the same custom item is added multiple times by different users?

---

**Document Version**: 1.0  
**Last Updated**: November 26, 2025  
**Contact**: User Portal Development Team

