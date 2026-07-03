import { pool } from "./pool.js";

// Lista todas las categorías ordenadas por nombre
export async function listarCategorias() {
  const { rows } = await pool.query(
    `SELECT id, nombre, descripcion FROM categorias ORDER BY nombre`
  );
  return rows;
}

// Lista productos activos, con filtros opcionales: categoría, nombre, rango de precio
export async function listarProductos({ categoriaId, nombre, precioMin, precioMax } = {}) {
  const params = [];
  const condiciones = ["p.activo = true"];

  if (categoriaId) {
    params.push(categoriaId);
    condiciones.push(`p.categoria_id = $${params.length}`);
  }
  if (nombre) {
    params.push(`%${nombre}%`);
    condiciones.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`);
  }
  if (precioMin !== undefined) {
    params.push(precioMin);
    condiciones.push(`p.precio >= $${params.length}`);
  }
  if (precioMax !== undefined) {
    params.push(precioMax);
    condiciones.push(`p.precio <= $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen_url,
            p.categoria_id, c.nombre AS categoria
     FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     WHERE ${condiciones.join(" AND ")}
     ORDER BY p.nombre`,
    params
  );
  return rows;
}

// Obtiene un producto activo por id (o null si no existe)
export async function obtenerProducto(id) {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen_url,
            p.categoria_id, c.nombre AS categoria
     FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     WHERE p.id = $1 AND p.activo = true`,
    [id]
  );
  return rows[0] || null;
}
