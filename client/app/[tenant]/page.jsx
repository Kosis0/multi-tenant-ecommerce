'use client';

import { use, useEffect, useState } from 'react';

export default function StorefrontPage({ params }) {
  const unwrappedParams = use(params);
  const tenant = unwrappedParams.tenant;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`http://localhost:5000/api/products?tenant=${tenant}`);
        if (!res.ok) {
          throw new Error('Store not found');
        }
        const json = await res.json();
        if (json.success) {
          setStoreData(json.data);
          setProducts(json.data.products || []);
        } else {
          throw new Error('Failed to load store');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [tenant]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addToCart = (product) => {
    if (product.stock === 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addToast(`Only ${product.stock} in stock`, 'error');
          return prev;
        }
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        product_id: product.id, 
        title: product.title, 
        price: product.price, 
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
  };

  const placeOrder = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCart([]);
        setIsCartOpen(false);
        addToast('Order placed successfully!');
      } else {
        addToast(data.error || 'Error placing order', 'error');
      }
    } catch (err) {
      addToast('Network error placing order', 'error');
    }
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">404 - Store Not Found</h1>
          <p className="text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const getStoreDisplayName = () => {
    if (!storeData) return tenant;
    if (typeof storeData.store === 'object' && storeData.store?.name) return storeData.store.name;
    if (typeof storeData.store === 'string') return storeData.store;
    return tenant;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <header className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <h1 className="text-xl font-bold tracking-tight capitalize">
            {loading ? <div className="skeleton h-6 w-48 rounded"></div> : getStoreDisplayName()}
          </h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background">
                {cartItemsCount}
              </span>
            )}
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                <div className="aspect-square skeleton"></div>
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded"></div>
                  <div className="skeleton h-4 w-1/4 rounded"></div>
                  <div className="skeleton h-8 w-full rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-foreground">No products yet</h3>
            <p className="mt-1 text-sm text-muted">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="group border border-border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors flex flex-col">
                <div className="aspect-square overflow-hidden relative border-b border-border">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-foreground truncate">{product.title}</h3>
                  <div className="flex items-center justify-between mt-1 mb-4">
                    <span className="text-sm font-mono font-semibold text-foreground">${Number(product.price).toFixed(2)}</span>
                    {product.stock > 0 ? (
                      <span className="text-xs text-muted">{product.stock} in stock</span>
                    ) : (
                      <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">Out of stock</span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    {product.stock > 0 ? (
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full py-2 text-xs font-medium uppercase tracking-wider bg-accent text-background hover:opacity-90 active:scale-[0.98] transition-all rounded"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full py-2 text-xs font-medium uppercase tracking-wider bg-accent text-background opacity-40 cursor-not-allowed rounded"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight capitalize">{getStoreDisplayName()}</h2>
                <p className="text-xs text-muted">{cartItemsCount} items</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  Your cart is empty
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <div className="text-xs text-muted font-mono mt-1">${Number(item.price).toFixed(2)}</div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-border rounded">
                          <button 
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="px-2 py-1 text-muted hover:text-foreground transition-colors"
                          >-</button>
                          <span className="text-xs font-mono w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="px-2 py-1 text-muted hover:text-foreground transition-colors"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="font-mono font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={placeOrder}
                  className="w-full py-3 text-sm font-medium uppercase tracking-wider bg-accent text-background hover:opacity-90 active:scale-[0.98] transition-all rounded-lg"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`bg-white dark:bg-zinc-900 border border-border rounded-lg p-4 shadow-lg flex items-center justify-between min-w-[300px] pointer-events-auto border-l-4 ${toast.type === 'error' ? 'border-l-red-500' : 'border-l-green-500'} animate-in slide-in-from-bottom-5 fade-in duration-300`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}