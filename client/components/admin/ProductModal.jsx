'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function ProductModal({
  isOpen,
  onClose,
  productForm,
  setProductForm,
  categories = [],
  onSubmit,
  loading = false,
  uploadingImage = false,
  onUploadImageFile,
  onOpenCategoryModal,
}) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'variants'

  // Variant generator state
  const [tempVariant, setTempVariant] = useState({
    size: '',
    color: '',
    sku: '',
    price_adjustment: '0',
    stock: '10',
  });

  const isEditing = !!productForm.id;

  const handleFieldChange = (name, value) => {
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVariant = () => {
    if (!tempVariant.size && !tempVariant.color) return;
    const newSku = tempVariant.sku || `${productForm.title?.substring(0, 3).toUpperCase() || 'PROD'}-${tempVariant.size || 'STD'}-${tempVariant.color || 'CLR'}-${Date.now().toString().slice(-4)}`;
    
    const newVar = {
      size: tempVariant.size,
      color: tempVariant.color,
      sku: newSku,
      price_adjustment: parseFloat(tempVariant.price_adjustment) || 0,
      stock: parseInt(tempVariant.stock, 10) || 0,
    };

    setProductForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVar],
    }));

    setTempVariant({ size: '', color: '', sku: '', price_adjustment: '0', stock: '10' });
  };

  const handleRemoveVariant = (index) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product Catalog Item' : 'Add New Boutique Product'}
      subtitle={isEditing ? `Updating product #${productForm.id}` : 'Create a new garment, footwear, or accessory item'}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Form Tabs */}
        <div className="flex p-1 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)]">
          {[
            { id: 'basic', label: '1. Basic Info' },
            { id: 'pricing', label: '2. Pricing & Stock' },
            { id: 'variants', label: '3. Media & Variants' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Tab 1: Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <Input
                label="Product Title"
                required
                value={productForm.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Minimalist Knit Runner"
              />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Category"
                    value={productForm.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    options={categoryOptions.length > 0 ? categoryOptions : [{ value: 'General', label: 'General' }]}
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onOpenCategoryModal(null)}
                  className="shrink-0 mb-0.5"
                >
                  + Add Category
                </Button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Description & Materials Narrative
                </label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Detailed product story, craftsmanship details, care instructions..."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => handleFieldChange('is_featured', e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent-dark)] rounded-sm"
                  />
                  <span>Featured Collection Spotlight</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_new_arrival}
                    onChange={(e) => handleFieldChange('is_new_arrival', e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent-dark)] rounded-sm"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing & Stock */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Selling Price (₦ Naira)"
                  type="number"
                  required
                  value={productForm.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  placeholder="48500"
                />

                <Input
                  label="Original / Compare-at Price (₦)"
                  type="number"
                  value={productForm.original_price}
                  onChange={(e) => handleFieldChange('original_price', e.target.value)}
                  placeholder="65000"
                  helperText="Optional. Shows markdown savings badge."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Base Stock Units"
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => handleFieldChange('stock', e.target.value)}
                  placeholder="15"
                />

                <Input
                  label="Discount % Tag"
                  type="number"
                  value={productForm.discount_percent}
                  onChange={(e) => handleFieldChange('discount_percent', e.target.value)}
                  placeholder="20"
                />

                <Input
                  label="Flash Sale Allocations"
                  type="number"
                  value={productForm.flash_sale_units}
                  onChange={(e) => handleFieldChange('flash_sale_units', e.target.value)}
                  placeholder="6"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Media & Variants */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Media Uploader */}
              <div className="space-y-4 p-4 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Primary Product Image & Gallery
                  </label>
                  <span className="text-[10px] text-[var(--accent-dark)] font-bold">High-Res Photography</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shrink-0">
                    {productForm.image_url ? (
                      <Image src={productForm.image_url} alt="Preview" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.image_url}
                      onChange={(e) => handleFieldChange('image_url', e.target.value)}
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUploadImageFile(file);
                        }}
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn-clay-outline text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        {uploadingImage ? 'Uploading Image...' : 'Upload Local File'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* 1-Click Curated Presets */}
                <div className="pt-2 border-t border-[var(--border-light)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Quick Fill: Curated Studio Presets
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Knit Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85', cat: 'Shoes', price: 48500 },
                      { name: 'Terracotta Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85', cat: 'Apparel', price: 32000 },
                      { name: 'Leather Tote', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85', cat: 'Bags', price: 68000 },
                      { name: 'Studio ANC Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85', cat: 'Electronics', price: 89000 },
                      { name: 'Sapphire Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85', cat: 'Accessories', price: 55000 },
                      { name: 'Gold Herringbone', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85', cat: 'Jewelry', price: 125000 },
                      { name: 'Emerald Signet', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', cat: 'Jewelry', price: 98000 },
                      { name: 'Oud Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85', cat: 'Accessories', price: 45000 },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            image_url: preset.url,
                            category: prev.category === 'General' || !prev.category ? preset.cat : prev.category,
                            price: prev.price || preset.price,
                          }));
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--card)] border border-[var(--border)] text-left transition-all hover:border-[var(--accent)] cursor-pointer"
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[var(--background)]">
                          <Image src={preset.url} alt={preset.name} fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="text-[11px] font-semibold text-[var(--foreground)] truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Variant Generator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Variants Matrix ({productForm.variants?.length || 0})
                  </span>
                </div>

                {/* New Variant Input Form */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] items-end">
                  <Input
                    label="Size"
                    placeholder="e.g. 42 EU"
                    value={tempVariant.size}
                    onChange={(e) => setTempVariant({ ...tempVariant, size: e.target.value })}
                  />
                  <Input
                    label="Color"
                    placeholder="e.g. Clay"
                    value={tempVariant.color}
                    onChange={(e) => setTempVariant({ ...tempVariant, color: e.target.value })}
                  />
                  <Input
                    label="+Price (₦)"
                    type="number"
                    value={tempVariant.price_adjustment}
                    onChange={(e) => setTempVariant({ ...tempVariant, price_adjustment: e.target.value })}
                  />
                  <Input
                    label="Units"
                    type="number"
                    value={tempVariant.stock}
                    onChange={(e) => setTempVariant({ ...tempVariant, stock: e.target.value })}
                  />
                  <Button
                    variant="clay"
                    size="sm"
                    onClick={handleAddVariant}
                    className="h-10 col-span-2 sm:col-span-1"
                  >
                    + Add
                  </Button>
                </div>

                {/* Variants List */}
                {productForm.variants?.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {productForm.variants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-light)] text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[var(--foreground)]">{v.size || 'N/A'}</span>
                          <span className="text-[var(--muted)]">{v.color || 'Standard'}</span>
                          <span className="font-mono text-[10px] text-[var(--muted)]">{v.sku}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-600">+{formatNaira(v.price_adjustment)}</span>
                          <span className="text-[var(--foreground)] font-bold">{v.stock} pcs</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(i)}
                            className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
                            aria-label="Remove variant"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="clay" size="lg" type="submit" isLoading={loading}>
              {isEditing ? 'Save Product Changes' : 'Create Product'}
            </Button>
          </div>
        </form>

      </div>
    </Modal>
  );
}
