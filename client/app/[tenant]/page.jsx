'use client';

import { use, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useToast } from '@/hooks/useToast';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useStorefront } from '@/hooks/useStorefront';

import { ToastContainer } from '@/components/ui/Toast';
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar';
import { StoreNavbar } from '@/components/storefront/StoreNavbar';
import { HeroSection } from '@/components/storefront/HeroSection';
import { CategoryPills } from '@/components/storefront/CategoryPills';
import { FlashSalesBanner } from '@/components/storefront/FlashSalesBanner';
import { FilterToolbar } from '@/components/storefront/FilterToolbar';
import { MobileFilterDrawer } from '@/components/storefront/MobileFilterDrawer';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductQuickViewModal } from '@/components/storefront/ProductQuickViewModal';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { WishlistDrawer } from '@/components/storefront/WishlistDrawer';
import { ReviewsModal } from '@/components/storefront/ReviewsModal';
import { CustomerAuthModal } from '@/components/storefront/CustomerAuthModal';
import { CustomerAccountModal } from '@/components/storefront/CustomerAccountModal';
import { CheckoutModal } from '@/components/storefront/CheckoutModal';
import { StoreFooter } from '@/components/storefront/StoreFooter';

export default function StorefrontPage({ params }) {
  const unwrappedParams = use(params);
  const tenant = unwrappedParams.tenant;

  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  // Custom Hooks
  const cartHook = useCart(tenant);
  const wishlistHook = useWishlist(tenant, addToast);
  const customerHook = useCustomerAuth(tenant, addToast);
  const storefront = useStorefront(tenant, addToast);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useRef([false]).current;
  const gridRef = useRef(null);

  const scrollToCatalog = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShareProduct = (product) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.title,
        text: `Explore ${product.title} on ${storefront.storeData?.name || tenant}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'success');
    }
  };

  const resetAllFilters = () => {
    storefront.setSelectedCategory('All');
    storefront.setSearchQuery('');
    storefront.setSelectedSize('All');
    storefront.setSelectedColor('All');
    storefront.setPriceRange(500000);
    storefront.setMinRating(0);
  };

  const featuredProduct = storefront.featuredProducts[0] || storefront.products[0] || null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      
      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Glassmorphic Store Navigation */}
      <StoreNavbar
        tenant={tenant}
        storeData={storefront.storeData}
        products={storefront.products}
        cartCount={cartHook.totalItems}
        cartTotal={cartHook.finalTotal}
        wishlistCount={wishlistHook.wishlistCount}
        customer={customerHook.customer}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenCart={() => cartHook.setIsCartOpen(true)}
        onOpenWishlist={() => wishlistHook.setIsWishlistOpen(true)}
        onOpenAuth={() => customerHook.setIsAuthModalOpen(true)}
        onOpenAccount={() => customerHook.setIsAccountModalOpen(true)}
        searchQuery={storefront.searchQuery}
        setSearchQuery={storefront.setSearchQuery}
        onSelectSearchProduct={(product) => storefront.openQuickView(product)}
        onSearchSubmit={scrollToCatalog}
      />

      {/* Hero Showcase */}
      <HeroSection
        storeData={storefront.storeData}
        featuredProduct={featuredProduct}
        onExploreCatalog={scrollToCatalog}
        onOpenProduct={(p) => storefront.openQuickView(p)}
      />

      {/* Category Pills Strip */}
      <CategoryPills
        categories={storefront.categories}
        selectedCategory={storefront.selectedCategory}
        onSelectCategory={(cat) => storefront.setSelectedCategory(cat)}
      />

      {/* Flash Sales Urgency Banner */}
      {storefront.storeData?.show_flash_deals !== false && (
        <FlashSalesBanner
          timeLeft={storefront.flashSaleTimeLeft}
          flashProducts={storefront.flashSaleProducts}
          onOpenProduct={(p) => storefront.openQuickView(p)}
        />
      )}

      {/* Multi-Attribute Filter Toolbar */}
      <FilterToolbar
        totalCount={storefront.filteredProducts.length}
        priceRange={storefront.priceRange}
        setPriceRange={storefront.setPriceRange}
        selectedSize={storefront.selectedSize}
        setSelectedSize={storefront.setSelectedSize}
        selectedColor={storefront.selectedColor}
        setSelectedColor={storefront.setSelectedColor}
        minRating={storefront.minRating}
        setMinRating={storefront.setMinRating}
        onResetFilters={resetAllFilters}
        onOpenMobileFilters={() => storefront.openMobileFilters?.() || cartHook.setIsCartOpen(false)}
      />

      {/* Responsive Product Grid */}
      <ProductGrid
        gridRef={gridRef}
        products={storefront.filteredProducts}
        loading={storefront.loading}
        loadingMore={storefront.loadingMore}
        hasMore={storefront.hasMore}
        onLoadMore={storefront.loadMoreProducts}
        wishlistIds={wishlistHook.wishlistIds}
        onToggleWishlist={wishlistHook.toggleWishlist}
        onOpenQuickView={storefront.openQuickView}
        onAddToCart={cartHook.addToCart}
        onResetFilters={resetAllFilters}
      />

      {/* Overlays & Drawers */}
      <ProductQuickViewModal
        product={storefront.quickViewProduct}
        isOpen={!!storefront.quickViewProduct}
        onClose={storefront.closeQuickView}
        onAddToCart={cartHook.addToCart}
        onOpenReviews={storefront.openReviewsModal}
        onShare={handleShareProduct}
        isWishlisted={wishlistHook.isWishlisted(storefront.quickViewProduct?.id)}
        onToggleWishlist={wishlistHook.toggleWishlist}
      />

      <CartDrawer
        isOpen={cartHook.isCartOpen}
        onClose={() => cartHook.setIsCartOpen(false)}
        cart={cartHook.cart}
        onUpdateQuantity={cartHook.updateQuantity}
        onRemoveItem={cartHook.removeFromCart}
        onClearCart={cartHook.clearCart}
        subtotal={cartHook.subtotal}
        totalItems={cartHook.totalItems}
        discountAmount={cartHook.discountAmount}
        shippingCost={cartHook.shippingCost}
        finalTotal={cartHook.finalTotal}
        isFreeShipping={cartHook.isFreeShipping}
        freeShippingRemaining={cartHook.freeShippingRemaining}
        freeShippingProgress={cartHook.freeShippingProgress}
        freeShippingThreshold={cartHook.freeShippingThreshold}
        promoCode={cartHook.promoCode}
        setPromoCode={cartHook.setPromoCode}
        appliedPromo={cartHook.appliedPromo}
        onApplyPromo={cartHook.applyPromoCode}
        onRemovePromo={cartHook.removePromoCode}
        onProceedToCheckout={() => storefront.setIsCheckoutOpen(true)}
        onExploreCatalog={scrollToCatalog}
      />

      <WishlistDrawer
        isOpen={wishlistHook.isWishlistOpen}
        onClose={() => wishlistHook.setIsWishlistOpen(false)}
        wishlistIds={wishlistHook.wishlistIds}
        products={storefront.products}
        onToggleWishlist={wishlistHook.toggleWishlist}
        onAddToCart={cartHook.addToCart}
        onExploreCatalog={scrollToCatalog}
      />

      <ReviewsModal
        product={storefront.reviewProduct}
        isOpen={!!storefront.reviewProduct}
        onClose={() => storefront.setReviewProduct(null)}
        reviews={storefront.reviewsList}
        loading={storefront.reviewLoading}
        submitting={storefront.submittingReview}
        onSubmitReview={storefront.submitReview}
      />

      <CustomerAuthModal
        isOpen={customerHook.isAuthModalOpen}
        onClose={() => customerHook.setIsAuthModalOpen(false)}
        mode={customerHook.authMode}
        setMode={customerHook.setAuthMode}
        loading={customerHook.authLoading}
        error={customerHook.authError}
        setError={customerHook.setAuthError}
        onLogin={customerHook.login}
        onRegister={customerHook.register}
      />

      <CustomerAccountModal
        customer={customerHook.customer}
        isOpen={customerHook.isAccountModalOpen}
        onClose={() => customerHook.setIsAccountModalOpen(false)}
        orders={customerHook.customerOrders}
        ordersLoading={customerHook.ordersLoading}
        onLogout={customerHook.logout}
      />

      <CheckoutModal
        isOpen={storefront.isCheckoutOpen}
        onClose={() => storefront.setIsCheckoutOpen(false)}
        cart={cartHook.cart}
        finalTotal={cartHook.finalTotal}
        subtotal={cartHook.subtotal}
        shippingCost={cartHook.shippingCost}
        discountAmount={cartHook.discountAmount}
        customer={customerHook.customer}
        tenant={tenant}
        onPaymentSuccess={() => {
          cartHook.clearCart();
        }}
        addToast={addToast}
      />

      {/* Store Footer */}
      <StoreFooter
        tenant={tenant}
        storeData={storefront.storeData}
        categories={storefront.categories}
        onSelectCategory={(cat) => {
          storefront.setSelectedCategory(cat);
          scrollToCatalog();
        }}
      />

    </div>
  );
}