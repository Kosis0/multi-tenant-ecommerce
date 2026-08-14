'use client';

import { use, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';

export default function StorefrontPage({ params }) {
  const unwrappedParams = use(params);
  const tenant = unwrappedParams.tenant;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { theme, toggleTheme } = useTheme();
  
  // Clay Shop Filter States
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(500000);
  const [minRating, setMinRating] = useState(0);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`cart_${tenant}`);
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Customer Auth & Account State
  const [customer, setCustomer] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const productsGridRef = useRef(null);

  // Scroll to products grid (used when searching)
  const scrollToProducts = () => {
    setTimeout(() => {
      productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      scrollToProducts();
      setIsMobileMenuOpen(false);
    }
  };

  // Review Modal State
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ authorName: '', rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Product Detail Modal State (Gallery & Rich Description)
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [activeDetailImage, setActiveDetailImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Countdown Timer State (Flash Sales)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });

  const [toasts, setToasts] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

  // Bug Fix #1: Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && cart.length >= 0) {
      localStorage.setItem(`cart_${tenant}`, JSON.stringify(cart));
    }
  }, [cart, tenant]);

  // Live Flash Sale Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Customer Init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCustomer = localStorage.getItem(`customer_${tenant}`);
      if (savedCustomer) {
        try {
          setCustomer(JSON.parse(savedCustomer));
        } catch (e) {}
      }
    }
  }, [tenant]);

  // Wishlist Init
  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
    
    fetch(`${API_URL}/api/wishlist?tenant=${tenant}&sessionId=${sid}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setWishlist(data.data.map(w => w.product_id));
        }
      })
      .catch(err => console.error('Failed to fetch wishlist', err));
  }, [tenant, API_URL]);

  // Demo Store Fallback Data Generator (Rich Catalog for Demo & Initial State)
  const getDemoStoreData = (tenantSlug) => {
    const name = tenantSlug ? tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1) : 'Clay & Co';
    return {
      store: { name: `${name} Official Boutique`, slug: tenantSlug },
      categories: [
        { id: 1, name: 'Shoes' },
        { id: 2, name: 'Apparel' },
        { id: 3, name: 'Accessories' },
        { id: 4, name: 'Electronics' },
        { id: 5, name: 'Bags' }
      ],
      products: [
        {
          id: 101,
          title: `${name} Minimalist Clay Knit Runner`,
          price: 48500,
          original_price: 65000,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          category: 'Shoes',
          description: `Sculpted lightweight knit sneaker crafted for effortless daily mobility. Features responsive foam cushioning and earthy organic tones inspired by modern clay design.`,
          is_featured: true,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 34,
          discount_percent: 25,
          flash_sale_units: 6,
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
          ]
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
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
          ]
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
          images: []
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
          images: []
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
          images: []
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
          images: []
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
          images: []
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
          images: []
        },
        {
          id: 109,
          title: `${name} Tactile Mechanical Keyboard`,
          price: 64000,
          original_price: 80000,
          stock: 7,
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
          category: 'Electronics',
          description: '75% wireless mechanical keyboard with hot-swappable lubricated switches, PBT clay keycaps, and CNC aluminum frame.',
          is_featured: false,
          is_new_arrival: true,
          rating: 5.0,
          review_count: 41,
          discount_percent: 20,
          flash_sale_units: 0,
          images: []
        },
        {
          id: 110,
          title: `${name} Tailored Pleated Trousers`,
          price: 36000,
          original_price: 45000,
          stock: 16,
          image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
          category: 'Apparel',
          description: 'High-waisted double pleated wide-leg trousers in wool blend fabric with adjustable side tab adjusters.',
          is_featured: false,
          is_new_arrival: false,
          rating: 4.6,
          review_count: 12,
          discount_percent: 20,
          flash_sale_units: 0,
          images: []
        },
        {
          id: 111,
          title: `${name} Matte Acetate Sunglasses`,
          price: 22000,
          original_price: 28000,
          stock: 25,
          image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
          category: 'Accessories',
          description: 'Handcrafted square frame sunglasses with 100% UV400 polarized mineral lenses and scratch-resistant coating.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 27,
          discount_percent: 21,
          flash_sale_units: 0,
          images: []
        },
        {
          id: 112,
          title: `${name} Compact Ceramic Coffee Mug Set`,
          price: 18000,
          original_price: 24000,
          stock: 30,
          image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
          category: 'Accessories',
          description: 'Set of 2 handcrafted stoneware ceramic cups with matte reactive glaze and heat-retaining ergonomic handle.',
          is_featured: false,
          is_new_arrival: false,
          rating: 4.8,
          review_count: 18,
          discount_percent: 25,
          flash_sale_units: 0,
          images: []
        }
      ]
    };
  };

  // Fetch Storefront Data
  const fetchProducts = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=${pageNum}&limit=12`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStoreData(json.data.store);
          setCategories(json.data.categories?.length > 0 ? json.data.categories : getDemoStoreData(tenant).categories);
          
          const newProducts = json.data.products?.length > 0 ? json.data.products : getDemoStoreData(tenant).products;
          
          if (isLoadMore) {
            setProducts(prev => [...prev, ...newProducts]);
          } else {
            setProducts(newProducts);
          }

          if (json.data.pagination) {
            setHasMore(pageNum < json.data.pagination.totalPages);
          } else {
            setHasMore(false);
          }
          
          setLoading(false);
          setLoadingMore(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API fetch failed, utilizing demo store fallback:', err);
    }
    
    // Fallback for unseeded stores or offline backend
    const demo = getDemoStoreData(tenant);
    setStoreData(demo.store);
    setProducts(demo.products);
    setCategories(demo.categories);
    setHasMore(false);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchProducts(1);
  }, [tenant, API_URL]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Currency Formatter (Naira ₦)
  const formatNaira = (amount) => {
    const num = Number(amount) || 0;
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Wishlist Toggle
  const toggleWishlist = async (productId) => {
    const exists = wishlist.includes(productId);
    
    if (exists) {
      setWishlist(prev => prev.filter(id => id !== productId));
      addToast('Removed from Wishlist', 'info');
      try {
        await fetch(`${API_URL}/api/wishlist/${productId}?tenant=${tenant}&sessionId=${sessionId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to remove from wishlist', err);
      }
    } else {
      setWishlist(prev => [...prev, productId]);
      addToast('Added to Wishlist!', 'success');
      try {
        await fetch(`${API_URL}/api/wishlist?tenant=${tenant}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, productId })
        });
      } catch (err) {
        console.error('Failed to add to wishlist', err);
      }
    }
  };

  // --- Customer Auth Logic ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const endpoint = authMode === 'login' ? '/api/customers/login' : '/api/customers/register';
      const res = await fetch(`${API_URL}${endpoint}?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      
      if (!data.success) {
        setAuthError(data.error || 'Authentication failed');
      } else {
        localStorage.setItem(`customer_${tenant}`, JSON.stringify(data.data.customer));
        localStorage.setItem(`customerToken_${tenant}`, data.data.token);
        setCustomer(data.data.customer);
        setIsAuthModalOpen(false);
        addToast(authMode === 'login' ? 'Logged in successfully!' : 'Account created successfully!', 'success');
      }
    } catch (err) {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutCustomer = () => {
    localStorage.removeItem(`customer_${tenant}`);
    localStorage.removeItem(`customerToken_${tenant}`);
    setCustomer(null);
    setCustomerOrders([]);
    setIsAccountModalOpen(false);
    addToast('Logged out successfully', 'info');
  };

  const fetchCustomerOrders = async () => {
    const token = localStorage.getItem(`customerToken_${tenant}`);
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/customers/orders?tenant=${tenant}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomerOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    if (isAccountModalOpen && customer) {
      fetchCustomerOrders();
    }
  }, [isAccountModalOpen, customer]);
  // -------------------------

  // Review Handlers
  const openReviewModal = async (product) => {
    setReviewProduct(product);
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}/reviews?tenant=${tenant}`);
      const json = await res.json();
      if (json.success) {
        setReviewsList(json.data || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${reviewProduct.id}/reviews?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const json = await res.json();
      if (json.success) {
        addToast('Thank you! Review submitted successfully!', 'success');
        setReviewsList(prev => [json.data, ...prev]);
        setNewReview({ authorName: '', rating: 5, comment: '' });
        // Refresh products to show updated rating
        const prodRes = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=1&limit=12`);
        const prodJson = await prodRes.json();
        if (prodJson.success && prodJson.data.products?.length > 0) {
          setProducts(prodJson.data.products);
          setPage(1);
          setHasMore(prodJson.data.pagination?.totalPages > 1);
        }
      }
    } catch (err) {
      addToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openProductDetail = (product) => {
    setSelectedDetailProduct(product);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    let parsedImages = [];
    try {
      parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
    } catch (e) {
      parsedImages = [];
    }
    const gallery = [product.image_url, ...(Array.isArray(parsedImages) ? parsedImages : [])].filter(Boolean);
    setActiveDetailImage(gallery[0] || null);
  };

  // Add To Cart
  const addToCart = (product, variant = null) => {
    const itemStock = variant ? variant.stock : product.stock;
    const itemPrice = variant ? Number(product.price) + Number(variant.price_adjustment) : Number(product.price);
    const itemTitle = variant ? `${product.title} - ${variant.value}` : product.title;
    
    if (itemStock === 0) {
      addToast(`Out of stock`, 'error');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id && item.variant_id === (variant ? variant.id : null));
      if (existing) {
        if (existing.quantity >= itemStock) {
          addToast(`Only ${itemStock} in stock`, 'error');
          return prev;
        }
        addToast(`Updated ${itemTitle} quantity in Cart`, 'success');
        return prev.map(item => 
          (item.product_id === product.id && item.variant_id === (variant ? variant.id : null))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      addToast(`Added ${itemTitle} to Cart!`, 'success');
      return [...prev, { 
        product_id: product.id, 
        variant_id: variant ? variant.id : null,
        variant_info: variant,
        title: itemTitle, 
        price: itemPrice, 
        image_url: product.image_url,
        quantity: 1,
        stock: itemStock
      }];
    });
  };

  const updateQuantity = (productId, delta, variantId = null) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId && item.variant_id === variantId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > item.stock) {
           addToast(`Only ${item.stock} in stock`, 'error');
           return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart(prev => prev.filter(item => !(item.product_id === productId && item.variant_id === variantId)));
    addToast('Item removed from cart', 'info');
  };

  // Stripe Payment Scaffolding & Order Execution
  const initiatePayment = async () => {
    if (cart.length === 0) return;
    setPaymentLoading(true);

    try {
      const token = localStorage.getItem(`customerToken_${tenant}`);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const orderRes = await fetch(`${API_URL}/api/orders?tenant=${tenant}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity, variant_id: item.variant_id }))
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const createdOrder = orderData.data;

      const checkoutRes = await fetch(`${API_URL}/api/checkout/create-session?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
          items: cart.map(item => ({ title: item.title, price: item.price, quantity: item.quantity, image_url: item.image_url }))
        })
      });
      const checkoutData = await checkoutRes.json();

      if (checkoutData.success && checkoutData.data?.url) {
        window.location.href = checkoutData.data.url;
      } else {
        setPaymentSuccess({
          orderId: createdOrder.id,
          totalAmount: createdOrder.total_amount,
          isMock: true,
          message: checkoutData.data?.message || 'Stripe Gateway Scaffolding Active. Payment processed in demo mode.'
        });
        setCart([]);
        setIsCartOpen(false);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      addToast(err.message || 'Payment initiation failed', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper SVG Line Icon renderer for category names
  const renderCategoryIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('phone')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
    }
    if (n.includes('computer') || n.includes('laptop')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    }
    if (n.includes('watch')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.42 3.83A2 2 0 0 1 14.1 23H9.9a2 2 0 0 1-1.99-1.82l-.42-3.83"/><path d="M7.49 6.65l.42-3.83A2 2 0 0 1 9.9 1h4.2a2 2 0 0 1 1.99 1.82l.42 3.83"/></svg>;
    }
    if (n.includes('camera')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    }
    if (n.includes('headphone') || n.includes('audio')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
    }
    if (n.includes('gaming') || n.includes('game')) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><rect x="2" y="6" width="20" height="12" rx="6"/></svg>;
    }
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  };

  // Filtered Products (Clay Shop multi-attribute filtering)
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = Number(p.price) <= priceRange;
    const matchesRating = minRating === 0 || (Number(p.rating || 4.5) >= minRating);
    const matchesSize = selectedSize === 'All' || 
      (p.variants && p.variants.some(v => v.value?.toLowerCase() === selectedSize.toLowerCase())) ||
      (!p.variants || p.variants.length === 0);
    return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesSize;
  });

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const wishlistCount = wishlist.length;

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="text-center bg-[#141418] border border-[#272734] p-8 rounded-xl max-w-md w-full shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">404 - Store Not Found</h1>
          <p className="text-[#a1a1aa] text-sm mb-6">{error}</p>
          <a href="/" className="inline-block px-5 py-2.5 bg-[#db4444] text-white rounded-lg font-medium text-xs uppercase tracking-wider">
            Back to Platform
          </a>
        </div>
      </div>
    );
  }

  const getStoreDisplayName = () => {
    if (!storeData) return tenant;
    if (typeof storeData === 'object' && storeData?.name) return storeData.name;
    return tenant;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Banner Announcement Bar */}
      <div className="bg-[var(--accent-clay)] border-b border-[var(--border)] text-xs py-2 px-4 text-center text-[var(--accent-dark)] flex items-center justify-center gap-2 font-medium">
        <span>Summer Clay Collection & Free Express Delivery Over ₦50,000!</span>
        <a href="#products-grid" className="font-bold underline hover:opacity-80 transition-opacity">Discover Now</a>
      </div>

      {/* Main Store Header */}
      <header className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none rounded-xl"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <a href={`/${tenant}`} className="text-xl font-bold tracking-tight capitalize flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                {getStoreDisplayName().charAt(0)}
              </span>
              <span className="font-editorial text-2xl font-semibold tracking-wide text-[var(--foreground)]">{loading ? '...' : getStoreDisplayName()}</span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted)]">
            <a href={`/${tenant}`} className="text-[var(--foreground)] font-semibold border-b-2 border-[var(--accent)] pb-0.5">Home</a>
            <a href="#products-grid" className="hover:text-[var(--foreground)] transition-colors">Shop</a>
            <a href="#categories-section" className="hover:text-[var(--foreground)] transition-colors">Categories</a>
          </nav>

          {/* Search & Actions: Theme Toggle, Wishlist, Cart, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center relative">
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-44 lg:w-56 bg-[var(--background)] border border-[var(--border)] rounded-full pl-3.5 pr-8 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-all"
              />
              <button 
                onClick={scrollToProducts} 
                className="absolute right-2.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Search products"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all shadow-xs"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark and Light Mode"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            
            {/* Account Button */}
            <button 
              onClick={() => customer ? setIsAccountModalOpen(true) : setIsAuthModalOpen(true)}
              className="relative p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all shadow-xs"
              aria-label="Account"
              title={customer ? `Account (${customer.name})` : "Sign In"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            
            {/* Wishlist Button */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all shadow-xs"
              aria-label={`Wishlist, ${wishlistCount} items`}
              title="Wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all shadow-xs"
              aria-label={`Shopping Cart, ${cartItemsCount} items`}
              title="Shopping Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]"
            />
            <button onClick={scrollToProducts} className="absolute right-3 top-2.5 text-[#a1a1aa] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] z-50 flex flex-col shadow-2xl transition-colors duration-300" style={{ animation: 'slideInLeft 0.3s ease-out' }}>
            {/* Drawer Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <a href={`/${tenant}`} className="text-lg font-bold tracking-tight capitalize flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center">
                  {getStoreDisplayName().charAt(0)}
                </span>
                <span className="font-editorial text-xl text-[var(--foreground)]">{loading ? '...' : getStoreDisplayName()}</span>
              </a>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Drawer Search */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]"
                />
                <button onClick={() => { scrollToProducts(); setIsMobileMenuOpen(false); }} className="absolute right-3 top-3 text-[var(--muted)] hover:text-[var(--foreground)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 px-3">Collections</p>
              
              <button
                onClick={() => { setSelectedCategory('All'); scrollToProducts(); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                All Products
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); scrollToProducts(); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                  }`}
                >
                  {renderCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))}

              <div className="border-t border-[var(--border)] my-4"></div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 px-3">Quick Links</p>
              
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                <span className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  )}
                  {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--background)] border border-[var(--border)]">{theme}</span>
              </button>

              <a
                href="#flash-sales"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Flash Sales
              </a>
              
              <button
                onClick={() => { setIsWishlistOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Wishlist ({wishlistCount})
              </button>

              <button
                onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Cart ({cartItemsCount})
              </button>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] text-center">
              <p className="text-[10px] text-[var(--muted)] font-mono">Mercato Commerce Engine</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-12">
        
        {/* EDITORIAL CLAY HERO BANNER SECTION */}
        {(() => {
          // Determine which product to showcase in Hero
          const heroProduct = (storeData?.hero_product_id && products.find(p => p.id === Number(storeData.hero_product_id))) ||
                              products.find(p => p.is_featured) ||
                              products[0] ||
                              null;
          
          const heroImage = heroProduct?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";
          const heroItemTitle = heroProduct ? heroProduct.title : "Summer Elegance";
          const heroItemPrice = heroProduct ? formatNaira(heroProduct.price) : "From ₦25,000";
          const heroBadgeText = storeData?.hero_badge || "Spring / Summer 2026 Collection";
          const heroMainTitle = storeData?.hero_title || "Admire Stylish Dresses & Looks";
          const heroSubtitleText = storeData?.hero_subtitle || "Discover curated contemporary fashion, luxury footwear, and modern lifestyle essentials with seamless Naira checkout.";

          return (
            <section className="relative rounded-3xl bg-[var(--card-clay)] border border-[var(--border)] overflow-hidden p-8 sm:p-14 transition-all duration-300 shadow-sm">
              {/* Subtle decorative background shapes */}
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--accent-light)] blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[var(--accent-clay)] blur-2xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left Content */}
                <div className="md:col-span-7 space-y-5 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface)]/80 backdrop-blur-xs border border-[var(--border)] text-[var(--muted)] text-[11px] font-semibold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span> {heroBadgeText}
                  </div>
                  
                  <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[var(--foreground)] leading-[1.1]">
                    {heroMainTitle}
                  </h1>

                  <p className="text-sm sm:text-base text-[var(--muted)] max-w-lg leading-relaxed">
                    {heroSubtitleText}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <a 
                      href="#products-grid" 
                      className="btn-clay"
                    >
                      <span>Show More</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>

                    <a 
                      href="#categories-section" 
                      className="btn-clay-outline"
                    >
                      Browse Catalog
                    </a>
                  </div>
                </div>

                {/* Right Editorial Showcase Card */}
                <div className="md:col-span-5 flex justify-center md:justify-end">
                  <div 
                    onClick={() => { if (heroProduct) openProductDetail(heroProduct); }}
                    className="relative w-full max-w-xs aspect-[4/5] rounded-3xl overflow-hidden shadow-clay border border-[var(--card-border)] bg-[var(--surface)] group cursor-pointer"
                  >
                    <Image 
                      src={heroImage} 
                      alt={heroItemTitle} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 400px" 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      priority
                    />
                    
                    {/* Floating Clay Floating Tag */}
                    <div className="absolute bottom-4 inset-x-4 p-3.5 rounded-2xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] flex items-center justify-between shadow-soft">
                      <div className="overflow-hidden pr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Featured in Hero</span>
                        <span className="text-xs font-semibold text-[var(--foreground)] truncate block">{heroItemTitle}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--accent-dark)] shrink-0">{heroItemPrice}</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          );
        })()}

        {/* FEATURED CATEGORY TILES (CLAY SHOP STYLE) */}
        <section id="categories-section" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div 
            onClick={() => { setSelectedCategory('Apparel'); scrollToProducts(); }}
            className="cursor-pointer relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-[var(--border)] bg-gradient-to-br from-[#f8e7e1] to-[#eedcd6] dark:from-[#262022] dark:to-[#1e191b] group transition-all duration-300 hover:-translate-y-1 hover:shadow-clay"
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-dark)] block">Collection</span>
                <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-0.5">Apparel</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--surface)]/80 text-[var(--foreground)] border border-[var(--border)]">
                24 Items
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--accent-dark)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 z-10">
              Explore &rarr;
            </span>
          </div>

          <div 
            onClick={() => { setSelectedCategory('Shoes'); scrollToProducts(); }}
            className="cursor-pointer relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-[var(--border)] bg-gradient-to-br from-[#f2ebe5] to-[#e4dad3] dark:from-[#232125] dark:to-[#1a191d] group transition-all duration-300 hover:-translate-y-1 hover:shadow-clay"
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Footwear</span>
                <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-0.5">Bestsellers</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--surface)]/80 text-[var(--foreground)] border border-[var(--border)]">
                Popular
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--accent-dark)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 z-10">
              Shop Now &rarr;
            </span>
          </div>

          <div 
            onClick={() => { setSelectedCategory('Accessories'); scrollToProducts(); }}
            className="cursor-pointer relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-[var(--border)] bg-gradient-to-br from-[#ebddec] to-[#ded0e0] dark:from-[#291f2c] dark:to-[#1c161f] group transition-all duration-300 hover:-translate-y-1 hover:shadow-clay"
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Highlights</span>
                <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-0.5">Accessories</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--surface)]/80 text-[var(--foreground)] border border-[var(--border)]">
                New
              </span>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 z-10">
              Discover &rarr;
            </span>
          </div>
        </section>

        {/* FLASH SALES SECTION (Conditionally shown based on Admin Toggle) */}
        {storeData?.show_flash_deals !== false && (
          <section id="flash-sales" className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block animate-ping"></span>
                  <span>Limited Time Offer</span>
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--foreground)]">Flash Deals</h2>
              </div>

              <div className="flex items-center gap-2 text-center font-mono">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-3.5 py-2 min-w-[54px] shadow-xs">
                  <span className="text-[var(--muted)] block uppercase text-[9px] font-bold">Days</span>
                  <span className="text-base font-bold text-[var(--foreground)]">{String(timeLeft.days).padStart(2, '0')}</span>
                </div>
                <span className="text-[var(--accent)] font-bold">:</span>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-3.5 py-2 min-w-[54px] shadow-xs">
                  <span className="text-[var(--muted)] block uppercase text-[9px] font-bold">Hours</span>
                  <span className="text-base font-bold text-[var(--foreground)]">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <span className="text-[var(--accent)] font-bold">:</span>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-3.5 py-2 min-w-[54px] shadow-xs">
                  <span className="text-[var(--muted)] block uppercase text-[9px] font-bold">Mins</span>
                  <span className="text-base font-bold text-[var(--foreground)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <span className="text-[var(--accent)] font-bold">:</span>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-3.5 py-2 min-w-[54px] shadow-xs">
                  <span className="text-[var(--muted)] block uppercase text-[9px] font-bold">Secs</span>
                  <span className="text-base font-bold text-[var(--accent-dark)]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 rounded-3xl skeleton"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {(products.filter(p => p.is_featured).length > 0 
                  ? products.filter(p => p.is_featured) 
                  : filteredProducts.slice(0, 4)
                ).map(product => {
                  const isWishlisted = wishlist.includes(product.id);
                  const originalPrice = product.original_price || (Number(product.price) * 1.25);
                  const calculatedPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                  const discountPercent = product.discount_percent || (calculatedPercent > 0 ? calculatedPercent : 20);

                  return (
                    <div key={product.id} className="clay-card group relative overflow-hidden flex flex-col">
                      
                      {/* Discount Badge */}
                      <div className="absolute top-3.5 left-3.5 z-10 bg-[var(--accent)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        -{discountPercent}% OFF
                      </div>

                      {/* Wishlist Button */}
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-full border transition-all ${
                          isWishlisted 
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' 
                            : 'bg-[var(--surface)]/90 backdrop-blur-xs border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>

                      <div 
                        onClick={() => openProductDetail(product)}
                        className="aspect-square relative overflow-hidden bg-[var(--card-clay)] flex items-center justify-center cursor-pointer m-3 rounded-2xl"
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
                        ) : (
                          <div className="text-[var(--muted)] text-xs font-mono">{product.category || 'Item'}</div>
                        )}
                      </div>

                      <div className="p-4 pt-1 flex flex-col flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)] mb-1">{product.category || 'Collection'}</span>
                        <h3 className="text-sm font-semibold text-[var(--foreground)] truncate mb-2 cursor-pointer hover:text-[var(--accent-dark)] transition-colors" onClick={() => openProductDetail(product)}>
                          {product.title}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-base font-mono font-bold text-[var(--accent-dark)]">{formatNaira(product.price)}</span>
                          <span className="text-xs text-[var(--muted)] line-through">{formatNaira(originalPrice)}</span>
                        </div>
                        
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="btn-clay w-full mt-auto text-xs py-2 disabled:opacity-50"
                        >
                          {product.stock > 0 ? 'Shop Now' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* BROWSE BY CATEGORY PILLS SECTION */}
        <section className="space-y-6 pt-4 border-t border-[var(--border)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span>Categories</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--foreground)]">Browse By Category</h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>All Products</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]'
                }`}
              >
                {renderCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* EXPLORE OUR PRODUCTS WITH CLAY SHOP FILTER SIDEBAR */}
        <section id="products-grid" ref={productsGridRef} className="space-y-8 pt-6 border-t border-[var(--border)] scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                <span>Exclusive Catalog</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--foreground)]">Explore Our Products</h2>
            </div>
            <p className="text-xs font-medium text-[var(--muted)]">
              Showing {filteredProducts.length} curated item{filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDEBAR FILTERS (MATCHING CLAY SHOP SKETCH DESIGN) */}
            <div className="hidden lg:block lg:col-span-3 space-y-6 bg-[var(--card)] border border-[var(--card-border)] p-6 rounded-3xl shadow-soft sticky top-24">
              
              {/* Category Filter */}
              <div className="space-y-3 pb-5 border-b border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Category</h4>
                  {selectedCategory !== 'All' && (
                    <button onClick={() => setSelectedCategory('All')} className="text-[10px] text-[var(--accent-dark)] hover:underline font-bold">Reset</button>
                  )}
                </div>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedCategory === 'All' ? 'bg-[var(--accent-clay)] text-[var(--accent-dark)] font-bold' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className="text-[10px] font-mono opacity-70">{products.length}</span>
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-[var(--accent-clay)] text-[var(--accent-dark)] font-bold' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {renderCategoryIcon(cat.name)}
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono opacity-70">
                        {products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3 pb-5 border-b border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Max Price</h4>
                  <span className="text-xs font-mono font-bold text-[var(--accent-dark)]">{formatNaira(priceRange)}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="500000" 
                  step="5000"
                  value={priceRange} 
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                  <span>₦5,000</span>
                  <span>₦500,000+</span>
                </div>
              </div>

              {/* Sizes (Clay Shop Chip Buttons) */}
              <div className="space-y-3 pb-5 border-b border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Size</h4>
                  {selectedSize !== 'All' && (
                    <button onClick={() => setSelectedSize('All')} className="text-[10px] text-[var(--accent-dark)] hover:underline font-bold">Reset</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['XXS', 'XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(prev => prev === size ? 'All' : size)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedSize === size
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
                          : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Rating Filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Rating</h4>
                  {minRating > 0 && (
                    <button onClick={() => setMinRating(0)} className="text-[10px] text-[var(--accent-dark)] hover:underline font-bold">Clear</button>
                  )}
                </div>
                <div className="space-y-1">
                  {[4, 3, 2].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(prev => prev === star ? 0 : star)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                        minRating === star ? 'bg-[var(--accent-clay)] font-bold text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <div className="flex text-amber-400 text-xs">
                        {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">& Up</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT PRODUCTS GRID */}
            <div className="lg:col-span-9 space-y-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent-clay)] text-[var(--accent-dark)] flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <h3 className="font-editorial text-xl font-semibold text-[var(--foreground)] mb-1">No products match your criteria</h3>
                  <p className="text-xs text-[var(--muted)] mb-6">Try adjusting your filters, price range, or category selection.</p>
                  <button 
                    onClick={() => { setSelectedCategory('All'); setPriceRange(500000); setMinRating(0); setSelectedSize('All'); setSearchQuery(''); }}
                    className="btn-clay text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {filteredProducts.map(product => {
                    const isWishlisted = wishlist.includes(product.id);
                    const originalPrice = product.original_price || (Number(product.price) * 1.25);
                    const isNew = product.is_new_arrival;

                    return (
                      <div key={product.id} className="clay-card group relative overflow-hidden flex flex-col">
                        
                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1">
                          {isNew && (
                            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                              New
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="bg-purple-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button 
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-full border transition-all ${
                            isWishlisted 
                              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' 
                              : 'bg-[var(--surface)]/90 backdrop-blur-xs border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                          }`}
                          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          aria-pressed={isWishlisted}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>

                        <div 
                          onClick={() => openProductDetail(product)} 
                          onKeyDown={(e) => { if(e.key === 'Enter') openProductDetail(product); }}
                          className="aspect-square relative overflow-hidden bg-[var(--card-clay)] flex items-center justify-center cursor-pointer m-3 rounded-2xl"
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${product.title}`}
                        >
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
                          ) : (
                            <div className="text-[var(--muted)] text-xs font-mono">{product.category || 'Product'}</div>
                          )}
                        </div>

                        <div className="p-4 pt-1 flex flex-col flex-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)] mb-1">{product.category || 'Collection'}</span>
                          
                          <h3 
                            className="text-sm font-semibold text-[var(--foreground)] truncate mb-2 cursor-pointer hover:text-[var(--accent-dark)] transition-colors" 
                            onClick={() => openProductDetail(product)}
                            onKeyDown={(e) => { if(e.key === 'Enter') openProductDetail(product); }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${product.title}`}
                          >
                            {product.title}
                          </h3>

                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-base font-mono font-bold text-[var(--accent-dark)]">{formatNaira(product.price)}</span>
                            <span className="text-[11px] text-[var(--muted)] font-mono">{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            disabled={product.stock === 0}
                            className="btn-clay w-full mt-auto text-xs py-2 disabled:opacity-50"
                            aria-label={`Add ${product.title} to cart`}
                          >
                            {product.stock > 0 ? 'Shop Now' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasMore && !loading && (
                <div className="flex justify-center mt-12">
                  <button 
                    onClick={loadMore} 
                    disabled={loadingMore} 
                    className="btn-clay-outline text-xs px-8 py-3 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading More Products...' : 'Load More Products'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* TRUST BADGES SECTION (CLAY SHOP SOFT CARDS) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[var(--border)] text-center">
          <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl shadow-soft flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--accent-dark)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">Express Delivery</h4>
            <p className="text-xs text-[var(--muted)]">Fast and secure shipping across Nigeria</p>
          </div>
          <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl shadow-soft flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--accent-dark)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">24/7 Dedicated Support</h4>
            <p className="text-xs text-[var(--muted)]">Instant assistance for order tracking</p>
          </div>
          <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl shadow-soft flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--accent-dark)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">Authentic Guarantee</h4>
            <p className="text-xs text-[var(--muted)]">100% verified original brand items</p>
          </div>
        </section>

      </main>

      {/* --- CUSTOMER AUTH MODAL --- */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAuthModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 sm:p-8">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-dark)] block">Customer Portal</span>
                  <h2 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-0.5">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                </div>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] p-2 rounded-full border border-[var(--border)] hover:bg-[var(--background)] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className="pt-6">
                {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-semibold text-center">{authError}</div>}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">Full Name</label>
                        <input required type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">Phone</label>
                        <input type="text" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="+234..." />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">Email Address</label>
                    <input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">Password</label>
                    <input required type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="••••••••" />
                  </div>
                  
                  <button type="submit" disabled={authLoading} className="btn-clay w-full py-3.5 mt-4 text-xs font-bold uppercase tracking-wider disabled:opacity-50">
                    {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In to Account' : 'Complete Registration')}
                  </button>
                </form>
                
                <div className="mt-6 text-center text-xs text-[var(--muted)]">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-[var(--accent-dark)] font-bold hover:underline ml-1">
                    {authMode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CUSTOMER ACCOUNT & ORDERS DRAWER --- */}
      <AnimatePresence>
        {isAccountModalOpen && customer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40" onClick={() => setIsAccountModalOpen(false)}></motion.div>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[var(--surface)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--card)]">
                <h2 className="font-editorial text-2xl font-semibold text-[var(--foreground)] flex items-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Account
                </h2>
                <button onClick={() => setIsAccountModalOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full border border-[var(--border)] hover:bg-[var(--background)] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider mb-3">Profile Details</h3>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-[var(--foreground)] text-base">{customer.name || customer.email.split('@')[0]}</p>
                      <p className="text-xs text-[var(--muted)]">{customer.email}</p>
                    </div>
                    <button onClick={logoutCustomer} className="text-xs font-semibold px-3 py-1.5 border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">Sign Out</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider mb-3">Order History</h3>
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--card-clay)] border border-[var(--border)] rounded-2xl border-dashed">
                      <svg className="w-10 h-10 mx-auto text-[var(--muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                      <p className="text-xs text-[var(--muted)]">You haven't placed any orders yet.</p>
                      <button onClick={() => setIsAccountModalOpen(false)} className="mt-3 text-[var(--accent-dark)] font-bold text-xs hover:underline">Start Shopping &rarr;</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(order => (
                        <div key={order.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
                          <div className="p-4 border-b border-[var(--border)] bg-[var(--card-clay)] flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-[var(--muted)] font-mono mb-0.5">#{order.id.slice(0,8).toUpperCase()}</p>
                              <p className="text-xs font-medium text-[var(--foreground)]">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-xs font-bold font-mono text-[var(--foreground)] mt-1">{formatNaira(order.total_amount)}</p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div>
                                  <p className="text-[var(--foreground)] font-semibold">Product #{item.product_id}</p>
                                  {item.variant_info && <p className="text-[10px] text-[var(--muted)]">{item.variant_info.name}: {item.variant_info.value}</p>}
                                </div>
                                <div className="text-right font-mono text-[var(--muted)]">
                                  <span>x{item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCartOpen(false)}></motion.div>
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] h-full flex flex-col z-10 shadow-2xl">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)]">Your Shopping Bag</h3>
                  <p className="text-xs text-[var(--muted)] font-mono">{cartItemsCount} item{cartItemsCount === 1 ? '' : 's'}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full border border-[var(--border)] hover:bg-[var(--background)] transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-[var(--muted)]">
                    <div className="w-14 h-14 rounded-full bg-[var(--card-clay)] text-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <p className="font-semibold text-[var(--foreground)] text-sm">Your bag is empty</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Explore our latest styles and add items to your cart.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.product_id}-${item.variant_id || 'base'}-${idx}`} className="relative flex items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xs">
                      <button 
                        onClick={() => removeFromCart(item.product_id, item.variant_id)} 
                        className="absolute top-3 right-3 text-[var(--muted)] hover:text-red-500 transition-colors text-xs"
                        title="Remove item"
                      >
                        ✕
                      </button>
                      <div className="w-16 h-16 rounded-xl bg-[var(--card-clay)] border border-[var(--border)] overflow-hidden relative flex-shrink-0">
                        {item.image_url && <Image src={item.image_url} alt={item.title} fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-xs font-semibold text-[var(--foreground)] truncate">{item.title}</h4>
                        {item.variant_info && (
                          <p className="text-[10px] text-[var(--muted)]">{item.variant_info.name}: {item.variant_info.value}</p>
                        )}
                        <span className="text-xs font-mono font-bold text-[var(--accent-dark)] block mt-0.5">{formatNaira(item.price)}</span>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product_id, -1, item.variant_id)} className="w-6 h-6 flex items-center justify-center bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold hover:border-[var(--accent)]">-</button>
                          <span className="text-xs font-mono font-semibold px-1">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, 1, item.variant_id)} className="w-6 h-6 flex items-center justify-center bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold hover:border-[var(--accent)]">+</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-[var(--border)] bg-[var(--card)] space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-[var(--muted)]">Subtotal:</span>
                    <span className="text-xl font-mono text-[var(--accent-dark)]">{formatNaira(cartTotal)}</span>
                  </div>

                  <button
                    onClick={initiatePayment}
                    disabled={paymentLoading}
                    className="btn-clay w-full py-4 text-xs uppercase tracking-wider font-bold shadow-md disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Proceed to Checkout (Stripe NGN)'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WISHLIST DRAWER */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)}></motion.div>
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[#141418] border-l border-[#272734] h-full flex flex-col z-10 shadow-2xl">
              <div className="p-5 border-b border-[#272734] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Your Wishlist</h3>
                <p className="text-xs text-[#a1a1aa] font-mono">{wishlistCount} item(s) saved</p>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 text-[#a1a1aa] hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="w-12 h-12 rounded-full bg-[#181824] text-[#a1a1aa] flex items-center justify-center mx-auto mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-white">No items in your wishlist</p>
                </div>
              ) : (
                products.filter(p => wishlist.includes(p.id)).map(product => (
                  <div key={product.id} className="flex items-center justify-between gap-3 p-3.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xs">
                    <div className="w-14 h-14 rounded-xl bg-[var(--card-clay)] overflow-hidden border border-[var(--border)] flex items-center justify-center relative flex-shrink-0">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill sizes="56px" className="object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[var(--foreground)] truncate">{product.title}</h4>
                      <span className="text-xs font-mono font-bold text-[var(--accent-dark)]">{formatNaira(product.price)}</span>
                    </div>

                    <button 
                      onClick={() => { addToCart(product); toggleWishlist(product.id); }}
                      className="btn-clay text-[10px] py-1.5 px-3 uppercase tracking-wider"
                    >
                      Shop Now
                    </button>
                  </div>
                ))
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STRIPE PAYMENT CONFIRMATION MODAL (DEMO / SCAFFOLDING MODE) */}
      {isPaymentModalOpen && paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPaymentModalOpen(false)}></div>
          
          <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[var(--accent-clay)] text-[var(--accent-dark)] border border-[var(--border)] rounded-full flex items-center justify-center text-3xl mx-auto">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)]">Order Confirmed!</h3>
            
            <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Order ID:</span>
                <span className="text-[var(--foreground)] font-bold">{paymentSuccess.orderId?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Total Paid:</span>
                <span className="text-[var(--accent-dark)] font-bold">{formatNaira(paymentSuccess.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Gateway:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Stripe NGN (Direct Checkout)</span>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {paymentSuccess.message}
            </p>

            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="btn-clay w-full py-3.5 text-xs uppercase tracking-wider font-bold"
            >
              Done / Return to Catalog
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL (Gallery & Detailed Description) */}
      <AnimatePresence>
        {selectedDetailProduct && (() => {
          let parsedImages = [];
          try {
            parsedImages = typeof selectedDetailProduct.images === 'string' 
              ? JSON.parse(selectedDetailProduct.images) 
              : (selectedDetailProduct.images || []);
          } catch (e) {
            parsedImages = [];
          }
          const gallery = [selectedDetailProduct.image_url, ...(Array.isArray(parsedImages) ? parsedImages : [])].filter(Boolean);
          const mainImg = activeDetailImage || gallery[0];
          const isWishlisted = wishlist.includes(selectedDetailProduct.id);
          const originalPrice = selectedDetailProduct.original_price || (Number(selectedDetailProduct.price) * 1.25);
          const calculatedPercent = Math.round(((originalPrice - selectedDetailProduct.price) / originalPrice) * 100);
          const discountPercent = selectedDetailProduct.discount_percent || (calculatedPercent > 0 ? calculatedPercent : 20);

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedDetailProduct(null)}></motion.div>
              
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-3xl w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedDetailProduct(null)} 
                className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Image Gallery Column */}
                <div className="space-y-3">
                  <div className="aspect-square bg-[var(--card-clay)] border border-[var(--border)] rounded-2xl overflow-hidden flex items-center justify-center p-4 relative shadow-soft">
                    {mainImg ? (
                      <Image src={mainImg} alt={selectedDetailProduct.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-xl" />
                    ) : (
                      <div className="text-[var(--muted)] text-xs font-mono">No Image Preview</div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {gallery.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDetailImage(imgUrl)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[var(--card-clay)] relative ${
                            mainImg === imgUrl ? 'border-[var(--accent)] scale-95' : 'border-[var(--border)] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image src={imgUrl} alt="Thumbnail" fill sizes="56px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info & Action Column */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-[var(--accent-clay)] border border-[var(--border)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-dark)] rounded-full">
                        {selectedDetailProduct.category || 'Curated'}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedDetailProduct.stock > 0 ? `In Stock (${selectedDetailProduct.stock} units)` : 'Out of Stock'}
                      </span>
                    </div>

                    <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight leading-snug">
                      {selectedDetailProduct.title}
                    </h2>

                    {/* Price & Strikethrough */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-black font-mono text-[var(--accent-dark)]">{formatNaira(selectedDetailProduct.price)}</span>
                      <span className="text-xs text-[var(--muted)] line-through">{formatNaira(originalPrice)}</span>
                      <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        -{discountPercent}% OFF
                      </span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <div className="flex text-amber-400">★★★★☆</div>
                      <span>({selectedDetailProduct.review_count || 12} customer reviews)</span>
                      <button 
                        onClick={() => { setSelectedDetailProduct(null); openReviewModal(selectedDetailProduct); }} 
                        className="text-[var(--accent-dark)] hover:underline font-bold ml-2"
                      >
                        Read Reviews
                      </button>
                    </div>

                    <div className="border-t border-[var(--border)] my-2"></div>

                    {/* Detailed Item Description */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">Item Overview & Specs</h4>
                      <p className="text-xs text-[var(--muted)] leading-relaxed whitespace-pre-line bg-[var(--card)] p-3.5 border border-[var(--border)] rounded-2xl">
                        {selectedDetailProduct.description || 'Premium build quality and high performance. Built with durable materials for long-lasting performance and reliability.'}
                      </p>
                    </div>
                  </div>

                  {/* Variants */}
                  {selectedDetailProduct.variants && selectedDetailProduct.variants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-3">Available Options</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDetailProduct.variants.map((v, i) => {
                          const isSelected = selectedVariant?.id === v.id;
                          const variantPriceStr = Number(v.price_adjustment) > 0 ? ` (+${formatNaira(Number(v.price_adjustment))})` : '';
                          return (
                            <button
                              key={v.id || i}
                              onClick={() => setSelectedVariant(v)}
                              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                                isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              {v.name}: {v.value} {variantPriceStr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-[var(--border)] flex items-center gap-3">
                    <button
                      onClick={() => { addToCart(selectedDetailProduct, selectedVariant); }}
                      disabled={(selectedVariant ? selectedVariant.stock : selectedDetailProduct.stock) === 0}
                      className="btn-clay flex-1 py-3.5 text-xs uppercase tracking-wider font-bold disabled:opacity-50"
                    >
                      {(selectedVariant ? selectedVariant.stock : selectedDetailProduct.stock) > 0 ? 'Shop Now' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => toggleWishlist(selectedDetailProduct.id)}
                      className={`p-3 rounded-2xl border transition-all ${
                        isWishlisted ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
      </AnimatePresence>

      {/* CUSTOMER PRODUCT REVIEWS MODAL */}
      <AnimatePresence>
        {reviewProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setReviewProduct(null)}></motion.div>
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-editorial text-xl font-semibold text-[var(--foreground)]">{reviewProduct.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="text-amber-400 font-bold">★ {reviewProduct.rating || 4.5}</span>
                  <span>({reviewsList.length} review{reviewsList.length === 1 ? '' : 's'})</span>
                </div>
              </div>
              <button onClick={() => setReviewProduct(null)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full border border-[var(--border)]">✕</button>
            </div>

            {/* Leave a Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Write a Customer Review</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. John D."
                    value={newReview.authorName}
                    onChange={e => setNewReview({ ...newReview, authorName: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Rating</label>
                  <select 
                    value={newReview.rating}
                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[var(--muted)] block mb-1">Your Review</label>
                <textarea 
                  required 
                  rows="2"
                  placeholder="Share your experience with this product..."
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="btn-clay w-full py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </form>

            {/* Existing Customer Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Customer Feedback</h4>
              
              {reviewLoading ? (
                <div className="text-xs text-[var(--muted)] text-center py-4">Loading reviews...</div>
              ) : reviewsList.length === 0 ? (
                <div className="text-xs text-[var(--muted)] text-center py-4">No reviews yet. Be the first to leave a review!</div>
              ) : (
                reviewsList.map(rev => (
                  <div key={rev.id} className="p-3.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--foreground)]">{rev.author_name}</span>
                      <span className="text-amber-400">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-[var(--muted)] font-mono block">
                      {new Date(rev.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`px-4 py-3 bg-[var(--card)] border text-xs font-semibold rounded-2xl shadow-xl pointer-events-auto border-l-4 ${
                toast.type === 'error' ? 'border-l-red-500 text-red-500 border-[var(--border)]' : 'border-l-[var(--accent)] text-[var(--foreground)] border-[var(--border)]'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer (Clay Shop Minimal Editorial Footer) */}
      <footer className="mt-20 py-10 border-t border-[var(--border)] bg-[var(--surface)] text-center text-xs font-medium text-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-editorial text-lg text-[var(--foreground)] font-semibold">{getStoreDisplayName()}</p>
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} {getStoreDisplayName()}. Crafted with Clay Luxury Commerce Engine.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--muted)]">
            <span className="hover:text-[var(--foreground)] cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-[var(--foreground)] cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-[var(--foreground)] cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}