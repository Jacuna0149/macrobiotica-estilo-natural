import { Router } from "express";
import { registrar, iniciarSesion, olvidePassword, restablecerPassword } from "./controller.js";
import { autenticar, asyncHandler } from "./middleware.js";
import { buscarPorId } from "../db/users.js";

const router = Router();

router.post("/register", asyncHandler(registrar));
router.post("/login", asyncHandler(iniciarSesion));
router.post("/olvide-password", asyncHandler(olvidePassword));
router.post("/restablecer-password", asyncHandler(restablecerPassword));

// Devuelve el usuario autenticado segun su token
router.get(
  "/me",
  autenticar,
  asyncHandler(async (req, res) => {
    const usuario = await buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.json({ usuario });
  })
);

export default router;
