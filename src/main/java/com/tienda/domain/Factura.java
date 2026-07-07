package com.tienda.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name="factura")
public class Factura implements Serializable {
    //se establece un inicio de ids para serializar
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFactura;

    @ManyToOne
    @JoinColumn(name="id_usuario")
    private Usuario usuario;

    private LocalDateTime fecha;

    @Column(precision=12, scale=2)
    private BigDecimal total;

    // Estado del pago según el enum de la tabla: Activa, Pagada, Anulada
    private String estado;

    // Estado de entrega del pedido (HU-11 y HU-13):
    // Pendiente | En proceso | Enviado | Entregado | Cancelado
    @Column(name = "estado_pedido", length = 20)
    private String estadoPedido;

    // Motivo cuando el administrador cancela el pedido (HU-13)
    @Column(name = "motivo_cancelacion", length = 255)
    private String motivoCancelacion;

    @OneToMany(mappedBy="factura")
    private List<Venta> ventas;

    // Fechas ya formateadas para las vistas (sin depender de #temporals)
    @Transient
    public String getFechaCorta() {
        return fecha == null ? "" : fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    @Transient
    public String getFechaLarga() {
        return fecha == null ? "" : fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }
}
