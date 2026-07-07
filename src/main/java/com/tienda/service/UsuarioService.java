package com.tienda.service;

import com.tienda.domain.Usuario;
import com.tienda.repository.RolRepository;
import com.tienda.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    // se enlaza el repositorio de usuario y el codificador de contraseñas
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Autentica un usuario por username y contraseña; vacío si no es válido
    @Transactional(readOnly = true)
    public Optional<Usuario> autenticar(String username, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }
        Usuario usuario = usuarioOpt.get();
        if (!usuario.isActivo()) {
            return Optional.empty();
        }
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            return Optional.empty();
        }
        return Optional.of(usuario);
    }

    // Registra un usuario nuevo con rol USER y contraseña hasheada
    @Transactional
    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new IllegalArgumentException("usuario.error05");
        }
        if (usuario.getCorreo() != null && usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException("usuario.error04");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setActivo(true);
        var rolUser = rolRepository.findByRol("USER");
        rolUser.ifPresent(rol -> usuario.setRoles(List.of(rol)));
        return usuarioRepository.save(usuario);
    }
}
