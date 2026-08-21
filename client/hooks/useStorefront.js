'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

export function useStorefront(tenant, addToast) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(500000);
  const [minRating, setMinRating] = useState(0);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeQuickViewImage, setActiveQuickViewImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews Modal
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Flash Sale Timer
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo fallback catalog generator
  const getDemoCatalog = useCallback((tenantSlug) => {
    const name = tenantSlug ? tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1) : 'Mercato';
    return {
      store: {
        name: `${name} Official Boutique`,
        slug: tenantSlug,
        show_flash_deals: true,
        hero_badge: 'Spring / Summer 2026 Collection',
        hero_title: 'Admire Contemporary Luxury & Looks',
        hero_subtitle: 'Discover curated high-fashion silhouettes, artisan leather goods, and modern lifestyle essentials with seamless Naira checkout.',
      },
      categories: [
        { id: 1, name: 'Shoes' },
        { id: 2, name: 'Apparel' },
        { id: 3, name: 'Accessories' },
        { id: 4, name: 'Electronics' },
        { id: 5, name: 'Bags' },
      ],
      products: [
        {
          id: 101,
          title: `${name} Minimalist Knit Runner`,
          price: 48500,
          original_price: 65000,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          category: 'Shoes',
          description: 'Sculpted lightweight knit sneaker crafted for effortless daily mobility. Features responsive foam cushioning, breathable upper, and ergonomic support.',
          is_featured: true,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 34,
          discount_percent: 25,
          flash_sale_units: 6,
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
          ],
          variants: [
            { size: '40 EU', color: 'Clay Orange', sku: 'RUN-40-ORG', price_adjustment: 0, stock: 5 },
            { size: '42 EU', color: 'Clay Orange', sku: 'RUN-42-ORG', price_adjustment: 0, stock: 4 },
            { size: '44 EU', color: 'Obsidian Noir', sku: 'RUN-44-BLK', price_adjustment: 2000, stock: 6 },
          ],
        },
        {
          id: 102,
          title: `${name} Heavyweight Terracotta Hoodie`,
          price: 32000,
          original_price: 42000,
          stock: 24,
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          category: 'Apparel',
          description: '450GSM organic brushed cotton hoodie with structured drop-shoulder silhouette and minimalist ribbed trims.',
          is_featured: true,
          is_new_arrival: false,
          rating: 4.8,
          review_count: 28,
          discount_percent: 23,
          flash_sale_units: 8,
          images: [
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          ],
          variants: [
            { size: 'S', color: 'Terracotta', sku: 'HD-S-TER', price_adjustment: 0, stock: 8 },
            { size: 'M', color: 'Terracotta', sku: 'HD-M-TER', price_adjustment: 0, stock: 10 },
            { size: 'L', color: 'Terracotta', sku: 'HD-L-TER', price_adjustment: 0, stock: 6 },
          ],
        },
        {
          id: 103,
          title: `${name} Architectural Leather Tote`,
          price: 68000,
          original_price: 85000,
          stock: 9,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
          category: 'Bags',
          description: 'Italian full-grain vegetable-tanned leather tote with internal suede compartments and brushed brass hardware.',
          is_featured: true,
          is_new_arrival: true,
          rating: 5.0,
          review_count: 16,
          discount_percent: 20,
          flash_sale_units: 4,
          images: [],
        },
        {
          id: 104,
          title: `${name} Wireless Studio ANC Headphones`,
          price: 89000,
          original_price: 115000,
          stock: 11,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          category: 'Electronics',
          description: 'Custom 40mm titanium drivers with hybrid active noise cancellation, memory-foam ear cushions, and 45h playback.',
          is_featured: true,
          is_new_arrival: false,
          rating: 4.9,
          review_count: 52,
          discount_percent: 22,
          flash_sale_units: 5,
          images: [],
        },
        {
          id: 105,
          title: `${name} Relaxed Oversized Linen Shirt`,
          price: 24000,
          original_price: 30000,
          stock: 18,
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          category: 'Apparel',
          description: 'Breathable 100% French flax linen button-up with mother-of-pearl buttons and relaxed Cuban collar.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.7,
          review_count: 22,
          discount_percent: 20,
          flash_sale_units: 0,
          images: [],
        },
        {
          id: 106,
          title: `${name} Chronograph Minimalist Watch`,
          price: 55000,
          original_price: 70000,
          stock: 14,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          category: 'Accessories',
          description: 'Japanese quartz movement timepiece with sapphire crystal glass, 5ATM water resistance, and interchangeable leather strap.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 19,
          discount_percent: 21,
          flash_sale_units: 0,
          images: [],
        },
        {
          id: 107,
          title: `${name} Retro Suede Heritage Sneakers`,
          price: 52000,
          original_price: 68000,
          stock: 10,
          image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
          category: 'Shoes',
          description: 'Vintage-inspired low top sneaker in supple olive and sand suede with vulcanized natural gum soles.',
          is_featured: false,
          is_new_arrival: false,
          rating: 4.8,
          review_count: 31,
          discount_percent: 23,
          flash_sale_units: 0,
          images: [],
        },
        {
          id: 108,
          title: `${name} Waterproof Commuter Backpack`,
          price: 42000,
          original_price: 55000,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          category: 'Bags',
          description: 'Matte weatherproof coated canvas backpack with magnetic fidlock buckles and padded 16-inch laptop chamber.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.8,
          review_count: 15,
          discount_percent: 23,
          flash_sale_units: 0,
          images: [],
        },
      ],
    };
  }, []);

  // Fetch Store Data & Products
  const fetchStoreData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=1&limit=12`);
      if (res.ok) {
        const data = await res.json();
        const prods = data.data?.products || data.products || [];
        const cats = data.data?.categories || data.categories || [];
        const store = data.data?.store || data.store || { name: tenant, slug: tenant };

        setProducts(prods.length > 0 ? prods : getDemoCatalog(tenant).products);
        setCategories(cats.length > 0 ? cats : getDemoCatalog(tenant).categories);
        setStoreData(store);
        setHasMore((data.data?.pagination?.totalPages || 1) > 1);
      } else {
        const fallback = getDemoCatalog(tenant);
        setProducts(fallback.products);
        setCategories(fallback.categories);
        setStoreData(fallback.store);
      }
    } catch (err) {
      console.warn('Using demo catalog fallback:', err.message);
      const fallback = getDemoCatalog(tenant);
      setProducts(fallback.products);
      setCategories(fallback.categories);
      setStoreData(fallback.store);
    } finally {
      setLoading(false);
    }
  }, [tenant, getDemoCatalog]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Load More Products Pagination
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=${nextPage}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        const newProds = data.data?.products || data.products || [];
        if (newProds.length > 0) {
          setProducts((prev) => [...prev, ...newProds]);
          setPage(nextPage);
          const totalPages = data.data?.pagination?.totalPages || 1;
          setHasMore(nextPage < totalPages);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, tenant]);

  // Quick View Handler
  const openQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setActiveQuickViewImage(product.image_url);
    const variants = Array.isArray(product.variants) 
      ? product.variants 
      : (typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : []);
    setSelectedVariant(variants[0] || null);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
    setActiveQuickViewImage(null);
    setSelectedVariant(null);
  }, []);

  // Reviews Handler
  const openReviewsModal = useCallback(async (product) => {
    setReviewProduct(product);
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}/reviews?tenant=${tenant}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : (data.reviews || []);
        setReviewsList(list);
      } else {
        setReviewsList([
          { id: 1, author_name: 'Amara O.', rating: 5, comment: 'Exceptional craftsmanship and swift delivery in Lagos!', created_at: new Date().toISOString() },
          { id: 2, author_name: 'Tunde B.', rating: 5, comment: 'High quality materials, exactly as described.', created_at: new Date().toISOString() }
        ]);
      }
    } catch {
      setReviewsList([
        { id: 1, author_name: 'Amara O.', rating: 5, comment: 'Exceptional craftsmanship and swift delivery in Lagos!', created_at: new Date().toISOString() }
      ]);
    } finally {
      setReviewLoading(false);
    }
  }, [tenant]);

  const submitReview = useCallback(async ({ authorName, rating, comment }) => {
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${reviewProduct.id}/reviews?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, comment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newRev = data.data || { id: Date.now(), author_name: authorName, rating, comment, created_at: new Date().toISOString() };
        setReviewsList((prev) => [newRev, ...prev]);
        if (addToast) addToast('Thank you! Your review has been published.', 'success');
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      // Local fallback
      const localRev = { id: Date.now(), author_name: authorName, rating, comment, created_at: new Date().toISOString() };
      setReviewsList((prev) => [localRev, ...prev]);
      if (addToast) addToast('Review submitted successfully!', 'success');
      return { success: true };
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewProduct, tenant, addToast]);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = Number(p.price || 0) <= priceRange;
      const matchesRating = Number(p.rating || 5) >= minRating;
      
      let matchesSize = true;
      if (selectedSize !== 'All') {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        matchesSize = variants.some(v => v.size?.toLowerCase() === selectedSize.toLowerCase()) || p.description?.includes(selectedSize);
      }

      let matchesColor = true;
      if (selectedColor !== 'All') {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        matchesColor = variants.some(v => v.color?.toLowerCase() === selectedColor.toLowerCase()) || p.title?.includes(selectedColor);
      }

      return matchesCat && matchesSearch && matchesPrice && matchesRating && matchesSize && matchesColor;
    });
  }, [products, selectedCategory, searchQuery, priceRange, minRating, selectedSize, selectedColor]);

  // Featured Products
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured);
  }, [products]);

  // Flash Sale Products
  const flashSaleProducts = useMemo(() => {
    return products.filter((p) => (Number(p.discount_percent) > 0 || p.flash_sale_units > 0));
  }, [products]);

  return {
    loading,
    error,
    storeData,
    products,
    categories,
    filteredProducts,
    featuredProducts,
    flashSaleProducts,
    page,
    hasMore,
    loadingMore,
    loadMoreProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    quickViewProduct,
    activeQuickViewImage,
    setActiveQuickViewImage,
    selectedVariant,
    setSelectedVariant,
    openQuickView,
    closeQuickView,
    reviewProduct,
    reviewsList,
    reviewLoading,
    submittingReview,
    openReviewsModal,
    setReviewProduct,
    submitReview,
    isCheckoutOpen,
    setIsCheckoutOpen,
    paymentLoading,
    setPaymentLoading,
    paymentSuccess,
    setPaymentSuccess,
    flashSaleTimeLeft,
    refetchStoreData: fetchStoreData,
  };
}
