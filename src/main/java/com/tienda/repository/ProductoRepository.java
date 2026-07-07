package com.tienda.repository;

import com.tienda.domain.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer>{

    // se crear una consulta derivada para recuperar las productos activas
    public List<Producto> findByActivoTrue();

    // Búsqueda combinada: nombre (parcial), categoría y rango de precio, todos opcionales
    @Query(value = "SELECT * FROM producto p " +
            "WHERE p.activo = true " +
            "AND (:nombre IS NULL OR p.descripcion LIKE CONCAT('%', :nombre, '%')) " +
            "AND (:idCategoria IS NULL OR p.id_categoria = :idCategoria) " +
            "AND (:precioMin IS NULL OR p.precio >= :precioMin) " +
            "AND (:precioMax IS NULL OR p.precio <= :precioMax) " +
            "ORDER BY p.descripcion",
            nativeQuery = true)
    List<Producto> buscarConFiltros(@Param("nombre") String nombre,
                                     @Param("idCategoria") Integer idCategoria,
                                     @Param("precioMin") Double precioMin,
                                     @Param("precioMax") Double precioMax);
}
