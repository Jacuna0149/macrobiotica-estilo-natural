package com.tienda.repository;

import com.tienda.domain.Favorito;
import com.tienda.domain.Producto;
import com.tienda.domain.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {

    // consulta derivada para recuperar los favoritos de un usuario
    public List<Favorito> findByUsuario(Usuario usuario);

    public Optional<Favorito> findByUsuarioAndProducto(Usuario usuario, Producto producto);

    public boolean existsByUsuarioAndProducto(Usuario usuario, Producto producto);
}
