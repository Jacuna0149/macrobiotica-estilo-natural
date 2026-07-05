package com.tienda.controller;

import com.tienda.service.PedidoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// HU-13: Gestionar y actualizar el estado de los pedidos (administrador).
// Las rutas /admin/** están protegidas por AdminInterceptor (solo rol ADMIN).
@Controller
@RequestMapping("/admin/pedidos")
public class AdminPedidoController {

    private final PedidoService pedidoService;

    public AdminPedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Criterio 1: ver todos los pedidos. Criterio 3: filtrar por estado.
    @GetMapping
    public String listado(@RequestParam(required = false) String estado, Model model) {
        var pedidos = pedidoService.getPedidos(estado);
        model.addAttribute("pedidos", pedidos);
        model.addAttribute("totalPedidos", pedidos.size());
        model.addAttribute("estadoActual", estado == null ? "Todos" : estado);
        model.addAttribute("estados", PedidoService.ESTADOS_PEDIDO);
        return "/admin/pedidos";
    }

    // Criterio 2: cambiar el estado del pedido
    @PostMapping("/estado")
    public String cambiarEstado(@RequestParam Integer idFactura,
            @RequestParam String nuevoEstado, RedirectAttributes redirectAttributes) {
        try {
            pedidoService.cambiarEstado(idFactura, nuevoEstado);
            redirectAttributes.addFlashAttribute("todoOk",
                    "Estado actualizado. Se notificó al cliente por correo electrónico.");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/pedidos";
    }

    // Criterio 4: cancelar pedido (con motivo, devuelve stock y notifica)
    @PostMapping("/cancelar")
    public String cancelar(@RequestParam Integer idFactura,
            @RequestParam String motivo, RedirectAttributes redirectAttributes) {
        try {
            pedidoService.cancelarPedido(idFactura, motivo);
            redirectAttributes.addFlashAttribute("todoOk",
                    "Pedido cancelado. Se devolvió el stock y se notificó al cliente.");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/pedidos";
    }
}
