package com.tienda.controller;

import com.tienda.domain.Usuario;
import com.tienda.service.CategoriaService;
import com.tienda.service.FavoritoService;
import com.tienda.service.ProductoService;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.Set;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class IndexController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;
    private final FavoritoService favoritoService;

    public IndexController(ProductoService productoService, CategoriaService categoriaService,
            FavoritoService favoritoService) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
        this.favoritoService = favoritoService;
    }

    @GetMapping("/")
    public String mostrarIndex(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            Model model, HttpSession session) {

        var productos = productoService.buscarConFiltros(nombre, null, precioMin, precioMax);
        model.addAttribute("productos", productos);
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        model.addAttribute("idsFavoritos", idsFavoritos(session));

        model.addAttribute("nombre", nombre);
        model.addAttribute("precioMin", precioMin);
        model.addAttribute("precioMax", precioMax);
        return "/index";
    }

    @GetMapping("/consultas/{idCategoria}")
    public String listado(@PathVariable("idCategoria") Integer idCategoria,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            Model model, HttpSession session) {

        var productos = productoService.buscarConFiltros(nombre, idCategoria, precioMin, precioMax);
        model.addAttribute("productos", productos);
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        model.addAttribute("categoriaSel", idCategoria);
        model.addAttribute("idsFavoritos", idsFavoritos(session));

        model.addAttribute("nombre", nombre);
        model.addAttribute("precioMin", precioMin);
        model.addAttribute("precioMax", precioMax);
        return "/index";
    }

    private Set<Integer> idsFavoritos(HttpSession session) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            return Collections.emptySet();
        }
        return favoritoService.getIdsFavoritos(usuario);
    }
}
