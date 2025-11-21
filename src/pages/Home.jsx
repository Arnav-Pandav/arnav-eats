import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import heroImg from "../assets/herosection.png";
import food1 from "../assets/food1.png";
import food2 from "../assets/food2.png";
import food3 from "../assets/food3.png";
import food4 from "../assets/food4.png";
import food5 from "../assets/food5.png";
import food6 from "../assets/food6.png";
import food7 from "../assets/food7.png";
import food8 from "../assets/food8.png";
import food9 from "../assets/food9.png";
import food10 from "../assets/food10.png";
import food11 from "../assets/food11.png";
import food12 from "../assets/food12.png";
import food13 from "../assets/food13.png";
import food14 from "../assets/food14.png";
import food15 from "../assets/food15.png";

import { Link } from "react-router-dom";

export default function Home() {
  const location = useLocation();

  // ⭐ Handle scroll when navigated with navbar
  useEffect(() => {
    const sectionId =
      location?.state?.scrollTo ||
      (location.hash ? location.hash.replace("#", "") : null);

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 80);

      // Remove hash from URL
      if (location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location]);

  const popularDishes = [
    food1, food2, food3, food4, food5, food6,
    food7, food8, food9, food10, food11,
    food12, food13, food14, food15
  ];

  const dishNames = [
    "Burger Deluxe",
    "Greece Salad",
    "Fish",
    "Pasta Alfredo",
    "Pizza",
    "Stick",
    "Omlete",
    "Noodles",
    "Sandwich",
    "Sushi Rolls",
    "Sushi Rolls",
    "Salad",
    "Onion Ring",
    "Pan Cakes",
    "Strawberry Mohito"
  ];

  const dishPrices = [
    "₹180",
    "₹120",
    "₹280",
    "₹180",
    "₹260",
    "₹220",
    "₹150",
    "₹250",
    "₹170",
    "₹200",
    "₹250",
    "₹100",
    "₹220",
    "₹140",
    "₹90"
  ];

  return (
    <>
      {/* 🌆 Hero Section */}
      <section
        id="hero"   // ⭐ THIS FIXES SCROLLING
        className="relative min-h-[85vh] sm:min-h-[75vh] md:min-h-[90vh] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat fade-in"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

        <div className="relative z-10 text-white px-6 max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            Welcome to Arnav Eats
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
            Delicious meals, crafted with love 🍴 — bringing the restaurant
            experience straight to your home.
          </p>

          <Link
            to="/order"
            className="btn-primary px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* 🍽️ Featured Dishes Section */}
      <section className="bg-lightbg dark:bg-darkbg py-20 fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-primary mb-14">
          Popular Dishes
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-6">
          {popularDishes.map((img, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <img
                src={img}
                alt={`Dish ${index + 1}`}
                className="w-full h-60 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {dishNames[index]}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Price: {dishPrices[index]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
