import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mercato — Premium Multi-Tenant Commerce",
  description: "Launch your custom multi-tenant storefront in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#db4444] selection:text-white">
        {children}
      </body>
    </html>
  );
}
