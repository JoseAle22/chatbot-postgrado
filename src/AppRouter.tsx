import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../src/components/admin/admin-dashboard";
import ChatBot from "../src/components/ChatBot";
import Login from "../src/components/Login";
import HomePage from "../src/components/HomePage";
import Register from "../src/components/Register";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

export default function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
        <p className="text-amber-600 font-medium">Iniciando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin" replace /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin" replace /> : 
              <Register />
          } 
        />
        <Route
          path="/admin"
          element={
            isAuthenticated ? 
              <AdminDashboard /> : 
              <Navigate to="/login" replace />
          }
        />
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}