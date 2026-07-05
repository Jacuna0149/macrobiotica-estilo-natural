package com.tienda.controller;

import com.tienda.domain.Categoria;
import com.tienda.domain.Usuario;
import com.tienda.service.CategoriaService;
import com.tienda.service.FavoritoService;
import com.tienda.service.ProductoService;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class IndexController {

    //para enlazar el servicio de la producto
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
    public String mostrarIndex(Model model, HttpSession session){
        var productos = productoService.getProductos(true);
        model.addAttribute("productos", productos);
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        model.addAttribute("idsFavoritos", idsFavoritos(session));
        return "/index";
    }


    @GetMapping("/consultas/{idCategoria}")
    public String listado (@PathVariable("idCategoria") Integer idCategoria,
            Model model, HttpSession session){
        Optional<Categoria> categoriaOpt = categoriaService.getCategoria(idCategoria);
        if(categoriaOpt.isEmpty()) { //si no lo encontraron...
           model.addAttribute("productos",java.util.Collections.EMPTY_LIST);
        } else {
            var categoria = categoriaOpt.get();
            var productos = categoria.getProductos();
            model.addAttribute("productos", productos);
        }
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        model.addAttribute("categoriaSel", idCategoria);
        model.addAttribute("idsFavoritos", idsFavoritos(session));
        return "/index";
    }

    // Conjunto de ids favoritos del usuario en sesión (vacío si no hay sesión)
    private Set<Integer> idsFavoritos(HttpSession session) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            return Collections.emptySet();
        }
        return favoritoService.getIdsFavoritos(usuario);
    }
}
