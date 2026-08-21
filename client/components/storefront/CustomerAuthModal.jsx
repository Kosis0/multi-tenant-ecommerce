'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CustomerAuthModal({
  isOpen,
  onClose,
  mode = 'login',
  setMode,
  loading = false,
  error = '',
  setError,
  onLogin,
  onRegister,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error && setError) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await onLogin(formData.email, formData.password);
    } else {
      await onRegister(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Customer Sign In' : 'Create Boutique Account'}
      subtitle={mode === 'login' ? 'Access your order history and saved delivery addresses.' : 'Join for exclusive drops, order tracking, and member offers.'}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        
        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              if (setError) setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              if (setError) setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              name="name"
              placeholder="Amara Okon"
              required
              value={formData.name}
              onChange={handleChange}
            />
          )}

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="amara@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleChange}
          />

          {mode === 'register' && (
            <>
              <Input
                label="Phone Number"
                name="phone"
                placeholder="+234 801 234 5678"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Default Shipping Address"
                name="address"
                placeholder="Victoria Island, Lagos"
                value={formData.address}
                onChange={handleChange}
              />
            </>
          )}

          <Button
            type="submit"
            variant="clay"
            size="lg"
            className="w-full mt-2"
            isLoading={loading}
          >
            {mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
          </Button>
        </form>

      </div>
    </Modal>
  );
}
