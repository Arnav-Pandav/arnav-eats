import React from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '../../firebaseConfig';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";



export default function Order() {
  const { addToCart } = useCart();

  // Fetch items from Firestore
  const menuQuery = query(collection(db, 'menuItems'), orderBy('category'), orderBy('name'));
  const [items, loading, error] = useCollectionData(menuQuery, { idField: 'id' });

  // Function to add an item to the cart

  const handleAddToCart = (item) => {
    // ✅ Ensure every item has a unique ID
    const itemWithId = {
      ...item,
      id: item.id || `${item.name}-${Date.now()}`
    };

    addToCart(itemWithId);
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading menu...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error fetching menu: {error.message}</div>;
  }


  // Group items by category for better display
  const categorizedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>


      <section className="bg-lightbg dark:bg-darkbg py-24 fade-in">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12"
        >
          {/* 🖼️ Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
           


            <img
              src="/order-now.png"
              alt="Order Now Illustration"
              className="rounded-2xl shadow-smooth max-w-md w-full object-cover"
            />

          </motion.div>

          {/* 📄 Right Side - Text + Button */}
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-gray-500">
              Hungry? Order Your Favorite Meal Now 🍔
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Whether you crave something sweet, spicy, or comforting —
              Arnav Eats delivers it hot and fresh. Enjoy quick delivery
              or easy takeaway options right from your fingertips.
            </p>

            <a href="#menu" className="btn-primary inline-block px-8 py-3 rounded-xl mt-4">
              Order Now
            </a>
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-primary">Our Menu</h1>
        {categorizedItems && Object.entries(categorizedItems).map(([category, itemsList]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsList.map((item) => (
                <div
                  key={item.id || item.name}
                  className="bg-white dark:bg-gray-400 p-5 rounded-lg shadow-md flex justify-between items-center transition duration-300 hover:shadow-lg"
                >
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-600">₹{Number(item.price).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-primary px-4 py-2"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>

  );
}

