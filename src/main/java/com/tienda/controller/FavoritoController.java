package com.tienda.controller;

import com.tienda.domain.Usuario;
import com.tienda.service.FavoritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// HU-12: Agregar productos a una lista de favoritos (cliente)
@Controller
@RequestMapping("/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    // Criterio 2: ver la lista de favoritos
    @GetMapping
    public String listado(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            // Criterio 4: favoritos sin iniciar sesión
            redirectAttributes.addFlashAttribute("error", "Regístrate o inicia sesión para guardar en favoritos");
            return "redirect:/login";
        }
        model.addAttribute("favoritos", favoritoService.getFavoritos(usuario));
        return "/favoritos/listado";
    }

    // Criterio 1 y 3: agregar o quitar de favoritos (corazón del catálogo)
    @PostMapping("/alternar")
    public String alternar(@RequestParam Integer idProducto,
            @RequestParam(required = false) String origen,
            HttpSession session, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            // Criterio 4
            redirectAttributes.addFlashAttribute("error", "Regístrate o inicia sesión para guardar en favoritos");
            return "redirect:/login";
        }
        boolean agregado = favoritoService.alternarFavorito(usuario, idProducto);
        redirectAttributes.addFlashAttribute("todoOk",
                agregado ? "Producto agregado a favoritos" : "Producto eliminado de favoritos");
        return "redirect:" + (origen != null && !origen.isBlank() ? origen : "/favoritos");
    }

    // Criterio 3: eliminar de favoritos desde la lista
    @PostMapping("/eliminar")
    public String eliminar(@RequestParam Integer idProducto,
            HttpSession session, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            return "redirect:/login";
        }
        favoritoService.eliminar(usuario, idProducto);
        redirectAttributes.addFlashAttribute("todoOk", "Producto eliminado de favoritos");
        return "redirect:/favoritos";
    }
}
