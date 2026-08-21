'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

export function useCustomerAuth(tenant, addToast) {
  const [customer, setCustomer] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Restore customer from localStorage
  useEffect(() => {
    if (!tenant || typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`customer_${tenant}`);
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse customer session', e);
    }
  }, [tenant]);

  // Fetch customer orders when customer or modal opens
  const fetchCustomerOrders = useCallback(async () => {
    if (!tenant) return;
    setOrdersLoading(true);
    try {
      // First try customer token if available, else email query
      let res;
      if (customer?.token) {
        res = await fetch(`${API_URL}/api/customers/orders?tenant=${tenant}`, {
          headers: { Authorization: `Bearer ${customer.token}` },
        });
      } else if (customer?.email) {
        res = await fetch(`${API_URL}/api/orders?tenant=${tenant}&customerEmail=${encodeURIComponent(customer.email)}`);
      }

      if (res && res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data.data) ? data.data : (data.data?.orders || data.orders || []);
        setCustomerOrders(ordersList);
      }
    } catch (err) {
      console.warn('Could not fetch customer orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [tenant, customer]);

  useEffect(() => {
    if (customer && isAccountModalOpen) {
      fetchCustomerOrders();
    }
  }, [customer, isAccountModalOpen, fetchCustomerOrders]);

  // Login
  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/api/customers/login?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Invalid email or password');
      }

      const custData = data.data?.customer || data.customer || { email, name: data.data?.name || email.split('@')[0] };
      if (data.data?.token) custData.token = data.data.token;

      setCustomer(custData);
      localStorage.setItem(`customer_${tenant}`, JSON.stringify(custData));
      setIsAuthModalOpen(false);
      if (addToast) addToast(`Welcome back, ${custData.name || 'Member'}!`, 'success');
      return { success: true, customer: custData };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, [tenant, addToast]);

  // Register
  const register = useCallback(async ({ name, email, password, phone, address }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/api/customers/register?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      const custData = data.data?.customer || { name, email, phone, address };
      if (data.data?.token) custData.token = data.data.token;

      setCustomer(custData);
      localStorage.setItem(`customer_${tenant}`, JSON.stringify(custData));
      setIsAuthModalOpen(false);
      if (addToast) addToast(`Account created! Welcome to the boutique, ${name}!`, 'success');
      return { success: true, customer: custData };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, [tenant, addToast]);

  // Logout
  const logout = useCallback(() => {
    setCustomer(null);
    setCustomerOrders([]);
    setIsAccountModalOpen(false);
    try {
      localStorage.removeItem(`customer_${tenant}`);
    } catch {}
    if (addToast) addToast('You have been signed out', 'info');
  }, [tenant, addToast]);

  return {
    customer,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    authMode,
    setAuthMode,
    authLoading,
    authError,
    setAuthError,
    customerOrders,
    ordersLoading,
    login,
    register,
    logout,
    fetchCustomerOrders,
  };
}
