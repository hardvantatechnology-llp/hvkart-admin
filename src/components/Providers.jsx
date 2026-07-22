"use client";

import { ToastProvider } from "@/components/ui/Toast";

// Trimmed from hardvanta/src/components/Providers.jsx — that file also wraps
// SessionProvider, CartProvider, WishlistProvider, and DeliveryLocationProvider,
// none of which anything in this project currently uses (no client-side
// useSession(), no cart/wishlist/delivery UI). Only ToastProvider is needed,
// since ProductForm/ProductsTable/AdminDeleteButton call useToast(). Add the
// others back if/when a future module actually needs them.
export default function Providers({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
