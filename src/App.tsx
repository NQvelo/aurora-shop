import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ShopProvider } from "@/context/ShopContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import ScrollToTop from "./components/ScrollToTop";
import CollectionsPage from "./pages/CollectionsPage";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ShopProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sale" element={<CategoryPage category="sale" />} />
              <Route path="/new" element={<CategoryPage category="new" />} />
              <Route
                path="/clothing"
                element={<CategoryPage category="clothing" />}
              />
              <Route
                path="/bestsellers"
                element={<CategoryPage category="bestsellers" />}
              />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route
                path="/collections/dresses"
                element={<CategoryPage category="dresses" />}
              />
              <Route
                path="/collections/makeup"
                element={<CategoryPage category="makeup" />}
              />
              <Route
                path="/collections/jewelry"
                element={<CategoryPage category="jewelry" />}
              />
              <Route
                path="/collections/pet"
                element={<CategoryPage category="pet" />}
              />
              <Route
                path="/collections/best-friend"
                element={<CategoryPage category="best-friend" />}
              />
              <Route
                path="/collections/girlfriend"
                element={<CategoryPage category="girlfriend" />}
              />
              <Route
                path="/collections/:collection"
                element={<CategoryPage category="collections" />}
              />
              <Route path="/stockists" element={<AboutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/orders" element={<AdminPage />} />
              <Route path="/admin/products" element={<AdminPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ShopProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
