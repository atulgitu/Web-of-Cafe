import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import StickyMiniCart from "./components/StickyMiniCart";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Impact from "./pages/Impact";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Offers from "./pages/Offers";
import OrderConfirmation from "./pages/OrderConfirmation";
import Partner from "./pages/Partner";
import Profile from "./pages/Profile";
import Rescue from "./pages/Rescue";

const titles = {
  "/": "Brew & Care — Good food shouldn't go to waste",
  "/menu": "Menu · Brew & Care",
  "/rescue": "Rescue board · Brew & Care",
  "/impact": "Impact · Brew & Care",
  "/about": "About the project · Brew & Care",
  "/dashboard": "Kitchen dashboard · Brew & Care",
  "/partner": "Partner pickups · Brew & Care",
  "/cart": "Cart · Brew & Care",
  "/checkout": "Checkout · Brew & Care",
  "/profile": "Your account · Brew & Care",
  "/login": "Log in · Brew & Care",
  "/offers": "Offers · Brew & Care",
  "/contact": "Contact · Brew & Care",
  "/order-confirmation": "Order confirmed · Brew & Care",
};

// Scroll to the top (or to #hash) on navigation, and keep the tab title in sync.
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = titles[pathname] || "Brew & Care";
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function protect(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
  const { pathname } = useLocation();

  if (pathname === "/login") {
    return (
      <>
        <RouteEffects />
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
      <Navbar />
      <main id="main" className="pb-20 md:pb-0 min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/rescue" element={<Rescue />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={protect(<Checkout />)} />
          <Route path="/order-confirmation" element={protect(<OrderConfirmation />)} />
          <Route path="/profile" element={protect(<Profile />)} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <StickyMiniCart />
    </>
  );
}
