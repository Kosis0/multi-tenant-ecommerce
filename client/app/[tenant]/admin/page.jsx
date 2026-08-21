'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '../../ThemeContext';
import { useToast } from '@/hooks/useToast';
import { useAdmin } from '@/hooks/useAdmin';

import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MetricCard } from '@/components/admin/MetricCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StorefrontConfigPanel } from '@/components/admin/StorefrontConfigPanel';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { OrderTable } from '@/components/admin/OrderTable';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { formatNaira } from '@/lib/utils';

export default function AdminDashboard() {
  const params = useParams();
  const tenantSlug = params?.tenant;
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Admin Custom Hook
  const admin = useAdmin(tenantSlug, addToast);

  if (admin.loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If unauthenticated, render clean login view
  if (!admin.token) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <AdminLogin
          tenantSlug={tenantSlug}
          loginEmail={admin.loginEmail}
          setLoginEmail={admin.setLoginEmail}
          loginPassword={admin.loginPassword}
          setLoginPassword={admin.setLoginPassword}
          loginLoading={admin.loginLoading}
          loginError={admin.loginError}
          onLogin={admin.handleLogin}
        />
      </>
    );
  }

  const lowStockCount = admin.products.filter((p) => Number(p.stock) <= 5).length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex transition-colors duration-300">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Desktop Navigation Sidebar */}
      <AdminSidebar
        tenantSlug={tenantSlug}
        activeTab={admin.activeTab}
        setActiveTab={admin.setActiveTab}
        lowStockCount={lowStockCount}
        ordersCount={admin.orders.length}
        productsCount={admin.products.length}
        onLogout={admin.handleLogout}
        className="hidden lg:flex"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <AdminHeader
          title={
            admin.activeTab === 'dashboard'
              ? 'Merchant Overview'
              : admin.activeTab === 'products'
              ? 'Products Inventory'
              : admin.activeTab === 'categories'
              ? 'Categories Directory'
              : admin.activeTab === 'orders'
              ? 'Order Fulfillment'
              : admin.activeTab === 'low-stock'
              ? 'Inventory Alerts'
              : 'Storefront Settings'
          }
          subtitle={`Admin control portal for ${tenantSlug} boutique`}
          tenantSlug={tenantSlug}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 flex-1">
          
          {/* Tab: Dashboard Overview */}
          {admin.activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* 4x KPI Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={formatNaira(admin.stats.revenue)}
                  change="+14.2% vs last month"
                  isPositive={true}
                  icon={<span>₦</span>}
                  onClick={() => admin.setActiveTab('orders')}
                />
                <MetricCard
                  title="Total Orders"
                  value={admin.stats.totalOrders}
                  change="+8.4% volume"
                  isPositive={true}
                  icon={<span>📦</span>}
                  onClick={() => admin.setActiveTab('orders')}
                />
                <MetricCard
                  title="Active Products"
                  value={admin.products.length || admin.stats.activeProducts}
                  subtitle="In catalog"
                  icon={<span>👗</span>}
                  onClick={() => admin.setActiveTab('products')}
                />
                <MetricCard
                  title="Low Stock Items"
                  value={lowStockCount}
                  change={lowStockCount > 0 ? `${lowStockCount} items low` : 'Healthy'}
                  isPositive={lowStockCount === 0}
                  icon={<span>⚠️</span>}
                  onClick={() => admin.setActiveTab('low-stock')}
                />
              </div>

              {/* Sales Chart & Quick Low Stock Alert */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <RevenueChart data={admin.stats.chartData} />
                </div>
                <div className="lg:col-span-4">
                  <LowStockAlert
                    products={admin.products}
                    onOpenProductModal={admin.openProductModal}
                  />
                </div>
              </div>

              {/* Recent Orders Preview */}
              <OrderTable
                orders={admin.orders.slice(0, 5)}
                page={1}
                totalPages={1}
                onPageChange={() => {}}
                onUpdateStatus={admin.updateOrderStatus}
              />
            </div>
          )}

          {/* Tab: Products */}
          {admin.activeTab === 'products' && (
            <ProductTable
              products={admin.products}
              categories={admin.categories}
              page={admin.productsPage}
              totalPages={admin.productsTotalPages}
              onPageChange={admin.setProductsPage}
              onOpenProductModal={admin.openProductModal}
              onDeleteProduct={admin.triggerDeleteProduct}
            />
          )}

          {/* Tab: Categories */}
          {admin.activeTab === 'categories' && (
            <div className="clay-card p-6 sm:p-8 bg-[var(--surface)] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Categories Registry</span>
                  <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)] mt-0.5">Departments & Tags</h3>
                </div>
                <button
                  onClick={() => admin.openCategoryModal(null)}
                  className="btn-clay text-xs"
                >
                  + New Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {admin.categories.map((cat) => (
                  <div key={cat.id || cat.name} className="p-4 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon || '🏷️'}</span>
                      <span className="text-xs font-bold text-[var(--foreground)]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => admin.openCategoryModal(cat)} className="text-xs font-semibold text-[var(--accent-dark)] hover:underline">
                        Edit
                      </button>
                      <button onClick={() => admin.triggerDeleteCategory(cat.id, cat.name)} className="text-xs text-red-500 hover:underline">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Orders */}
          {admin.activeTab === 'orders' && (
            <OrderTable
              orders={admin.orders}
              page={admin.ordersPage}
              totalPages={admin.ordersTotalPages}
              onPageChange={admin.setOrdersPage}
              onUpdateStatus={admin.updateOrderStatus}
            />
          )}

          {/* Tab: Low Stock */}
          {admin.activeTab === 'low-stock' && (
            <LowStockAlert
              products={admin.products}
              onOpenProductModal={admin.openProductModal}
            />
          )}

          {/* Tab: Storefront Settings */}
          {admin.activeTab === 'settings' && (
            <StorefrontConfigPanel
              heroBadge={admin.heroBadge}
              setHeroBadge={admin.setHeroBadge}
              heroTitle={admin.heroTitle}
              setHeroTitle={admin.setHeroTitle}
              heroSubtitle={admin.heroSubtitle}
              setHeroSubtitle={admin.setHeroSubtitle}
              heroProductId={admin.heroProductId}
              setHeroProductId={admin.setHeroProductId}
              products={admin.products}
              showFlashDeals={admin.showFlashDeals}
              onToggleFlashDeals={admin.toggleFlashDeals}
              onSaveHeroSettings={admin.saveHeroSettings}
              updating={admin.updatingSettings}
            />
          )}

        </main>
      </div>

      {/* Modals & Dialogs */}
      <ProductModal
        isOpen={admin.isProductModalOpen}
        onClose={() => admin.setIsProductModalOpen(false)}
        productForm={admin.productForm}
        setProductForm={admin.setProductForm}
        categories={admin.categories}
        onSubmit={admin.handleProductSubmit}
        loading={admin.productSubmitLoading}
        uploadingImage={admin.uploadingImage}
        onUploadImageFile={admin.uploadImageFile}
        onOpenCategoryModal={admin.openCategoryModal}
      />

      <CategoryModal
        isOpen={admin.isCategoryModalOpen}
        onClose={() => admin.setIsCategoryModalOpen(false)}
        editingCategory={admin.editingCategory}
        categoryName={admin.newCatName}
        setCategoryName={admin.setNewCatName}
        categoryIcon={admin.newCatIcon}
        setCategoryIcon={admin.setNewCatIcon}
        onSave={admin.handleSaveCategory}
      />

      <ConfirmDialog
        isOpen={admin.confirmDialog.isOpen}
        onClose={() => admin.setConfirmDialog({ ...admin.confirmDialog, isOpen: false })}
        onConfirm={admin.executeConfirmAction}
        title={admin.confirmDialog.title}
        message={admin.confirmDialog.message}
      />

    </div>
  );
}