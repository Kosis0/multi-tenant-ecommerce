import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
          Your store. Your brand.<br /> Live in seconds.
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto mb-10">
          The minimalist, multi-tenant e-commerce platform. Launch your dedicated storefront with total brand isolation and instant global edge performance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register-store" 
            className="press px-6 py-3 bg-accent text-background font-medium rounded-md w-full sm:w-auto"
          >
            Launch Your Store
          </Link>
          <Link 
            href="/demo-store" 
            className="press px-6 py-3 border border-border text-foreground font-medium rounded-md w-full sm:w-auto hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Browse Demo
          </Link>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-[slideUp_0.7s_ease-out]">
        <div className="border border-border rounded-lg p-6">
          <div className="text-2xl mb-4">⚡</div>
          <h3 className="font-mono text-sm font-semibold mb-2">Instant Setup</h3>
          <p className="text-muted text-sm">
            Deploy your storefront immediately. No servers to manage, no complex configuration required.
          </p>
        </div>
        <div className="border border-border rounded-lg p-6">
          <div className="text-2xl mb-4">🛡️</div>
          <h3 className="font-mono text-sm font-semibold mb-2">Tenant Isolation</h3>
          <p className="text-muted text-sm">
            Your data and customers are strictly separated. True multi-tenant architecture for maximum security.
          </p>
        </div>
        <div className="border border-border rounded-lg p-6">
          <div className="text-2xl mb-4">📊</div>
          <h3 className="font-mono text-sm font-semibold mb-2">Real-time Analytics</h3>
          <p className="text-muted text-sm">
            Monitor traffic, sales, and conversions in real-time with your dedicated owner dashboard.
          </p>
        </div>
      </div>

      <footer className="mt-24 py-8 border-t border-border w-full text-center text-sm font-mono text-muted">
        &copy; {new Date().getFullYear()} Mercato
      </footer>
    </div>
  );
}
