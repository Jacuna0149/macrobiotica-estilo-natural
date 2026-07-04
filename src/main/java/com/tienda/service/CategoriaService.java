package com.tienda.service;

import com.tienda.domain.Categoria;
import com.tienda.repository.CategoriaRepository;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CategoriaService {

    // se enlaza el repositorio de categoria
    private final CategoriaRepository categoriaRepository;
    private final FirebaseStorageService firebaseStorageService;

    public CategoriaService(CategoriaRepository categoriaRepository, FirebaseStorageService firebaseStorageService) {
        this.categoriaRepository = categoriaRepository;
        this.firebaseStorageService = firebaseStorageService;
    }

    @Transactional(readOnly = true)
    public List<Categoria> getCategorias(boolean activo) {
        if (activo) { //si se quiere solo las categorias activas 
            return categoriaRepository.findByActivoTrue();
        }
        return categoriaRepository.findAll();
    }

    //Read
    @Transactional(readOnly = true)
    public Optional<Categoria> getCategoria(Integer idCategoria) {
        return categoriaRepository.findById(idCategoria);
    }

    // create / update
    //si el idCategoria dentro de categoria  esta vacio... se inserta
    //si el idCategoria dentro de categoria no esta vacio... se modifica
    @Transactional
    public void save(Categoria categoria, MultipartFile imagen) {
        categoria = categoriaRepository.save(categoria);
        if (!imagen.isEmpty()) { // nos pasaron una imagen ...
            try {
                String ruta = firebaseStorageService
                        .uploadImage(imagen,
                                "categoria",
                                categoria.getIdCategoria());
                categoria.setRutaImagen(ruta);
                categoriaRepository.save(categoria);
            } catch (IOException e) {

            }

        }
    }

    //Delete
    @Transactional
    public void delete(Integer idCategoria) {
        //Primero se verifica que el registro exista...
        if (!categoriaRepository.existsById(idCategoria)) {
            // el registro no se puede eliminar por que no existe
            throw new IllegalArgumentException("No se puede eliminar el registro, no existe id " + idCategoria);
        }
        try {
            categoriaRepository.deleteById(idCategoria);
        } catch (DataIntegrityViolationException e) {
            //se lanza una excepcion por que la caegoria tiene datos asociados
            throw new IllegalStateException("no se elimina por que tiene datos asociados", e);
        }
    }
}
