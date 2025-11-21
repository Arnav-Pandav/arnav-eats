import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ⭐ Dark mode
  useEffect(() => {
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  // ⭐ Universal scroll function with correct page target
  const goToAndScroll = (e, route, id) => {
    e.preventDefault();

    // If already on correct page → just scroll
    if (window.location.pathname === route) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Otherwise navigate to target page AND pass scroll ID
    navigate(route, { state: { scrollTo: id } });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-darkbg shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

        {/* ⭐ LOGO → scroll to hero */}
        <a
          href="/"
          onClick={(e) => goToAndScroll(e, "/", "hero")}
          className="text-2xl font-bold text-primary dark:hover:text-teal-600 cursor-pointer"
        >
          Arnav Eats
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          <a
            href="/"
            onClick={(e) => goToAndScroll(e, "/", "hero")}
            className="text-gray-700 dark:text-gray-400 hover:text-primary transition"
          >
            Home
          </a>

          <a
            href="/about"
            onClick={(e) => goToAndScroll(e, "/about", "about-section")}
            className="text-gray-700 dark:text-gray-400 hover:text-primary transition"
          >
            About
          </a>

          <a
            href="/contact"
            onClick={(e) => goToAndScroll(e, "/contact", "contact-section")}
            className="text-gray-700 dark:text-gray-400 hover:text-primary transition"
          >
            Contact
          </a>

          <a
            href="/order"
            onClick={(e) => goToAndScroll(e, "/order", "menu-section")}
            className="text-gray-700 dark:text-gray-400 hover:text-primary transition"
          >
            Menu
          </a>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-700 dark:text-gray-400 hover:text-primary transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition"
          >
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-100" />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-darkbg px-6 py-4 flex flex-col gap-4"
          >
            <a onClick={(e) => { goToAndScroll(e, "/", "hero"); setIsOpen(false); }} className="text-gray-700 dark:text-gray-400">Home</a>
            <a onClick={(e) => { goToAndScroll(e, "/about", "about-section"); setIsOpen(false); }} className="text-gray-700 dark:text-gray-400">About</a>
            <a onClick={(e) => { goToAndScroll(e, "/contact", "contact-section"); setIsOpen(false); }} className="text-gray-700 dark:text-gray-400">Contact</a>
            <a onClick={(e) => { goToAndScroll(e, "/order", "menu-section"); setIsOpen(false); }} className="text-gray-700 dark:text-gray-400">Menu</a>

            <Link to="/cart" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-400">
              Cart ({totalItems})
            </Link>

            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
            >
              {theme === "light" ? <Sun /> : <Moon />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
