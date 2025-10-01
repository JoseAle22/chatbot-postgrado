import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "@/lib/appwrite";

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Intentando login", { email, password });
      
      const session = await account.createEmailPasswordSession(email, password);
      
      console.log("Session creada:", session);
      
      // Ejecutar el callback del padre
      onLogin();
      
      // Redirección inmediata
      navigate("/admin", { replace: true });
      
    } catch (err: any) {
      console.error("Error en login:", err);
      
      if (err?.code === 429 || err?.message?.includes("Rate limit")) {
        setError("Demasiados intentos. Por favor espera 5-10 minutos.");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-orange-700 mb-2">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-orange-600 text-white font-semibold py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <button
          type="button"
          className="text-orange-700 underline mt-2"
          onClick={() => navigate("/register")}
        >
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </form>
    </div>
  );
}

export default Login;