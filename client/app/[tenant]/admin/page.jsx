'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const params = useParams();
  const tenantSlug = params?.tenant;

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard state
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeProducts: 0 });
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
    is_featured: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');

  // Toasts
  const [toasts, setToasts] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  const addToast = (message, type = 'success') => {
    const id = Date.now();
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

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        authFetch(`/api/products?tenant=${tenantSlug}`),
        authFetch(`/api/orders?tenant=${tenantSlug}`)
      ]);

      const productsData = productsRes.data?.products || productsRes.products || [];
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || ordersRes.orders || []);
      const categoriesData = productsRes.data?.categories || [];

      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);

      const revenue = ordersData.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);
      setStats({
        revenue,
        totalOrders: ordersData.length,
        activeProducts: productsData.length,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
      setLoading(false);
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
      
      if (!res.ok || !jwtToken) {
        throw new Error(data.error || data.message || 'Login failed');
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
      setProductForm({
        id: product.id,
        title: product.title || '',
        price: product.price || '',
        original_price: product.original_price || '',
        stock: product.stock || '',
        category: product.category || 'General',
        description: product.description || '',
        image_url: product.image_url || '',
        is_featured: !!product.is_featured
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
        is_featured: false 
      });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
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
        is_featured: productForm.is_featured
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
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await authFetch(`/api/products/${id}?tenant=${tenantSlug}`, {
        method: 'DELETE'
      });
      addToast('Product deleted');
      fetchDashboardData();
    } catch (error) {
      addToast('Error deleting product', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await authFetch(`/api/categories?tenant=${tenantSlug}`, {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, icon: newCatIcon })
      });
      if (res.success) {
        addToast('Category added!');
        setNewCatName('');
        setIsCategoryModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      addToast('Error adding category', 'error');
    }
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
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#db4444] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#141418] border border-[#272734] rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#db4444] text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#db4444]/30">
            M
          </div>
          
          <h1 className="text-2xl font-extrabold text-white mb-2 text-center capitalize">{tenantSlug} Admin</h1>
          <p className="text-xs text-[#a1a1aa] text-center mb-6">Store Merchant Login</p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/40 text-red-400 text-xs rounded-lg border border-red-900/60">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444] transition-colors"
                placeholder="owner@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="press w-full bg-[#db4444] hover:bg-[#e53838] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 mt-2 flex justify-center items-center shadow-lg shadow-[#db4444]/20"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href={`/${tenantSlug}`} className="text-xs text-[#a1a1aa] hover:text-[#db4444] transition-colors">
              ← View Customer Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#272734]">
          <div>
            <h1 className="text-2xl font-extrabold text-white capitalize flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#db4444] text-white text-xs font-black flex items-center justify-center">
                {tenantSlug?.charAt(0)}
              </span>
              <span>{tenantSlug} Merchant Dashboard</span>
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1">Manage catalog, upload product images, process orders in Naira (₦)</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/${tenantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-4 py-2 border border-[#272734] rounded-lg hover:border-[#db4444] text-white transition-colors"
            >
              View Storefront ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 border border-[#272734] rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#141418] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Analytics Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">Total Revenue</h3>
            {dataLoading ? (
              <div className="skeleton h-8 w-32 rounded"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-[#db4444]">{formatNaira(stats.revenue)}</div>
            )}
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">Total Orders</h3>
            {dataLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-white">{stats.totalOrders}</div>
            )}
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">Active Catalog Products</h3>
            {dataLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-white">{stats.activeProducts}</div>
            )}
          </div>
        </div>

        {/* Catalog & Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Products Management Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#a1a1aa]">Product Catalog</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-[#141418] border border-[#272734] text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:border-[#db4444] transition-colors"
                >
                  + Add Category
                </button>
                <button
                  onClick={() => openProductModal()}
                  className="bg-[#db4444] text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-[#e53838] transition-colors"
                >
                  + Add Product
                </button>
              </div>
            </div>
            
            <div className="border border-[#272734] rounded-xl bg-[#141418] overflow-hidden shadow-xl">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-lg"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-[#a1a1aa] text-xs">
                  No products in catalog. Click <strong>+ Add Product</strong> to list items.
                </div>
              ) : (
                <div className="divide-y divide-[#272734]">
                  {products.map(product => (
                    <div key={product.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#1c1c24] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-11 h-11 rounded-lg object-cover border border-[#272734]" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-[#09090b] border border-[#272734] flex items-center justify-center text-xs text-[#a1a1aa]">Img</div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-white truncate">{product.title}</div>
                          <div className="text-[11px] text-[#a1a1aa] flex items-center gap-2">
                            <span>Category: {product.category || 'General'}</span>
                            <span>• Stock: {product.stock}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono">
                          <div className="text-xs sm:text-sm font-bold text-[#db4444]">{formatNaira(product.price)}</div>
                          {product.original_price && (
                            <div className="text-[10px] text-[#a1a1aa] line-through">{formatNaira(product.original_price)}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProductModal(product)}
                            className="text-xs font-semibold text-[#a1a1aa] hover:text-white px-2 py-1 bg-[#272734] rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Orders Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#a1a1aa]">Recent Store Orders</h2>
            <div className="border border-[#272734] rounded-xl bg-[#141418] overflow-hidden shadow-xl">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-lg"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-[#a1a1aa] text-xs">No orders placed yet.</div>
              ) : (
                <div className="divide-y divide-[#272734]">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-[#1c1c24] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-white font-bold">#{order.id.substring(0, 8)}</span>
                          <span className="text-[#a1a1aa]">• {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[#db4444]">{formatNaira(order.total_amount)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1 bg-[#09090b] border border-[#272734] text-white rounded-lg outline-none cursor-pointer hover:border-[#db4444]"
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
            </div>
          </section>
        </div>
      </div>

      {/* PRODUCT ADD / EDIT MODAL (With Image Upload Support) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={closeProductModal}></div>
          
          <div className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#272734] pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {productForm.id ? 'Edit Product Item' : 'Add New Product Item'}
              </h3>
              <button onClick={closeProductModal} className="text-[#a1a1aa] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                  placeholder="e.g. Wireless Gaming Mouse"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">Price (NGN ₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                    placeholder="120000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">Original Strikethrough (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.original_price}
                    onChange={e => setProductForm({ ...productForm, original_price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                    placeholder="150000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                  >
                    <option value="General">General</option>
                    <option value="Phones">Phones</option>
                    <option value="Computers">Computers</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Camera">Camera</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Gaming">Gaming</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IMAGE UPLOAD & IMAGE URL SECTION */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1 block">
                  Product Image (File Upload or Image URL)
                </label>
                
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 cursor-pointer bg-[#181824] hover:bg-[#272734] border border-[#272734] rounded-lg py-2 px-3 text-center text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {uploadingImage && (
                  <div className="text-xs text-[#db4444] font-mono mb-2">Uploading image file to server...</div>
                )}

                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-xs text-white outline-none focus:border-[#db4444]"
                  placeholder="https://..."
                />

                {productForm.image_url && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-[#09090b] border border-[#272734] rounded-lg">
                    <img src={productForm.image_url} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    <span className="text-[11px] text-[#a1a1aa] truncate flex-1">{productForm.image_url}</span>
                    <button type="button" onClick={() => setProductForm({ ...productForm, image_url: '' })} className="text-xs text-red-400">Remove</button>
                  </div>
                )}
              </div>

              {/* FLASH SALE / FEATURED TOGGLE */}
              <div className="p-3 bg-[#181824] border border-[#272734] rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Feature in Flash Sales</span>
                  <span className="text-[11px] text-[#a1a1aa]">Show this item in the top Flash Sales section on your storefront</span>
                </div>
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-[#db4444] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272734]">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSubmitLoading}
                  className="press bg-[#db4444] hover:bg-[#e53838] text-white py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center"
                >
                  {productSubmitLoading ? 'Saving...' : productForm.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
          
          <div className="relative bg-[#141418] border border-[#272734] rounded-2xl p-6 w-full max-w-sm z-10 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Add Store Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="text-xs text-[#a1a1aa] block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                  placeholder="e.g. Footwear"
                />
              </div>
              <div>
                <label className="text-xs text-[#a1a1aa] block mb-1">Category Emoji Icon</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#272734] rounded-lg text-sm text-white outline-none focus:border-[#db4444]"
                  placeholder="👟"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-3 py-1.5 text-xs text-[#a1a1aa]">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#db4444] text-white text-xs font-bold rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg border text-xs font-semibold shadow-2xl transition-all ${
              toast.type === 'error'
                ? 'bg-red-950 text-red-200 border-red-900'
                : 'bg-[#141418] text-white border-[#272734] border-l-4 border-l-[#db4444]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

    </div>
  );
}