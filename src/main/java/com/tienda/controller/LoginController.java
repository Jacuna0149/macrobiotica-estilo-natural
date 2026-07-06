package com.tienda.controller;

import com.tienda.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    // para enlazar el servicio de usuario
    private final UsuarioService usuarioService;
    private final MessageSource messageSource;

    public LoginController(UsuarioService usuarioService, MessageSource messageSource) {
        this.usuarioService = usuarioService;
        this.messageSource = messageSource;
    }

    @GetMapping("/login")
    public String login() {
        return "/login";
    }

    @PostMapping("/login")
    public String autenticar(@RequestParam String username,
            @RequestParam String password,
            HttpSession session, Model model) {
        var usuarioOpt = usuarioService.autenticar(username, password);
        if (usuarioOpt.isEmpty()) {
            model.addAttribute("error", messageSource.getMessage("error.login", null, Locale.getDefault()));
            return "/login";
        }
        var usuario = usuarioOpt.get();
        session.setAttribute("usuarioSesion", usuario);
        session.setAttribute("esAdmin", usuario.tieneRol("ADMIN"));
        return "redirect:/";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}
