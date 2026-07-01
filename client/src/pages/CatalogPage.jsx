import { useEffect, useState } from "react";
import { obtenerCategorias, obtenerProductos } from "../api/catalog";
import { agregarAlCarrito } from "../api/cart";

const colones = (n) => "₡" + Number(n).toLocaleString("es-CR");

export default function CatalogPage({ onAgregar }) {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState(null); // null = "Todos"
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [agregadoId, setAgregadoId] = useState(null);

  async function anadir(producto) {
    try {
      const carrito = await agregarAlCarrito(producto.id, 1);
      onAgregar?.(carrito);
      setAgregadoId(producto.id);
      setTimeout(() => setAgregadoId((id) => (id === producto.id ? null : id)), 1500);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    setError("");
    obtenerProductos(filtro)
      .then(setProductos)
      .catch(() => setError("No se pudieron cargar los productos."))
      .finally(() => setCargando(false));
  }, [filtro]);

  const chip = (activo) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      activo
        ? "bg-green-800 text-white"
        : "bg-white text-green-800 hover:bg-green-100"
    }`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <header className="text-center">
        <h2 className="text-3xl font-semibold text-green-900">
          Catálogo de Bienestar
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-green-600">
          Cada ingrediente ha sido seleccionado por su pureza, origen natural y
          capacidad para restaurar el equilibrio de tu cuerpo.
        </p>
      </header>

      {/* Filtros por categoría */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button className={chip(filtro === null)} onClick={() => setFiltro(null)}>
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            className={chip(filtro === c.id)}
            onClick={() => setFiltro(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {error && <p className="mt-8 text-center text-red-600">{error}</p>}
      {cargando ? (
        <p className="mt-10 text-center text-green-600">Cargando productos…</p>
      ) : productos.length === 0 ? (
        <p className="mt-10 text-center text-green-600">
          No hay productos en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              {/* Imagen o marcador de posición */}
              {p.imagen_url ? (
                <img
                  src={p.imagen_url}
                  alt={p.nombre}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-green-100 text-4xl">
                  🌿
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                {p.categoria && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {p.categoria}
                  </span>
                )}
                <h3 className="font-semibold text-green-900">{p.nombre}</h3>
                {p.descripcion && (
                  <p className="mt-1 line-clamp-2 text-xs text-green-600">
                    {p.descripcion}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-green-900">
                    {colones(p.precio)}
                  </span>
                  <span
                    className={`text-xs ${
                      p.stock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={p.stock === 0}
                  onClick={() => anadir(p)}
                  className="mt-4 w-full rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-50"
                >
                  {agregadoId === p.id ? "Añadido ✓" : "Añadir"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
