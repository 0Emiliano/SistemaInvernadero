# 🔐 JWT Authentication - Guía Completa

## Componentes Implementados

```
JwtTokenProvider.java
├─ generateToken(userId, greenhouse, role) → JWT
├─ getClaimsFromToken(token) → Claims
├─ validateToken(token) → boolean
└─ isTokenExpired(token) → boolean

JwtAuthenticationFilter.java
├─ Intercepta requests
├─ Extrae JWT del header Authorization
├─ Valida token
└─ Establece SecurityContext

SecurityConfig.java
├─ Endpoints públicos (login, health)
├─ Endpoints autenticados
├─ Endpoints admin (role-based)
└─ CORS configuration

AuthController.java
├─ POST /auth/login → JWT token
├─ POST /auth/validate → Validar token
└─ POST /auth/refresh → Renovar token
```

---

## Flow Completo: Login → Token → Autenticación

### 1. Login (Obtener JWT)

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "farmer@greenhouse.com",
    "password": "password123",
    "greenhouse": "GW-001",
    "role": "OPERATOR"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJmYXJtZXJAZ3JlZW5ob3VzZS5jb20iLCJncmVlbmhvdXNlIjoiR1ctMDAxIiwicm9sZSI6Ik9QRVJBVE9SIiwiaWF0IjoxNjI2MDAwMDAwLCJleHAiOjE2MjYwODY0MDB9.sig",
    "type": "Bearer",
    "username": "farmer@greenhouse.com",
    "greenhouse": "GW-001",
    "expiresIn": 86400
  }
}
```

### 2. Usar Token en Requests

```bash
# Incluir en header Authorization
curl -X GET http://localhost:8080/api/v1/analytics/dashboard/GW-001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJz..."
```

### 3. Validar Token

```bash
curl -X POST http://localhost:8080/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJz..."
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "userId": "farmer@greenhouse.com",
    "greenhouse": "GW-001",
    "role": "OPERATOR",
    "valid": "true"
  }
}
```

### 4. Renovar Token

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJz..."
```

---

## Configuración en application.properties

```properties
# JWT Configuration
jwt.secret=your-very-long-secure-secret-key-at-least-64-chars
jwt.expiration=86400000

# Cambiar en producción usando variables de entorno:
# export JWT_SECRET=$(openssl rand -hex 32)
# export JWT_EXPIRATION=86400000
```

---

## Endpoint Security Rules

```
PUBLICO:
├─ POST /auth/login
├─ POST /auth/register
└─ GET  /actuator/health

AUTENTICADO:
├─ GET  /api/v1/analytics/**
├─ GET  /sensors/**
└─ POST /ingest/**

ADMIN ONLY:
├─ POST /api/v1/analytics/**
├─ POST /sensors/**
├─ DELETE /sensors/**
└─ GET  /actuator/prometheus
```

---

## Frontend Integration (React)

### 1. Login Service

```typescript
// services/authService.ts
import axios from 'axios';

export class AuthService {
  private API_URL = 'http://localhost:8080/auth';

  async login(username: string, password: string, greenhouse: string): Promise<string> {
    const response = await axios.post(`${this.API_URL}/login`, {
      username,
      password,
      greenhouse,
      role: 'OPERATOR'
    });
    
    const token = response.data.data.token;
    localStorage.setItem('jwt_token', token);
    return token;
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

### 2. Axios Interceptor

```typescript
// services/api.ts
import axios from 'axios';
import { AuthService } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

const authService = new AuthService();

// Request interceptor
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Login Component

```typescript
// components/Login.tsx
import React, { useState } from 'react';
import { AuthService } from '../services/authService';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [greenhouse, setGreenhouse] = useState('GW-001');
  const authService = new AuthService();

  const handleLogin = async () => {
    try {
      await authService.login(username, password, greenhouse);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-form">
      <input
        type="email"
        placeholder="Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={greenhouse} onChange={(e) => setGreenhouse(e.target.value)}>
        <option>GW-001</option>
        <option>GW-002</option>
        <option>GW-003</option>
      </select>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};
```

### 4. Protected Routes

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authService = new AuthService();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
```

---

## Token Claims Structure

```json
{
  "sub": "farmer@greenhouse.com",      // Subject (user ID)
  "greenhouse": "GW-001",               // Allowed greenhouse
  "role": "OPERATOR",                   // User role
  "iat": 1626000000,                    // Issued at
  "exp": 1626086400                     // Expires at (24 horas después)
}
```

---

## Multi-Tenancy Support

Cada token incluye el `greenhouse_id`. El backend puede filtrar datos basado en esto:

```java
@GetMapping("/api/v1/analytics/dashboard/{greenhouseId}")
public ApiResponse<...> getDashboard(
    @PathVariable String greenhouseId,
    HttpServletRequest request) {
    
    // Obtener greenhouse del token
    String userGreenhouse = (String) request.getAttribute("greenhouse_id");
    
    // Validar que el usuario solo vea su greenhouse
    if (!userGreenhouse.equals(greenhouseId)) {
        throw new ForbiddenException("Acceso denegado");
    }
    
    // Retornar datos solo del greenhouse del usuario
    return analyticsService.getDashboard(greenhouseId);
}
```

---

## Seguridad Recomendada

### 1. Environment Variables (Producción)

```bash
# En Kubernetes secret
kubectl create secret generic jwt-config \
  --from-literal=jwt_secret=$(openssl rand -hex 32) \
  --from-literal=jwt_expiration=86400000 \
  -n invernadero
```

### 2. Rotación de Tokens

Implementar refresh token para tokens de larga duración:

```java
@PostMapping("/auth/refresh-token")
public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
    // Validar refresh token (sin expiración o larga duración)
    // Generar nuevo access token
    // Retornar nuevo token
}
```

### 3. Token Blacklist

Para logout real:

```java
@Component
public class TokenBlacklist {
    private Set<String> blacklist = Collections.synchronizedSet(new HashSet<>());
    
    public void addToBlacklist(String token) {
        blacklist.add(token);
    }
    
    public boolean isBlacklisted(String token) {
        return blacklist.contains(token);
    }
}
```

### 4. HTTPS Solo

Configurar Ingress con TLS forzado:

```yaml
spec:
  rules:
  - host: api.your-domain.com
    http:
      paths:
      - path: /auth
        backend:
          service:
            name: backend-service
            port:
              number: 8080
```

---

## Testing JWT

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass","greenhouse":"GW-001"}' \
  | jq -r '.data.token')

# 2. Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/analytics/dashboard/GW-001

# 3. Validate
curl -X POST http://localhost:8080/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

---

Este setup proporciona:
✅ Autenticación stateless
✅ Multi-tenancy (greenhouse-based)
✅ Role-based access control
✅ Token refresh
✅ CORS habilitado
✅ Production-ready
