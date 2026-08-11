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
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeProducts: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({ id: null, title: '', price: '', stock: '', image_url: '' });
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

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
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`http://localhost:5000${url}`, {
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
      const ordersData = ordersRes.data?.orders || ordersRes.orders || [];

      setProducts(productsData);
      setOrders(ordersData);

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
      const res = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, tenantSlug })
      });

      const data = await res.json();
      
      const jwtToken = data.data?.token || data.token;
      
      if (!res.ok || !jwtToken) {
        throw new Error(data.message || 'Login failed');
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

  const openProductModal = (product = null) => {
    if (product) {
      setProductForm({
        id: product.id,
        title: product.title || '',
        price: product.price || '',
        stock: product.stock || '',
        image_url: product.image_url || ''
      });
    } else {
      setProductForm({ id: null, title: '', price: '', stock: '', image_url: '' });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductForm({ id: null, title: '', price: '', stock: '', image_url: '' });
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
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image_url: productForm.image_url
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
        throw new Error('Failed to save product');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let color = 'zinc-500';
    let textColor = 'text-zinc-700 dark:text-zinc-300';
    
    if (s === 'pending') { color = 'amber-500'; textColor = 'text-amber-700 dark:text-amber-400'; }
    else if (s === 'paid') { color = 'emerald-500'; textColor = 'text-emerald-700 dark:text-emerald-400'; }
    else if (s === 'shipped') { color = 'blue-500'; textColor = 'text-blue-700 dark:text-blue-400'; }
    else if (s === 'delivered') { color = 'green-500'; textColor = 'text-green-700 dark:text-green-400'; }
    else if (s === 'cancelled') { color = 'red-500'; textColor = 'text-red-700 dark:text-red-400'; }

    // Use specific tailwind color strings for the bg dot to prevent purge issues or string concatenation matching issues
    const dotColors = {
      'amber-500': 'bg-amber-500',
      'emerald-500': 'bg-emerald-500',
      'blue-500': 'bg-blue-500',
      'green-500': 'bg-green-500',
      'red-500': 'bg-red-500',
      'zinc-500': 'bg-zinc-500',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`}></span>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-border rounded-lg p-8">
          <h1 className="text-xl font-semibold text-foreground mb-6 text-center capitalize">{tenantSlug} Admin</h1>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-100 dark:border-red-900/50">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-accent text-background py-2.5 px-4 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 mt-2 flex justify-center items-center"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground capitalize">{tenantSlug}</h1>
            <p className="text-sm text-muted">Store Administrator Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-muted hover:text-foreground transition-colors px-4 py-2 border border-border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 border border-border rounded-lg bg-white dark:bg-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Total Revenue</h3>
            {dataLoading ? (
              <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-32"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-foreground">{formatCurrency(stats.revenue)}</div>
            )}
          </div>
          <div className="p-5 border border-border rounded-lg bg-white dark:bg-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Total Orders</h3>
            {dataLoading ? (
              <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-20"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-foreground">{stats.totalOrders}</div>
            )}
          </div>
          <div className="p-5 border border-border rounded-lg bg-white dark:bg-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Active Products</h3>
            {dataLoading ? (
              <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-20"></div>
            ) : (
              <div className="text-2xl font-mono font-bold text-foreground">{stats.activeProducts}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Products</h2>
              <button
                onClick={() => openProductModal()}
                className="bg-accent text-background py-1.5 px-3 rounded-md text-xs font-medium hover:opacity-90 transition-all"
              >
                + Add Product
              </button>
            </div>
            
            <div className="border border-border rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">No products found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {products.map(product => (
                    <div key={product.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-10 h-10 rounded object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 border border-border flex items-center justify-center text-xs text-muted">Img</div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">{product.title}</div>
                          <div className="text-xs text-muted">Stock: {product.stock}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-sm font-medium">{formatCurrency(product.price)}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProductModal(product)}
                            className="text-xs font-medium text-muted hover:text-foreground transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded text-xs font-medium transition-colors"
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
          <section>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">Recent Orders</h2>
            <div className="border border-border rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
              {dataLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">No orders yet.</div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted">#{order.id.substring(0, 8)}</span>
                          <span className="text-xs text-muted">&bull; {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="font-mono text-sm font-medium">{formatCurrency(order.total_amount)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs px-2 py-1 bg-transparent border border-border rounded outline-none cursor-pointer hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
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

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-border rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-6">
              {productForm.id ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted mb-1.5 block">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3 py-2.5 bg-transparent border border-border rounded-md text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors dark:border-zinc-700"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSubmitLoading}
                  className="bg-accent text-background py-2 px-4 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center"
                >
                  {productSubmitLoading ? (
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : null}
                  {productForm.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-md border text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right-8 ${
              toast.type === 'error' 
                ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900' 
                : 'bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 border-l-4 border-l-emerald-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}