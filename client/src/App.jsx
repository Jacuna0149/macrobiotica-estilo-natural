import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import { obtenerPerfil } from "./api/auth";
import { obtenerCarrito } from "./api/cart";

const contarItems = (carrito) =>
  (carrito?.items || []).reduce((acc, i) => acc + i.cantidad, 0);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("catalogo"); // "catalogo" | "carrito"
  const [contador, setContador] = useState(0);

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

  // Al iniciar sesión, carga el contador del carrito
  useEffect(() => {
    if (!usuario) return;
    obtenerCarrito()
      .then((c) => setContador(contarItems(c)))
      .catch(() => {});
  }, [usuario]);

  function manejarAuth({ usuario, token }) {
    localStorage.setItem("token", token);
    setUsuario(usuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setUsuario(null);
    setVista("catalogo");
    setContador(0);
  }

  function actualizarCarrito(carrito) {
    setContador(contarItems(carrito));
  }

  if (cargando) return null;

  if (!usuario) {
    return <AuthPage onAuth={manejarAuth} />;
  }

  const navBtn = (activo) =>
    `text-sm font-medium transition ${
      activo ? "text-green-900" : "text-green-600 hover:text-green-800"
    }`;

  return (
    <div className="min-h-screen bg-green-50">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-green-900">
          Macrobiótica Estilo Natural
        </h1>
        <nav className="flex items-center gap-6">
          <button className={navBtn(vista === "catalogo")} onClick={() => setVista("catalogo")}>
            Catálogo
          </button>
          <button className={navBtn(vista === "carrito")} onClick={() => setVista("carrito")}>
            Carrito ({contador})
          </button>
          <span className="text-sm text-green-700">Hola, {usuario.nombre}</span>
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-lg border border-green-700 px-3 py-1.5 text-sm font-semibold text-green-800 transition hover:bg-green-100"
          >
            Cerrar sesión
          </button>
        </nav>
      </header>

      {vista === "catalogo" ? (
        <CatalogPage onAgregar={actualizarCarrito} />
      ) : (
        <CartPage
          onCambio={actualizarCarrito}
          onSeguirComprando={() => setVista("catalogo")}
        />
      )}
    </div>
  );
}

export default App;
