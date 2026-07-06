package com.tienda.controller;

import com.tienda.domain.Usuario;
import com.tienda.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/registro")
public class RegistroController {

    // para enlazar el servicio de usuario
    private final UsuarioService usuarioService;
    private final MessageSource messageSource;

    public RegistroController(UsuarioService usuarioService, MessageSource messageSource) {
        this.usuarioService = usuarioService;
        this.messageSource = messageSource;
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("usuario", new Usuario());
        return "/registro/nuevo";
    }

    @PostMapping("/guardar")
    public String guardar(@Valid Usuario usuario, HttpSession session, Model model) {
        try {
            var registrado = usuarioService.registrar(usuario);
            // se inicia la sesión automáticamente tras el registro
            session.setAttribute("usuarioSesion", registrado);
            session.setAttribute("esAdmin", registrado.tieneRol("ADMIN"));
            return "redirect:/";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", messageSource.getMessage(e.getMessage(), null, Locale.getDefault()));
            model.addAttribute("usuario", usuario);
            return "/registro/nuevo";
        }
    }
}
