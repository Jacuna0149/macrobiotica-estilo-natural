import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { obtenerPerfil } from "./api/auth";
import { obtenerCarrito } from "./api/cart";

const colones = (n) => "₡" + Number(n).toLocaleString("es-CR");
const contarItems = (carrito) =>
  (carrito?.items || []).reduce((acc, i) => acc + i.cantidad, 0);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("catalogo"); // catalogo | carrito | checkout | confirmacion
  const [contador, setContador] = useState(0);
  const [pedido, setPedido] = useState(null);

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
    setPedido(null);
  }

  function actualizarCarrito(carrito) {
    setContador(contarItems(carrito));
  }

  function confirmarPedido(nuevoPedido) {
    setPedido(nuevoPedido);
    setContador(0);
    setVista("confirmacion");
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

      {vista === "catalogo" && <CatalogPage onAgregar={actualizarCarrito} />}

      {vista === "carrito" && (
        <CartPage
          onCambio={actualizarCarrito}
          onSeguirComprando={() => setVista("catalogo")}
          onContinuar={() => setVista("checkout")}
        />
      )}

      {vista === "checkout" && (
        <CheckoutPage
          onPedidoCreado={confirmarPedido}
          onVolver={() => setVista("carrito")}
        />
      )}

      {vista === "confirmacion" && pedido && (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl bg-white p-10 shadow-sm">
            <div className="text-5xl">✅</div>
            <h2 className="mt-4 text-2xl font-semibold text-green-900">
              ¡Pedido confirmado!
            </h2>
            <p className="mt-2 text-green-700">
              Tu pedido <span className="font-semibold">#{pedido.id}</span> quedó registrado
              en estado <span className="font-semibold">{pedido.estado}</span>.
            </p>
            <p className="mt-1 text-green-900">
              Total pagado: <span className="font-semibold">{colones(pedido.total)}</span>
            </p>
            <button
              type="button"
              onClick={() => setVista("catalogo")}
              className="mt-6 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
            >
              Seguir comprando
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
