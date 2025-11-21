import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// icons
import { Mail, Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your email and password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-3 gap-2 bg-white dark:bg-gray-700">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none bg-transparent dark:text-white"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-3 gap-2 bg-white dark:bg-gray-700">
              <Lock className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button (unchanged) */}
          <button type="submit" className="w-full btn-primary py-3">
            Log In
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
