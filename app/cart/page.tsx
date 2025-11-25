'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, ChevronRight, Edit2, Copy, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './cart.module.css';

type CartItem = {
  id: string;
  itemId: string;
  name: string;
  store: string;
  quantity: number;
  unit: string;
  addedAt: Date;
};

type PublishedCart = {
  id: string;
  publishedAt: Date;
  items: CartItem[];
};

export default function CartPage() {
  const { 
    data, 
    cart, 
    publishedCarts, 
    updateCartQuantity, 
    updateCartUnit, 
    removeFromCart, 
    publishCart, 
    addToCart,
    updatePublishedCart,
    deletePublishedCart,
    copyPublishedCartToCart
  } = useCart();
  const [expandedPublishedCarts, setExpandedPublishedCarts] = useState<Set<string>>(new Set());
  const [editingCart, setEditingCart] = useState<PublishedCart | null>(null);
  const [editedItems, setEditedItems] = useState<CartItem[]>([]);

  const togglePublishedCart = (cartId: string) => {
    const newExpanded = new Set(expandedPublishedCarts);
    if (newExpanded.has(cartId)) {
      newExpanded.delete(cartId);
    } else {
      newExpanded.add(cartId);
    }
    setExpandedPublishedCarts(newExpanded);
  };

  const formatPublishedDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${year} - ${hours}:${minutes}`;
  };

  const handleEditPublishedCart = (cart: PublishedCart) => {
    setEditingCart(cart);
    setEditedItems([...cart.items]);
  };

  const handleCloseModal = () => {
    setEditingCart(null);
    setEditedItems([]);
  };

  const handleSaveEditedCart = async () => {
    if (!editingCart) return;
    await updatePublishedCart(editingCart.id, editedItems);
    handleCloseModal();
  };

  const handleDeletePublishedCart = async (cartId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this published cart?')) {
      await deletePublishedCart(cartId);
    }
  };

  const handleCopyPublishedCart = (cartId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    copyPublishedCartToCart(cartId);
    alert('Items copied to current cart!');
  };

  const handleUpdateEditedItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setEditedItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleUpdateEditedItemUnit = (itemId: string, newUnit: string) => {
    setEditedItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, unit: newUnit } : item
    ));
  };

  const handleRemoveEditedItem = (itemId: string) => {
    setEditedItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (!data) {
    return <div className={styles.loadingContainer}><p>Loading...</p></div>;
  }

  return (
    <>
      <div className={styles.currentCartSection}>
        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={48} strokeWidth={2} />
            <h2>Your cart is empty</h2>
            <p>Start by adding some items from the Items section</p>
          </div>
        ) : (
          <div className={styles.cartContainer}>
            <div className={styles.cartHeader}>
              <h2 className={styles.cartTitle}>Current Cart</h2>
              <div className={styles.cartHeaderActions}>
                <span className={styles.cartCount}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
                <button className={styles.publishButton} onClick={publishCart}>
                  Publish
                </button>
              </div>
            </div>
            
            <div className={styles.cartTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Item Name</div>
                <div className={styles.headerCell}>Store</div>
                <div className={styles.headerCell}>Qty</div>
                <div className={styles.headerCell}>Unit</div>
                <div className={styles.headerCell}>Actions</div>
              </div>
              
              {cart.map((cartItem) => (
                <div key={cartItem.id} className={styles.tableRow}>
                  <div className={styles.tableCell} data-label="Item Name">
                    {cartItem.name}
                  </div>
                  <div className={styles.tableCell} data-label="Store">
                    {cartItem.store}
                  </div>
                  <div className={styles.tableCell} data-label="Qty">
                    <input
                      type="number"
                      min="1"
                      value={cartItem.quantity}
                      onChange={(e) => updateCartQuantity(cartItem.id, parseInt(e.target.value) || 1)}
                      className={styles.quantityInput}
                    />
                  </div>
                  <div className={styles.tableCell} data-label="Unit">
                    <select
                      value={cartItem.unit}
                      onChange={(e) => updateCartUnit(cartItem.id, e.target.value)}
                      className={styles.unitSelect}
                    >
                      {data.units.map((unit) => (
                        <option key={unit.abbreviation} value={unit.abbreviation}>
                          {unit.abbreviation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.tableCell} data-label="Actions">
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(cartItem.id)}
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Published Carts Section */}
      {publishedCarts.length > 0 && (
        <div className={styles.publishedCartsSection}>
          <div className={styles.partitionLine}>
            <span className={styles.partitionLabel}>Published Carts</span>
          </div>

          <div className={styles.publishedCartsContainer}>
            {publishedCarts.slice().reverse().map((publishedCart) => {
              const isExpanded = expandedPublishedCarts.has(publishedCart.id);
              
              return (
                <div key={publishedCart.id} className={styles.publishedCartCard}>
                  <div className={styles.publishedCartHeader}>
                    <button
                      className={`${styles.publishedCartHeaderButton} ${isExpanded ? styles.publishedCartHeaderExpanded : ''}`}
                      onClick={() => togglePublishedCart(publishedCart.id)}
                    >
                      <div className={styles.publishedCartHeaderLeft}>
                        <ChevronRight 
                          size={20} 
                          className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                        />
                        <span className={styles.publishedCartDate}>
                          {formatPublishedDate(publishedCart.publishedAt)}
                        </span>
                      </div>
                      <span className={styles.publishedCartCount}>
                        {publishedCart.items.length} item{publishedCart.items.length !== 1 ? 's' : ''}
                      </span>
                    </button>
                    
                    <div className={styles.publishedCartActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPublishedCart(publishedCart);
                        }}
                        aria-label="Edit cart"
                        title="Edit cart"
                      >
                        <Edit2 size={18} strokeWidth={2} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleCopyPublishedCart(publishedCart.id, e)}
                        aria-label="Copy to current cart"
                        title="Copy to current cart"
                      >
                        <Copy size={18} strokeWidth={2} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteActionButton}`}
                        onClick={(e) => handleDeletePublishedCart(publishedCart.id, e)}
                        aria-label="Delete cart"
                        title="Delete cart"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.publishedCartItems}>
                      {publishedCart.items.map((item) => (
                        <div key={item.id} className={styles.publishedItemCard}>
                          <div className={styles.publishedItemInfo}>
                            <h4 className={styles.publishedItemName}>{item.name}</h4>
                            <span className={styles.publishedItemStore}>{item.store}</span>
                          </div>
                          <div className={styles.publishedItemQuantity}>
                            <span className={styles.readOnlyBadge}>
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCart && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Published Cart</h2>
              <button
                className={styles.modalCloseButton}
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDate}>
                Published: {formatPublishedDate(editingCart.publishedAt)}
              </p>

              {editedItems.length === 0 ? (
                <div className={styles.emptyModalState}>
                  <p>No items left in this cart</p>
                </div>
              ) : (
                <div className={styles.modalItems}>
                  {editedItems.map((item) => (
                    <div key={item.id} className={styles.modalItemCard}>
                      <div className={styles.modalItemInfo}>
                        <h4 className={styles.modalItemName}>{item.name}</h4>
                        <span className={styles.modalItemStore}>{item.store}</span>
                      </div>

                      <div className={styles.modalItemControls}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateEditedItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          className={styles.modalQuantityInput}
                        />

                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateEditedItemUnit(item.id, e.target.value)}
                          className={styles.modalUnitSelect}
                        >
                          {data?.units.map((unit) => (
                            <option key={unit.abbreviation} value={unit.abbreviation}>
                              {unit.abbreviation}
                            </option>
                          ))}
                        </select>

                        <button
                          className={styles.modalRemoveButton}
                          onClick={() => handleRemoveEditedItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancelButton} onClick={handleCloseModal}>
                Cancel
              </button>
              <button 
                className={styles.modalSaveButton} 
                onClick={handleSaveEditedCart}
                disabled={editedItems.length === 0}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

