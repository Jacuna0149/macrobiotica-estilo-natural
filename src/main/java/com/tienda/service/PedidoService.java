package com.tienda.service;

import com.tienda.domain.Factura;
import com.tienda.domain.Usuario;
import com.tienda.domain.Venta;
import com.tienda.repository.FacturaRepository;
import com.tienda.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de consulta y gestión de pedidos (HU-11 cliente, HU-13 administrador)
@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    // Estados de entrega del pedido
    public static final List<String> ESTADOS_PEDIDO =
            List.of("Pendiente", "En proceso", "Enviado", "Entregado", "Cancelado");

    private final FacturaRepository facturaRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(FacturaRepository facturaRepository, ProductoRepository productoRepository) {
        this.facturaRepository = facturaRepository;
        this.productoRepository = productoRepository;
    }

    // HU-11: historial de pedidos del cliente
    @Transactional(readOnly = true)
    public List<Factura> getPedidosDeUsuario(Usuario usuario) {
        return facturaRepository.findByUsuarioOrderByFechaDesc(usuario);
    }

    // Detalle de un pedido
    @Transactional(readOnly = true)
    public Optional<Factura> getFactura(Integer idFactura) {
        return facturaRepository.findById(idFactura);
    }

    // HU-13, criterio 1 y 3: todos los pedidos o filtrados por estado
    @Transactional(readOnly = true)
    public List<Factura> getPedidos(String estadoPedido) {
        if (estadoPedido == null || estadoPedido.isBlank() || "Todos".equalsIgnoreCase(estadoPedido)) {
            return facturaRepository.findAllByOrderByFechaDesc();
        }
        return facturaRepository.findByEstadoPedidoOrderByFechaDesc(estadoPedido);
    }

    // HU-13, criterio 2: cambiar el estado del pedido y notificar al cliente
    @Transactional
    public void cambiarEstado(Integer idFactura, String nuevoEstado) {
        var factura = facturaRepository.findById(idFactura)
                .orElseThrow(() -> new IllegalArgumentException("El pedido no existe."));
        if (!ESTADOS_PEDIDO.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado de pedido no válido.");
        }
        if ("Cancelado".equals(factura.getEstadoPedido())) {
            throw new IllegalStateException("No se puede modificar un pedido cancelado.");
        }
        factura.setEstadoPedido(nuevoEstado);
        facturaRepository.save(factura);
        notificarCliente(factura, "Su pedido #" + factura.getIdFactura()
                + " cambió al estado '" + nuevoEstado + "'.");
    }

    // HU-13, criterio 4: cancela el pedido, devuelve el stock al inventario y notifica
    @Transactional
    public void cancelarPedido(Integer idFactura, String motivo) {
        var factura = facturaRepository.findById(idFactura)
                .orElseThrow(() -> new IllegalArgumentException("El pedido no existe."));
        if ("Cancelado".equals(factura.getEstadoPedido())) {
            throw new IllegalStateException("El pedido ya se encuentra cancelado.");
        }
        // Devuelve el stock al inventario
        if (factura.getVentas() != null) {
            for (Venta venta : factura.getVentas()) {
                var producto = venta.getProducto();
                if (producto != null && venta.getCantidad() != null) {
                    int existencias = producto.getExistencias() == null ? 0 : producto.getExistencias();
                    producto.setExistencias(existencias + venta.getCantidad());
                    productoRepository.save(producto);
                }
            }
        }
        factura.setEstadoPedido("Cancelado");
        factura.setEstado("Anulada");
        factura.setMotivoCancelacion(motivo);
        facturaRepository.save(factura);
        notificarCliente(factura, "Su pedido #" + factura.getIdFactura()
                + " fue cancelado. Motivo: " + motivo);
    }

    // El proyecto base no tiene servidor de correo: se simula la notificación en el log.
    private void notificarCliente(Factura factura, String mensaje) {
        String correo = factura.getUsuario() != null ? factura.getUsuario().getCorreo() : "desconocido";
        log.info("[NOTIFICACION] Para {}: {}", correo, mensaje);
    }
}
