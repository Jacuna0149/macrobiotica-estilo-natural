package com.tienda.service;

import com.tienda.domain.Factura;
import com.tienda.domain.Usuario;
import com.tienda.domain.Venta;
import com.tienda.repository.FacturaRepository;
import com.tienda.repository.ProductoRepository;
import com.tienda.repository.VentaRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FacturaService {

    // se enlazan los repositorios necesarios para facturar
    private final FacturaRepository facturaRepository;
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    public FacturaService(FacturaRepository facturaRepository, VentaRepository ventaRepository, ProductoRepository productoRepository) {
        this.facturaRepository = facturaRepository;
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
    }

    // Crea la factura y sus ventas a partir del carrito (idProducto -> cantidad),
    // valida y descuenta existencias; todo dentro de una transacción.
    @Transactional
    public Factura facturar(Usuario usuario, Map<Integer, Integer> carrito) {
        if (carrito == null || carrito.isEmpty()) {
            throw new IllegalArgumentException("carrito.no_mostrar");
        }

        var ventas = new ArrayList<Venta>();
        var total = BigDecimal.ZERO;

        for (var item : carrito.entrySet()) {
            var productoOpt = productoRepository.findById(item.getKey());
            if (productoOpt.isEmpty()) {
                throw new IllegalArgumentException("producto.error01");
            }
            var producto = productoOpt.get();
            int cantidad = item.getValue();
            if (producto.getExistencias() == null || producto.getExistencias() < cantidad) {
                throw new IllegalStateException("producto.error04");
            }
            // se descuentan las existencias del producto
            producto.setExistencias(producto.getExistencias() - cantidad);
            productoRepository.save(producto);

            var venta = new Venta();
            venta.setProducto(producto);
            venta.setPrecioHistorico(producto.getPrecio());
            venta.setCantidad(cantidad);
            ventas.add(venta);

            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(cantidad)));
        }

        // se guarda la factura con su total
        var factura = new Factura();
        factura.setUsuario(usuario);
        factura.setFecha(LocalDateTime.now());
        factura.setTotal(total);
        factura.setEstado("Pagada");
        // estado de entrega inicial del pedido (HU-11 y HU-13)
        factura.setEstadoPedido("Pendiente");
        factura = facturaRepository.save(factura);

        // se guardan las ventas asociadas a la factura
        for (var venta : ventas) {
            venta.setFactura(factura);
            ventaRepository.save(venta);
        }
        factura.setVentas(ventas);
        return factura;
    }
}
