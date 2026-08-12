'use client';

import { use, useEffect, useState, useRef } from 'react';

export default function StorefrontPage({ params }) {
  const unwrappedParams = use(params);
  const tenant = unwrappedParams.tenant;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Countdown Timer State (Flash Sales)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });

  const [toasts, setToasts] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  // Fetch Storefront Data
  useEffect(() => {
    async function fetchStorefront() {
      try {
        const res = await fetch(`${API_URL}/api/products?tenant=${tenant}`);
        if (!res.ok) throw new Error('Store not found');
        
        const json = await res.json();
        if (json.success) {
          setStoreData(json.data.store);
          setProducts(json.data.products || []);
          setCategories(json.data.categories || []);
        } else {
          throw new Error(json.error || 'Failed to load store');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStorefront();
  }, [tenant, API_URL]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
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
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Added to Wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

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
        const prodRes = await fetch(`${API_URL}/api/products?tenant=${tenant}`);
        const prodJson = await prodRes.json();
        if (prodJson.success) setProducts(prodJson.data.products || []);
      }
    } catch (err) {
      addToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openProductDetail = (product) => {
    setSelectedDetailProduct(product);
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
  const addToCart = (product) => {
    if (product.stock === 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addToast(`Only ${product.stock} in stock`, 'error');
          return prev;
        }
        addToast(`Updated ${product.title} quantity in Cart`, 'success');
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      addToast(`Added ${product.title} to Cart!`, 'success');
      return [...prev, { 
        product_id: product.id, 
        title: product.title, 
        price: product.price, 
        image_url: product.image_url,
        quantity: 1,
        stock: product.stock
      }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
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

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
    addToast('Item removed from cart', 'info');
  };

  // Stripe Payment Scaffolding & Order Execution
  const initiatePayment = async () => {
    if (cart.length === 0) return;
    setPaymentLoading(true);

    try {
      const orderRes = await fetch(`${API_URL}/api/orders?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
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
              className="md:hidden p-2 text-[#a1a1aa] hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
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
            <button onClick={scrollToProducts} className="absolute right-3 top-2.5 text-[#a1a1aa] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>

          {/* Nav Icons: Wishlist, Cart & Admin Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Wishlist Button */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#a1a1aa] hover:text-white hover:bg-[#141418] rounded-lg transition-colors"
              title="Wishlist"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#db4444] text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#a1a1aa] hover:text-white hover:bg-[#141418] rounded-lg transition-colors"
              title="Shopping Cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
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
                      ? 'bg-[#db4444]/10 text-[#db4444] border border-[#db4444]/30'
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Flash Sales
              </a>
              
              <button
                onClick={() => { setIsWishlistOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Wishlist ({wishlistCount})
              </button>

              <button
                onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#1c1c28] transition-all"
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
        
        {/* HERO BANNER SECTION (Figma Style) */}
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#141418] via-[#1c1c28] to-[#09090b] border border-[#272734] p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-4 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#a1a1aa] text-xs uppercase font-mono tracking-widest">
              <span className="text-[#db4444] font-bold">●</span> iPhone 14 Series / Tech Collection
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Up to 10% off<br />Voucher Coupon
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa]">
              Discover premium gadgets, fashion, and lifestyle items curated specifically for your store.
            </p>
            <div className="pt-2">
              <a 
                href="#products-grid" 
                className="press inline-flex items-center gap-2 px-6 py-3 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#db4444]/25 transition-all"
              >
                Shop Now →
              </a>
            </div>
          </div>

          {/* Hero Decorative Visual */}
          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-[#db4444]/20 rounded-full blur-3xl"></div>
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-[#181824] border border-[#272734] p-4 flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-[#db4444]/20 border border-[#db4444]/30 text-[#db4444] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span className="text-sm font-mono font-bold text-white">Exclusive Deals</span>
              <span className="text-xs text-[#a1a1aa] mt-1">Available in Naira (₦)</span>
              <div className="mt-3 px-3 py-1 bg-[#db4444]/20 text-[#db4444] text-[10px] font-bold rounded-full border border-[#db4444]/30">
                Save Big Today
              </div>
            </div>
          </div>
        </section>

        {/* FLASH SALES SECTION (Figma Style with Live Countdown Timer) */}
        <section id="flash-sales" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#272734] pb-4">
            
            {/* Header Title with Red Bar */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#db4444]">
                <span className="w-3 h-7 bg-[#db4444] rounded-sm inline-block"></span>
                <span>Today's</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Flash Sales</h2>
            </div>

            {/* Countdown Clock Display */}
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

          {/* Flash Sales Product Carousel / Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-xl border border-[#272734]"></div>
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
                  <div key={product.id} className="group relative bg-[#141418] border border-[#272734] rounded-xl overflow-hidden hover:border-[#db4444]/60 transition-all duration-300 flex flex-col">
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-[#db4444] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      -{discountPercent}% OFF
                    </div>

                    {/* Wishlist Toggle Heart */}
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full border transition-all ${
                        isWishlisted 
                          ? 'bg-[#db4444] border-[#db4444] text-white animate-heart' 
                          : 'bg-[#09090b]/60 border-[#272734] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>

                    {/* Product Image Area — Clickable for Product Detail Modal */}
                    <div 
                      onClick={() => openProductDetail(product)}
                      className="aspect-square relative overflow-hidden bg-[#181824] p-4 flex items-center justify-center cursor-pointer"
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1c1c28] flex flex-col items-center justify-center text-center p-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#a1a1aa] mb-1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                          <span className="text-[10px] text-[#a1a1aa] font-mono">{product.category || 'Item'}</span>
                        </div>
                      )}

                      {/* Hover Overlay "Add to Cart" Button */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full py-2 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md transition-colors disabled:opacity-50"
                        >
                          {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 
                        onClick={() => openProductDetail(product)}
                        className="text-xs sm:text-sm font-semibold text-white truncate mb-1 cursor-pointer hover:text-[#db4444] transition-colors"
                      >
                        {product.title}
                      </h3>
                      
                      {/* Price in Naira (₦) */}
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs sm:text-sm">
                        <span className="text-[#db4444] font-bold">{formatNaira(product.price)}</span>
                        <span className="text-[#a1a1aa] line-through text-[11px]">{formatNaira(originalPrice)}</span>
                      </div>

                      {/* Rating Stars & Count — Clickable for Customer Reviews */}
                      <button 
                        onClick={() => openReviewModal(product)}
                        className="flex items-center gap-1.5 mt-auto text-[11px] text-[#a1a1aa] hover:text-white transition-colors group/review text-left"
                      >
                        <div className="flex text-amber-400">★★★★☆</div>
                        <span className="underline decoration-[#272734] group-hover/review:decoration-[#db4444]">
                          ({product.review_count || 12} reviews)
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BROWSE BY CATEGORY SECTION (Figma Style) */}
        <section className="space-y-6 pt-4 border-t border-[#272734]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#db4444]">
              <span className="w-3 h-7 bg-[#db4444] rounded-sm inline-block"></span>
              <span>Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Browse By Category</h2>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#db4444] border-[#db4444] text-white shadow-lg shadow-[#db4444]/20'
                  : 'bg-[#141418] border-[#272734] text-[#a1a1aa] hover:text-white hover:border-[#db4444]/40'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>All Products</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#db4444] border-[#db4444] text-white shadow-lg shadow-[#db4444]/20'
                    : 'bg-[#141418] border-[#272734] text-[#a1a1aa] hover:text-white hover:border-[#db4444]/40'
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
              <div className="w-12 h-12 rounded-full bg-[#181824] text-[#a1a1aa] flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-white">No products found</h3>
              <p className="text-xs text-[#a1a1aa] mt-1">Try selecting another category or clear your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div key={product.id} className="group relative bg-[#141418] border border-[#272734] rounded-xl overflow-hidden hover:border-[#db4444]/60 transition-all duration-300 flex flex-col">
                    
                    {/* Wishlist Toggle Heart */}
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full border transition-all ${
                        isWishlisted 
                          ? 'bg-[#db4444] border-[#db4444] text-white animate-heart' 
                          : 'bg-[#09090b]/60 border-[#272734] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>

                    {/* Image Area — Clickable */}
                    <div 
                      onClick={() => openProductDetail(product)}
                      className="aspect-square relative overflow-hidden bg-[#181824] p-4 flex items-center justify-center cursor-pointer"
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1c1c28] flex flex-col items-center justify-center text-center p-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#a1a1aa] mb-1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                          <span className="text-[10px] text-[#a1a1aa] font-mono">{product.category || 'General'}</span>
                        </div>
                      )}

                      {/* Add To Cart Hover Button */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full py-2 bg-[#db4444] hover:bg-[#e53838] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md transition-colors disabled:opacity-50"
                        >
                          {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 
                        onClick={() => openProductDetail(product)}
                        className="text-xs sm:text-sm font-semibold text-white truncate mb-1 cursor-pointer hover:text-[#db4444] transition-colors"
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold font-mono text-[#db4444]">{formatNaira(product.price)}</span>
                        <span className="text-[10px] text-[#a1a1aa] font-mono">{product.stock > 0 ? `${product.stock} left` : 'Sold out'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-auto text-[11px] text-[#a1a1aa]">
                        <div className="flex text-amber-400">★★★★☆</div>
                        <span>(35)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* TRUST BADGES SECTION (Figma Style) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#272734] text-center">
          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#181824] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">FREE AND FAST DELIVERY</h4>
            <p className="text-xs text-[#a1a1aa]">Free delivery for all orders over ₦50,000</p>
          </div>

          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#181824] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">24/7 CUSTOMER SERVICE</h4>
            <p className="text-xs text-[#a1a1aa]">Friendly 24/7 customer support</p>
          </div>

          <div className="p-6 bg-[#141418] border border-[#272734] rounded-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#181824] border border-[#272734] flex items-center justify-center mb-3 text-[#db4444]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">MONEY BACK GUARANTEE</h4>
            <p className="text-xs text-[#a1a1aa]">We return money within 30 days</p>
          </div>
        </section>

      </main>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#141418] border-l border-[#272734] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-[#272734] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white capitalize">{getStoreDisplayName()} Cart</h3>
                <p className="text-xs text-[#a1a1aa] font-mono">{cartItemsCount} item(s)</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-[#a1a1aa] hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="w-12 h-12 rounded-full bg-[#181824] text-[#a1a1aa] flex items-center justify-center mx-auto mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-white">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between gap-3 p-3 bg-[#181824] border border-[#272734] rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-[#09090b] overflow-hidden border border-[#272734] flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#a1a1aa]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      <span className="text-xs font-mono text-[#db4444]">{formatNaira(item.price)}</span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product_id, -1)} className="px-2 py-0.5 bg-[#272734] rounded text-xs">-</button>
                        <span className="text-xs font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, 1)} className="px-2 py-0.5 bg-[#272734] rounded text-xs">+</button>
                        <button onClick={() => removeFromCart(item.product_id)} className="text-[10px] text-red-400 ml-2">Remove</button>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-white">
                      {formatNaira(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#272734] bg-[#09090b] space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#a1a1aa]">Total (NGN)</span>
                  <span className="font-mono text-[#db4444] text-base font-extrabold">{formatNaira(cartTotal)}</span>
                </div>
                
                <button 
                  onClick={initiatePayment}
                  disabled={paymentLoading}
                  className="press w-full py-3 bg-[#db4444] hover:bg-[#e53838] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#db4444]/30 transition-all flex items-center justify-center"
                >
                  {paymentLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Proceed to Payment (Stripe NGN ₦)'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#141418] border-l border-[#272734] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
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
                    <div className="w-12 h-12 rounded-lg bg-[#09090b] overflow-hidden border border-[#272734] flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
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
          </div>
        </div>
      )}

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDetailProduct(null)}></div>
            
            <div className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 max-w-3xl w-full z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedDetailProduct(null)} 
                className="absolute top-4 right-4 p-2 text-[#a1a1aa] hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Image Gallery Column */}
                <div className="space-y-3">
                  <div className="aspect-square bg-[#181824] border border-[#272734] rounded-xl overflow-hidden flex items-center justify-center p-4">
                    {mainImg ? (
                      <img src={mainImg} alt={selectedDetailProduct.title} className="w-full h-full object-cover rounded-lg" />
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
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-[#09090b] ${
                            mainImg === imgUrl ? 'border-[#db4444] scale-95' : 'border-[#272734] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
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

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#272734] flex items-center gap-3">
                    <button
                      onClick={() => { addToCart(selectedDetailProduct); }}
                      disabled={selectedDetailProduct.stock === 0}
                      className="press flex-1 py-3 bg-[#db4444] hover:bg-[#e53838] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#db4444]/20 transition-all disabled:opacity-50"
                    >
                      {selectedDetailProduct.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
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
            </div>
          </div>
        );
      })()}

      {/* CUSTOMER PRODUCT REVIEWS MODAL */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReviewProduct(null)}></div>
          
          <div className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-3 bg-[#141418] border text-xs font-semibold rounded-lg shadow-2xl pointer-events-auto border-l-4 ${
              toast.type === 'error' ? 'border-l-red-500 text-red-400 border-[#272734]' : 'border-l-[#db4444] text-white border-[#272734]'
            } animate-in slide-in-from-bottom-5 duration-300`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#272734] bg-[#09090b] text-center text-xs font-mono text-[#a1a1aa]">
        &copy; {new Date().getFullYear()} {getStoreDisplayName()}. Powered by Mercato Commerce Engine.
      </footer>
    </div>
  );
}