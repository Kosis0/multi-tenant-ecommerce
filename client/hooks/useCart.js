'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const FREE_SHIPPING_THRESHOLD = 50000; // ₦50,000

export function useCart(tenant) {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined' && tenant) {
      try {
        const saved = localStorage.getItem(`cart_${tenant}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Persist cart to localStorage on change
  useEffect(() => {
    if (!tenant || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`cart_${tenant}`, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart, tenant]);

  // Remove single item
  const removeFromCart = useCallback((cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((cartKey, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartKey === cartKey ? { ...item, quantity: newQuantity } : item))
    );
  }, []);

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1, selectedVariant = null) => {
    setCart((prevCart) => {
      const variantKey = selectedVariant 
        ? `${product.id}_${selectedVariant.size || ''}_${selectedVariant.color || ''}`
        : `${product.id}`;

      const existingIndex = prevCart.findIndex((item) => item.cartKey === variantKey);

      const basePrice = Number(product.price) || 0;
      const adjustment = Number(selectedVariant?.price_adjustment || 0);
      const unitPrice = basePrice + adjustment;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem = {
          id: product.id,
          cartKey: variantKey,
          title: product.title,
          price: unitPrice,
          original_price: product.original_price,
          image_url: product.image_url,
          category: product.category,
          quantity: quantity,
          variant: selectedVariant,
        };
        return [...prevCart, newItem];
      }
    });
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromo(null);
    setAppliedDiscount(0);
  }, []);

  // Apply Promo Code
  const applyPromoCode = useCallback((code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MERCATO10' || clean === 'WELCOME10') {
      setAppliedDiscount(0.10);
      setAppliedPromo({ code: clean, label: '10% Off Welcome Promo', discount: 0.10 });
      return { success: true, message: '10% discount applied!' };
    }
    if (clean === 'MERCATO20' || clean === 'VIP20') {
      setAppliedDiscount(0.20);
      setAppliedPromo({ code: clean, label: '20% Off VIP Promo', discount: 0.20 });
      return { success: true, message: '20% VIP discount applied!' };
    }
    if (clean === 'FREESHIP') {
      setAppliedDiscount(0);
      setAppliedPromo({ code: clean, label: 'Free Express Shipping', freeShipping: true });
      return { success: true, message: 'Free Express Shipping applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try WELCOME10 or MERCATO20.' };
  }, []);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setAppliedDiscount(0);
    setPromoCode('');
  }, []);

  // Computed Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return subtotal * appliedDiscount;
  }, [subtotal, appliedDiscount]);

  const isFreeShipping = useMemo(() => {
    return subtotal >= FREE_SHIPPING_THRESHOLD || appliedPromo?.freeShipping === true;
  }, [subtotal, appliedPromo]);

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    return isFreeShipping ? 0 : 3500;
  }, [subtotal, isFreeShipping]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingCost);
  }, [subtotal, discountAmount, shippingCost]);

  const freeShippingRemaining = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  }, [subtotal]);

  const freeShippingProgress = useMemo(() => {
    return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  }, [subtotal]);

  return {
    cart,
    isLoaded: true,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
    discountAmount,
    shippingCost,
    finalTotal,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    promoCode,
    setPromoCode,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  };
}
