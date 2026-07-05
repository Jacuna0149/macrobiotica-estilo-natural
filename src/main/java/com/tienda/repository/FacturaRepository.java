package com.tienda.repository;

import com.tienda.domain.Factura;
import com.tienda.domain.Usuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Integer>{

    // consulta derivada para recuperar las facturas de un usuario
    public List<Factura> findByUsuarioOrderByFechaDesc(Usuario usuario);

    // HU-13: todos los pedidos (más recientes primero)
    public List<Factura> findAllByOrderByFechaDesc();

    // HU-13, criterio 3: filtrar pedidos por estado de entrega
    public List<Factura> findByEstadoPedidoOrderByFechaDesc(String estadoPedido);
}
