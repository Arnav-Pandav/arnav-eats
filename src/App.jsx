// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";


// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Order from "./assets/components/Order";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSucessPage";

// Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMenuManagement from "./pages/AdminMenuManagement";
import ProtectedRoute from "./assets/components/ProtectedRoute";

// Context
import { CartProvider } from "./context/CartContext";

// Reservation Section (ONLY for homepage)
import ReservationSection from "./assets/components/ReservationSection";

// ------------------------------------------------------
// Layout Wrapper (decides admin layout vs public layout)
// ------------------------------------------------------
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // ---------------- ADMIN LAYOUT (no navbar/footer) ----------------
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <main className="px-6 py-10">{children}</main>
      </div>
    );
  }

  // ---------------- PUBLIC LAYOUT ----------------
  return (
    <div className="min-h-screen flex flex-col bg-lightbg dark:bg-darkbg text-textDark dark:text-textLight transition-colors duration-300">
      <Navbar />

      <main className="flex-grow mt-20 px-6">{children}</main>

      {/* Show ReservationSection ONLY on Home Page */}
      {location.pathname === "/" && <ReservationSection />}

      <Footer />
    </div>
  );
};

// ------------------------------------------------------
// MAIN APP
// ------------------------------------------------------
export default function App() {
  return (
    <CartProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order" element={<Order />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenuManagement />} />
            </Route>
          </Routes>
          <ToastContainer position="bottom-right" autoClose={2000} />
        </LayoutWrapper>
      </Router>
    </CartProvider>
  );
}
