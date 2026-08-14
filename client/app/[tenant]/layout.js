export async function generateMetadata({ params }) {
  const { tenant } = await params;

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://multi-tenant-ecommerce-backend-six.onrender.com";
    const res = await fetch(`${API_URL}/api/products?tenant=${tenant}`, { 
      headers: { 'x-tenant-slug': tenant },
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.store?.name) {
        const storeName = data.data.store.name;
        return {
          title: `${storeName} | Premium Store`,
          description: `Shop the latest products at ${storeName}.`,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch tenant metadata:", error);
  }

  // Fallback
  return {
    title: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Store`,
    description: `Welcome to the ${tenant} store.`,
  };
}

export default function TenantLayout({ children }) {
  return <>{children}</>;
}
