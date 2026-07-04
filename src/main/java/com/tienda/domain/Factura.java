package com.tienda.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    // Estado según el enum de la tabla: Activa, Pagada, Anulada
    private String estado;

    @OneToMany(mappedBy="factura")
    private List<Venta> ventas;
}
