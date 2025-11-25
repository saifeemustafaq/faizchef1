For the shopping cart experience, remove the edit and delete buttons. Implement an "Add" button inside each product card.

Each product card should include:
- Item name
- Store name
- Current unit (with a dropdown to change unit if needed)

At the lower section of the card:
- A numeric input box to enter quantity (numbers only)
- A dropdown (or similar selector) to change the unit, with the default unit pre-selected
- The "Add" button

When the user enters a quantity, selects the desired unit, and clicks "Add," that item should be added to the cart using the specified quantity and unit (e.g., "5 kg tomatoes" or "3 cases tomatoes"). Make sure the cart reflects the chosen unit for each addition. Users should be able to override the default unit before adding to cart.




On the left side of the interface, please implement an input table with five rows and appropriate column headers at the top (such as Item Name, Store, Quantity, Unit, etc). Each row should contain text boxes and dropdowns as needed, allowing the user to enter details for up to five different items at a time.

The user should be able to fill in one or more rows and then click an "Add to Cart" button. When "Add to Cart" is clicked:
- All entered items should be added to the cart and displayed as a list on the right.
- The input table should be cleared, so the user can add a new batch of items if desired.
- It's fine if the user enters only one item before adding to the cart.

Additionally, please implement the following functionality for the list of previously added items (on the right):
- Each previously added item should be editable (the user can modify item details and save changes).
- Each item should have a delete button to remove it from the list.
- Provide a "quick add" (plus/“+”) button for each previously added item, allowing the user to quickly add that same item to the cart again in the future, without having to re-enter the details.

This will let users efficiently enter multiple new items at once, and also conveniently manage and reuse previously added items.