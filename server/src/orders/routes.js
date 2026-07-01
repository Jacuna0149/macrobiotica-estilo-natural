import { Router } from "express";
import { autenticar, asyncHandler } from "../auth/middleware.js";
import {
  crearPedidoDesdeCarrito,
  listarPedidos,
  obtenerPedido,
  PedidoError,
} from "../db/orders.js";

const router = Router();
const METODOS = ["tarjeta", "sinpe", "efectivo"];

// Todos los pedidos requieren sesión iniciada
router.use(autenticar);

// POST /api/pedidos — crea un pedido desde el carrito del usuario
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { nombre_envio, provincia, canton, direccion, metodo_pago } = req.body || {};

    if (!nombre_envio || !provincia || !canton || !direccion || !metodo_pago) {
      return res.status(400).json({ error: "Faltan datos de envío o de pago" });
    }
    if (!METODOS.includes(metodo_pago)) {
      return res.status(400).json({ error: "Método de pago inválido" });
    }

    try {
      const pedido = await crearPedidoDesdeCarrito(req.usuario.id, {
        nombreEnvio: nombre_envio,
        provincia,
        canton,
        direccion,
        metodoPago: metodo_pago,
      });
      return res.status(201).json({ pedido });
    } catch (err) {
      if (err instanceof PedidoError) {
        return res.status(err.status).json({ error: err.message });
      }
      throw err;
    }
  })
);

// GET /api/pedidos — lista mis pedidos
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pedidos = await listarPedidos(req.usuario.id);
    res.json({ pedidos });
  })
);

// GET /api/pedidos/:id — detalle de un pedido mío
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const pedido = await obtenerPedido(req.usuario.id, id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ pedido });
  })
);

export default router;
