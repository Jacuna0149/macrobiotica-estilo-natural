package com.tienda.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name="venta")
public class Venta implements Serializable {
    //se establece un inicio de ids para serializar
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVenta;

    @ManyToOne
    @JoinColumn(name="id_factura")
    private Factura factura;

    @ManyToOne
    @JoinColumn(name="id_producto")
    private Producto producto;

    @Column(precision=12, scale=2)
    private BigDecimal precioHistorico;

    private Integer cantidad;

    // Subtotal de la línea (precio histórico x cantidad); no se persiste
    @Transient
    public BigDecimal getSubtotal() {
        if (precioHistorico == null || cantidad == null) {
            return BigDecimal.ZERO;
        }
        return precioHistorico.multiply(BigDecimal.valueOf(cantidad));
    }
}
