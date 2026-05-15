package com.sistemas.invernadero.modules.auth;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.security.JwtTokenProvider;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private JwtTokenProvider tokenProvider;

    /**
     * Login endpoint
     * Retorna JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody LoginRequest request) {
        
        // TODO: Validar usuario contra DB
        // Por ahora, validación dummy para demostración
        
        if (request.getUsername() == null || request.getUsername().isEmpty()) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Username es requerido"));
        }

        try {
            // Generar JWT token
            String token = tokenProvider.generateToken(
                request.getUsername(),
                request.getGreenhouse() != null ? request.getGreenhouse() : "DEFAULT",
                request.getRole() != null ? request.getRole() : "USER"
            );

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("type", "Bearer");
            data.put("username", request.getUsername());
            data.put("greenhouse", request.getGreenhouse());
            data.put("expiresIn", 86400); // 24 horas en segundos

            log.info("Usuario {} autenticado exitosamente", request.getUsername());
            
            return ResponseEntity.ok(
                ApiResponse.success(data, "Autenticación exitosa")
            );
        } catch (Exception e) {
            log.error("Error durante autenticación: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error durante autenticación"));
        }
    }

    /**
     * Validar token
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, String>>> validateToken(
            @RequestHeader("Authorization") String token) {

        try {
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Formato de token inválido"));
            }

            String jwt = token.substring(7);
            
            if (!tokenProvider.validateToken(jwt)) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Token inválido"));
            }

            if (tokenProvider.isTokenExpired(jwt)) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Token expirado"));
            }

            Map<String, String> data = new HashMap<>();
            data.put("userId", tokenProvider.getUserIdFromToken(jwt));
            data.put("greenhouse", tokenProvider.getGreenhouseFromToken(jwt));
            data.put("role", tokenProvider.getRoleFromToken(jwt));
            data.put("valid", "true");

            return ResponseEntity.ok(
                ApiResponse.success(data, "Token válido")
            );
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Error validando token"));
        }
    }

    /**
     * Refresh token (generar nuevo token)
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(
            @RequestHeader("Authorization") String token) {

        try {
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Formato de token inválido"));
            }

            String jwt = token.substring(7);
            
            if (!tokenProvider.validateToken(jwt)) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Token inválido"));
            }

            String userId = tokenProvider.getUserIdFromToken(jwt);
            String greenhouse = tokenProvider.getGreenhouseFromToken(jwt);
            String role = tokenProvider.getRoleFromToken(jwt);

            String newToken = tokenProvider.generateToken(userId, greenhouse, role);

            Map<String, String> data = new HashMap<>();
            data.put("token", newToken);
            data.put("type", "Bearer");
            data.put("expiresIn", "86400");

            log.info("Token renovado para usuario: {}", userId);
            
            return ResponseEntity.ok(
                ApiResponse.success(data, "Token renovado exitosamente")
            );
        } catch (Exception e) {
            log.error("Error renovando token: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Error renovando token"));
        }
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
        private String greenhouse;
        private String role;
    }
}
