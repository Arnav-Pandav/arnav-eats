import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import chefImg from "../assets/chef.png";
import { BookOpen, Target } from "lucide-react";


export default function About() {

  // ⭐ SCROLL HANDLER FOR NAVBAR SMOOTH SCROLL
  const location = useLocation();

  useEffect(() => {
    const scrollId =
      location?.state?.scrollTo ||
      (location.hash ? location.hash.replace("#", "") : null);

    if (scrollId) {
      setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 80);

      // Clean URL hash
      if (location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location]);

  return (
    <div
      id="about-section"
      className="max-w-5xl mx-auto text-center mt-28 px-6 fade-in"
    >
      {/* 🧡 Heading */}
      <h2 className="text-4xl font-bold text-primary mb-4">
        About Arnav Eats
      </h2>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
        At <span className="text-primary font-semibold">Arnav Eats</span>, we blend
        fresh ingredients and modern flavors to craft dishes that bring people
        together. What started as a small idea over a cup of coffee has grown into
        a space that celebrates taste, creativity, and community.
      </p>

      {/* 🍽️ Our Story */}
      <section className="mt-16">


        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Our Story</h2>
        </div>




        <p className="text-gray-700 dark:text-gray-400 max-w-3xl mx-auto">
          We began with one goal — to serve food that not only fills the stomach,
          but warms the heart. Every recipe at Arnav Eats is inspired by home-style
          cooking with a modern twist. From our early days serving a handful of
          regulars, to now welcoming food lovers from across the city — our passion
          has only grown stronger.
        </p>
      </section>

      {/* 🌿 Our Mission */}
      <section className="mt-16">

        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Our Mission</h2>
        </div>


        <p className="text-gray-700 dark:text-gray-400 max-w-3xl mx-auto">
          To create memorable dining experiences that celebrate flavor, freshness,
          and togetherness — while maintaining sustainability and care for our
          environment.
        </p>
      </section>

      {/* 👨‍🍳 Meet the Chef */}
      <section className="mt-16">
        <h3 className="text-2xl font-semibold text-primary mb-6">Meet Our Chef</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <img
            src={chefImg}
            alt="Chef"
            className="rounded-2xl w-60 h-60 object-cover shadow-smooth"
          />
          <div className="max-w-md text-left">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-400">
              Chef Antoine Dubois
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              "With a passion for blending classic French techniques and contemporary
              culinary artistry, Chef Antoine brings innovation and authenticity to every plate.
              Her approach is simple — good food, made with love and honesty."
            </p>
          </div>
        </div>
      </section>

      {/* 🧾 Call to Action */}
      <div className="mt-20 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ready to taste something extraordinary?
        </p>
        <a
          href="/contact"
          className="btn-primary px-8 py-3 rounded-xl inline-block"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
