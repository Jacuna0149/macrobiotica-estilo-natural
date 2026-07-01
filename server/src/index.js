import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth/routes.js";
import catalogRoutes from "./catalog/routes.js";
import cartRoutes from "./cart/routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Healthcheck — verifica que el servidor responde
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "macrobiotica-server" });
});

// Autenticación: registro, login y perfil
app.use("/api/auth", authRoutes);

// Catálogo: categorías y productos
app.use("/api", catalogRoutes);

// Carrito de compras (requiere autenticación)
app.use("/api/carrito", cartRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
