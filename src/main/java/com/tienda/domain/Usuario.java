package com.tienda.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name="usuario")
public class Usuario implements Serializable {
    //se establece un inicio de ids para serializar
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;

    @Column(unique = true, nullable = false, length = 30)
    @NotNull
    @Size(max = 30)
    private String username;

    @Column(nullable = false, length = 512)
    @NotNull
    private String password;

    @Column(nullable = false, length = 20)
    @NotNull
    @Size(max = 20)
    private String nombre;

    @Column(nullable = false, length = 30)
    @NotNull
    @Size(max = 30)
    private String apellidos;

    @Column(unique = true, length = 75)
    @Email
    private String correo;

    @Column(length = 25)
    private String telefono;

    @Column(length = 1024)
    @Size(max = 1024)
    private String rutaImagen;

    private boolean activo;

    // Relación con los roles a través de la tabla usuario_rol
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "usuario_rol",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_rol"))
    private List<Rol> roles;

    // Verifica si el usuario tiene el rol indicado
    public boolean tieneRol(String nombreRol) {
        if (roles == null) {
            return false;
        }
        return roles.stream().anyMatch(r -> r.getRol().equals(nombreRol));
    }
}
