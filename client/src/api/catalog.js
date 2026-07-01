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

export async function obtenerProductos(categoriaId) {
  const query = categoriaId ? `?categoria=${categoriaId}` : "";
  const { productos } = await getJSON(`/productos${query}`);
  return productos;
}
