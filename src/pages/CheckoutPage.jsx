import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const { cart, formattedTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!address || !contact) {
      toast.error("Please fill in both address and contact details.");
      return;
    }

    // In a real app, this data would be sent to the backend
    console.log("Order placed:", { cart, formattedTotal, address, contact });

    clearCart();
    toast.success("Order placed successfully! 🍕");
    navigate("/order-success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-10 min-h-screen max-w-xl mx-auto px-4"
    >
      <h1 className="text-4xl font-bold text-primary mb-8">Checkout</h1>

      {/* 🧾 Order Details */}
      <div className="bg-white dark:bg-gray-400 p-6 rounded-xl shadow-smooth mb-8">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <span>
              {item.name} (x{item.quantity})
            </span>
            <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-4 border-t pt-4 font-bold text-xl">
          <span>Total:</span>
          <span className="text-primary">{formattedTotal}</span>
        </div>
      </div>

      {/* 🏠 User Info */}
      <form
        onSubmit={handlePlaceOrder}
        className="bg-white dark:bg-gray-400 p-6 rounded-xl shadow-smooth"
      >
        <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>

        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Delivery Address
          </label>
          <textarea
            id="address"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-400 dark:border-gray-600"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="contact" className="block text-sm font-medium mb-1">
            Contact Number
          </label>
          <input
            type="tel"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-400 dark:border-gray-600"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full py-3">
          Place Order Now
        </button>
      </form>
    </motion.div>
  );
}
