'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Item = {
  id: string;
  name: string;
  category: string;
  store: string;
  unit: string;
};

type Unit = {
  name: string;
  abbreviation: string;
};

type ExtraItem = {
  id: string;
  name: string;
  store?: string;
  category?: string;
  unit: string;
  addedAt: Date;
};

type DataStructure = {
  stores: string[];
  units: Unit[];
  items: Item[];
  publishedCarts?: PublishedCart[];
  extraItemsHistory?: ExtraItem[];
};

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

type CartContextType = {
  data: DataStructure | null;
  loading: boolean;
  cart: CartItem[];
  publishedCarts: PublishedCart[];
  extraItemsHistory: ExtraItem[];
  addToCart: (item: Item, quantity: number, unit: string) => void;
  updateCartQuantity: (cartItemId: string, newQuantity: number) => void;
  updateCartUnit: (cartItemId: string, newUnit: string) => void;
  removeFromCart: (cartItemId: string) => void;
  publishCart: () => Promise<void>;
  fetchData: () => Promise<void>;
  updatePublishedCart: (cartId: string, updatedItems: CartItem[]) => Promise<void>;
  deletePublishedCart: (cartId: string) => Promise<void>;
  copyPublishedCartToCart: (cartId: string) => void;
  addExtraItemToCart: (name: string, unit: string, quantity: number, store?: string, category?: string) => Promise<void>;
  updateExtraItemHistory: (itemId: string, name: string, unit: string, store?: string, category?: string) => Promise<void>;
  deleteExtraItemFromHistory: (itemId: string) => Promise<void>;
  quickAddExtraItem: (itemId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [publishedCarts, setPublishedCarts] = useState<PublishedCart[]>([]);
  const [extraItemsHistory, setExtraItemsHistory] = useState<ExtraItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed.map((item: CartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/items');
      const jsonData = await response.json();
      setData(jsonData);
      
      // Load published carts if they exist
      if (jsonData.publishedCarts) {
        setPublishedCarts(jsonData.publishedCarts.map((cart: PublishedCart) => ({
          ...cart,
          publishedAt: new Date(cart.publishedAt),
          items: cart.items.map((item: CartItem) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        })));
      }

      // Load extra items history if it exists
      if (jsonData.extraItemsHistory) {
        setExtraItemsHistory(jsonData.extraItemsHistory.map((item: ExtraItem) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveData = async (updatedData: DataStructure) => {
    try {
      await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      setData(updatedData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addToCart = (item: Item, quantity: number, unit: string) => {
    if (quantity <= 0) {
      alert('Please enter a quantity greater than 0');
      return;
    }

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      store: item.store,
      quantity: quantity,
      unit: unit,
      addedAt: new Date(),
    };

    setCart(prev => [...prev, cartItem]);
  };

  const updateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const updateCartUnit = (cartItemId: string, newUnit: string) => {
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, unit: newUnit }
        : item
    ));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const publishCart = async () => {
    if (!data) return;
    if (cart.length === 0) {
      alert('Your cart is empty. Add items before publishing.');
      return;
    }

    const newPublishedCart: PublishedCart = {
      id: `published-${Date.now()}`,
      publishedAt: new Date(),
      items: [...cart],
    };

    const updatedPublishedCarts = [...publishedCarts, newPublishedCart];
    setPublishedCarts(updatedPublishedCarts);

    // Save to backend
    const updatedData = {
      ...data,
      publishedCarts: updatedPublishedCarts,
    };
    await saveData(updatedData);

    // Clear current cart
    setCart([]);
  };

  const updatePublishedCart = async (cartId: string, updatedItems: CartItem[]) => {
    if (!data) return;

    const updatedPublishedCarts = publishedCarts.map(cart =>
      cart.id === cartId ? { ...cart, items: updatedItems } : cart
    );

    setPublishedCarts(updatedPublishedCarts);

    // Save to backend
    const updatedData = {
      ...data,
      publishedCarts: updatedPublishedCarts,
    };
    await saveData(updatedData);
  };

  const deletePublishedCart = async (cartId: string) => {
    if (!data) return;

    const updatedPublishedCarts = publishedCarts.filter(cart => cart.id !== cartId);
    setPublishedCarts(updatedPublishedCarts);

    // Save to backend
    const updatedData = {
      ...data,
      publishedCarts: updatedPublishedCarts,
    };
    await saveData(updatedData);
  };

  const copyPublishedCartToCart = (cartId: string) => {
    const publishedCart = publishedCarts.find(cart => cart.id === cartId);
    if (!publishedCart) return;

    // Create new cart items with new IDs and current timestamp
    const copiedItems = publishedCart.items.map(item => ({
      ...item,
      id: `${item.itemId}-${Date.now()}-${Math.random()}`,
      addedAt: new Date(),
    }));

    setCart(prev => [...prev, ...copiedItems]);
  };

  const addExtraItemToCart = async (name: string, unit: string, quantity: number, store?: string, category?: string) => {
    if (!data) return;

    const uniqueId = `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create extra item for history
    const extraItem: ExtraItem = {
      id: uniqueId,
      name,
      store,
      category,
      unit,
      addedAt: new Date(),
    };

    // Add to history
    const updatedHistory = [...extraItemsHistory, extraItem];
    setExtraItemsHistory(updatedHistory);

    // Add to current cart
    const cartItem: CartItem = {
      id: `${extraItem.id}-cart-${Date.now()}`,
      itemId: extraItem.id,
      name,
      store: store || 'Not Assigned',
      quantity,
      unit,
      addedAt: new Date(),
    };

    setCart(prev => [...prev, cartItem]);

    // Save to backend
    const updatedData = {
      ...data,
      extraItemsHistory: updatedHistory,
    };
    await saveData(updatedData);
  };

  const updateExtraItemHistory = async (itemId: string, name: string, unit: string, store?: string, category?: string) => {
    if (!data) return;

    const updatedHistory = extraItemsHistory.map(item =>
      item.id === itemId
        ? { ...item, name, unit, store, category }
        : item
    );

    setExtraItemsHistory(updatedHistory);

    const updatedData = {
      ...data,
      extraItemsHistory: updatedHistory,
    };
    await saveData(updatedData);
  };

  const deleteExtraItemFromHistory = async (itemId: string) => {
    if (!data) return;

    const updatedHistory = extraItemsHistory.filter(item => item.id !== itemId);
    setExtraItemsHistory(updatedHistory);

    const updatedData = {
      ...data,
      extraItemsHistory: updatedHistory,
    };
    await saveData(updatedData);
  };

  const quickAddExtraItem = (itemId: string, quantity: number) => {
    const extraItem = extraItemsHistory.find(item => item.id === itemId);
    if (!extraItem) return;

    const cartItem: CartItem = {
      id: `${extraItem.id}-cart-${Date.now()}`,
      itemId: extraItem.id,
      name: extraItem.name,
      store: extraItem.store || 'Not Assigned',
      quantity,
      unit: extraItem.unit,
      addedAt: new Date(),
    };

    setCart(prev => [...prev, cartItem]);
  };

  return (
    <CartContext.Provider
      value={{
        data,
        loading,
        cart,
        publishedCarts,
        extraItemsHistory,
        addToCart,
        updateCartQuantity,
        updateCartUnit,
        removeFromCart,
        publishCart,
        fetchData,
        updatePublishedCart,
        deletePublishedCart,
        copyPublishedCartToCart,
        addExtraItemToCart,
        updateExtraItemHistory,
        deleteExtraItemFromHistory,
        quickAddExtraItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

