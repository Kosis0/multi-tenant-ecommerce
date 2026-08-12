import "./globals.css";

export const metadata = {
  title: "Mercato — Premium Multi-Tenant Commerce",
  description: "Launch your custom multi-tenant storefront in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#db4444] selection:text-white">
        {children}
      </body>
    </html>
  );
}
