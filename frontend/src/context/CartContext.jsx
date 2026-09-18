import React, { createContext, useState, useEffect } from 'react';
import { getMenuItemImageUrl } from '../utils/menuImageResolver';

const CartContext = createContext();

const STORAGE_KEY = 'aflax_cart';
const CUSTOMER_STORAGE_KEY = 'aflax_customer';

/**
 * Safely load initial cart from localStorage
 */
function getInitialCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Validate items have required properties and valid quantities
      return parsed.filter(
        (item) => item && item.menuItemId && typeof item.price === 'number' && item.quantity >= 1
      );
    }
    return [];
  } catch (err) {
    console.warn('⚠️ Invalid localStorage cart data found. Resetting cart.', err);
    return [];
  }
}

/**
 * Safely load initial customer info from localStorage
 */
function getInitialCustomer() {
  try {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!saved) return { name: '', phone: '', notes: '' };
    const parsed = JSON.parse(saved);
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return { name: '', phone: '', notes: '' };
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart);
  const [customer, setCustomer] = useState(getInitialCustomer);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cartItems]);

  // Sync customer info to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
    } catch (err) {
      console.error('Failed to save customer info to localStorage:', err);
    }
  }, [customer]);

  /**
   * Add an item to cart or increment quantity if already present
   */
  const addToCart = (item, qty = 1) => {
    if (!item || item.isAvailable === false) {
      return false;
    }

    const itemId = item._id || item.slug;
    const addQuantity = Math.max(1, parseInt(qty, 10) || 1);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.menuItemId === itemId);

      if (existingIndex > -1) {
        // Increment quantity of existing line
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + addQuantity,
        };
        return updated;
      }

      // Add new cart line
      const categoryName =
        typeof item.category === 'object' && item.category !== null
          ? item.category.name
          : '';

      const resolvedImage = getMenuItemImageUrl(item) || item.image || null;

      const newItem = {
        menuItemId: itemId,
        name: item.name,
        price: Number(item.price),
        image: resolvedImage,
        categoryName,
        quantity: addQuantity,
      };

      return [...prevItems, newItem];
    });

    return true;
  };

  /**
   * Update quantity of a specific item (minimum 1)
   */
  const updateQuantity = (itemId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === itemId ? { ...item, quantity: qty } : item
      )
    );
  };

  /**
   * Increment quantity by 1
   */
  const incrementQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Decrement quantity by 1 (removes item if quantity reaches 0)
   */
  const decrementQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.menuItemId === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /**
   * Remove a single item completely from cart
   */
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.menuItemId !== itemId));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Update customer information
   */
  const updateCustomer = (fields) => {
    setCustomer((prev) => ({ ...prev, ...fields }));
  };

  // Calculations: total items count and total numeric price
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /**
   * Builds formatted order data object for review/submission
   */
  const getOrderPayload = () => {
    return {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        notes: customer.notes.trim(),
      },
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number((item.price * item.quantity).toFixed(2)),
      })),
      total: Number(totalAmount.toFixed(2)),
      currency: 'USD',
    };
  };

  const value = {
    cartItems,
    customer,
    totalCount,
    totalAmount,
    addToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    updateCustomer,
    getOrderPayload,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
