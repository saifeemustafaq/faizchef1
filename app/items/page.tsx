'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './items.module.css';

const CATEGORIES = [
  'Produce (veg & fruit)',
  'Fresh herbs & aromatics',
  'Dairy and Eggs',
  'Bakery',
  'Dry goods & grains',
  'Legumes & pulses (dry)',
  'Oils & fats',
  'Spices (whole)',
  'Spices & masalas (ground)',
  'Condiments & sauces',
  'Nuts & baking',
  'Frozen',
  'Canned & jarred',
];

export default function ItemsPage() {
  const { data, loading, addToCart } = useCart();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Canned & jarred']));
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemUnits, setItemUnits] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(CATEGORIES));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data.items;

    const query = searchQuery.toLowerCase().trim();
    return data.items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.store.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const getItemsByCategory = (category: string) => {
    return filteredItems.filter(item => item.category === category);
  };

  // Get categories that have items after filtering
  const categoriesWithItems = useMemo(() => {
    return CATEGORIES.filter(category => 
      getItemsByCategory(category).length > 0
    );
  }, [filteredItems]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: numQuantity
    }));
  };

  const handleUnitChange = (itemId: string, unit: string) => {
    setItemUnits(prev => ({
      ...prev,
      [itemId]: unit
    }));
  };

  const getItemUnit = (itemId: string, defaultUnit: string) => {
    return itemUnits[itemId] || defaultUnit;
  };

  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId] || 0;
  };

  const handleAddToCart = (item: any) => {
    const quantity = getItemQuantity(item.id);
    const unit = getItemUnit(item.id, item.unit);

    addToCart(item, quantity, unit);
    
    // Reset quantity and unit for this item
    setItemQuantities(prev => ({ ...prev, [item.id]: 0 }));
    setItemUnits(prev => {
      const newUnits = { ...prev };
      delete newUnits[item.id];
      return newUnits;
    });
  };

  if (loading) {
    return <div className={styles.loadingContainer}><p>Loading...</p></div>;
  }

  if (!data) {
    return <div className={styles.loadingContainer}><p>Error loading data</p></div>;
  }

  return (
    <>
      <div className={styles.contentHeader}>
        <h2 className={styles.productCount}>
          {filteredItems.length} {searchQuery ? 'result' : 'product'}{filteredItems.length !== 1 ? 's' : ''}
          {searchQuery && <span className={styles.totalCount}> of {data.items.length}</span>}
        </h2>
        <div className={styles.headerActions}>
          <button className={styles.expandButton} onClick={expandAll}>
            <ChevronRight size={16} />
            Expand All
          </button>
          <button className={styles.collapseButton} onClick={collapseAll}>
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            Collapse All
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search items by name, store, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 && searchQuery ? (
        <div className={styles.noResults}>
          <Search size={48} strokeWidth={2} />
          <h3>No items found</h3>
          <p>Try adjusting your search terms</p>
          <button className={styles.clearSearchButton} onClick={clearSearch}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className={styles.categoriesContainer}>
          {categoriesWithItems.map((category) => {
          const items = getItemsByCategory(category);
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className={styles.categorySection}>
              <button
                className={`${styles.categoryHeader} ${isExpanded ? styles.categoryHeaderExpanded : ''}`}
                onClick={() => toggleCategory(category)}
              >
                <div className={styles.categoryHeaderLeft}>
                  <ChevronRight 
                    size={20} 
                    className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                  />
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  <span className={styles.categoryCount}>({items.length} items)</span>
                </div>
              </button>

              {isExpanded && (
                <div className={styles.itemsGrid}>
                  {items.map((item) => {
                    const currentUnit = getItemUnit(item.id, item.unit);
                    const currentQuantity = getItemQuantity(item.id);
                    
                    return (
                      <div key={item.id} className={styles.itemCard}>
                        <div className={styles.itemCardHeader}>
                          <div>
                            <h4 className={styles.itemName}>{item.name}</h4>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemStore}>{item.store}</span>
                              <span className={styles.itemDefaultUnit}>Default: {item.unit}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.addToCartSection}>
                          <div className={styles.quantityUnitRow}>
                            <input
                              type="number"
                              min="0"
                              value={currentQuantity || ''}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              placeholder="Qty"
                              className={styles.quantityInput}
                            />
                            
                            <select
                              value={currentUnit}
                              onChange={(e) => handleUnitChange(item.id, e.target.value)}
                              className={styles.unitSelect}
                            >
                              {data.units.map((unit) => (
                                <option key={unit.abbreviation} value={unit.abbreviation}>
                                  {unit.abbreviation}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            className={styles.addButton}
                            onClick={() => handleAddToCart(item)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </>
  );
}

