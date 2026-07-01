import { useEffect, useState } from "react";
import { obtenerCarrito, actualizarCantidad, eliminarDelCarrito } from "../api/cart";

const colones = (n) => "₡" + Number(n).toLocaleString("es-CR");

export default function CartPage({ onCambio, onSeguirComprando, onContinuar }) {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  function aplicar(data) {
    setCarrito(data);
    onCambio?.(data);
  }

  useEffect(() => {
    obtenerCarrito()
      .then(aplicar)
      .catch(() => setError("No se pudo cargar el carrito."))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarCantidad(item, delta) {
    const nueva = item.cantidad + delta;
    if (nueva < 1) return;
    try {
      aplicar(await actualizarCantidad(item.producto_id, nueva));
    } catch (e) {
      setError(e.message);
    }
  }

  async function quitar(item) {
    try {
      aplicar(await eliminarDelCarrito(item.producto_id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-3xl font-semibold text-green-900">Finalizar Pedido</h2>
      <p className="mt-1 text-sm text-green-600">Revisa los artículos de tu carrito.</p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {cargando ? (
        <p className="mt-10 text-green-600">Cargando carrito…</p>
      ) : carrito.items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-green-700">Tu carrito está vacío.</p>
          <button
            type="button"
            onClick={onSeguirComprando}
            className="mt-4 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
          >
            Explorar catálogo
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {carrito.items.map((item) => (
              <li
                key={item.producto_id}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 text-2xl">
                  🌿
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">{item.nombre}</h3>
                  <p className="text-sm text-green-600">{colones(item.precio)} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item, -1)}
                    disabled={item.cantidad <= 1}
                    className="h-8 w-8 rounded-full border border-green-300 text-green-800 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-green-900">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item, 1)}
                    disabled={item.cantidad >= item.stock}
                    className="h-8 w-8 rounded-full border border-green-300 text-green-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <div className="w-24 text-right font-semibold text-green-900">
                  {colones(item.subtotal)}
                </div>

                <button
                  type="button"
                  onClick={() => quitar(item)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-green-800 p-6 text-white">
            <span className="text-lg">Total</span>
            <span className="text-2xl font-semibold">{colones(carrito.total)}</span>
          </div>

          <button
            type="button"
            onClick={onContinuar}
            className="mt-4 w-full rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
          >
            Continuar al pago
          </button>
        </>
      )}
    </section>
  );
}
