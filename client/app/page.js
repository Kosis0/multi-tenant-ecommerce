import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-screen px-4 bg-[#09090b] text-[#fafafa] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#db4444]/10 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Header / Brand Nav */}
      <header className="w-full max-w-6xl mx-auto py-6 px-4 flex items-center justify-between z-10 border-b border-[#272734]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#db4444] flex items-center justify-center font-bold text-white shadow-lg shadow-[#db4444]/30">
            M
          </div>
          <span className="text-xl font-bold tracking-tight font-mono">Mercato</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/register-store" 
            className="text-xs uppercase tracking-wider font-semibold text-[#db4444] hover:text-white transition-colors"
          >
            Create Store
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full text-center py-20 z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#db4444]/30 bg-[#db4444]/10 text-[#db4444] text-xs font-semibold uppercase tracking-wider mb-6 animate-[fadeIn_0.5s_ease-out]">
          <span className="w-2 h-2 rounded-full bg-[#db4444] animate-ping"></span>
          Multi-Tenant Commerce Infrastructure
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Your Store. Your Brand.<br />
          <span className="bg-gradient-to-r from-[#db4444] via-[#ff6b6b] to-[#f59e0b] bg-clip-text text-transparent">
            Live in Seconds.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
          Launch a high-performance multi-tenant online store complete with dynamic category browsing, flash sales, wishlist support, Naira (₦) payments, and full mobile responsiveness.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link 
            href="/register-store" 
            className="press px-8 py-3.5 bg-[#db4444] hover:bg-[#e53838] text-white font-medium rounded-lg w-full sm:w-auto shadow-lg shadow-[#db4444]/25 transition-all text-sm uppercase tracking-wider"
          >
            Launch Your Store
          </Link>
          <Link 
            href="/nike" 
            className="press px-8 py-3.5 border border-[#272734] text-white font-medium rounded-lg w-full sm:w-auto hover:bg-[#1c1c24] transition-colors text-sm uppercase tracking-wider"
          >
            Explore Demo Store
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#db4444]/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#db4444]/10 text-[#db4444] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="font-mono text-base font-semibold mb-2 text-white">Instant Merchant Onboarding</h3>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Auto-generate custom store slugs, register owner accounts, and start uploading catalog items immediately.
            </p>
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#db4444]/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#db4444]/10 text-[#db4444] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🛒
            </div>
            <h3 className="font-mono text-base font-semibold mb-2 text-white">Figma-Grade Storefront</h3>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Complete with flash sales countdowns, discount strikethroughs, wishlists, star ratings, and responsive drawers.
            </p>
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#db4444]/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#db4444]/10 text-[#db4444] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💳
            </div>
            <h3 className="font-mono text-base font-semibold mb-2 text-white">Naira (₦) Payment Gateway</h3>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Full Stripe NGN checkout scaffolding built-in, supporting instant card checkout and order payment tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-6 border-t border-[#272734] text-center text-xs font-mono text-[#a1a1aa] z-10">
        &copy; {new Date().getFullYear()} Mercato Multi-Tenant Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
