import { createContext, useContext, useState, useEffect, useMemo } from "react";

// Create Cart Context
const CartContext = createContext();

// Custom hook
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🧠 Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("arnavEatsCart"));
    if (storedCart) setCart(storedCart);
  }, []);

  // 💾 Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("arnavEatsCart", JSON.stringify(cart));
  }, [cart]);

  // ➕ Add Item to Cart

  const addToCart = (item) => {
    setCart((prev) => {
      // Find by both ID (if exists) or fallback to name
      const existingItem = prev.find(
        (i) => i.id === item.id || i.name === item.name
      );

      if (existingItem) {
        return prev.map((i) =>
          (i.id === item.id || i.name === item.name)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };



  // ➖ Remove One Quantity
  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  // ❌ Delete Entire Item
  const deleteItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // 🧹 Clear Entire Cart
  const clearCart = () => setCart([]);

  // 💰 Calculate Total (safe, accurate, memoized)
  const totalPrice = useMemo(() => {
    if (cart.length === 0) return 0;

    return cart.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cart]);

  // 💵 Format for INR Display
  const formattedTotal = useMemo(() => {
    return totalPrice.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }, [totalPrice]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteItem,
        clearCart,
        totalPrice,
        formattedTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
