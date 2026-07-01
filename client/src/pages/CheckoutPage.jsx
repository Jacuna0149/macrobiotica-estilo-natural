import { useEffect, useState } from "react";
import { obtenerCarrito } from "../api/cart";
import { crearPedido } from "../api/orders";

const colones = (n) => "₡" + Number(n).toLocaleString("es-CR");
const ENVIO = 2500;
const TASA_IVA = 0.13;

const METODOS = [
  { valor: "tarjeta", etiqueta: "Tarjeta de Crédito / Débito" },
  { valor: "sinpe", etiqueta: "SINPE Móvil" },
  { valor: "efectivo", etiqueta: "Efectivo contra entrega" },
];

const inputClass =
  "w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-green-700";

export default function CheckoutPage({ onPedidoCreado, onVolver }) {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({
    nombre_envio: "",
    provincia: "",
    canton: "",
    direccion: "",
    metodo_pago: "tarjeta",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerCarrito()
      .then(setCarrito)
      .catch(() => setError("No se pudo cargar el carrito."))
      .finally(() => setCargando(false));
  }, []);

  const subtotal = Number(carrito.total) || 0;
  const impuesto = Math.round(subtotal * TASA_IVA);
  const total = subtotal + (subtotal > 0 ? ENVIO : 0) + impuesto;

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const pedido = await crearPedido(form);
      onPedidoCreado(pedido);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return <p className="mx-auto max-w-5xl px-4 py-10 text-green-600">Cargando…</p>;
  }

  if (carrito.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h2 className="text-2xl font-semibold text-green-900">Tu carrito está vacío</h2>
        <button
          type="button"
          onClick={onVolver}
          className="mt-4 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
        >
          Volver al carrito
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="text-3xl font-semibold text-green-900">Finalizar Pedido</h2>
      <p className="mt-1 text-sm text-green-600">
        Completa tus datos y selecciona un método de pago.
      </p>

      <form onSubmit={enviar} className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Dirección + pago */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-green-900">Dirección de Envío</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="nombre_envio">Nombre completo</label>
                <input
                  id="nombre_envio"
                  className={inputClass}
                  value={form.nombre_envio}
                  onChange={(e) => setForm({ ...form, nombre_envio: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="provincia">Provincia</label>
                  <input
                    id="provincia"
                    className={inputClass}
                    value={form.provincia}
                    onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="canton">Cantón</label>
                  <input
                    id="canton"
                    className={inputClass}
                    value={form.canton}
                    onChange={(e) => setForm({ ...form, canton: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="direccion">Dirección exacta</label>
                <input
                  id="direccion"
                  className={inputClass}
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-green-900">Método de Pago</h3>
            <div className="space-y-2">
              {METODOS.map((m) => (
                <label
                  key={m.valor}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-green-200 px-4 py-3 text-sm text-green-900"
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    value={m.valor}
                    checked={form.metodo_pago === m.valor}
                    onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                  />
                  {m.etiqueta}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-green-500">
              * Pago simulado con fines de demostración; no se procesa ningún cobro real.
            </p>
          </div>
        </div>

        {/* Resumen */}
        <aside className="h-fit rounded-2xl bg-green-800 p-6 text-white">
          <h3 className="mb-4 text-lg font-semibold">Resumen del Pedido</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{colones(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{colones(ENVIO)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Impuesto (IVA 13%)</dt>
              <dd>{colones(impuesto)}</dd>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/30 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{colones(total)}</dd>
            </div>
          </dl>

          {error && <p className="mt-4 text-sm text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-green-900 transition hover:bg-green-50 disabled:opacity-60"
          >
            {enviando ? "Procesando…" : "Completar Pedido"}
          </button>
        </aside>
      </form>
    </section>
  );
}
