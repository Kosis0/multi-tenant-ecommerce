export async function generateMetadata({ params }) {
  const { tenant } = await params;
  const tenantName = tenant ? tenant.charAt(0).toUpperCase() + tenant.slice(1) : 'Merchant';
  
  return {
    title: `${tenantName} Merchant Portal | Command Center`,
    description: `Merchant command center for managing products, inventory, orders, and storefront customization for ${tenantName}.`,
    icons: {
      icon: [
        { url: '/admin-icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico' },
      ],
      shortcut: '/admin-icon.svg',
      apple: '/admin-icon.svg',
    },
  };
}

export default function AdminLayout({ children }) {
  return <>{children}</>;
}
