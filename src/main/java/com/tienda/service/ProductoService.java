package com.tienda.service;

import com.tienda.domain.Producto;
import com.tienda.repository.ProductoRepository;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductoService {

    // se enlaza el repositorio de producto
    private final ProductoRepository productoRepository;
    private final FirebaseStorageService firebaseStorageService;

    public ProductoService(ProductoRepository productoRepository, FirebaseStorageService firebaseStorageService) {
        this.productoRepository = productoRepository;
        this.firebaseStorageService = firebaseStorageService;
    }

    @Transactional(readOnly = true)
    public List<Producto> getProductos(boolean activo) {
        if (activo) { //si se quiere solo las productos activas 
            return productoRepository.findByActivoTrue();
        }
        return productoRepository.findAll();
    }

    //Read
    @Transactional(readOnly = true)
    public Optional<Producto> getProducto(Integer idProducto) {
        return productoRepository.findById(idProducto);
    }

    // create / update
    //si el idProducto dentro de producto  esta vacio... se inserta
    //si el idProducto dentro de producto no esta vacio... se modifica
    @Transactional
    public void save(Producto producto, MultipartFile imagen) {
        producto = productoRepository.save(producto);
        if (!imagen.isEmpty()) { // nos pasaron una imagen ...
            try {
                String ruta = firebaseStorageService
                        .uploadImage(imagen,
                                "producto",
                                producto.getIdProducto());
                producto.setRutaImagen(ruta);
                productoRepository.save(producto);
            } catch (IOException e) {

            }

        }
    }

    //Delete
    @Transactional
    public void delete(Integer idProducto) {
        //Primero se verifica que el registro exista...
        if (!productoRepository.existsById(idProducto)) {
            // el registro no se puede eliminar por que no existe
            throw new IllegalArgumentException("No se puede eliminar el registro, no existe id " + idProducto);
        }
        try {
            productoRepository.deleteById(idProducto);
        } catch (DataIntegrityViolationException e) {
            //se lanza una excepcion por que la caegoria tiene datos asociados
            throw new IllegalStateException("no se elimina por que tiene datos asociados", e);
        }
    }
}
