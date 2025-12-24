import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminSettings from "./pages/admin/AdminSettings";
import BuyerProfile from "./pages/dashboard/BuyerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:id" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Dashboard Routes - All nested under /dashboard */}
              {/* Admin Routes */}
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/dashboard/users" element={<AdminUsers />} />
              <Route path="/dashboard/products" element={<AdminProducts />} />
              <Route path="/dashboard/orders" element={<AdminOrders />} />
              <Route path="/dashboard/sellers" element={<AdminSellers />} />
              <Route path="/dashboard/banners" element={<AdminBanners />} />
              <Route path="/dashboard/promotions" element={<AdminPromotions />} />
              <Route path="/dashboard/cms" element={<AdminCMS />} />
              <Route path="/dashboard/settings" element={<AdminSettings />} />
              
              {/* Shared Profile Route (accessible by all authenticated users) */}
              <Route path="/dashboard/profile" element={<BuyerProfile />} />
              
              {/* Buyer Routes */}
              <Route path="/dashboard/buyer" element={<BuyerProfile />} />
              <Route path="/dashboard/buyer/orders" element={<BuyerProfile />} />
              <Route path="/dashboard/buyer/addresses" element={<BuyerProfile />} />
              <Route path="/dashboard/buyer/wishlist" element={<BuyerProfile />} />
              <Route path="/dashboard/buyer/payments" element={<BuyerProfile />} />
              
              {/* Seller Routes (placeholder - will be implemented) */}
              <Route path="/dashboard/seller" element={<AdminDashboard />} />
              <Route path="/dashboard/seller/products" element={<AdminProducts />} />
              <Route path="/dashboard/seller/orders" element={<AdminOrders />} />
              <Route path="/dashboard/seller/analytics" element={<AdminDashboard />} />
              <Route path="/dashboard/seller/products/new" element={<AdminProducts />} />
              
              {/* Legacy Admin Routes - Redirect to new paths */}
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
