package com.tienda;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

// Protege las rutas de administración: solo usuarios con rol ADMIN en sesión
@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        var session = request.getSession(false);
        var esAdmin = session != null && Boolean.TRUE.equals(session.getAttribute("esAdmin"));
        if (!esAdmin) {
            response.sendRedirect("/login");
            return false;
        }
        return true;
    }
}
