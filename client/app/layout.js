import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

export const metadata = {
  title: "Mercato — Multi-Tenant Commerce Platform",
  description: "Enterprise-grade multi-tenant commerce engine with independent storefronts, real-time inventory management, and payments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased suppressHydrationWarning">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300 selection:bg-[#e8a598] selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
