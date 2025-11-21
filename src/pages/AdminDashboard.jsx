import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  SlidersHorizontal,
  Download,
  Trash2,
  CheckCircle2,
  Activity,
  Users,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";
import saveAs from "file-saver";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const TOTAL_CAPACITY = 40;

// Helper to safely convert Firestore Timestamp to milliseconds
const getTimestampMs = (timestamp) => {
  return timestamp?.toDate ? timestamp.toDate().getTime() : null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 🔹 Data state
  const [bookings, setBookings] = useState([]);
  const [capacityDocs, setCapacityDocs] = useState([]);

  // 🔹 UI state
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [minPersons, setMinPersons] = useState("");
  const [maxPersons, setMaxPersons] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Infinite scroll (local)
  const [visibleCount, setVisibleCount] = useState(20);

  // Analytics
  const [todaySeats, setTodaySeats] = useState(0);
  const [capacityDate, setCapacityDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Admin activity log (localStorage)
  const [activityLog, setActivityLog] = useState([]);

  // ---------- Effects: load bookings & capacities ----------

  useEffect(() => {
    // Real-time bookings
    const q = query(
      collection(db, "tableBookings"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            // Convert Firestore Timestamp to milliseconds on fetch for consistent sorting/display
            createdAt: getTimestampMs(docData.createdAt),
          };
        });
        setBookings(data);
        computeTodaySeats(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening bookings:", err);
        toast.error("Failed to load bookings.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    // Real-time capacity docs for timeline
    const cRef = collection(db, "capacityCounts");
    const unsub = onSnapshot(
      cRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCapacityDocs(data);
      },
      (err) => {
        console.error("Error listening capacities:", err);
      }
    );
    return () => unsub();
  }, []);

  // Load activity log from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("arnavEatsAdminLog");
    if (stored) {
      try {
        setActivityLog(JSON.parse(stored));
      } catch {
        setActivityLog([]);
      }
    }
  }, []);

  // Persist activity log
  useEffect(() => {
    localStorage.setItem("arnavEatsAdminLog", JSON.stringify(activityLog));
  }, [activityLog]);

  const computeTodaySeats = (data) => {
    const today = new Date().toISOString().split("T")[0];
    const total = data
      .filter((b) => b.date === today)
      .reduce((sum, b) => sum + Number(b.persons || 0), 0);
    setTodaySeats(total);
  };

  // ---------- Activity Log helper ----------
  const logAction = (message, type = "info") => {
    const entry = {
      id: Date.now() + Math.random().toString(16),
      message,
      type,
      at: new Date().toISOString(),
    };
    setActivityLog((prev) => [entry, ...prev].slice(0, 50)); // keep latest 50
  };

  // ---------- Filters & Sorting ----------

  const resetFilters = () => {
    setSearchName("");
    setFilterStatus("all");
    setFilterDate("");
    setFilterTime("");
    setMinPersons("");
    setMaxPersons("");
    setVisibleCount(20);
    logAction("Filters reset", "info");
  };

  const filteredAndSorted = useMemo(() => {
    let rows = [...bookings];

    // Search by name (case-insensitive)
    if (searchName.trim()) {
      const term = searchName.trim().toLowerCase();
      rows = rows.filter((b) => (b.name || "").toLowerCase().includes(term));
    }

    // Status filter
    if (filterStatus !== "all") {
      rows = rows.filter(
        (b) => (b.status || "pending").toLowerCase() === filterStatus
      );
    }

    // Date filter
    if (filterDate) {
      rows = rows.filter((b) => b.date === filterDate);
    }

    // Time filter
    if (filterTime) {
      rows = rows.filter((b) => b.time === filterTime);
    }

    // Persons range filters
    const minP = Number(minPersons);
    const maxP = Number(maxPersons);

    if (!Number.isNaN(minP) && minPersons !== "") {
      rows = rows.filter((b) => Number(b.persons || 0) >= minP);
    }
    if (!Number.isNaN(maxP) && maxPersons !== "") {
      rows = rows.filter((b) => Number(b.persons || 0) <= maxP);
    }

    // Sorting
    rows.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // `createdAt` is a millisecond number, simplifying sorting.
      if (sortBy === "createdAt") {
        const aTime = Number(aVal || 0);
        const bTime = Number(bVal || 0);
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      }

      // numbers
      if (sortBy === "persons") {
        const aNum = Number(aVal || 0);
        const bNum = Number(bVal || 0);
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }

      // strings
      aVal = (aVal || "").toString();
      bVal = (bVal || "").toString();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    bookings,
    searchName,
    filterStatus,
    filterDate,
    filterTime,
    minPersons,
    maxPersons,
    sortBy,
    sortDir,
  ]);

  const visibleRows = filteredAndSorted.slice(0, visibleCount);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  // ---------- Summary Stats ----------

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter(
        (b) => (b.status || "pending").toLowerCase() === "pending"
      ).length,
      completed: bookings.filter(
        (b) => (b.status || "pending").toLowerCase() === "completed"
      ).length,
      seatsToday: todaySeats,
    }),
    [bookings, todaySeats]
  );

  // ---------- Charts Data ----------

  const bookingsPerDayData = useMemo(() => {
    const grouped = {};
    for (const b of bookings) {
      if (!b.date) continue;
      if (!grouped[b.date]) grouped[b.date] = 0;
      grouped[b.date] += 1;
    }
    return Object.entries(grouped)
      .sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))
      .slice(-7)
      .map(([date, count]) => ({ date, count }));
  }, [bookings]);

  const capacityTimelineData = useMemo(() => {
    if (!capacityDate) return [];

    const OPEN = 10;
    const CLOSE = 22;
    const result = [];

    for (let h = OPEN; h < CLOSE; h++) {
      const timeLabel = h.toString().padStart(2, "0") + ":00";
      const id = `${capacityDate}_${timeLabel}`;
      const docEntry = capacityDocs.find((d) => d.id === id);

      const remainingSeats =
        docEntry && typeof docEntry.remainingSeats === "number"
          ? docEntry.remainingSeats
          : TOTAL_CAPACITY;

      const bookedSeats =
        docEntry && typeof docEntry.bookedSeats === "number"
          ? docEntry.bookedSeats
          : TOTAL_CAPACITY - remainingSeats;

      result.push({
        time: timeLabel,
        remainingSeats,
        bookedSeats,
      });
    }

    return result;
  }, [capacityDate, capacityDocs]);

  // ---------- CSV Export ----------

  const exportCSV = (rows, filename) => {
    if (!rows.length) {
      toast.error("No data to export.");
      return;
    }

    const plainRows = rows.map((b) => ({
      id: b.id,
      name: b.name || "",
      persons: Number(b.persons || 0),
      date: b.date || "",
      time: b.time || "",
      status: (b.status || "pending").toLowerCase(),
      // Use the millisecond timestamp stored in state
      createdAt: b.createdAt
        ? new Date(b.createdAt).toISOString()
        : "",
    }));

    const header = Object.keys(plainRows[0]).join(",") + "\n";
    const body = plainRows
      .map((row) =>
        Object.values(row)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csv = header + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handleExportAll = () => {
    exportCSV(bookings, "arnav-eats-bookings-all.csv");
    logAction("Exported all bookings as CSV", "export");
  };

  const handleExportToday = () => {
    const today = new Date().toISOString().split("T")[0];
    const rows = bookings.filter((b) => b.date === today);
    exportCSV(rows, "arnav-eats-bookings-today.csv");
    logAction("Exported today's bookings as CSV", "export");
  };

  const handleExportFiltered = () => {
    exportCSV(filteredAndSorted, "arnav-eats-bookings-filtered.csv");
    logAction("Exported filtered bookings as CSV", "export");
  };

  // ---------- Print / PDF ----------

  const handlePrint = () => {
    logAction("Triggered print / PDF report", "export");
    window.print();
  };

  // ---------- Actions: Mark Completed / Delete ----------

  const handleMarkCompleted = async (booking) => {
    if (!booking?.id) return;
    const name = booking.name || "Booking";

    const confirm = window.confirm(
      `Mark "${name}" as completed? This will update status only.`
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, "tableBookings", booking.id), {
        status: "completed",
      });
      toast.success(`Marked "${name}" as completed.`);
      logAction(`Marked booking "${name}" as completed.`, "status");
    } catch (error) {
      console.error("Error marking completed:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (booking) => {
    if (!booking?.id) return;
    const name = booking.name || "Booking";

    const confirm = window.confirm(
      `Delete booking "${name}"? This will free seats for that time slot.`
    );
    if (!confirm) return;

    const capacityDocId = `${booking.date}_${booking.time}`;
    const capacityRef = doc(db, "capacityCounts", capacityDocId);

    try {
      await runTransaction(db, async (transaction) => {
        // Adjust capacity if capacity doc exists
        const capSnap = await transaction.get(capacityRef);

        if (capSnap.exists()) {
          const data = capSnap.data();
          const currentRemaining =
            typeof data.remainingSeats === "number"
              ? data.remainingSeats
              : TOTAL_CAPACITY;
          const persons = Number(booking.persons || 0);

          const newRemaining = Math.min(
            TOTAL_CAPACITY,
            currentRemaining + persons
          );

          // Ensure base value for booked seats is numeric
          const initialBooked = typeof data.bookedSeats === "number"
            ? data.bookedSeats
            : TOTAL_CAPACITY - currentRemaining;

          const newBooked = Math.max(
            0,
            initialBooked - persons
          );

          transaction.set(
            capacityRef,
            {
              totalCapacity: TOTAL_CAPACITY,
              remainingSeats: newRemaining,
              bookedSeats: newBooked,
            },
            { merge: true }
          );
        }

        // Delete booking
        transaction.delete(doc(db, "tableBookings", booking.id));
      });

      toast.success(`Deleted booking "${name}".`);
      logAction(
        `Deleted booking "${name}" for ${booking.date} ${booking.time}.`,
        "delete"
      );
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking.");
    }
  };

  // ---------- Logout ----------

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading admin dashboard…
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>
        {`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 16px;
            font-size: 13px;
            color: #000 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px 6px !important;
          }
        }
      `}
      </style>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 py-8 print-container">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time overview of reservations, capacity & activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/admin/menu" className="btn-primary px-4 py-2">
              Manage Menu
            </Link>
            <button
              onClick={handleExportAll}
              className="btn-secondary px-4 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
            <button
              onClick={handleExportToday}
              className="btn-secondary px-4 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Today
            </button>
            <button
              onClick={handleExportFiltered}
              className="btn-secondary px-4 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Filtered
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow flex items-center gap-2"
            >
              🖨 Print / PDF
            </button>
            <button
              onClick={handleLogout}
              className="btn-primary px-4 py-2"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Total Bookings"
            value={stats.total}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Seats Today"
            value={`${stats.seatsToday}/${TOTAL_CAPACITY}`}
          />
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm no-print">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
              Filters & Search
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search by Name */}
            <div className="flex items-center gap-2 border rounded-lg px-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setVisibleCount(20);
                }}
                className="w-full py-1.5 text-sm outline-none"
              />
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2 border rounded-lg px-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setVisibleCount(20);
                }}
                className="w-full py-1.5 text-sm outline-none"
              />
            </div>

            {/* Time filter */}
            <div className="flex items-center gap-2 border rounded-lg px-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={filterTime}
                onChange={(e) => {
                  setFilterTime(e.target.value);
                  setVisibleCount(20);
                }}
                className="w-full py-1.5 text-sm outline-none"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 border rounded-lg px-2">
              <span className="text-xs text-gray-500">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setVisibleCount(20);
                }}
                className="w-full py-1.5 text-sm outline-none bg-transparent"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Persons range + Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex items-center gap-2 border rounded-lg px-2">
                <Users className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  placeholder="Min persons"
                  value={minPersons}
                  onChange={(e) => {
                    setMinPersons(e.target.value);
                    setVisibleCount(20);
                  }}
                  className="w-20 py-1.5 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2 border rounded-lg px-2">
                <Users className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  placeholder="Max persons"
                  value={maxPersons}
                  onChange={(e) => {
                    setMaxPersons(e.target.value);
                    setVisibleCount(20);
                  }}
                  className="w-20 py-1.5 text-sm outline-none"
                />
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Reset filters
            </button>
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
              Bookings ({filteredAndSorted.length} results)
            </h2>
            <span className="text-xs text-gray-500">
              Showing {visibleRows.length} of {filteredAndSorted.length}
            </span>
          </div>

          {filteredAndSorted.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No bookings match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <SortableTh
                      label="Name"
                      column="name"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableTh
                      label="Persons"
                      column="persons"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableTh
                      label="Date"
                      column="date"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableTh
                      label="Time"
                      column="time"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableTh
                      label="Status"
                      column="status"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableTh
                      label="Booked At"
                      column="createdAt"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((b) => {
                    const status = (b.status || "pending").toLowerCase();
                    const isCompleted = status === "completed";
                    return (
                      <tr
                        key={b.id}
                        className={`border-t border-gray-100 ${isCompleted
                            ? "bg-green-50/70"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <td className="px-4 py-2 text-gray-800 text-xs sm:text-sm">
                          {b.name}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-800 text-xs sm:text-sm">
                          {b.persons}
                        </td>
                        <td className="px-4 py-2 text-gray-800 text-xs sm:text-sm">
                          {b.date}
                        </td>
                        <td className="px-4 py-2 text-gray-800 text-xs sm:text-sm">
                          {b.time}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {b.createdAt
                            ? new Date(
                              b.createdAt
                            ).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            {!isCompleted && (
                              <button
                                onClick={() => handleMarkCompleted(b)}
                                className="text-green-600 hover:text-green-800"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(b)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Infinite scroll style "Load more" */}
              {visibleRows.length < filteredAndSorted.length && (
                <div className="py-3 text-center no-print">
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + 20)
                    }
                    className="text-sm text-primary hover:underline"
                  >
                    Load more…
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ANALYTICS: Bookings per day & Capacity timeline */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
              📊 Bookings per day (last 7 days)
            </h3>

            <div className="w-full min-w-0 min-h-[224px] h-[224px]">
              {bookingsPerDayData.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Not enough data to show chart yet.
                </p>
              ) : (
                  <ResponsiveContainer width="100%" height={224}>
                  <BarChart data={bookingsPerDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
                  )}
              </div>
          </div>
          
          {/* Capacity timeline */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                ⏰ Capacity timeline
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Date:</span>
                <input
                  type="date"
                  value={capacityDate}
                  onChange={(e) => setCapacityDate(e.target.value)}
                  className="border rounded px-2 py-1 text-xs outline-none"
                />
              </div>
            </div>

            <div className="w-full min-w-0 min-h-[224px] h-[224px]">
              <ResponsiveContainer width="100%" height={224}>
                <LineChart data={capacityTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="remainingSeats"
                    name="Remaining seats"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="bookedSeats"
                    name="Booked seats"
                    stroke="#f97316"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>



        {/* ADMIN ACTIVITY LOG */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Admin Activity Log
              </h3>
            </div>
            <button
              onClick={() => setActivityLog([])}
              className="text-xs text-gray-500 hover:text-red-500 no-print"
            >
              Clear log
            </button>
          </div>
          {activityLog.length === 0 ? (
            <p className="text-xs text-gray-500">
              No recent admin actions logged yet.
            </p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {activityLog.map((log) => (
                <li
                  key={log.id}
                  className="flex justify-between gap-3 border-b border-gray-100 pb-1"
                >
                  <span className="text-gray-700">{log.message}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(log.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Small UI components ----------

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className="p-2 rounded-full bg-orange-100 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SortableTh({ label, column, sortBy, sortDir, onSort }) {
  const isActive = sortBy === column;
  return (
    <th
      className="px-4 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer select-none"
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-[10px]">
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </span>
    </th>
  );
}





