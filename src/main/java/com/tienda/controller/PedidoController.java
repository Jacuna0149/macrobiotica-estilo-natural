package com.tienda.controller;

import com.tienda.domain.Factura;
import com.tienda.domain.Usuario;
import com.tienda.service.PedidoService;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// HU-11: Ver el historial de pedidos realizados (cliente)
@Controller
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Criterio 1 y 3: lista de pedidos (o estado vacío si no hay pedidos)
    @GetMapping
    public String listado(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            redirectAttributes.addFlashAttribute("error", "Debe iniciar sesión para ver sus pedidos.");
            return "redirect:/login";
        }
        model.addAttribute("pedidos", pedidoService.getPedidosDeUsuario(usuario));
        return "/pedidos/listado";
    }

    // Criterio 2: detalle de un pedido
    @GetMapping("/{idFactura}")
    public String detalle(@PathVariable Integer idFactura, HttpSession session,
            Model model, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            return "redirect:/login";
        }
        Optional<Factura> facturaOpt = pedidoService.getFactura(idFactura);
        if (facturaOpt.isEmpty() || !esPropietario(facturaOpt.get(), usuario)) {
            redirectAttributes.addFlashAttribute("error", "El pedido no existe o no le pertenece.");
            return "redirect:/pedidos";
        }
        model.addAttribute("factura", facturaOpt.get());
        return "/pedidos/detalle";
    }

    // Criterio 4: descargar factura (vista imprimible / guardar como PDF)
    @GetMapping("/{idFactura}/factura")
    public String factura(@PathVariable Integer idFactura, HttpSession session,
            Model model, RedirectAttributes redirectAttributes) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) {
            return "redirect:/login";
        }
        Optional<Factura> facturaOpt = pedidoService.getFactura(idFactura);
        if (facturaOpt.isEmpty() || !esPropietario(facturaOpt.get(), usuario)) {
            redirectAttributes.addFlashAttribute("error", "El pedido no existe o no le pertenece.");
            return "redirect:/pedidos";
        }
        model.addAttribute("factura", facturaOpt.get());
        return "/pedidos/factura";
    }

    private boolean esPropietario(Factura factura, Usuario usuario) {
        return factura.getUsuario() != null
                && factura.getUsuario().getIdUsuario().equals(usuario.getIdUsuario());
    }
}
