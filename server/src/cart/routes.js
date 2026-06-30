import { Router } from "express";
import { autenticar, asyncHandler } from "../auth/middleware.js";
import { obtenerProducto } from "../db/products.js";
import {
  obtenerCarrito,
  cantidadEnCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
} from "../db/cart.js";

const router = Router();

// Todo el carrito requiere sesión iniciada
router.use(autenticar);

// GET /api/carrito — ver mi carrito
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const carrito = await obtenerCarrito(req.usuario.id);
    res.json(carrito);
  })
);

// POST /api/carrito/items — agregar producto (suma si ya existe)
router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const productoId = Number(req.body?.producto_id);
    const cantidad = req.body?.cantidad === undefined ? 1 : Number(req.body.cantidad);

    if (!Number.isInteger(productoId) || productoId <= 0) {
      return res.status(400).json({ error: "producto_id inválido" });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: "cantidad inválida" });
    }

    const producto = await obtenerProducto(productoId);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const actual = await cantidadEnCarrito(req.usuario.id, productoId);
    if (actual + cantidad > producto.stock) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    await agregarItem(req.usuario.id, productoId, cantidad);
    const carrito = await obtenerCarrito(req.usuario.id);
    res.status(201).json(carrito);
  })
);

// PATCH /api/carrito/items/:productoId — fijar cantidad
router.patch(
  "/items/:productoId",
  asyncHandler(async (req, res) => {
    const productoId = Number(req.params.productoId);
    const cantidad = Number(req.body?.cantidad);

    if (!Number.isInteger(productoId) || productoId <= 0) {
      return res.status(400).json({ error: "producto inválido" });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: "cantidad inválida" });
    }

    const producto = await obtenerProducto(productoId);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (cantidad > producto.stock) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    const actualizado = await actualizarItem(req.usuario.id, productoId, cantidad);
    if (!actualizado) {
      return res.status(404).json({ error: "El producto no está en el carrito" });
    }
    const carrito = await obtenerCarrito(req.usuario.id);
    res.json(carrito);
  })
);

// DELETE /api/carrito/items/:productoId — quitar producto
router.delete(
  "/items/:productoId",
  asyncHandler(async (req, res) => {
    const productoId = Number(req.params.productoId);
    if (!Number.isInteger(productoId) || productoId <= 0) {
      return res.status(400).json({ error: "producto inválido" });
    }
    await eliminarItem(req.usuario.id, productoId);
    const carrito = await obtenerCarrito(req.usuario.id);
    res.json(carrito);
  })
);

export default router;
