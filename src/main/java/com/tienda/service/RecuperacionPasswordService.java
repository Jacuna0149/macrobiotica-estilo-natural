package com.tienda.service;

import com.tienda.domain.SolicitudRecuperacion;
import com.tienda.domain.Usuario;
import com.tienda.repository.SolicitudRecuperacionRepository;
import com.tienda.repository.UsuarioRepository;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecuperacionPasswordService {

    private static final int MINUTOS_EXPIRACION = 60;

    private final UsuarioRepository usuarioRepository;
    private final SolicitudRecuperacionRepository solicitudRepository;
    private final PasswordEncoder passwordEncoder;

    public RecuperacionPasswordService(UsuarioRepository usuarioRepository,
            SolicitudRecuperacionRepository solicitudRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.solicitudRepository = solicitudRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Genera un token si el correo existe; vacío si no (así no revelamos si el correo está registrado)
    @Transactional
    public Optional<String> solicitar(String correo) {
        var usuarioOpt = usuarioRepository.findByCorreo(correo);
        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }
        Usuario usuario = usuarioOpt.get();

        String token = generarTokenAleatorio();
        SolicitudRecuperacion solicitud = new SolicitudRecuperacion();
        solicitud.setIdUsuario(usuario.getIdUsuario());
        solicitud.setTokenHash(hashSha256(token));
        solicitud.setExpiraEn(LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION));
        solicitud.setUsado(false);
        solicitud.setCreadoEn(LocalDateTime.now());
        solicitudRepository.save(solicitud);

        return Optional.of(token);
    }

    // Valida el token y actualiza la contraseña; lanza excepción con clave de mensaje si falla
    @Transactional
    public void restablecer(String token, String nuevaPassword) {
        String hash = hashSha256(token);
        SolicitudRecuperacion solicitud = solicitudRepository.findByTokenHashAndUsadoFalse(hash)
                .orElseThrow(() -> new IllegalArgumentException("recuperacion.error01"));

        if (solicitud.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("recuperacion.error01");
        }

        Usuario usuario = usuarioRepository.findById(solicitud.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("error.login"));

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        solicitud.setUsado(true);
        solicitudRepository.save(solicitud);
    }

    private String generarTokenAleatorio() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashSha256(String texto) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(texto.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
