'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './cart.module.css';

export default function CartPage() {
  const { data, cart, publishedCarts, updateCartQuantity, updateCartUnit, removeFromCart, publishCart } = useCart();
  const [expandedPublishedCarts, setExpandedPublishedCarts] = useState<Set<string>>(new Set());

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
            
            <div className={styles.cartItems}>
              {cart.map((cartItem) => (
                <div key={cartItem.id} className={styles.cartItemCard}>
                  <div className={styles.cartItemMain}>
                    <div className={styles.cartItemInfo}>
                      <h4 className={styles.cartItemName}>{cartItem.name}</h4>
                      <span className={styles.cartItemStore}>{cartItem.store}</span>
                    </div>
                    
                    <div className={styles.cartItemControls}>
                      <input
                        type="number"
                        min="1"
                        value={cartItem.quantity}
                        onChange={(e) => updateCartQuantity(cartItem.id, parseInt(e.target.value) || 1)}
                        className={styles.cartQuantityInput}
                      />
                      
                      <select
                        value={cartItem.unit}
                        onChange={(e) => updateCartUnit(cartItem.id, e.target.value)}
                        className={styles.cartUnitSelect}
                      >
                        {data.units.map((unit) => (
                          <option key={unit.abbreviation} value={unit.abbreviation}>
                            {unit.abbreviation}
                          </option>
                        ))}
                      </select>
                    </div>
                    
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
                  <button
                    className={`${styles.publishedCartHeader} ${isExpanded ? styles.publishedCartHeaderExpanded : ''}`}
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
    </>
  );
}

