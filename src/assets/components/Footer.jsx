import { useState } from "react";
import { Instagram, Facebook, Mail, Phone, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const { cart, totalPrice } = useCart();

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }

    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    setMessage({ text: "Subscribed successfully!", type: "success" });
    setEmail("");
  };

  return (
    <footer className="bg-lightbg dark:bg-darkbg border-t border-gray-200 dark:border-gray-700 mt-24 relative">

      {/* 🛒 Floating Cart Summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-20 right-6 bg-white dark:bg-gray-800 shadow-2xl border border-gray-300 dark:border-gray-700 rounded-xl px-6 py-4 z-50"
        >
          <div className="flex items-center gap-5">
            <ShoppingCart className="w-5 h-5 text-primary ml-8" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {cart.length} item(s)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <Link to="/cart" className="btn-primary mt-3 block text-center py-2 rounded-lg text-sm">
            View Cart & Checkout
          </Link>
        </motion.div>
      )}

      {/* 🌆 Main Footer Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-4 gap-14 fade-in"
      >

        {/* 🍴 Brand Info */}
        <div>
          <h3 className="text-2xl font-bold text-primary dark:text-secondary mb-4 dark:text-gray-500">
            Arnav Eats
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Experience the taste of freshness with handcrafted meals made with
            love. Serving joy in every bite since 2025.
          </p>
        </div>

        {/* 🔗 Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-400 mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            {[
              { name: "Home", to: "/" },
              { name: "About", to: "/about" },
              { name: "Contact", to: "/contact" },
              { name: "Menu", to: "/order" },
            ].map((link) => (
              <li key={link.name}>
                <Link
                  to={link.to}
                  className="hover:text-primary dark:hover:text-secondary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🗺️ Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-400 mb-4">
            Contact Info
          </h4>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary dark:text-secondary" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary dark:text-secondary" /> support@arnaveats.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary dark:text-secondary" /> Ahmedabad, Gujarat
            </li>
          </ul>
        </div>

        {/* 📨 Newsletter */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-400 mb-4">
            Stay Updated
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Subscribe for updates and exclusive offers.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage({ text: "", type: "" });
              }}
              className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-secondary bg-white dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleSubscribe}
              className="btn-primary px-5 py-3 rounded-xl"
            >
              Subscribe
            </button>
          </form>

          {message.text && (
            <p
              className={`mt-3 text-sm transition-all duration-300 ${
                message.type === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </motion.div>

      {/* 🌐 Social & Copyright */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="border-t border-gray-200 dark:border-gray-700 py-10 text-center text-sm text-gray-600 dark:text-gray-400 space-y-5"
      >
        {/* Social Icons */}
        <div className="flex justify-center gap-10">
          {[Instagram, Facebook, Mail].map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-primary dark:hover:text-secondary transition-colors duration-300"
            >
              <Icon className="w-6 h-6" />
            </motion.a>
          ))}
        </div>

        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-primary dark:text-secondary font-medium">Arnav Eats</span> — All
          rights reserved.
        </p>
      </motion.div>
    </footer>
  );
}
