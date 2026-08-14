'use client';

import { use, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Demo Store Fallback Data Generator
  const getDemoStoreData = (tenantSlug) => {
    const name = tenantSlug ? tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1) : 'Demo';
    return {
      store: { name: `${name} Official Store`, slug: tenantSlug },
      categories: [
        { id: 1, name: 'Shoes' },
        { id: 2, name: 'Apparel' },
        { id: 3, name: 'Accessories' },
        { id: 4, name: 'Electronics' }
      ],
      products: [
        {
          id: 101,
          title: `${name} Nitro Speed Pro Runners`,
          price: 45000,
          original_price: 65000,
          stock: 12,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          category: 'Shoes',
          description: `Premium performance footwear from ${name}. Features responsive cushioning and sleek aerodynamic design for athletic performance.`,
          is_featured: true,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 28,
          discount_percent: 30,
          flash_sale_units: 5,
          images: []
        },
        {
          id: 102,
          title: `${name} Essential Performance Hoodie`,
          price: 28000,
          original_price: 35000,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          category: 'Apparel',
          description: 'Ultra-soft heavyweight cotton blend hoodie designed for warmth and modern street style.',
          is_featured: true,
          is_new_arrival: false,
          rating: 4.7,
          review_count: 19,
          discount_percent: 20,
          flash_sale_units: 10,
          images: []
        },
        {
          id: 103,
          title: `${name} Urban Tactical Backpack`,
          price: 38000,
          original_price: 48000,
          stock: 8,
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          category: 'Accessories',
          description: 'Water-resistant multi-compartment backpack with padded 16 inch laptop sleeve and ergonomic straps.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.8,
          review_count: 14,
          discount_percent: 20,
          flash_sale_units: 4,
          images: []
        },
        {
          id: 104,
          title: `${name} Wireless ANC Pro Headphones`,
          price: 75000,
          original_price: 95000,
          stock: 6,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          category: 'Electronics',
          description: 'Studio-grade audio with active noise cancellation, 40-hour battery life, and memory foam earcups.',
          is_featured: true,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 42,
          discount_percent: 21,
          flash_sale_units: 3,
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

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
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
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-[#db4444] selection:text-white">
      
      {/* Top Banner Announcement Bar */}
      <div className="bg-[#141418] border-b border-[#272734] text-xs py-2 px-4 text-center text-[#a1a1aa] flex items-center justify-center gap-2">
        <span>Summer Sale For All Products And Free Express Delivery - OFF 50%!</span>
        <a href="#flash-sales" className="font-semibold text-white underline hover:text-[#db4444] transition-colors">Shop Now</a>
      </div>

      {/* Main Store Header */}
      <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-md border-b border-[#272734]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-[#a1a1aa] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#db4444] rounded-lg"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <a href={`/${tenant}`} className="text-xl font-bold tracking-tight capitalize flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#db4444] text-white text-xs font-black flex items-center justify-center">
                {getStoreDisplayName().charAt(0)}
              </span>
              <span>{loading ? '...' : getStoreDisplayName()}</span>
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-xs relative">
            <input 
              type="text" 
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-[#141418] border border-[#272734] rounded-lg pl-3.5 pr-9 py-1.5 text-xs text-white placeholder-[#a1a1aa] outline-none focus:border-[#db4444] transition-colors"
            />
            <button 
              onClick={scrollToProducts} 
              className="absolute right-3 top-2.5 text-[#a1a1aa] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#db4444] rounded"
              aria-label="Search products"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>

          {/* Nav Icons: Wishlist, Cart, Account & Admin Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Account Button */}
            <button 
              onClick={() => customer ? setIsAccountModalOpen(true) : setIsAuthModalOpen(true)}
              className="relative p-2 text-[#a1a1aa] hover:text-white hover:bg-[#141418] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#db4444]"
              aria-label="Account"
              title={customer ? `Account (${customer.name})` : "Sign In"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            
            {/* Wishlist Button */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#a1a1aa] hover:text-white hover:bg-[#141418] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#db4444]"
              aria-label={`Wishlist, ${wishlistCount} items`}
              title="Wishlist"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#db4444] text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#a1a1aa] hover:text-white hover:bg-[#141418] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#db4444]"
              aria-label={`Shopping Cart, ${cartItemsCount} items`}
              title="Shopping Cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#db4444] text-[10px] font-bold text-white">
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
              placeholder="Search store products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-[#141418] border border-[#272734] rounded-lg pl-3.5 pr-9 py-2 text-xs text-white placeholder-[#a1a1aa] outline-none focus:border-[#db4444]"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#141418] border-r border-[#272734] z-50 flex flex-col shadow-2xl" style={{ animation: 'slideInLeft 0.3s ease-out' }}>
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#272734] flex items-center justify-between">
              <a href={`/${tenant}`} className="text-lg font-bold tracking-tight capitalize flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#db4444] text-white text-xs font-black flex items-center justify-center">
                  {getStoreDisplayName().charAt(0)}
                </span>
                <span className="text-white">{loading ? '...' : getStoreDisplayName()}</span>
              </a>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#a1a1aa] hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Drawer Search */}
            <div className="p-4 border-b border-[#272734]">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full bg-[#09090b] border border-[#272734] rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-white placeholder-[#a1a1aa] outline-none focus:border-[#db4444] transition-colors"
                />
                <button onClick={() => { scrollToProducts(); setIsMobileMenuOpen(false); }} className="absolute right-3 top-3 text-[#a1a1aa] hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-bold mb-3 px-3">Categories</p>
              
              <button
                onClick={() => { setSelectedCategory('All'); scrollToProducts(); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#db4444]/10 text-[#db4444] border border-[#db4444]/30'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                All Products
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); scrollToProducts(); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#db4444] text-white'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28]'
                  }`}
                >
                  {renderCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))}

              <div className="border-t border-[#272734] my-4"></div>
              <p className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-bold mb-3 px-3">Quick Links</p>
              
              <a
                href="#flash-sales"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Flash Sales
              </a>
              
              <button
                onClick={() => { setIsWishlistOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Wishlist ({wishlistCount})
              </button>

              <button
                onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Cart ({cartItemsCount})
              </button>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#272734] text-center">
              <p className="text-[10px] text-[#a1a1aa] font-mono">Powered by Mercato</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-12">
        
        {/* HERO BANNER SECTION */}
        <section className="relative rounded-2xl bg-[#141418] border border-[#272734] p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-4 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#a1a1aa] text-xs uppercase font-mono tracking-widest">
              <span className="text-[#db4444] font-bold">●</span> Exclusive Collection
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Premium Tech & Lifestyle
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa]">
              Discover premium gadgets, fashion, and lifestyle items curated specifically for your store.
            </p>
            <div className="pt-2">
              <a 
                href="#products-grid" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
              >
                Shop Now →
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-[#09090b] border border-[#272734] p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#141418] border border-[#272734] text-[#db4444] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span className="text-sm font-mono font-bold text-white">Exclusive Deals</span>
              <span className="text-xs text-[#a1a1aa] mt-1">Available in Naira (₦)</span>
              <div className="mt-3 px-3 py-1 bg-[#141418] text-[#db4444] text-[10px] font-bold rounded-full border border-[#272734]">
                Save Big Today
              </div>
            </div>
          </div>
        </section>

        {/* FLASH SALES SECTION */}
        <section id="flash-sales" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#272734] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#db4444]">
                <span className="w-3 h-7 bg-[#db4444] rounded-sm inline-block"></span>
                <span>Today's</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Flash Sales</h2>
            </div>

            <div className="flex items-center gap-2 text-center font-mono">
              <div className="bg-[#141418] border border-[#272734] rounded-lg px-3 py-1.5 min-w-[50px]">
                <span className="text-xs text-[#a1a1aa] block uppercase text-[9px]">Days</span>
                <span className="text-base font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
              </div>
              <span className="text-[#db4444] font-bold">:</span>
              <div className="bg-[#141418] border border-[#272734] rounded-lg px-3 py-1.5 min-w-[50px]">
                <span className="text-xs text-[#a1a1aa] block uppercase text-[9px]">Hours</span>
                <span className="text-base font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
              </div>
              <span className="text-[#db4444] font-bold">:</span>
              <div className="bg-[#141418] border border-[#272734] rounded-lg px-3 py-1.5 min-w-[50px]">
                <span className="text-xs text-[#a1a1aa] block uppercase text-[9px]">Mins</span>
                <span className="text-base font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
              </div>
              <span className="text-[#db4444] font-bold">:</span>
              <div className="bg-[#141418] border border-[#272734] rounded-lg px-3 py-1.5 min-w-[50px]">
                <span className="text-xs text-[#a1a1aa] block uppercase text-[9px]">Secs</span>
                <span className="text-base font-bold text-white text-[#db4444]">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl border border-[#272734] bg-[#141418]"></div>
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
                  <div key={product.id} className="group relative bg-[#141418] border border-[#272734] rounded-xl overflow-hidden flex flex-col">
                    
                    <div className="absolute top-3 left-3 z-10 bg-[#db4444] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      -{discountPercent}% OFF
                    </div>

                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full border transition-all ${
                        isWishlisted 
                          ? 'bg-[#db4444] border-[#db4444] text-white' 
                          : 'bg-[#09090b] border-[#272734] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>

                    <div 
                      onClick={() => openProductDetail(product)}
                      className="aspect-square relative overflow-hidden bg-[#09090b] flex items-center justify-center cursor-pointer"
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[#a1a1aa] text-[10px] font-mono">{product.category || 'Item'}</div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          disabled={product.stock === 0}
                          className="w-full py-2 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase rounded transition-colors disabled:opacity-50"
                        >
                          {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-white truncate mb-1 cursor-pointer hover:text-[#db4444]" onClick={() => openProductDetail(product)}>
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs sm:text-sm">
                        <span className="text-[#db4444] font-bold">{formatNaira(product.price)}</span>
                        <span className="text-[#a1a1aa] line-through text-[11px]">{formatNaira(originalPrice)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-auto text-[11px] text-[#a1a1aa]">
                        <div className="flex text-amber-400">★★★★☆</div>
                        <span>({product.review_count || 12} reviews)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BROWSE BY CATEGORY SECTION */}
        <section className="space-y-6 pt-4 border-t border-[#272734]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#db4444]">
              <span className="w-3 h-7 bg-[#db4444] rounded-sm inline-block"></span>
              <span>Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Browse By Category</h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-semibold uppercase whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#db4444] border-[#db4444] text-white'
                  : 'bg-[#141418] border-[#272734] text-[#a1a1aa] hover:text-white hover:border-[#3f3f50]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>All Products</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-semibold uppercase whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#db4444] border-[#db4444] text-white'
                    : 'bg-[#141418] border-[#272734] text-[#a1a1aa] hover:text-white hover:border-[#3f3f50]'
                }`}
              >
                {renderCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* EXPLORE OUR PRODUCTS GRID */}
        <section id="products-grid" ref={productsGridRef} className="space-y-6 pt-4 border-t border-[#272734] scroll-mt-24">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#db4444]">
              <span className="w-3 h-7 bg-[#db4444] rounded-sm inline-block"></span>
              <span>Our Products</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Explore Our Products</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#141418] border border-[#272734] rounded-xl">
              <p className="text-xs text-[#a1a1aa]">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div key={product.id} className="group relative bg-[#141418] border border-[#272734] rounded-xl overflow-hidden flex flex-col">
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-[#db4444] ${
                        isWishlisted ? 'bg-[#db4444] border-[#db4444] text-white' : 'bg-[#09090b] border-[#272734] text-[#a1a1aa]'
                      }`}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={isWishlisted}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>

                    <div 
                      onClick={() => openProductDetail(product)} 
                      onKeyDown={(e) => { if(e.key === 'Enter') openProductDetail(product); }}
                      className="aspect-square relative overflow-hidden bg-[#09090b] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#db4444]"
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${product.title}`}
                    >
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="text-[#a1a1aa] text-[10px] font-mono">{product.category || 'Product'}</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          disabled={product.stock === 0}
                          className="w-full py-2 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
                          aria-label={`Add ${product.title} to cart`}
                        >
                          {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 
                        className="text-xs sm:text-sm font-semibold text-white truncate mb-1 cursor-pointer hover:text-[#db4444] transition-colors focus:outline-none focus:ring-2 focus:ring-[#db4444] rounded px-1 -mx-1" 
                        onClick={() => openProductDetail(product)}
                        onKeyDown={(e) => { if(e.key === 'Enter') openProductDetail(product); }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${product.title}`}
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold font-mono text-[#db4444]">{formatNaira(product.price)}</span>
                        <span className="text-[10px] text-[#a1a1aa] font-mono">{product.stock > 0 ? `${product.stock} left` : 'Sold out'}</span>
                      </div>
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
                className="px-8 py-3 bg-[#141418] border border-[#272734] text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#272734] transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Products'}
              </button>
            </div>
          )}
        </section>

        {/* TRUST BADGES SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#272734] text-center">
          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#09090b] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">FREE DELIVERY</h4>
          </div>
          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#09090b] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">24/7 SUPPORT</h4>
          </div>
          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#09090b] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">MONEY BACK</h4>
          </div>
        </section>

      </main>

      {/* --- CUSTOMER AUTH MODAL --- */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAuthModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#141418] border border-[#272734] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[#272734] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-tight">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-[#a1a1aa] hover:text-white p-2 rounded-lg hover:bg-[#272734] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className="p-6">
                {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{authError}</div>}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Full Name</label>
                        <input required type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-[#09090b] border border-[#272734] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#db4444] transition-colors" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Phone</label>
                        <input type="text" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full bg-[#09090b] border border-[#272734] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#db4444] transition-colors" placeholder="+1234567890" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Email Address</label>
                    <input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-[#09090b] border border-[#272734] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#db4444] transition-colors" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Password</label>
                    <input required type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-[#09090b] border border-[#272734] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#db4444] transition-colors" placeholder="••••••••" />
                  </div>
                  
                  <button type="submit" disabled={authLoading} className="w-full bg-[#db4444] hover:bg-[#b93838] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 mt-4">
                    {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>
                
                <div className="mt-6 text-center text-sm text-[#a1a1aa]">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-[#db4444] hover:text-[#b93838] font-bold">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setIsAccountModalOpen(false)}></motion.div>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#09090b] border-l border-[#272734] z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[#272734] bg-[#141418]">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Account
                </h2>
                <button onClick={() => setIsAccountModalOpen(false)} className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#272734] rounded-lg transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#272734] scrollbar-track-transparent space-y-8">
                <div>
                  <h3 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-4">Profile Details</h3>
                  <div className="bg-[#141418] border border-[#272734] rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-lg">{customer.name || customer.email.split('@')[0]}</p>
                      <p className="text-sm text-[#a1a1aa]">{customer.email}</p>
                    </div>
                    <button onClick={logoutCustomer} className="text-sm px-3 py-1.5 border border-[#272734] rounded-lg text-white hover:bg-[#db4444] hover:border-[#db4444] transition-colors">Sign Out</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-4">Order History</h3>
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-[#141418] border border-[#272734] rounded-xl border-dashed">
                      <svg className="w-12 h-12 mx-auto text-[#272734] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                      <p className="text-[#a1a1aa]">You haven't placed any orders yet.</p>
                      <button onClick={() => setIsAccountModalOpen(false)} className="mt-4 text-[#db4444] hover:text-[#b93838] font-bold text-sm">Start Shopping &rarr;</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(order => (
                        <div key={order.id} className="bg-[#141418] border border-[#272734] rounded-xl overflow-hidden">
                          <div className="p-4 border-b border-[#272734] bg-[#1a1a20] flex justify-between items-start">
                            <div>
                              <p className="text-xs text-[#a1a1aa] font-mono mb-1">#{order.id.slice(0,8).toUpperCase()}</p>
                              <p className="text-sm font-medium text-white">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-sm font-bold text-white mt-1">₦{Number(order.total_amount).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#09090b] rounded-lg border border-[#272734] flex items-center justify-center text-[#a1a1aa] overflow-hidden">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                  </div>
                                  <div>
                                    <p className="text-white">Product #{item.product_id}</p>
                                    {item.variant_info && <p className="text-xs text-[#a1a1aa]">{item.variant_info.name}: {item.variant_info.value}</p>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[#a1a1aa]">x{item.quantity}</p>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[#141418] border-l border-[#272734] h-full flex flex-col z-10 shadow-2xl">
              <div className="p-5 border-b border-[#272734] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Your Cart</h3>
                <p className="text-xs text-[#a1a1aa] font-mono">{cartItemsCount} item(s)</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-[#a1a1aa] hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">Cart is empty</div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.product_id}-${item.variant_id || 'base'}-${idx}`} className="relative flex items-center justify-between gap-3 p-3 bg-[#09090b] border border-[#272734] rounded-xl">
                    <button 
                      onClick={() => removeFromCart(item.product_id, item.variant_id)} 
                      className="absolute top-2 right-2 text-[#a1a1aa] hover:text-[#db4444] transition-colors"
                      title="Remove item"
                    >
                      ✕
                    </button>
                    <div className="w-12 h-12 rounded-lg bg-[#141418] border border-[#272734] overflow-hidden relative">
                      {item.image_url && <Image src={item.image_url} alt={item.title} fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      {item.variant_info && (
                        <p className="text-[10px] text-[#a1a1aa]">{item.variant_info.name}: {item.variant_info.value}</p>
                      )}
                      <span className="text-xs font-mono text-[#db4444] block mt-0.5">{formatNaira(item.price)}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product_id, -1, item.variant_id)} className="px-2 bg-[#272734] rounded text-xs">-</button>
                        <span className="text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, 1, item.variant_id)} className="px-2 bg-[#272734] rounded text-xs">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#272734] bg-[#09090b] space-y-3">
                <div className="pt-4 border-t border-[#272734] space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-[#a1a1aa]">Total:</span>
                    <span className="text-lg font-mono text-[#db4444]">{formatNaira(cartTotal)}</span>
                  </div>

                  <button
                    onClick={initiatePayment}
                    disabled={paymentLoading}
                    className="press w-full py-3 bg-[#db4444] hover:bg-[#e53838] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center"
                  >
                    {paymentLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Proceed to Checkout (Stripe NGN)'
                    )}
                  </button>
                </div>
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
                  <div key={product.id} className="flex items-center justify-between gap-3 p-3 bg-[#181824] border border-[#272734] rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-[#09090b] overflow-hidden border border-[#272734] flex items-center justify-center relative">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill sizes="48px" className="object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#a1a1aa]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{product.title}</h4>
                      <span className="text-xs font-mono text-[#db4444]">{formatNaira(product.price)}</span>
                    </div>

                    <button 
                      onClick={() => { addToCart(product); toggleWishlist(product.id); }}
                      className="px-3 py-1.5 bg-[#db4444] text-white text-[10px] font-bold uppercase rounded"
                    >
                      Add To Cart
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
          
          <div className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 max-w-md w-full z-10 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 rounded-full flex items-center justify-center text-3xl mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <h3 className="text-xl font-extrabold text-white">Payment Checkout Scaffolding Active</h3>
            
            <div className="p-4 bg-[#09090b] border border-[#272734] rounded-xl text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Order ID:</span>
                <span className="text-white font-bold">{paymentSuccess.orderId?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Total Paid:</span>
                <span className="text-[#db4444] font-bold">{formatNaira(paymentSuccess.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Gateway:</span>
                <span className="text-emerald-400">Stripe NGN (Test Mode)</span>
              </div>
            </div>

            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              {paymentSuccess.message}
            </p>

            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="press w-full py-3 bg-[#db4444] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg"
            >
              Done / Return to Store
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDetailProduct(null)}></motion.div>
              
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 max-w-3xl w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedDetailProduct(null)} 
                className="absolute top-4 right-4 p-2 text-[#a1a1aa] hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Image Gallery Column */}
                <div className="space-y-3">
                  <div className="aspect-square bg-[#181824] border border-[#272734] rounded-xl overflow-hidden flex items-center justify-center p-4 relative">
                    {mainImg ? (
                      <Image src={mainImg} alt={selectedDetailProduct.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-lg" />
                    ) : (
                      <div className="text-[#a1a1aa] text-xs">No Image Preview</div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {gallery.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDetailImage(imgUrl)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-[#09090b] relative ${
                            mainImg === imgUrl ? 'border-[#db4444] scale-95' : 'border-[#272734] opacity-70 hover:opacity-100'
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
                      <span className="px-2.5 py-1 bg-[#181824] border border-[#272734] text-[10px] font-mono font-bold uppercase tracking-wider text-[#a1a1aa] rounded-md">
                        {selectedDetailProduct.category || 'General'}
                      </span>
                      <span className="text-xs font-mono text-[#22c55e]">
                        {selectedDetailProduct.stock > 0 ? `In Stock (${selectedDetailProduct.stock} units)` : 'Out of Stock'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                      {selectedDetailProduct.title}
                    </h2>

                    {/* Price & Strikethrough */}
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-2xl font-black text-[#db4444]">{formatNaira(selectedDetailProduct.price)}</span>
                      <span className="text-sm text-[#a1a1aa] line-through">{formatNaira(originalPrice)}</span>
                      <span className="bg-[#db4444]/20 text-[#db4444] border border-[#db4444]/30 text-xs font-bold px-2 py-0.5 rounded">
                        -{discountPercent}% OFF
                      </span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                      <div className="flex text-amber-400">★★★★☆</div>
                      <span>({selectedDetailProduct.review_count || 12} customer reviews)</span>
                      <button 
                        onClick={() => { setSelectedDetailProduct(null); openReviewModal(selectedDetailProduct); }} 
                        className="text-[#db4444] hover:underline font-semibold ml-2"
                      >
                        Read Reviews
                      </button>
                    </div>

                    <div className="border-t border-[#272734] my-2"></div>

                    {/* Detailed Item Description */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Item Overview & Specs</h4>
                      <p className="text-xs text-[#fafafa]/80 leading-relaxed whitespace-pre-line bg-[#09090b] p-3 border border-[#272734] rounded-lg">
                        {selectedDetailProduct.description || 'Premium build quality and high performance. Built with durable materials for long-lasting performance and reliability.'}
                      </p>
                    </div>
                  </div>

                  {/* Variants */}
                  {selectedDetailProduct.variants && selectedDetailProduct.variants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#272734]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3">Available Options</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDetailProduct.variants.map((v, i) => {
                          const isSelected = selectedVariant?.id === v.id;
                          const variantPriceStr = Number(v.price_adjustment) > 0 ? ` (+${formatNaira(Number(v.price_adjustment))})` : '';
                          return (
                            <button
                              key={v.id || i}
                              onClick={() => setSelectedVariant(v)}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                isSelected ? 'bg-[#db4444] border-[#db4444] text-white' : 'bg-[#181824] border-[#272734] text-[#a1a1aa] hover:border-[#db4444] hover:text-white'
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
                  <div className="pt-4 border-t border-[#272734] flex items-center gap-3">
                    <button
                      onClick={() => { addToCart(selectedDetailProduct, selectedVariant); }}
                      disabled={(selectedVariant ? selectedVariant.stock : selectedDetailProduct.stock) === 0}
                      className="press flex-1 py-3 bg-[#db4444] hover:bg-[#e53838] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {(selectedVariant ? selectedVariant.stock : selectedDetailProduct.stock) > 0 ? 'Add To Cart' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => toggleWishlist(selectedDetailProduct.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        isWishlisted ? 'bg-[#db4444] border-[#db4444] text-white' : 'bg-[#181824] border-[#272734] text-[#a1a1aa] hover:text-white'
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReviewProduct(null)}></motion.div>
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#272734] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">{reviewProduct.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <span className="text-amber-400">★ {reviewProduct.rating || 4.5}</span>
                  <span>({reviewsList.length} reviews)</span>
                </div>
              </div>
              <button onClick={() => setReviewProduct(null)} className="text-[#a1a1aa] hover:text-white">✕</button>
            </div>

            {/* Leave a Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 bg-[#09090b] border border-[#272734] rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Write a Customer Review</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#a1a1aa] block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. John D."
                    value={newReview.authorName}
                    onChange={e => setNewReview({ ...newReview, authorName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#141418] border border-[#272734] rounded text-xs text-white outline-none focus:border-[#db4444]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#a1a1aa] block mb-1">Rating</label>
                  <select 
                    value={newReview.rating}
                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#141418] border border-[#272734] rounded text-xs text-white outline-none focus:border-[#db4444]"
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
                <label className="text-[11px] text-[#a1a1aa] block mb-1">Your Review</label>
                <textarea 
                  required 
                  rows="2"
                  placeholder="Share your experience with this product..."
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#141418] border border-[#272734] rounded text-xs text-white outline-none focus:border-[#db4444]"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="w-full py-2 bg-[#db4444] hover:bg-[#e53838] text-white font-bold text-xs uppercase tracking-wider rounded transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </form>

            {/* Existing Customer Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Customer Feedback</h4>
              
              {reviewLoading ? (
                <div className="text-xs text-[#a1a1aa] text-center py-4">Loading reviews...</div>
              ) : reviewsList.length === 0 ? (
                <div className="text-xs text-[#a1a1aa] text-center py-4">No reviews yet. Be the first to leave a review!</div>
              ) : (
                reviewsList.map(rev => (
                  <div key={rev.id} className="p-3 bg-[#181824] border border-[#272734] rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{rev.author_name}</span>
                      <span className="text-amber-400">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-[#a1a1aa] font-mono block">
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
              className={`px-4 py-3 bg-[#141418] border text-xs font-semibold rounded-lg shadow-2xl pointer-events-auto border-l-4 ${
                toast.type === 'error' ? 'border-l-red-500 text-red-400 border-[#272734]' : 'border-l-[#db4444] text-white border-[#272734]'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#272734] bg-[#09090b] text-center text-xs font-mono text-[#a1a1aa]">
        &copy; {new Date().getFullYear()} {getStoreDisplayName()}. Powered by Mercato Commerce Engine.
      </footer>
    </div>
  );
}