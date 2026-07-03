const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error("Error al cargar datos del catálogo");
  }
  return res.json();
}

export async function obtenerCategorias() {
  const { categorias } = await getJSON("/categorias");
  return categorias;
}

// Acepta un objeto de filtros: { categoriaId, nombre, precioMin, precioMax }
export async function obtenerProductos(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.categoriaId) params.set("categoria", filtros.categoriaId);
  if (filtros.nombre) params.set("nombre", filtros.nombre);
  if (filtros.precioMin !== undefined && filtros.precioMin !== "") {
    params.set("precioMin", filtros.precioMin);
  }
  if (filtros.precioMax !== undefined && filtros.precioMax !== "") {
    params.set("precioMax", filtros.precioMax);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const { productos } = await getJSON(`/productos${query}`);
  return productos;
}
