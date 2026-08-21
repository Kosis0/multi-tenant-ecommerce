'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CategoryModal({
  isOpen,
  onClose,
  editingCategory = null,
  categoryName,
  setCategoryName,
  categoryIcon,
  setCategoryIcon,
  onSave,
  loading = false,
}) {
  const isEditing = !!editingCategory;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create New Boutique Category'}
      subtitle={isEditing ? `Editing "${editingCategory.name}"` : 'Organize your storefront pieces into curated departments'}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSave} className="space-y-4">
        <Input
          label="Category Name"
          required
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="e.g. Footwear, Silk Tops, Jewelry"
        />

        <Input
          label="Category Code / Short Tag"
          value={categoryIcon}
          onChange={(e) => setCategoryIcon(e.target.value)}
          placeholder="e.g. SHOES, APPAREL, BAGS"
          helperText="Optional department code for inventory categorization."
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="clay" size="md" type="submit" isLoading={loading}>
            {isEditing ? 'Update Category' : 'Save Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
