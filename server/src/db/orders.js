import { pool } from "./pool.js";

const ENVIO = 2500; // tarifa fija de envío en colones
const TASA_IVA = 0.13; // IVA de Costa Rica

// Error de negocio con código HTTP asociado
export class PedidoError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Crea un pedido a partir del carrito del usuario, en una transacción:
// valida y descuenta stock, calcula montos y vacía el carrito.
export async function crearPedidoDesdeCarrito(usuarioId, datosEnvio) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: carritoRows } = await client.query(
      "SELECT id FROM carritos WHERE usuario_id = $1",
      [usuarioId]
    );
    const carritoId = carritoRows[0]?.id;

    let items = [];
    if (carritoId) {
      const r = await client.query(
        `SELECT ci.producto_id, ci.cantidad, p.nombre, p.precio, p.stock
         FROM carrito_items ci
         JOIN productos p ON p.id = ci.producto_id
         WHERE ci.carrito_id = $1
         FOR UPDATE OF p`,
        [carritoId]
      );
      items = r.rows;
    }

    if (items.length === 0) {
      throw new PedidoError(400, "El carrito está vacío");
    }

    for (const it of items) {
      if (it.cantidad > it.stock) {
        throw new PedidoError(409, `Stock insuficiente para ${it.nombre}`);
      }
    }

    const subtotal = items.reduce((acc, it) => acc + Number(it.precio) * it.cantidad, 0);
    const impuesto = Math.round(subtotal * TASA_IVA);
    const total = subtotal + ENVIO + impuesto;

    const { rows: pedidoRows } = await client.query(
      `INSERT INTO pedidos
         (usuario_id, nombre_envio, provincia, canton, direccion, metodo_pago,
          subtotal, envio, impuesto, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        usuarioId,
        datosEnvio.nombreEnvio,
        datosEnvio.provincia,
        datosEnvio.canton,
        datosEnvio.direccion,
        datosEnvio.metodoPago,
        subtotal,
        ENVIO,
        impuesto,
        total,
      ]
    );
    const pedidoId = pedidoRows[0].id;

    for (const it of items) {
      const subt = Number(it.precio) * it.cantidad;
      await client.query(
        `INSERT INTO pedido_items
           (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pedidoId, it.producto_id, it.nombre, it.precio, it.cantidad, subt]
      );
      await client.query(
        "UPDATE productos SET stock = stock - $1 WHERE id = $2",
        [it.cantidad, it.producto_id]
      );
    }

    await client.query("DELETE FROM carrito_items WHERE carrito_id = $1", [carritoId]);

    await client.query("COMMIT");
    return obtenerPedido(usuarioId, pedidoId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Lista los pedidos del usuario (resumen), del más reciente al más antiguo
export async function listarPedidos(usuarioId) {
  const { rows } = await pool.query(
    `SELECT id, total, estado, metodo_pago, creado_en
     FROM pedidos WHERE usuario_id = $1 ORDER BY creado_en DESC`,
    [usuarioId]
  );
  return rows;
}

// Obtiene un pedido del usuario con sus items (o null si no existe)
export async function obtenerPedido(usuarioId, pedidoId) {
  const { rows: pedidos } = await pool.query(
    `SELECT id, usuario_id, nombre_envio, provincia, canton, direccion, metodo_pago,
            subtotal, envio, impuesto, total, estado, creado_en
     FROM pedidos WHERE id = $1 AND usuario_id = $2`,
    [pedidoId, usuarioId]
  );
  const pedido = pedidos[0];
  if (!pedido) return null;

  const { rows: items } = await pool.query(
    `SELECT producto_id, nombre_producto, precio_unitario, cantidad, subtotal
     FROM pedido_items WHERE pedido_id = $1 ORDER BY id`,
    [pedido.id]
  );
  return { ...pedido, items };
}
