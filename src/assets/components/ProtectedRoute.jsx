import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    const verifyAdmin = async () => {
      try {
        const adminRef = doc(db, "admins", user.uid);
        const snap = await getDoc(adminRef);

        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("🔥 Admin check failed:", err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    verifyAdmin();
  }, [user]);

  // 🔄 Show loading while checking login + admin
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Verifying Admin Access…
      </div>
    );
  }

  // ⛔ Not admin OR not logged in → redirect
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // ✅ Allow Admin Access
  return <Outlet />;
}
