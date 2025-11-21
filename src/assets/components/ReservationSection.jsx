import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "../../firebaseConfig";
import {
  collection,
  doc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

export default function ReservationSection() {
  const [formData, setFormData] = useState({
    name: "",
    persons: "",
    date: "",
    time: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // NEW → store all slot capacities (for all times)
  const [allCapacities, setAllCapacities] = useState({});

  const TOTAL_CAPACITY = 40;

  // ✅ Listen to ALL capacityCounts docs in real time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "capacityCounts"), (snap) => {
      const data = {};
      snap.forEach((d) => {
        data[d.id] = d.data().remainingSeats; // store per slot remaining seats
      });
      setAllCapacities(data);
    });

    return () => unsub();
  }, []);

  // Generate slots: 10 AM – 10 PM
  const availableTimeSlots = useMemo(() => {
    const OPEN = 10;
    const CLOSE = 22;
    const slots = [];

    for (let hour = OPEN; hour < CLOSE; hour++) {
      const formatted = hour.toString().padStart(2, "0");
      slots.push(`${formatted}:00`);
    }
    return slots;
  }, []);


  useEffect(() => {
    if (!formData.date) return;

    const today = new Date().toISOString().split("T")[0];

    if (formData.date !== today) return;

    const now = new Date();

    for (const timeSlot of availableTimeSlots) {
      const [h, m] = timeSlot.split(":").map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);

      const id = `${formData.date}_${timeSlot}`;
      const remaining = allCapacities[id] ?? TOTAL_CAPACITY;
      const isFull = remaining <= 0;

      if (slotTime > now && !isFull) {
        if (formData.time !== timeSlot) {
          setFormData(prev => ({ ...prev, time: timeSlot }));
        }
        return;
      }
    }

    setFormData(prev => ({ ...prev, time: "" }));
  }, [formData.date, allCapacities]);


  // Calculate available capacity of the selected slot
  const selectedSlotCapacity = (() => {
    if (!formData.date || !formData.time) return TOTAL_CAPACITY;
    const id = `${formData.date}_${formData.time}`;
    return allCapacities[id] ?? TOTAL_CAPACITY;
  })();

  // BOOKING HANDLER
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.persons || !formData.date || !formData.time) {
      setMessage({ text: "Please fill all fields.", type: "error" });
      return;
    }

    const personsRequested = Number(formData.persons);

    // Client-side validation
    if (personsRequested > selectedSlotCapacity) {
      setMessage({
        text: `Only ${selectedSlotCapacity} seats remaining for this time.`,
        type: "error",
      });
      return;
    }

    setLoading(true);

    const bookingId = `${formData.date}_${formData.time}_${Date.now()}`;
    const capacityDocId = `${formData.date}_${formData.time}`;
    const capacityRef = doc(db, "capacityCounts", capacityDocId);

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(capacityRef);
        let currentRemaining = TOTAL_CAPACITY;

        if (snap.exists()) {
          currentRemaining = snap.data().remainingSeats;
        }

        if (currentRemaining < personsRequested) {
          throw new Error("INSUFFICIENT_CAPACITY");
        }

        const newRemaining = currentRemaining - personsRequested;

        transaction.set(
          capacityRef,
          {
            totalCapacity: TOTAL_CAPACITY,
            bookedSeats: TOTAL_CAPACITY - newRemaining,
            remainingSeats: newRemaining,
          },
          { merge: true }
        );

        // Save booking
        transaction.set(doc(db, "tableBookings", bookingId), {
          name: formData.name,
          persons: personsRequested,
          date: formData.date,
          time: formData.time,
          createdAt: serverTimestamp(),
          status: "Pending",
        });
      });

      setMessage({ text: "🎉 Your table has been booked!", type: "success" });
      setFormData({ name: "", persons: "", date: "", time: "" });
    } catch (error) {
      console.error(error);
      if (error.message === "INSUFFICIENT_CAPACITY") {
        setMessage({
          text: "Not enough capacity remaining for that time slot.",
          type: "error",
        });
      } else {
        setMessage({
          text: "Something went wrong while booking.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-lightbg dark:bg-darkbg py-20 px-6 fade-in border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* FORM */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-bold mb-3 text-primary">Book a Table 🍽️</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Total Café Capacity: {TOTAL_CAPACITY} seats. (Open 10 AM – 10 PM)
          </p>

          <form onSubmit={handleBooking} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-darkbg"
            />

            <input
              type="number"
              placeholder="No. of Persons"
              value={formData.persons}
              onChange={(e) => setFormData({ ...formData, persons: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-darkbg"
              min="1"
              max={TOTAL_CAPACITY}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="flex-1 p-3 rounded-xl border dark:bg-darkbg"
              />

              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="flex-1 p-3 rounded-xl border dark:bg-darkbg"
                disabled={!formData.date}
              >
                <option value="">
                  {formData.date ? "Select a time slot" : "Select a date first"}
                </option>
                {availableTimeSlots.map((timeSlot) => {
                  const id = `${formData.date}_${timeSlot}`;
                  const remaining = allCapacities[id] ?? TOTAL_CAPACITY;
                  const isFull = remaining <= 0;

                  // ⏰ Disable past times if booking for today
                  let isPast = false;
                  if (formData.date) {
                    const today = new Date().toISOString().split("T")[0];
                    if (formData.date === today) {
                      const now = new Date();
                      const [h, m] = timeSlot.split(":").map(Number);
                      const slotTime = new Date();
                      slotTime.setHours(h, m, 0, 0);
                      isPast = now > slotTime; // true = slot already passed → disable
                    }
                  }

                  return (
                    <option
                      key={timeSlot}
                      value={timeSlot}
                      disabled={isPast || isFull}
                      className={isPast ? "opacity-50" : ""}
                    >
                      {timeSlot}{" "}
                      {isPast
                        ? "(Past)"
                        : isFull
                          ? "(Full)"
                          : `(${remaining} seats left)`}
                    </option>
                  );
                })}

              </select>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.date ||
                !formData.time ||
                Number(formData.persons) > selectedSlotCapacity
              }
              className={`btn-primary w-full py-3 rounded-xl ${loading ? "opacity-70" : ""
                }`}
            >
              {loading ? "Booking..." : "Book Now"}
            </button>
          </form>

          {message.text && (
            <p
              className={`mt-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"
                }`}
            >
              {message.text}
            </p>
          )}
        </motion.div>

        {/* MAP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden shadow-lg"
        >


          <iframe
            title="Cafe Location"
            width="100%"
            height="400"
            loading="lazy"
            allowFullScreen
            className="rounded-2xl border-none"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.978000000!2d72.5713615!3d23.0225053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f87e11b2e5%3A0x7a892fc7a2bfbf7e!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1708618456789"
          ></iframe>

        </motion.div>
      </div>
    </section>
  );
}
