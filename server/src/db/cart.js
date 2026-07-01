import { pool } from "./pool.js";

// Devuelve el id del carrito del usuario, creándolo si no existe
async function obtenerOCrearCarritoId(usuarioId) {
  const sel = await pool.query("SELECT id FROM carritos WHERE usuario_id = $1", [usuarioId]);
  if (sel.rows[0]) return sel.rows[0].id;
  const ins = await pool.query(
    "INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING id",
    [usuarioId]
  );
  return ins.rows[0].id;
}

// Devuelve el carrito del usuario con sus items, subtotales y total
export async function obtenerCarrito(usuarioId) {
  const carritoId = await obtenerOCrearCarritoId(usuarioId);
  const { rows: items } = await pool.query(
    `SELECT ci.producto_id, ci.cantidad,
            p.nombre, p.precio, p.imagen_url, p.stock,
            (ci.cantidad * p.precio) AS subtotal
     FROM carrito_items ci
     JOIN productos p ON p.id = ci.producto_id
     WHERE ci.carrito_id = $1
     ORDER BY p.nombre`,
    [carritoId]
  );
  const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
  return { items, total };
}

// Cantidad actual de un producto en el carrito del usuario (0 si no está)
export async function cantidadEnCarrito(usuarioId, productoId) {
  const carritoId = await obtenerOCrearCarritoId(usuarioId);
  const { rows } = await pool.query(
    "SELECT cantidad FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2",
    [carritoId, productoId]
  );
  return rows[0] ? rows[0].cantidad : 0;
}

// Agrega un producto; si ya existe en el carrito, suma la cantidad
export async function agregarItem(usuarioId, productoId, cantidad) {
  const carritoId = await obtenerOCrearCarritoId(usuarioId);
  await pool.query(
    `INSERT INTO carrito_items (carrito_id, producto_id, cantidad)
     VALUES ($1, $2, $3)
     ON CONFLICT (carrito_id, producto_id)
     DO UPDATE SET cantidad = carrito_items.cantidad + EXCLUDED.cantidad`,
    [carritoId, productoId, cantidad]
  );
}

// Fija la cantidad de un producto; devuelve false si no estaba en el carrito
export async function actualizarItem(usuarioId, productoId, cantidad) {
  const carritoId = await obtenerOCrearCarritoId(usuarioId);
  const { rowCount } = await pool.query(
    "UPDATE carrito_items SET cantidad = $3 WHERE carrito_id = $1 AND producto_id = $2",
    [carritoId, productoId, cantidad]
  );
  return rowCount > 0;
}

// Elimina un producto del carrito
export async function eliminarItem(usuarioId, productoId) {
  const carritoId = await obtenerOCrearCarritoId(usuarioId);
  await pool.query(
    "DELETE FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2",
    [carritoId, productoId]
  );
}
