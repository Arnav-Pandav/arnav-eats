import { useState } from "react";
import { toast } from "react-toastify";
import { Mail, Phone, MessageCircle, User } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill out all fields before submitting!");
      return;
    }

    toast.success("Your message has been sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div
      id="contact-section"
      className="max-w-3xl mx-auto mt-28 text-center fade-in"
    >
      {/* Heading */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Mail className="w-6 h-6 text-orange-500" />
        <h2 className="text-3xl font-bold">Contact Us</h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Have questions? We’d love to hear from you!
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md mx-auto bg-lightbg dark:bg-darkbg p-6 rounded-2xl shadow-smooth"
      >
        {/* Name */}
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full outline-none bg-transparent"
          />
        </div>

        {/* Email */}
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 gap-2">
          <Mail className="w-5 h-5 text-gray-500" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full outline-none bg-transparent"
          />
        </div>

        {/* Message */}
        <div className="flex items-start border border-gray-300 dark:border-gray-600 rounded-xl p-3 gap-2">
          <MessageCircle className="w-5 h-5 text-gray-500 mt-1" />
          <textarea
            rows="4"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            className="w-full outline-none bg-transparent"
          ></textarea>
        </div>

        {/* Button (unchanged exactly same) */}
        <button type="submit" className="btn-primary w-full py-3 rounded-xl">
          Send Message
        </button>
      </form>
    </div>
  );
}
