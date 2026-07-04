package com.tienda.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name="producto")
public class Producto implements Serializable {
    //se establece un inicio de ids para serializar
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProducto;
    //private Integer idCategoria; A partir de @ManyToOne no se usa este atributo
    
    @Column(unique = true, nullable = false, length = 50)
    @NotNull
    @Size(max = 50)
    private String descripcion;
    
    @Column(columnDefinition="TEXT")
    private String detalle;
    
    @Column(precision=12, scale=2)
    @DecimalMin(value="0.00", inclusive=true)
    private BigDecimal precio;
    
    @Min(value=0)
    private Integer existencias;
    
    @Column(length = 1024)
    @Size(max = 1024)
    private String rutaImagen;
    
    private boolean activo;
    
    @ManyToOne
    @JoinColumn(name="id_categoria")
    private Categoria categoria;
}
