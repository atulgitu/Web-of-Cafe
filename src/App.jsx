import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import OfflineBanner from "./components/OfflineBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import StickyMiniCart from "./components/StickyMiniCart";
import { miniCartShownOn } from "./lib/miniCart";
import { useCart } from "./hooks/useAppContext";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Impact from "./pages/Impact";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Offers from "./pages/Offers";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import Rescue from "./pages/Rescue";
import { Spinner } from "./components/ui";

// Staff, partner and credits pages are loaded only when someone opens them, so
// customers don't download the kitchen dashboard with the menu.
const Credits = lazy(() => import("./pages/Credits"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Partner = lazy(() => import("./pages/Partner"));

const pageLoading = (
  <div className="py-24 flex justify-center text-charcoal-soft" role="status" aria-label="Loading">
    <Spinner />
  </div>
);

const BRAND = "Coffee Cinnamon";
const titles = {
  "/": `${BRAND} — Good food shouldn't go to waste`,
  "/menu": `Menu · ${BRAND}`,
  "/rescue": `Food rescue · ${BRAND}`,
  "/impact": `Impact · ${BRAND}`,
  "/about": `About · ${BRAND}`,
  "/dashboard": `Kitchen dashboard · ${BRAND}`,
  "/partner": `Partner pickups · ${BRAND}`,
  "/cart": `Cart · ${BRAND}`,
  "/checkout": `Checkout · ${BRAND}`,
  "/profile": `Your account · ${BRAND}`,
  "/login": `Sign in · ${BRAND}`,
  "/credits": `Photo credits · ${BRAND}`,
  "/forgot-password": `Reset your password · ${BRAND}`,
  "/offers": `Offers · ${BRAND}`,
  "/contact": `Contact · ${BRAND}`,
};

// Scroll to the top (or to #hash) on navigation, and keep the tab title in sync.
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = titles[pathname] || (pathname.startsWith("/order/") ? `Your order · ${BRAND}` : BRAND);
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const miniCartVisible = itemCount > 0 && miniCartShownOn(pathname);

  if (pathname === "/login") {
    return (
      <>
        <RouteEffects />
        <OfflineBanner />
        <Login />
      </>
    );
  }

  return (
    <>
      <RouteEffects />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <OfflineBanner />
      <Navbar />
      <main id="main" className="min-h-[60vh]">
        {/* keyed by path so navigating away from a crashed page recovers */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={pageLoading}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/rescue" element={<Rescue />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/cart" element={<Cart />} />
              {/* No account needed to order: details are collected at checkout */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
              <Route path="/profile" element={protect(<Profile />)} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {/* on phones, leave room under the footer for the floating cart bar when it shows */}
      <div className={miniCartVisible ? "pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0" : ""}>
        <Footer />
      </div>
      <StickyMiniCart />
    </>
  );
}
