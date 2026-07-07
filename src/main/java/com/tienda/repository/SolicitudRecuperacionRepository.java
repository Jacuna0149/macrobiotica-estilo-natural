package com.tienda.repository;

import com.tienda.domain.SolicitudRecuperacion;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRecuperacionRepository extends JpaRepository<SolicitudRecuperacion, Integer> {
    Optional<SolicitudRecuperacion> findByTokenHashAndUsadoFalse(String tokenHash);
}