import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import { obtenerPerfil } from "./api/auth";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar, intenta restaurar la sesión desde el token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCargando(false);
      return;
    }
    obtenerPerfil(token)
      .then(setUsuario)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setCargando(false));
  }, []);

  function manejarAuth({ usuario, token }) {
    localStorage.setItem("token", token);
    setUsuario(usuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setUsuario(null);
  }

  if (cargando) return null;

  if (!usuario) {
    return <AuthPage onAuth={manejarAuth} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 text-green-900">
      <h1 className="text-3xl font-semibold">
        ¡Hola, {usuario.nombre}!
      </h1>
      <p className="mt-2 text-green-700">
        Sesión iniciada como <span className="font-mono">{usuario.email}</span> (rol: {usuario.rol})
      </p>
      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-6 rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
      >
        Cerrar sesión
      </button>
    </main>
  );
}

export default App;
