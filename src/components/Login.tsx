import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "@/lib/appwrite";
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await account.createEmailPasswordSession(email, password);
      onLogin();
      navigate("/admin", { replace: true });
    } catch (err: any) {
      if (err?.code === 429) {
        setError("Demasiados intentos. Espera 5-10 minutos.");
      } else if (err?.code === 401) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(err?.message || "Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        relative min-h-screen-safe w-full 
        flex items-center justify-center 
        overflow-hidden bg-amber-50 px-4
      "
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >

      {/* Fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/bg.jpg)',
          opacity: 0.45,
        }}
      />

      {/* Luces decorativas */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />

      {/* Botón Regresar */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-700 hover:bg-white hover:text-amber-600 transition-all hover:scale-105"
      >
        <ArrowLeft size={18} />
        <span className="font-medium text-sm">Volver al inicio</span>
      </button>

      {/* FORMULARIO */}
      <form
        onSubmit={handleLogin}
        className="
          relative z-10 w-full max-w-md 
          bg-white/80 backdrop-blur-lg 
          border border-white/50 rounded-2xl 
          shadow-xl p-6 md:p-10 
          space-y-6
        "
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Bienvenido
          </h2>
          <p className="text-gray-500 text-sm">
            Inicia sesión en tu cuenta de administrador
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="
              w-full px-4 py-3 bg-white/50 
              border border-gray-300 rounded-lg 
              text-gray-800 placeholder-gray-400 
              focus:outline-none focus:ring-2 
              focus:ring-amber-500 focus:border-transparent
            "
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="
                w-full px-4 py-3 bg-white/50 
                border border-gray-300 rounded-lg 
                text-gray-800 placeholder-gray-400 
                focus:outline-none focus:ring-2 
                focus:ring-amber-500 focus:border-transparent
                pr-12
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 bg-gradient-to-r 
            from-amber-500 to-orange-600 
            text-white font-semibold rounded-lg 
            transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed 
            shadow-lg hover:shadow-xl hover:opacity-90
          "
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          ¿Problemas para iniciar sesión? 
          <span className="text-amber-600 font-medium ml-1 cursor-pointer hover:underline">
            Contacta a soporte
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
