package com.tienda.controller;

import com.tienda.domain.Producto;
import com.tienda.domain.Usuario;
import com.tienda.service.FacturaService;
import com.tienda.service.ProductoService;
import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import lombok.Data;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/carrito")
public class CarritoController {

    // para enlazar los servicios de producto y factura
    private final ProductoService productoService;
    private final FacturaService facturaService;
    private final MessageSource messageSource;

    public CarritoController(ProductoService productoService, FacturaService facturaService, MessageSource messageSource) {
        this.productoService = productoService;
        this.facturaService = facturaService;
        this.messageSource = messageSource;
    }

    // Clase auxiliar para mostrar cada línea del carrito en la vista
    @Data
    public static class ItemCarrito {
        private final Producto producto;
        private final Integer cantidad;
        private final BigDecimal subtotal;
    }

    // Recupera (o crea) el mapa del carrito en la sesión: idProducto -> cantidad
    @SuppressWarnings("unchecked")
    private Map<Integer, Integer> getCarrito(HttpSession session) {
        var carrito = (Map<Integer, Integer>) session.getAttribute("carrito");
        if (carrito == null) {
            carrito = new LinkedHashMap<>();
            session.setAttribute("carrito", carrito);
        }
        return carrito;
    }

    // Actualiza el contador de artículos que se muestra en el menú
    private void actualizarContador(HttpSession session) {
        var carrito = getCarrito(session);
        int cantidad = carrito.values().stream().mapToInt(Integer::intValue).sum();
        session.setAttribute("carritoCant", cantidad);
    }

    @PostMapping("/agregar")
    public String agregar(@RequestParam Integer idProducto,
            @RequestParam(defaultValue = "1") Integer cantidad,
            HttpSession session, RedirectAttributes redirectAttributes) {
        var productoOpt = productoService.getProducto(idProducto);
        if (productoOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", messageSource.getMessage("producto.error01", null, Locale.getDefault()));
            return "redirect:/";
        }
        var producto = productoOpt.get();
        var carrito = getCarrito(session);
        int actual = carrito.getOrDefault(idProducto, 0);
        if (actual + cantidad > producto.getExistencias()) {
            redirectAttributes.addFlashAttribute("error", messageSource.getMessage("producto.error04", null, Locale.getDefault()));
            return "redirect:/";
        }
        carrito.put(idProducto, actual + cantidad);
        actualizarContador(session);
        redirectAttributes.addFlashAttribute("todoOk", messageSource.getMessage("carrito.agregado", null, Locale.getDefault()));
        return "redirect:/";
    }

    @GetMapping("/ver")
    public String ver(HttpSession session, Model model) {
        cargarCarrito(session, model);
        return "/carrito/listado";
    }

    @PostMapping("/actualizar")
    public String actualizar(@RequestParam Integer idProducto,
            @RequestParam Integer cantidad,
            HttpSession session, RedirectAttributes redirectAttributes) {
        var carrito = getCarrito(session);
        var productoOpt = productoService.getProducto(idProducto);
        if (productoOpt.isPresent() && carrito.containsKey(idProducto)) {
            int existencias = productoOpt.get().getExistencias();
            if (cantidad <= 0) {
                carrito.remove(idProducto);
            } else if (cantidad <= existencias) {
                carrito.put(idProducto, cantidad);
            } else {
                redirectAttributes.addFlashAttribute("error", messageSource.getMessage("producto.error04", null, Locale.getDefault()));
            }
        }
        actualizarContador(session);
        return "redirect:/carrito/ver";
    }

    @PostMapping("/eliminar")
    public String eliminar(@RequestParam Integer idProducto, HttpSession session) {
        getCarrito(session).remove(idProducto);
        actualizarContador(session);
        return "redirect:/carrito/ver";
    }

    @PostMapping("/facturar")
    public String facturar(HttpSession session, RedirectAttributes redirectAttributes, Model model) {
        var usuario = (Usuario) session.getAttribute("usuarioSesion");
        if (usuario == null) { // debe iniciar sesión para facturar
            return "redirect:/login";
        }
        try {
            var factura = facturaService.facturar(usuario, getCarrito(session));
            // se vacía el carrito luego de facturar
            session.setAttribute("carrito", new LinkedHashMap<Integer, Integer>());
            actualizarContador(session);
            model.addAttribute("factura", factura);
            return "/factura/confirmacion";
        } catch (IllegalArgumentException | IllegalStateException e) {
            redirectAttributes.addFlashAttribute("error", messageSource.getMessage(e.getMessage(), null, Locale.getDefault()));
            return "redirect:/carrito/ver";
        }
    }

    // Arma las líneas del carrito con su producto, cantidad y subtotal
    private void cargarCarrito(HttpSession session, Model model) {
        var carrito = getCarrito(session);
        var items = new ArrayList<ItemCarrito>();
        var total = BigDecimal.ZERO;
        for (var entry : carrito.entrySet()) {
            var productoOpt = productoService.getProducto(entry.getKey());
            if (productoOpt.isPresent()) {
                var producto = productoOpt.get();
                var subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(entry.getValue()));
                items.add(new ItemCarrito(producto, entry.getValue(), subtotal));
                total = total.add(subtotal);
            }
        }
        model.addAttribute("items", items);
        model.addAttribute("total", total);
    }
}
