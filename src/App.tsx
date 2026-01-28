import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { CategoriesProvider } from "@/hooks/useCategories";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminHeroBanners from "./pages/admin/AdminHeroBanners";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProductView from "./pages/admin/AdminProductView";
import BuyerProfile from "./pages/dashboard/BuyerProfile";
import BuyerOrders from "./pages/dashboard/BuyerOrders";
import DashboardIndex from "./pages/dashboard/DashboardIndex";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import SellerPending from "./pages/dashboard/SellerPending";
import AddProduct from "./pages/dashboard/AddProduct";
import EditProduct from "./pages/dashboard/EditProduct";
import SellerProducts from "./pages/dashboard/SellerProducts";
import SellerProfileChoice from "./pages/seller/SellerProfileChoice";
import SellerProfileComplete from "./pages/seller/SellerProfileComplete";
import SellerProductView from "./pages/dashboard/SellerProductView";
import SellerOrders from "./pages/dashboard/SellerOrders";
import SellerAnalytics from "./pages/dashboard/SellerAnalytics";
import SellerReviews from "./pages/dashboard/SellerReviews";
import SellerTranslations from "./pages/dashboard/SellerTranslations";
import Wishlist from "./pages/dashboard/Wishlist";
import BuyerReviews from "./pages/dashboard/BuyerReviews";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminContactMessages from "./pages/admin/AdminContactMessages";
import AdminContactSettings from "./pages/admin/AdminContactSettings";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminCategories from "./pages/admin/AdminCategories";
import Notifications from "./pages/dashboard/Notifications";
import DashboardShell from "@/components/dashboard/DashboardShell";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <CategoriesProvider>
            <CartProvider>
              <WishlistProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
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
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />

                      {/* Dashboard Routes */}
                      <Route path="/dashboard/seller/pending" element={<SellerPending />} />

                      {/* Buyer + Seller dashboard shell (sidebar/header stay mounted) */}
                      <Route path="/dashboard/*" element={<DashboardShell />}>
                        <Route index element={<DashboardIndex />} />

                        {/* Shared */}
                        <Route path="profile" element={<BuyerProfile />} />
                        <Route path="notifications" element={<Notifications />} />

                        {/* Buyer */}
                        <Route path="buyer" element={<BuyerDashboard />} />
                        <Route path="buyer/orders" element={<BuyerOrders />} />
                        <Route path="buyer/reviews" element={<BuyerReviews />} />
                        <Route path="buyer/addresses" element={<BuyerProfile />} />
                        <Route path="buyer/wishlist" element={<Wishlist />} />
                        <Route path="buyer/payments" element={<BuyerProfile />} />

                        {/* Seller */}
                        <Route path="seller" element={<SellerDashboard />} />
                        <Route path="seller/products" element={<SellerProducts />} />
                        <Route path="seller/orders" element={<SellerOrders />} />
                        <Route path="seller/reviews" element={<SellerReviews />} />
                        <Route path="seller/analytics" element={<SellerAnalytics />} />
                        <Route path="seller/translations" element={<SellerTranslations />} />
                        <Route path="seller/products/new" element={<AddProduct />} />
                        <Route path="seller/products/edit/:id" element={<EditProduct />} />
                        <Route path="seller/products/view/:id" element={<SellerProductView />} />
                      </Route>

                      {/* Admin Routes */}
                      <Route path="/dashboard/admin" element={<AdminDashboard />} />
                      <Route path="/dashboard/users" element={<AdminUsers />} />
                      <Route path="/dashboard/products" element={<AdminProducts />} />
                      <Route path="/admin/products/:id" element={<AdminProductView />} />
                      <Route path="/dashboard/orders" element={<AdminOrders />} />
                      <Route path="/dashboard/orders/:id" element={<AdminOrderDetail />} />
                      <Route path="/dashboard/sellers" element={<AdminSellers />} />
                      <Route path="/dashboard/hero-banners" element={<AdminHeroBanners />} />
                      <Route path="/dashboard/cms" element={<AdminCMS />} />
                      <Route path="/dashboard/cms" element={<AdminCMS />} />
                      <Route path="/dashboard/settings" element={<AdminSettings />} />
                      <Route path="/dashboard/reviews" element={<AdminReviews />} />
                      <Route path="/dashboard/contact-messages" element={<AdminContactMessages />} />
                      <Route path="/dashboard/contact-settings" element={<AdminContactSettings />} />
                      <Route path="/dashboard/newsletter" element={<AdminNewsletter />} />
                      <Route path="/dashboard/social-links" element={<AdminSocialLinks />} />
                      <Route path="/dashboard/deals" element={<AdminDeals />} />
                      <Route path="/dashboard/blogs" element={<AdminBlogs />} />
                      <Route path="/dashboard/about" element={<AdminAbout />} />
                      <Route path="/dashboard/categories" element={<AdminCategories />} />
                      <Route path="/dashboard/admin/notifications" element={<AdminNotifications />} />
                      <Route path="/dashboard/admin/products/:id" element={<AdminProductView />} />
                      <Route path="/dashboard/admin/orders/:id" element={<AdminOrderDetail />} />

                      {/* Seller Onboarding Routes */}
                      <Route path="/seller/profile-choice" element={<SellerProfileChoice />} />
                      <Route path="/seller/complete-profile" element={<SellerProfileComplete />} />

                      {/* Legacy Admin Routes - Redirect to new paths */}
                      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </WishlistProvider>
            </CartProvider>
          </CategoriesProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
