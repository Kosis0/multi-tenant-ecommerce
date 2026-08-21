'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

export function useWishlist(tenant, addToast) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize Session ID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let sid = localStorage.getItem('mercato_session_id');
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'sid_' + Date.now();
      localStorage.setItem('mercato_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch wishlist from API
  useEffect(() => {
    if (!tenant || !sessionId) return;
    
    // Also load local backup if any
    try {
      const local = localStorage.getItem(`wishlist_${tenant}`);
      if (local) {
        setWishlistIds(JSON.parse(local));
      }
    } catch {}

    fetch(`${API_URL}/api/wishlist?tenant=${tenant}&sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const ids = data.data.map((w) => w.product_id);
          setWishlistIds(ids);
          try {
            localStorage.setItem(`wishlist_${tenant}`, JSON.stringify(ids));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Wishlist API sync error:', err.message);
      });
  }, [tenant, sessionId]);

  // Toggle wishlist item
  const toggleWishlist = useCallback(
    async (product) => {
      const productId = product.id;
      const isSaved = wishlistIds.includes(productId);
      
      // Optimistic update
      const updatedIds = isSaved 
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];
      
      setWishlistIds(updatedIds);
      try {
        localStorage.setItem(`wishlist_${tenant}`, JSON.stringify(updatedIds));
      } catch {}

      if (addToast) {
        if (isSaved) {
          addToast(`Removed ${product.title} from wishlist`, 'info');
        } else {
          addToast(`Added ${product.title} to wishlist!`, 'success');
        }
      }

      if (!sessionId) return;

      try {
        if (isSaved) {
          await fetch(`${API_URL}/api/wishlist/${productId}?tenant=${tenant}&sessionId=${sessionId}`, {
            method: 'DELETE',
          });
        } else {
          await fetch(`${API_URL}/api/wishlist?tenant=${tenant}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              sessionId,
            }),
          });
        }
      } catch (err) {
        console.warn('Wishlist remote sync failed:', err.message);
      }
    },
    [tenant, sessionId, wishlistIds, addToast]
  );

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    isWishlisted,
    toggleWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistCount: wishlistIds.length,
    loading,
  };
}
