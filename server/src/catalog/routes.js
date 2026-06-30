import { Router } from "express";
import { asyncHandler } from "../auth/middleware.js";
import { listarCategorias, listarProductos, obtenerProducto } from "../db/products.js";

const router = Router();

// GET /api/categorias — lista de categorías
router.get(
  "/categorias",
  asyncHandler(async (req, res) => {
    const categorias = await listarCategorias();
    res.json({ categorias });
  })
);

// GET /api/productos[?categoria=<id>] — catálogo, con filtro opcional por categoría
router.get(
  "/productos",
  asyncHandler(async (req, res) => {
    let categoriaId;
    if (req.query.categoria !== undefined) {
      categoriaId = Number(req.query.categoria);
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({ error: "Categoría inválida" });
      }
    }
    const productos = await listarProductos({ categoriaId });
    res.json({ productos });
  })
);

// GET /api/productos/:id — detalle de un producto
router.get(
  "/productos/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const producto = await obtenerProducto(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ producto });
  })
);

export default router;
