package com.tienda.controller;

import com.tienda.service.RecuperacionPasswordService;
import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RecuperacionPasswordController {

    private final RecuperacionPasswordService recuperacionService;
    private final MessageSource messageSource;

    public RecuperacionPasswordController(RecuperacionPasswordService recuperacionService,
            MessageSource messageSource) {
        this.recuperacionService = recuperacionService;
        this.messageSource = messageSource;
    }

    @GetMapping("/olvide-password")
    public String formularioOlvide() {
        return "/olvide-password";
    }

    @PostMapping("/olvide-password")
public String enviarEnlace(@RequestParam String correo, Model model,
        jakarta.servlet.http.HttpServletRequest request) {
    var tokenOpt = recuperacionService.solicitar(correo);

    tokenOpt.ifPresent(token -> {
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + (request.getServerPort() == 80 || request.getServerPort() == 443
                    ? "" : ":" + request.getServerPort());
        String enlace = baseUrl + "/restablecer-password?token=" + token;
        System.out.println("Enlace de recuperación para " + correo + ": " + enlace);
    });

    model.addAttribute("todoOk", messageSource.getMessage("recuperacion.enlaceEnviado", null, Locale.getDefault()));
    return "/olvide-password";
}

    @GetMapping("/restablecer-password")
    public String formularioRestablecer(@RequestParam String token, Model model) {
        model.addAttribute("token", token);
        return "/restablecer-password";
    }

    @PostMapping("/restablecer-password")
    public String restablecer(@RequestParam String token,
            @RequestParam String password,
            @RequestParam String confirmar,
            Model model) {

        if (!password.equals(confirmar)) {
            model.addAttribute("error", messageSource.getMessage("recuperacion.error02", null, Locale.getDefault()));
            model.addAttribute("token", token);
            return "/restablecer-password";
        }

        try {
            recuperacionService.restablecer(token, password);
            model.addAttribute("exito", true);
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", messageSource.getMessage(e.getMessage(), null, Locale.getDefault()));
            model.addAttribute("token", token);
        }
        return "/restablecer-password";
    }
}
