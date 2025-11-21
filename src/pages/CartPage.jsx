import React from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartPage() {
  const {
    cart,
    formattedTotal,
    addToCart,
    removeFromCart,
    deleteItem,
    clearCart,
  } = useCart();

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 min-h-screen bg-lightbg dark:bg-darkbg"
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-400">
          Your Cart is Empty 🙁
        </h2>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Go back to the menu to add some delicious food!
        </p>

        <Link to="/order" className="btn-primary">
          Go to Menu
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-10 bg-lightbg dark:bg-darkbg min-h-screen"
    >
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Your Order Summary
        </h1>

        {/* 🛍 Cart Items */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between 
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700
              p-4 rounded-xl shadow-smooth"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ₹{Number(item.price).toFixed(2)} each
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 🔼 Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded-full
                    bg-gray-200 dark:bg-gray-700 
                    hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>

                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className="p-1 rounded-full
                    bg-gray-200 dark:bg-gray-700 
                    hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* 💵 Subtotal */}
                <p className="font-semibold w-24 text-right text-gray-800 dark:text-gray-100">
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </p>

                {/* 🗑 Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🧾 Total Summary */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">
              Total Amount:
            </h2>

            <p className="text-3xl font-bold text-primary">{formattedTotal}</p>
          </div>

          <div className="flex justify-between">
            <button onClick={clearCart} className="btn-secondary">
              Clear Cart
            </button>
            <Link to="/checkout" className="btn-primary">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
