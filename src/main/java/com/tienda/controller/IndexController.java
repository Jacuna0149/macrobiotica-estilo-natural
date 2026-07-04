package com.tienda.controller;

import com.tienda.domain.Categoria;
import com.tienda.service.CategoriaService;
import com.tienda.service.ProductoService;
import java.util.Optional;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class IndexController {
    
    //para enlazar el servicio de la producto
    private final ProductoService productoService;
    private final CategoriaService categoriaService;

    public IndexController(ProductoService productoService, CategoriaService categoriaService) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
    }



    

    @GetMapping("/")
    public String mostrarIndex(Model model){
        var productos = productoService.getProductos(true);
        model.addAttribute("productos", productos);
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        return "/index";
    }
    

    @GetMapping("/consultas/{idCategoria}")
    public String listado (@PathVariable("idCategoria") Integer idCategoria,
            Model model){
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
        return "/index";
    }
    
    
    
}
