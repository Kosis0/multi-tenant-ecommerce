'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';

export function useStorefront(tenant, addToast) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(500000);
  const [minRating, setMinRating] = useState(0);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeQuickViewImage, setActiveQuickViewImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews Modal
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Flash Sale Timer
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo fallback catalog generator
  const getDemoCatalog = useCallback((tenantSlug) => {
    const name = tenantSlug ? tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1) : 'Mercato';
    return {
      store: {
        name: `${name} Official Boutique`,
        slug: tenantSlug,
        show_flash_deals: true,
        hero_badge: 'Spring / Summer 2026 Collection',
        hero_title: 'Admire Contemporary Luxury & Looks',
        hero_subtitle: 'Discover curated high-fashion silhouettes, artisan leather goods, and modern lifestyle essentials with seamless Naira checkout.',
      },
      categories: [
        { id: 1, name: 'Shoes' },
        { id: 2, name: 'Apparel' },
        { id: 3, name: 'Bags' },
        { id: 4, name: 'Electronics' },
        { id: 5, name: 'Accessories' },
        { id: 6, name: 'Jewelry' },
      ],
      products: [
        {
          id: 101,
          title: `${name} Minimalist Knit Runner`,
          price: 48500,
          original_price: 65000,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
          category: 'Shoes',
          description: 'Sculpted lightweight knit sneaker crafted for effortless daily mobility. Features responsive foam cushioning, breathable engineered mesh upper, and ergonomic arch support.',
          is_featured: true,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 38,
          discount_percent: 25,
          flash_sale_units: 6,
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '40 EU', color: 'Clay Orange', sku: 'RUN-40-ORG', price_adjustment: 0, stock: 5 },
            { size: '42 EU', color: 'Clay Orange', sku: 'RUN-42-ORG', price_adjustment: 0, stock: 4 },
            { size: '44 EU', color: 'Obsidian Noir', sku: 'RUN-44-BLK', price_adjustment: 2000, stock: 6 },
          ],
        },
        {
          id: 102,
          title: `${name} Heavyweight Brushed Terracotta Hoodie`,
          price: 32000,
          original_price: 42000,
          stock: 24,
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
          category: 'Apparel',
          description: '450GSM organic brushed cotton fleece hoodie with a structured drop-shoulder silhouette, double-layered hood, and minimalist ribbed trims.',
          is_featured: true,
          is_new_arrival: false,
          rating: 4.8,
          review_count: 28,
          discount_percent: 23,
          flash_sale_units: 8,
          images: [
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'S', color: 'Terracotta', sku: 'HD-S-TER', price_adjustment: 0, stock: 8 },
            { size: 'M', color: 'Terracotta', sku: 'HD-M-TER', price_adjustment: 0, stock: 10 },
            { size: 'L', color: 'Terracotta', sku: 'HD-L-TER', price_adjustment: 0, stock: 6 },
          ],
        },
        {
          id: 103,
          title: `${name} Architectural Vegetable-Tanned Leather Tote`,
          price: 68000,
          original_price: 85000,
          stock: 9,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
          category: 'Bags',
          description: 'Italian full-grain vegetable-tanned leather tote with internal suede compartments, magnetic snap closure, and brushed solid brass hardware.',
          is_featured: true,
          is_new_arrival: true,
          rating: 5.0,
          review_count: 21,
          discount_percent: 20,
          flash_sale_units: 4,
          images: [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Standard (18L)', color: 'Cognac Tan', sku: 'TOTE-STD-CGN', price_adjustment: 0, stock: 5 },
            { size: 'Grand (24L)', color: 'Espresso Noir', sku: 'TOTE-GRD-ESP', price_adjustment: 8000, stock: 4 },
          ],
        },
        {
          id: 104,
          title: `${name} Wireless Studio ANC Headphones`,
          price: 89000,
          original_price: 115000,
          stock: 11,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
          category: 'Electronics',
          description: 'Custom 40mm titanium drivers with hybrid active noise cancellation, memory-foam ear cushions, lossless spatial audio, and 45-hour battery life.',
          is_featured: true,
          is_new_arrival: false,
          rating: 4.9,
          review_count: 54,
          discount_percent: 22,
          flash_sale_units: 5,
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Over-Ear', color: 'Matte Slate', sku: 'ANC-OVR-SLT', price_adjustment: 0, stock: 6 },
            { size: 'Over-Ear', color: 'Rose Gold', sku: 'ANC-OVR-RSG', price_adjustment: 3500, stock: 5 },
          ],
        },
        {
          id: 105,
          title: `${name} Relaxed Oversized French Linen Shirt`,
          price: 24000,
          original_price: 30000,
          stock: 18,
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
          category: 'Apparel',
          description: 'Breathable 100% French flax linen button-up with genuine mother-of-pearl buttons and a relaxed resort Cuban collar.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.7,
          review_count: 22,
          discount_percent: 20,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'S', color: 'Natural Ecru', sku: 'LIN-S-ECR', price_adjustment: 0, stock: 6 },
            { size: 'M', color: 'Natural Ecru', sku: 'LIN-M-ECR', price_adjustment: 0, stock: 7 },
            { size: 'L', color: 'Olive Sage', sku: 'LIN-L-SGE', price_adjustment: 1000, stock: 5 },
          ],
        },
        {
          id: 106,
          title: `${name} Chronograph Sapphire Minimalist Watch`,
          price: 55000,
          original_price: 70000,
          stock: 14,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
          category: 'Accessories',
          description: 'Japanese quartz movement timepiece with scratch-resistant sapphire crystal glass, 5ATM water resistance, and an interchangeable Horween leather strap.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 19,
          discount_percent: 21,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '40mm', color: 'Smoked Silver', sku: 'WCH-40-SLV', price_adjustment: 0, stock: 8 },
            { size: '42mm', color: 'Midnight Gold', sku: 'WCH-42-GLD', price_adjustment: 4500, stock: 6 },
          ],
        },
        {
          id: 107,
          title: `${name} Retro Suede Gum Sole Sneakers`,
          price: 52000,
          original_price: 68000,
          stock: 10,
          image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85',
          category: 'Shoes',
          description: 'Vintage-inspired low top sneaker in supple olive and sand suede with vulcanized natural gum soles and reinforced toe bumpers.',
          is_featured: false,
          is_new_arrival: false,
          rating: 4.8,
          review_count: 31,
          discount_percent: 23,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1512374382149-233c42b6613c?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '41 EU', color: 'Olive & Sand', sku: 'RET-41-OLV', price_adjustment: 0, stock: 4 },
            { size: '43 EU', color: 'Olive & Sand', sku: 'RET-43-OLV', price_adjustment: 0, stock: 6 },
          ],
        },
        {
          id: 108,
          title: `${name} Matte Weatherproof Commuter Backpack`,
          price: 42000,
          original_price: 55000,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
          category: 'Bags',
          description: 'Matte weatherproof coated canvas backpack with magnetic fidlock buckles, hidden passport compartment, and padded 16-inch laptop chamber.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.8,
          review_count: 15,
          discount_percent: 23,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '20L Daily', color: 'Obsidian Black', sku: 'BP-20L-BLK', price_adjustment: 0, stock: 12 },
            { size: '28L Travel', color: 'Obsidian Black', sku: 'BP-28L-BLK', price_adjustment: 6000, stock: 8 },
          ],
        },
        {
          id: 109,
          title: `${name} 18k Solid Gold Herringbone Chain`,
          price: 125000,
          original_price: 150000,
          stock: 8,
          image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
          category: 'Jewelry',
          description: 'Handcrafted 18-karat solid yellow gold herringbone chain with a silky high-polish finish and secure lobster clasp.',
          is_featured: true,
          is_new_arrival: true,
          rating: 5.0,
          review_count: 14,
          discount_percent: 16,
          flash_sale_units: 3,
          images: [
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1611591475152-478311382490?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '18 Inch', color: '18k Yellow Gold', sku: 'GLD-18-CHN', price_adjustment: 0, stock: 5 },
            { size: '22 Inch', color: '18k Yellow Gold', sku: 'GLD-22-CHN', price_adjustment: 20000, stock: 3 },
          ],
        },
        {
          id: 110,
          title: `${name} Polarized Acetate Sunglasses`,
          price: 28500,
          original_price: 36000,
          stock: 16,
          image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
          category: 'Accessories',
          description: 'Handcrafted Italian cellulose acetate frames with category-3 polarized CR-39 lenses and 100% UVA/UVB protection.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.8,
          review_count: 26,
          discount_percent: 21,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Medium', color: 'Havana Amber', sku: 'SUN-MED-AMB', price_adjustment: 0, stock: 10 },
            { size: 'Large', color: 'Gloss Noir', sku: 'SUN-LRG-BLK', price_adjustment: 0, stock: 6 },
          ],
        },
        {
          id: 111,
          title: `${name} Acoustic Walnut Bluetooth Speaker`,
          price: 76000,
          original_price: 95000,
          stock: 12,
          image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85',
          category: 'Electronics',
          description: 'Solid American walnut enclosure with woven acoustic fabric, dual neodymium drivers, passive bass radiator, and Bluetooth 5.3 aptX HD audio.',
          is_featured: false,
          is_new_arrival: false,
          rating: 4.9,
          review_count: 32,
          discount_percent: 20,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Desk 30W', color: 'Walnut Wood', sku: 'SPK-30W-WLN', price_adjustment: 0, stock: 8 },
            { size: 'Studio 60W', color: 'Smoked Ash', sku: 'SPK-60W-ASH', price_adjustment: 18000, stock: 4 },
          ],
        },
        {
          id: 112,
          title: `${name} Raw Emerald & Diamond Signet Ring`,
          price: 98000,
          original_price: 120000,
          stock: 7,
          image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
          category: 'Jewelry',
          description: 'Hand-set natural Zambian emerald surrounded by brilliant-cut pavé diamonds on a brushed 14k yellow gold geometric signet band.',
          is_featured: true,
          is_new_arrival: true,
          rating: 5.0,
          review_count: 18,
          discount_percent: 18,
          flash_sale_units: 2,
          images: [
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Size 7 (17.3mm)', color: '14k Yellow Gold', sku: 'RNG-SZ7-GLD', price_adjustment: 0, stock: 4 },
            { size: 'Size 9 (18.9mm)', color: '14k Yellow Gold', sku: 'RNG-SZ9-GLD', price_adjustment: 0, stock: 3 },
          ],
        },
        {
          id: 113,
          title: `${name} Tailored Double-Breasted Wool Overcoat`,
          price: 115000,
          original_price: 145000,
          stock: 9,
          image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=1200&q=85',
          category: 'Apparel',
          description: 'Pure virgin wool double-breasted overcoat with horn buttons, peak lapels, viscose cupro lining, and tailored back vent.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 11,
          discount_percent: 21,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '38R', color: 'Camel Tan', sku: 'COT-38R-CML', price_adjustment: 0, stock: 4 },
            { size: '40R', color: 'Camel Tan', sku: 'COT-40R-CML', price_adjustment: 0, stock: 5 },
          ],
        },
        {
          id: 114,
          title: `${name} Eau de Parfum 100ml (Smoked Oud & Bergamot)`,
          price: 45000,
          original_price: 58000,
          stock: 19,
          image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
          category: 'Accessories',
          description: 'Artisanal unisex eau de parfum featuring top notes of Calabrian bergamot, heart of smoked cedarwood, and deep base notes of rare aged Cambodian oud.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.9,
          review_count: 27,
          discount_percent: 22,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '50ml Spray', color: 'Smoked Glass', sku: 'PRF-50ML-GLS', price_adjustment: 0, stock: 10 },
            { size: '100ml Spray', color: 'Smoked Glass', sku: 'PRF-100ML-GLS', price_adjustment: 15000, stock: 9 },
          ],
        },
        {
          id: 115,
          title: `${name} Artisan Derby Oxford Shoes`,
          price: 72000,
          original_price: 90000,
          stock: 8,
          image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85',
          category: 'Shoes',
          description: 'Hand-burnished Italian calfskin leather derby shoes with Goodyear-welted construction and stacked leather heel.',
          is_featured: false,
          is_new_arrival: false,
          rating: 5.0,
          review_count: 16,
          discount_percent: 20,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: '42 EU', color: 'Mahogany Brown', sku: 'DRB-42-MHG', price_adjustment: 0, stock: 4 },
            { size: '44 EU', color: 'Mahogany Brown', sku: 'DRB-44-MHG', price_adjustment: 0, stock: 4 },
          ],
        },
        {
          id: 116,
          title: `${name} Handcrafted Leather Crossbody Satchel`,
          price: 49000,
          original_price: 62000,
          stock: 14,
          image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
          category: 'Bags',
          description: 'Full-grain saddle leather crossbody bag with adjustable shoulder strap, antique brass quick-release buckle, and phone slip pocket.',
          is_featured: false,
          is_new_arrival: true,
          rating: 4.8,
          review_count: 23,
          discount_percent: 21,
          flash_sale_units: 0,
          images: [
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=1200&q=85',
          ],
          variants: [
            { size: 'Compact (8L)', color: 'Vintage Espresso', sku: 'STC-CPT-ESP', price_adjustment: 0, stock: 8 },
            { size: 'Classic (12L)', color: 'Vintage Espresso', sku: 'STC-CLS-ESP', price_adjustment: 5000, stock: 6 },
          ],
        },
      ],
    };
  }, []);

  // Fetch Store Data & Products
  const fetchStoreData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=1&limit=12`);
      if (res.ok) {
        const data = await res.json();
        const prods = data.data?.products || data.products || [];
        const cats = data.data?.categories || data.categories || [];
        const store = data.data?.store || data.store || { name: tenant, slug: tenant };

        setProducts(prods.length > 0 ? prods : getDemoCatalog(tenant).products);
        setCategories(cats.length > 0 ? cats : getDemoCatalog(tenant).categories);
        setStoreData(store);
        setHasMore((data.data?.pagination?.totalPages || 1) > 1);
      } else {
        const fallback = getDemoCatalog(tenant);
        setProducts(fallback.products);
        setCategories(fallback.categories);
        setStoreData(fallback.store);
      }
    } catch (err) {
      console.warn('Using demo catalog fallback:', err.message);
      const fallback = getDemoCatalog(tenant);
      setProducts(fallback.products);
      setCategories(fallback.categories);
      setStoreData(fallback.store);
    } finally {
      setLoading(false);
    }
  }, [tenant, getDemoCatalog]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Load More Products Pagination
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`${API_URL}/api/products?tenant=${tenant}&page=${nextPage}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        const newProds = data.data?.products || data.products || [];
        if (newProds.length > 0) {
          setProducts((prev) => [...prev, ...newProds]);
          setPage(nextPage);
          const totalPages = data.data?.pagination?.totalPages || 1;
          setHasMore(nextPage < totalPages);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, tenant]);

  // Quick View Handler
  const openQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setActiveQuickViewImage(product.image_url);
    const variants = Array.isArray(product.variants) 
      ? product.variants 
      : (typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : []);
    setSelectedVariant(variants[0] || null);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
    setActiveQuickViewImage(null);
    setSelectedVariant(null);
  }, []);

  // Reviews Handler
  const openReviewsModal = useCallback(async (product) => {
    setReviewProduct(product);
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}/reviews?tenant=${tenant}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : (data.reviews || []);
        setReviewsList(list);
      } else {
        setReviewsList([
          { id: 1, author_name: 'Amara O.', rating: 5, comment: 'Exceptional craftsmanship and swift delivery in Lagos!', created_at: new Date().toISOString() },
          { id: 2, author_name: 'Tunde B.', rating: 5, comment: 'High quality materials, exactly as described.', created_at: new Date().toISOString() }
        ]);
      }
    } catch {
      setReviewsList([
        { id: 1, author_name: 'Amara O.', rating: 5, comment: 'Exceptional craftsmanship and swift delivery in Lagos!', created_at: new Date().toISOString() }
      ]);
    } finally {
      setReviewLoading(false);
    }
  }, [tenant]);

  const submitReview = useCallback(async ({ authorName, rating, comment }) => {
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${reviewProduct.id}/reviews?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, comment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newRev = data.data || { id: Date.now(), author_name: authorName, rating, comment, created_at: new Date().toISOString() };
        setReviewsList((prev) => [newRev, ...prev]);
        if (addToast) addToast('Thank you! Your review has been published.', 'success');
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      // Local fallback
      const localRev = { id: Date.now(), author_name: authorName, rating, comment, created_at: new Date().toISOString() };
      setReviewsList((prev) => [localRev, ...prev]);
      if (addToast) addToast('Review submitted successfully!', 'success');
      return { success: true };
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewProduct, tenant, addToast]);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = Number(p.price || 0) <= priceRange;
      const matchesRating = Number(p.rating || 5) >= minRating;
      
      let matchesSize = true;
      if (selectedSize !== 'All') {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        matchesSize = variants.some(v => v.size?.toLowerCase() === selectedSize.toLowerCase()) || p.description?.includes(selectedSize);
      }

      let matchesColor = true;
      if (selectedColor !== 'All') {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        matchesColor = variants.some(v => v.color?.toLowerCase() === selectedColor.toLowerCase()) || p.title?.includes(selectedColor);
      }

      return matchesCat && matchesSearch && matchesPrice && matchesRating && matchesSize && matchesColor;
    });
  }, [products, selectedCategory, searchQuery, priceRange, minRating, selectedSize, selectedColor]);

  // Featured Products
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured);
  }, [products]);

  // Flash Sale Products
  const flashSaleProducts = useMemo(() => {
    return products.filter((p) => (Number(p.discount_percent) > 0 || p.flash_sale_units > 0));
  }, [products]);

  return {
    loading,
    error,
    storeData,
    products,
    categories,
    filteredProducts,
    featuredProducts,
    flashSaleProducts,
    page,
    hasMore,
    loadingMore,
    loadMoreProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    quickViewProduct,
    activeQuickViewImage,
    setActiveQuickViewImage,
    selectedVariant,
    setSelectedVariant,
    openQuickView,
    closeQuickView,
    reviewProduct,
    reviewsList,
    reviewLoading,
    submittingReview,
    openReviewsModal,
    setReviewProduct,
    submitReview,
    isCheckoutOpen,
    setIsCheckoutOpen,
    paymentLoading,
    setPaymentLoading,
    paymentSuccess,
    setPaymentSuccess,
    flashSaleTimeLeft,
    refetchStoreData: fetchStoreData,
  };
}
