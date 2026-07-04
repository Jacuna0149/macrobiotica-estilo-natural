package com.tienda.repository;

import com.tienda.domain.Rol;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer>{

    // consulta derivada para recuperar un rol por su nombre
    public Optional<Rol> findByRol(String rol);
}
