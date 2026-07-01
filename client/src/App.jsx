import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
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
    <div className="min-h-screen bg-green-50">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-green-900">
          Macrobiótica Estilo Natural
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-700">Hola, {usuario.nombre}</span>
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-lg border border-green-700 px-3 py-1.5 font-semibold text-green-800 transition hover:bg-green-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <CatalogPage />
    </div>
  );
}

export default App;
