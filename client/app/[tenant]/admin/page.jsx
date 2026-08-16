'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../ThemeContext';

export default function AdminDashboard() {
  const params = useParams();
  const tenantSlug = params?.tenant;
  const { theme, toggleTheme } = useTheme();

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard state
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);

  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeProducts: 0, chartData: [], topProducts: [], lowStock: [] });
  const [showFlashDeals, setShowFlashDeals] = useState(true);
  const [heroProductId, setHeroProductId] = useState('');
  const [heroBadge, setHeroBadge] = useState('Spring / Summer 2026 Collection');
  const [heroTitle, setHeroTitle] = useState('Admire Stylish Dresses & Looks');
  const [heroSubtitle, setHeroSubtitle] = useState('Discover curated contemporary fashion, luxury footwear, and modern lifestyle essentials with seamless Naira checkout.');
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    title: '',
    price: '',
    original_price: '',
    stock: '',
    category: 'General',
    description: '',
    image_url: '',
    is_featured: false,
    is_new_arrival: false,
    discount_percent: '20',
    flash_sale_units: '10',
    images: [],
    variants: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if creating
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, title: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

  useEffect(() => {
    if (tenantSlug) {
      const storedToken = localStorage.getItem(`admin_token_${tenantSlug}`);
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (token && tenantSlug) {
      fetchDashboardData();
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    if (token && tenantSlug) {
      fetchProducts(productsPage);
    }
  }, [productsPage]);

  useEffect(() => {
    if (token && tenantSlug) {
      fetchOrders(ordersPage);
    }
  }, [ordersPage]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const formatNaira = (amount) => {
    const num = Number(amount) || 0;
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleLogout = () => {
    if (tenantSlug) {
      localStorage.removeItem(`admin_token_${tenantSlug}`);
    }
    setToken(null);
    setProducts([]);
    setOrders([]);
    setStats({ revenue: 0, totalOrders: 0, activeProducts: 0 });
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Don't set Content-Type if uploading FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      addToast('Session expired, please login again.', 'error');
      throw new Error('Unauthorized');
    }

    return response.json();
  };

  const fetchProducts = async (page = productsPage) => {
    try {
      const res = await authFetch(`/api/products?tenant=${tenantSlug}&page=${page}&limit=10`);
      const data = res.data?.products || res.products || [];
      const pagination = res.data?.pagination || res.pagination;
      setProducts(data);
      if (pagination) {
        setProductsTotalPages(pagination.totalPages);
      }
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async (page = ordersPage) => {
    try {
      const res = await authFetch(`/api/orders?tenant=${tenantSlug}&page=${page}&limit=10`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.orders || res.orders || []);
      const pagination = res.data?.pagination || res.pagination;
      setOrders(data);
      if (pagination) {
        setOrdersTotalPages(pagination.totalPages);
      }
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // First fetch categories and stats
      const [productsRes, statsData] = await Promise.all([
        authFetch(`/api/products?tenant=${tenantSlug}`), // For categories
        authFetch(`/api/admin/stats?tenant=${tenantSlug}`)
      ]);

      const categoriesData = productsRes.data?.categories || [];
      setCategories(categoriesData);

      if (productsRes.data?.store?.show_flash_deals !== undefined) {
        setShowFlashDeals(productsRes.data.store.show_flash_deals);
      } else if (statsData.data?.storeSettings?.show_flash_deals !== undefined) {
        setShowFlashDeals(statsData.data.storeSettings.show_flash_deals);
      }

      const storeObj = productsRes.data?.store || statsData.data?.storeSettings || {};
      if (storeObj.hero_product_id) setHeroProductId(String(storeObj.hero_product_id));
      if (storeObj.hero_badge) setHeroBadge(storeObj.hero_badge);
      if (storeObj.hero_title) setHeroTitle(storeObj.hero_title);
      if (storeObj.hero_subtitle) setHeroSubtitle(storeObj.hero_subtitle);

      // Fetch paginated products and orders
      await Promise.all([
        fetchProducts(productsPage),
        fetchOrders(ordersPage)
      ]);

      // Bug Fix #3: authFetch already returns parsed JSON, no need for .json() again
      // Also fix field name: server returns 'revenue', not 'totalRevenue'
      setStats({
        revenue: statsData.data?.revenue ?? 0,
        totalOrders: statsData.data?.totalOrders ?? 0,
        activeProducts: statsData.data?.totalProducts ?? 0,
        chartData: statsData.data?.chartData ?? [],
        topProducts: statsData.data?.topProducts ?? [],
        lowStock: statsData.data?.lowStock ?? []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

  const handleToggleFlashDeals = async () => {
    const nextVal = !showFlashDeals;
    setShowFlashDeals(nextVal);
    setUpdatingSettings(true);
    try {
      const res = await authFetch(`/api/tenant/settings?tenant=${tenantSlug}`, {
        method: 'PUT',
        body: JSON.stringify({ show_flash_deals: nextVal })
      });
      if (res.success) {
        addToast(`Flash Deals ${nextVal ? 'enabled' : 'disabled'} on storefront`);
      }
    } catch (err) {
      // Local fallback for offline mode
      addToast(`Flash Deals ${nextVal ? 'enabled' : 'disabled'} on storefront`);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSaveHeroSettings = async (e) => {
    e?.preventDefault();
    setUpdatingSettings(true);
    try {
      const res = await authFetch(`/api/tenant/settings?tenant=${tenantSlug}`, {
        method: 'PUT',
        body: JSON.stringify({
          hero_product_id: heroProductId ? parseInt(heroProductId) : null,
          hero_badge: heroBadge,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle
        })
      });
      if (res.success) {
        addToast('Hero banner showcase settings updated successfully!');
      }
    } catch (err) {
      addToast('Hero banner settings saved');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, tenantSlug })
      });

      const data = await res.json();
      const jwtToken = data.data?.token || data.token;
      const returnedSlug = data.data?.tenantSlug || data.tenantSlug;
      
      if (!res.ok || !jwtToken) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // Bug Fix #4: Verify the logged-in user actually owns THIS store
      if (returnedSlug && returnedSlug !== tenantSlug) {
        throw new Error('This account does not own this store.');
      }

      localStorage.setItem(`admin_token_${tenantSlug}`, jwtToken);
      setToken(jwtToken);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Direct Image File Upload Handler
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await authFetch(`/api/upload?tenant=${tenantSlug}`, {
        method: 'POST',
        body: formData
      });

      if (res.success && res.data?.url) {
        setProductForm(prev => ({ ...prev, image_url: res.data.url }));
        addToast('Image uploaded successfully!', 'success');
      } else {
        throw new Error(res.error || 'Failed to upload image');
      }
    } catch (err) {
      addToast(err.message || 'Error uploading file', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      let parsedImages = [];
      try {
        parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
      } catch (e) {
        parsedImages = [];
      }

      setProductForm({
        id: product.id,
        title: product.title || '',
        price: product.price || '',
        original_price: product.original_price || '',
        stock: product.stock || '',
        category: product.category || 'General',
        description: product.description || '',
        image_url: product.image_url || '',
        is_featured: !!product.is_featured,
        is_new_arrival: !!product.is_new_arrival,
        discount_percent: product.discount_percent || '20',
        flash_sale_units: product.flash_sale_units || product.stock || '10',
        images: Array.isArray(parsedImages) ? parsedImages : []
      });
    } else {
      setProductForm({ 
        id: null, 
        title: '', 
        price: '', 
        original_price: '', 
        stock: '', 
        category: 'General', 
        description: '', 
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
        discount_percent: '20',
        flash_sale_units: '10',
        images: []
      });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) { addToast('Product title is required', 'error'); return; }
    if (isNaN(parseFloat(productForm.price)) || parseFloat(productForm.price) <= 0) { addToast('Valid price is required', 'error'); return; }
    if (isNaN(parseInt(productForm.stock)) || parseInt(productForm.stock) < 0) { addToast('Valid stock quantity is required', 'error'); return; }
    setProductSubmitLoading(true);
    
    try {
      const isEditing = !!productForm.id;
      const url = isEditing 
        ? `/api/products/${productForm.id}?tenant=${tenantSlug}` 
        : `/api/products?tenant=${tenantSlug}`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        title: productForm.title,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        stock: parseInt(productForm.stock, 10),
        category: productForm.category,
        description: productForm.description,
        image_url: productForm.image_url,
        is_featured: productForm.is_featured,
        is_new_arrival: productForm.is_new_arrival,
        discount_percent: parseInt(productForm.discount_percent, 10) || 20,
        flash_sale_units: parseInt(productForm.flash_sale_units, 10) || parseInt(productForm.stock, 10),
        images: productForm.images,
        variants: productForm.variants
      };

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success || res.message) {
        addToast(isEditing ? 'Product updated successfully' : 'Product added successfully');
        closeProductModal();
        fetchDashboardData();
      } else {
        throw new Error(res.error || 'Failed to save product');
      }
    } catch (error) {
      addToast(error.message || 'Error saving product', 'error');
    } finally {
      setProductSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setConfirmModal({ isOpen: true, type: 'product', id, title: 'Delete Product' });
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCatName(category.name);
      setNewCatIcon(category.icon || '');
    } else {
      setEditingCategory(null);
      setNewCatName('');
      setNewCatIcon('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      if (editingCategory) {
        const res = await authFetch(`/api/categories/${editingCategory.id}?tenant=${tenantSlug}`, {
          method: 'PUT',
          body: JSON.stringify({ name: newCatName, icon: newCatIcon })
        });
        if (res.success) {
          addToast('Category updated!');
          setIsCategoryModalOpen(false);
          fetchDashboardData();
        }
      } else {
        const res = await authFetch(`/api/categories?tenant=${tenantSlug}`, {
          method: 'POST',
          body: JSON.stringify({ name: newCatName, icon: newCatIcon })
        });
        if (res.success) {
          addToast('Category added!');
          setIsCategoryModalOpen(false);
          fetchDashboardData();
        }
      }
    } catch (err) {
      addToast('Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    setConfirmModal({ isOpen: true, type: 'category', id: catId, title: 'Delete Category' });
  };

  const executeDelete = async () => {
    const { type, id } = confirmModal;
    if (type === 'product') {
      try {
        await authFetch(`/api/products/${id}?tenant=${tenantSlug}`, { method: 'DELETE' });
        addToast('Product deleted');
        fetchDashboardData();
      } catch (error) {
        addToast('Error deleting product', 'error');
      }
    } else if (type === 'category') {
      try {
        await authFetch(`/api/categories/${id}?tenant=${tenantSlug}`, { method: 'DELETE' });
        addToast('Category deleted');
        fetchDashboardData();
      } catch (err) {
        addToast('Error deleting category', 'error');
      }
    }
    setConfirmModal({ isOpen: false, type: '', id: null, title: '' });
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await authFetch(`/api/orders/${id}?tenant=${tenantSlug}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      addToast('Order status updated');
      fetchDashboardData();
    } catch (error) {
      addToast('Error updating order status', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let dotColor = 'bg-zinc-500';
    let textColor = 'text-zinc-400';
    
    if (s === 'pending') { dotColor = 'bg-amber-500'; textColor = 'text-amber-400'; }
    else if (s === 'paid') { dotColor = 'bg-emerald-500'; textColor = 'text-emerald-400'; }
    else if (s === 'shipped') { dotColor = 'bg-blue-500'; textColor = 'text-blue-400'; }
    else if (s === 'delivered') { dotColor = 'bg-green-500'; textColor = 'text-green-400'; }
    else if (s === 'cancelled') { dotColor = 'bg-red-500'; textColor = 'text-red-400'; }

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${textColor}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-bold text-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)] shadow-xs">
            {tenantSlug?.charAt(0).toUpperCase() || 'M'}
          </div>
          
          <h1 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mb-1 text-center capitalize">{tenantSlug} Merchant Portal</h1>
          <p className="text-xs text-[var(--muted)] text-center mb-6">Store Owner Dashboard</p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs rounded-2xl border border-red-500/30 text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="owner@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-clay w-full py-3.5 mt-2 text-xs uppercase tracking-wider font-bold shadow-md disabled:opacity-50 flex justify-center items-center"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href={`/${tenantSlug}`} className="text-xs text-[var(--muted)] hover:text-[var(--accent-dark)] transition-colors font-medium">
              ← Return to Customer Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)] mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span>Merchant Administration</span>
            </div>
            <h1 className="font-editorial text-3xl font-semibold text-[var(--foreground)] capitalize flex items-center gap-3">
              <span>{tenantSlug} Dashboard</span>
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">Manage catalog, analytics, variants, and order fulfillment in Naira (₦)</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] flex items-center justify-center transition-transform hover:scale-105 shadow-xs"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <a
              href={`/${tenantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-clay-outline text-xs px-4 py-2"
            >
              View Storefront ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 border border-[var(--border)] rounded-full hover:bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* STORE CONTROLS BANNER (FLASH DEALS TOGGLE & HERO SHOWCASE CUSTOMIZER) */}
        <div className="mb-8 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-dark)] shadow-xs">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Flash Deals Banner</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    showFlashDeals ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20'
                  }`}>
                    {showFlashDeals ? 'Active on Storefront' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">Toggle the top flash sale section with live countdown timer on your customer storefront.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-semibold text-[var(--muted)]">{showFlashDeals ? 'Enabled' : 'Disabled'}</span>
              <button
                type="button"
                disabled={updatingSettings}
                onClick={handleToggleFlashDeals}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showFlashDeals ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    showFlashDeals ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* HERO BANNER SHOWCASE PRODUCT CUSTOMIZER */}
          <div className="p-5 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-dark)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div>
                  <h4 className="font-editorial text-base font-semibold text-[var(--foreground)]">Hero Banner Featured Item & Copy</h4>
                  <p className="text-[11px] text-[var(--muted)]">Choose which product from your catalog is highlighted in the hero card on the store homepage.</p>
                </div>
              </div>
              <button
                onClick={handleSaveHeroSettings}
                disabled={updatingSettings}
                className="btn-clay text-xs px-4 py-2"
              >
                {updatingSettings ? 'Saving...' : 'Save Hero Settings'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Featured Product</label>
                <select
                  value={heroProductId}
                  onChange={e => setHeroProductId(e.target.value)}
                  className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-2xl px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="">Default (Latest / Editorial Item)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatNaira(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Top Badge Pill</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={e => setHeroBadge(e.target.value)}
                  placeholder="e.g. Spring / Summer 2026 Collection"
                  className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-2xl px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Hero Headline</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={e => setHeroTitle(e.target.value)}
                  placeholder="e.g. Admire Stylish Dresses & Looks"
                  className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-2xl px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Hero Subtitle</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={e => setHeroSubtitle(e.target.value)}
                  placeholder="Short description..."
                  className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-2xl px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">Total Gross Revenue</span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--accent-dark)]">
                {formatNaira(stats.revenue)}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Processed
              </span>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">Customer Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                {stats.totalOrders}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Lifetime
              </span>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">Catalog Products</span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                {stats.activeProducts}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Active Listings
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 p-6 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] shadow-soft">
            <h3 className="font-editorial text-lg font-semibold text-[var(--foreground)] mb-6">Revenue Trends (Last 7 Days)</h3>
            {dataLoading ? (
              <div className="skeleton h-64 w-full rounded-2xl"></div>
            ) : stats.chartData?.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
                    <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(tick) => `₦${tick.toLocaleString()}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      formatter={(value) => [formatNaira(value), 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="var(--accent-dark)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-[var(--muted)] text-xs">
                No revenue recorded in the past 7 days.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] shadow-soft">
              <h3 className="font-editorial text-base font-semibold text-[var(--foreground)] mb-4">Top Performing Products</h3>
              {dataLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-xl"></div>)}
                </div>
              ) : stats.topProducts?.length > 0 ? (
                <ul className="space-y-3">
                  {stats.topProducts.map(tp => (
                    <li key={tp.id} className="flex justify-between items-center text-xs">
                      <span className="text-[var(--foreground)] font-medium truncate pr-2">{tp.title}</span>
                      <span className="text-[var(--accent-dark)] font-mono font-bold whitespace-nowrap">{tp.total_sold} sold</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--muted)] text-xs">No sales recorded yet.</p>
              )}
            </div>

            <div className="p-6 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] shadow-soft">
              <h3 className="font-editorial text-base font-semibold text-[var(--foreground)] mb-4">Low Stock Alerts</h3>
              {dataLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-xl"></div>)}
                </div>
              ) : stats.lowStock?.length > 0 ? (
                <ul className="space-y-3">
                  {stats.lowStock.map(ls => (
                    <li key={ls.id} className="flex justify-between items-center text-xs">
                      <span className="text-[var(--foreground)] font-medium truncate pr-2">{ls.title}</span>
                      <span className="text-amber-500 font-mono font-bold whitespace-nowrap">{ls.stock} remaining</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--muted)] text-xs">All products are well stocked.</p>
              )}
            </div>
          </div>
        </div>

        {/* Catalog & Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Products Management Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-editorial text-xl font-semibold text-[var(--foreground)]">Product Catalog</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openCategoryModal()}
                    className="btn-clay-outline text-xs py-1.5 px-3"
                  >
                    + Category
                  </button>
                  <button
                    onClick={() => openProductModal()}
                    className="btn-clay text-xs py-1.5 px-3"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            
            <div className="border border-[var(--card-border)] rounded-3xl bg-[var(--card)] overflow-hidden shadow-soft">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-xl"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-[var(--muted)] text-xs">
                  No products in catalog. Click <strong>+ Add Product</strong> to list items.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {products.map(product => (
                    <div key={product.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--card-clay)] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.title} width={48} height={48} className="w-12 h-12 rounded-xl object-cover border border-[var(--border)]" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[var(--card-clay)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--muted)]">Img</div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">{product.title}</div>
                          <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                            <span>Category: {product.category || 'General'}</span>
                            <span>• Stock: {product.stock}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono">
                          <div className="text-xs sm:text-sm font-bold text-[var(--accent-dark)]">{formatNaira(product.price)}</div>
                          {product.original_price && (
                            <div className="text-[10px] text-[var(--muted)] line-through">{formatNaira(product.original_price)}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProductModal(product)}
                            className="text-xs font-semibold text-[var(--foreground)] px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs font-semibold text-red-500 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {productsTotalPages > 1 && (
                <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                  <button
                    disabled={productsPage === 1}
                    onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                    className="text-xs font-semibold px-3.5 py-1.5 border border-[var(--border)] rounded-xl hover:bg-[var(--card-clay)] disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-[var(--muted)]">Page {productsPage} of {productsTotalPages}</span>
                  <button
                    disabled={productsPage === productsTotalPages}
                    onClick={() => setProductsPage(p => Math.min(productsTotalPages, p + 1))}
                    className="text-xs font-semibold px-3.5 py-1.5 border border-[var(--border)] rounded-xl hover:bg-[var(--card-clay)] disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Store Categories Management Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-xl font-semibold text-[var(--foreground)]">Store Categories ({categories.length})</h2>
              <button
                onClick={() => openCategoryModal()}
                className="text-xs font-bold text-[var(--accent-dark)] hover:underline"
              >
                + Create New Category
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="p-3.5 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl flex items-center justify-between hover:border-[var(--accent)] transition-colors shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[var(--accent-dark)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    </span>
                    <span className="text-xs font-semibold text-[var(--foreground)] truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openCategoryModal(cat)} className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] text-xs">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:text-red-400 text-xs">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Orders Section */}
          <section className="space-y-4">
            <h2 className="font-editorial text-xl font-semibold text-[var(--foreground)]">Recent Store Orders</h2>
            <div className="border border-[var(--card-border)] rounded-3xl bg-[var(--card)] overflow-hidden shadow-soft">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-xl"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-[var(--muted)] text-xs">No orders placed yet.</div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-[var(--card-clay)] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[var(--foreground)] font-bold">#{String(order.id).substring(0, 8)}</span>
                          <span className="text-[var(--muted)]">• {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[var(--accent-dark)]">{formatNaira(order.total_amount)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-semibold px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-xl outline-none cursor-pointer hover:border-[var(--accent)]"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ordersTotalPages > 1 && (
                <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                  <button
                    disabled={ordersPage === 1}
                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                    className="text-xs font-semibold px-3.5 py-1.5 border border-[var(--border)] rounded-xl hover:bg-[var(--card-clay)] disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-[var(--muted)]">Page {ordersPage} of {ordersTotalPages}</span>
                  <button
                    disabled={ordersPage === ordersTotalPages}
                    onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))}
                    className="text-xs font-semibold px-3.5 py-1.5 border border-[var(--border)] rounded-xl hover:bg-[var(--card-clay)] disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* PRODUCT ADD / EDIT MODAL (With Image Upload Support) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeProductModal}></div>
          
          <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)]">
                {productForm.id ? 'Edit Product Item' : 'Add New Product'}
              </h3>
              <button onClick={closeProductModal} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full border border-[var(--border)]">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="e.g. Silk Linen Relaxed Shirt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Price (NGN ₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Original Strikethrough (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.original_price}
                    onChange={e => setProductForm({ ...productForm, original_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    placeholder="35000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="General">General</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DETAILED DESCRIPTION & GALLERY IMAGES */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">
                  Detailed Item Description
                </label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="Enter specs, features, warranty, build materials, etc."
                ></textarea>
              </div>

              {/* ADDITIONAL GALLERY IMAGES */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Additional Gallery Images ({productForm.images.length})
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-[var(--accent-dark)] hover:underline">
                    + Upload Extra Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await authFetch(`/api/upload?tenant=${tenantSlug}`, { method: 'POST', body: formData });
                        if (res.success && res.data?.url) {
                          setProductForm(prev => ({ ...prev, images: [...prev.images, res.data.url] }));
                          addToast('Gallery image added!');
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {productForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-[var(--border)] aspect-square bg-[var(--card-clay)]">
                        <Image src={imgUrl} alt="Gallery" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT VARIANTS */}
              <div className="p-4 bg-[var(--card-clay)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Product Variants</label>
                  <button
                    type="button"
                    onClick={() => setProductForm(prev => ({ 
                      ...prev, 
                      variants: [...(prev.variants || []), { name: 'Size', value: '', stock: 0, price_adjustment: 0 }] 
                    }))}
                    className="text-[11px] font-bold text-[var(--accent-dark)] hover:underline"
                  >
                    + Custom Variant
                  </button>
                </div>

                {/* Quick Presets for Apparel, Shoes, and Colors */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm(prev => ({
                        ...prev,
                        variants: [
                          { name: 'Size', value: 'S', stock: 10, price_adjustment: 0 },
                          { name: 'Size', value: 'M', stock: 15, price_adjustment: 0 },
                          { name: 'Size', value: 'L', stock: 15, price_adjustment: 0 },
                          { name: 'Size', value: 'XL', stock: 8, price_adjustment: 0 },
                        ]
                      }));
                      addToast('Added Standard Apparel Sizes (S, M, L, XL)');
                    }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors shadow-xs"
                  >
                    + Apparel (S, M, L, XL)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm(prev => ({
                        ...prev,
                        variants: [
                          { name: 'Size', value: '40', stock: 5, price_adjustment: 0 },
                          { name: 'Size', value: '41', stock: 8, price_adjustment: 0 },
                          { name: 'Size', value: '42', stock: 10, price_adjustment: 0 },
                          { name: 'Size', value: '43', stock: 8, price_adjustment: 0 },
                          { name: 'Size', value: '44', stock: 5, price_adjustment: 0 },
                        ]
                      }));
                      addToast('Added Shoe Sizes (40-44)');
                    }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors shadow-xs"
                  >
                    + Shoes (40-44)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm(prev => ({
                        ...prev,
                        variants: [
                          { name: 'Color', value: 'Black', stock: 10, price_adjustment: 0 },
                          { name: 'Color', value: 'White', stock: 10, price_adjustment: 0 },
                          { name: 'Color', value: 'Sand Beige', stock: 8, price_adjustment: 0 },
                        ]
                      }));
                      addToast('Added Core Color Variants');
                    }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors shadow-xs"
                  >
                    + Colors
                  </button>
                  {productForm.variants?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, variants: [] }))}
                      className="text-[10px] font-semibold px-2 py-0.5 text-red-500 hover:underline ml-auto"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {(productForm.variants || []).map((v, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_60px_1fr] gap-2 items-end">
                    <div>
                      <label className="text-[10px] text-[var(--muted)] mb-1 block">Type (e.g. Size)</label>
                      <input 
                        type="text" 
                        value={v.name} 
                        onChange={(e) => {
                          const newV = [...productForm.variants];
                          newV[idx].name = e.target.value;
                          setProductForm({...productForm, variants: newV});
                        }}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] mb-1 block">Value (e.g. XL)</label>
                      <input 
                        type="text" 
                        value={v.value} 
                        required
                        onChange={(e) => {
                          const newV = [...productForm.variants];
                          newV[idx].value = e.target.value;
                          setProductForm({...productForm, variants: newV});
                        }}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] mb-1 block">Stock</label>
                      <input 
                        type="number" 
                        value={v.stock} 
                        onChange={(e) => {
                          const newV = [...productForm.variants];
                          newV[idx].stock = e.target.value;
                          setProductForm({...productForm, variants: newV});
                        }}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-[var(--muted)] mb-1 block">Price Adj. (₦)</label>
                        <input 
                          type="number" 
                          value={v.price_adjustment} 
                          onChange={(e) => {
                            const newV = [...productForm.variants];
                            newV[idx].price_adjustment = e.target.value;
                            setProductForm({...productForm, variants: newV});
                          }}
                          className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newV = [...productForm.variants];
                          newV.splice(idx, 1);
                          setProductForm({...productForm, variants: newV});
                        }}
                        className="text-red-500 hover:text-red-400 pb-1 px-1"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">
                  Product Image (File Upload or Image URL)
                </label>
                
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 cursor-pointer bg-[var(--card)] hover:bg-[var(--card-clay)] border border-[var(--border)] rounded-2xl py-2 px-3 text-center text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {uploadingImage && (
                  <div className="text-xs text-[var(--accent-dark)] font-mono mb-2">Uploading image file to server...</div>
                )}

                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                />
              </div>

              {/* FLASH SALE / FEATURED TOGGLE & OPTIONS */}
              <div className="p-4 bg-[var(--card-clay)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">Feature in Flash Deals</span>
                    <span className="text-[11px] text-[var(--muted)]">Show this item in the top Flash Deals banner</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">New Arrival Badge</span>
                    <span className="text-[11px] text-[var(--muted)]">Mark as new arrival in storefront</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={productForm.is_new_arrival}
                    onChange={e => setProductForm({ ...productForm, is_new_arrival: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                  />
                </div>

                {productForm.is_featured && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                    <div>
                      <label className="text-[11px] text-[var(--muted)] block mb-1">Discount (% Off)</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={productForm.discount_percent}
                        onChange={e => setProductForm({ ...productForm, discount_percent: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[var(--muted)] block mb-1">Flash Sale Stock Units</label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.flash_sale_units}
                        onChange={e => setProductForm({ ...productForm, flash_sale_units: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSubmitLoading}
                  className="btn-clay py-2.5 px-6 text-xs uppercase tracking-wider font-bold shadow-md flex items-center"
                >
                  {productSubmitLoading ? 'Saving...' : productForm.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCategoryModalOpen(false)}></div>
          
          <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 w-full max-w-sm z-10 space-y-4 shadow-2xl">
            <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)]">
              {editingCategory ? 'Edit Category' : 'Add Store Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="e.g. Footwear"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 block">Category Icon (Optional)</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="tag"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-3 py-1.5 text-xs text-[var(--muted)]">Cancel</button>
                <button type="submit" className="btn-clay text-xs py-1.5 px-4">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setConfirmModal({ isOpen: false, type: '', id: null, title: '' })}></motion.div>
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 w-full max-w-sm z-10 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 className="font-editorial text-xl font-semibold text-[var(--foreground)] mb-2">{confirmModal.title}</h3>
              <p className="text-xs text-[var(--muted)] mb-6">Are you sure you want to proceed? This action cannot be undone.</p>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: '', id: null, title: '' })} 
                  className="flex-1 py-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-clay)] text-[var(--foreground)] text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete} 
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold shadow-xl transition-all ${
              toast.type === 'error'
                ? 'bg-red-500/10 text-red-500 border-red-500/30'
                : 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] border-l-4 border-l-[var(--accent)]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

    </div>
  );
}