import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function AdminMenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const modalRef = useRef(null);

  const [search, setSearch] = useState('');

  const CATEGORIES = [
    'Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Fast Food',
    'Indian', 'Snacks', 'Breakfast', 'Italian', 'Japanese', 'Healthy'
  ];

  // 🔒 Route protection
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔐 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'menuItems'),
      orderBy('category'),
      orderBy('name')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching menu items:', err);
        toast.error('Failed to load menu items.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return toast.error('Enter item name');
    if (!price || Number(price) <= 0) return toast.error('Enter valid price');

    try {
      await addDoc(collection(db, 'menuItems'), {
        name: itemName.trim(),
        price: Number(price),
        category,
        createdAt: serverTimestamp(),
      });

      toast.success('Item added');
      setItemName('');
      setPrice('');
      setCategory('Main Course');
    } catch (err) {
      console.error('Error adding item:', err);
      toast.error('Failed to add item.');
    }
  };

  const openEditModal = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name || '',
      price: String(item.price ?? ''),
      category: item.category || CATEGORIES[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!isModalOpen) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen]);

  const saveEdit = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) return toast.error('Name cannot be empty');
    if (!editingItem.price || Number(editingItem.price) <= 0)
      return toast.error('Enter valid price');

    try {
      const ref = doc(db, 'menuItems', editingItem.id);
      await updateDoc(ref, {
        name: editingItem.name.trim(),
        price: Number(editingItem.price),
        category: editingItem.category,
      });

      toast.success('Saved');
      closeModal();
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error('Failed to save changes.');
    }
  };

  const deleteItem = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this menu item?')) return;

    try {
      await deleteDoc(doc(db, 'menuItems', id));
      toast.success('Deleted');
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item.');
    }
  };

  if (loading) {
    return <div className="p-6">Loading menu management panel...</div>;
  }

  // 🔍 Search filter
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* 🟦 Top Bar with Email + Logout */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Menu Items</h1>
          {auth.currentUser && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as:{" "}
              <span className="font-medium">{auth.currentUser.email}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="btn-primary px-5 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add New Item */}
      <form
        onSubmit={addItem}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 mb-8"
      >
        <h2 className="text-xl font-semibold mb-2">Add New Item</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Item name"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Price"
            min="0"
            step="0.01"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded w-full"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-5 py-2 rounded">
            Add Item
          </button>
        </div>
      </form>

      {/* Existing Items */}
      <h2 className="text-2xl font-semibold mb-4">
        Existing Items ({items.length})
      </h2>

      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <ul className="space-y-3">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-bold truncate">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category} • ₹{Number(item.price).toFixed(2)}
                </p>
              </div>

              <div className="mt-3 sm:mt-0 flex items-center gap-3">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded text-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            ref={modalRef}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Edit Menu Item</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
