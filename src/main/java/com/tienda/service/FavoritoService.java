package com.tienda.service;

import com.tienda.domain.Favorito;
import com.tienda.domain.Usuario;
import com.tienda.repository.FavoritoRepository;
import com.tienda.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de la lista de favoritos del cliente (HU-12)
@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final ProductoRepository productoRepository;

    public FavoritoService(FavoritoRepository favoritoRepository, ProductoRepository productoRepository) {
        this.favoritoRepository = favoritoRepository;
        this.productoRepository = productoRepository;
    }

    // Criterio 2: lista de favoritos del usuario
    @Transactional(readOnly = true)
    public List<Favorito> getFavoritos(Usuario usuario) {
        return favoritoRepository.findByUsuario(usuario);
    }

    // Ids de productos favoritos, para pintar el corazón activo en el catálogo
    @Transactional(readOnly = true)
    public Set<Integer> getIdsFavoritos(Usuario usuario) {
        return favoritoRepository.findByUsuario(usuario).stream()
                .map(f -> f.getProducto().getIdProducto())
                .collect(Collectors.toSet());
    }

    // Criterio 1 y 3: alterna el producto en la lista de favoritos.
    // Devuelve true si quedó marcado como favorito, false si se eliminó.
    @Transactional
    public boolean alternarFavorito(Usuario usuario, Integer idProducto) {
        var producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new IllegalArgumentException("producto.error01"));
        Optional<Favorito> existente = favoritoRepository.findByUsuarioAndProducto(usuario, producto);
        if (existente.isPresent()) {
            favoritoRepository.delete(existente.get());
            return false;
        }
        var favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setProducto(producto);
        favoritoRepository.save(favorito);
        return true;
    }

    // Criterio 3: eliminar de favoritos
    @Transactional
    public void eliminar(Usuario usuario, Integer idProducto) {
        productoRepository.findById(idProducto)
                .flatMap(p -> favoritoRepository.findByUsuarioAndProducto(usuario, p))
                .ifPresent(favoritoRepository::delete);
    }
}
