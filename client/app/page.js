import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-screen px-4 bg-[#09090b] text-[#fafafa] relative overflow-hidden">
      
      {/* Header / Brand Nav */}
      <header className="w-full max-w-6xl mx-auto py-6 px-4 flex items-center justify-between z-10 border-b border-[#272734]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#db4444] flex items-center justify-center font-bold text-white shadow-sm">
            M
          </div>
          <span className="text-xl font-bold tracking-tight font-mono text-white">Mercato</span>
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#272734] bg-[#141418] text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
          Multi-Tenant Commerce Engine
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white">
          Your Store. Your Brand.<br />
          <span className="text-[#db4444]">
            Live in Seconds.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
          Launch a high-performance multi-tenant online store complete with dynamic category browsing, flash sales, wishlist support, Naira (₦) payments, and full mobile responsiveness.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link 
            href="/register-store" 
            className="press px-8 py-3.5 bg-[#db4444] hover:bg-[#e53838] text-white font-semibold rounded-lg w-full sm:w-auto shadow-md transition-all text-sm uppercase tracking-wider"
          >
            Launch Your Store
          </Link>
          <Link 
            href="/nike" 
            className="press px-8 py-3.5 border border-[#272734] text-white font-medium rounded-lg w-full sm:w-auto hover:bg-[#141418] transition-colors text-sm uppercase tracking-wider"
          >
            Explore Demo Store
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#3f3f50] transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#181824] border border-[#272734] text-[#db4444] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 className="font-mono text-base font-semibold mb-2 text-white">Instant Merchant Onboarding</h3>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Auto-generate custom store slugs, register owner accounts, and start uploading catalog items immediately.
            </p>
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#3f3f50] transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#181824] border border-[#272734] text-[#db4444] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 className="font-mono text-base font-semibold mb-2 text-white">Professional Storefront</h3>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Complete with flash sales countdowns, discount strikethroughs, wishlists, star ratings, and responsive drawers.
            </p>
          </div>

          <div className="p-6 border border-[#272734] rounded-xl bg-[#141418] hover:border-[#3f3f50] transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#181824] border border-[#272734] text-[#db4444] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
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
