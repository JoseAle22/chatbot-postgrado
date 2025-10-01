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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
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