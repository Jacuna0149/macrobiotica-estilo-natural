package com.tienda.repository;

import com.tienda.domain.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer>{

    // consulta derivada para recuperar un usuario por su username
    public Optional<Usuario> findByUsername(String username);
    public Optional<Usuario> findByCorreo(String correo);

    // consultas derivadas para validar unicidad en el registro
    public boolean existsByUsername(String username);
    public boolean existsByCorreo(String correo);
}
