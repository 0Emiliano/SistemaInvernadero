package com.sistemas.invernadero.unit;

import com.sistemas.invernadero.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JwtTokenProviderTest {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String testToken;

    @BeforeEach
    void setup() {
        testToken = jwtTokenProvider.generateToken("testuser", "USER");
    }

    @Test
    void testGenerateToken() {
        assertNotNull(testToken);
        assertTrue(testToken.startsWith("eyJ"));
    }

    @Test
    void testValidateToken() {
        assertTrue(jwtTokenProvider.validateToken(testToken));
    }

    @Test
    void testGetUserFromToken() {
        String username = jwtTokenProvider.getUserFromToken(testToken);
        assertEquals("testuser", username);
    }

    @Test
    void testGetRoleFromToken() {
        String role = jwtTokenProvider.getRoleFromToken(testToken);
        assertEquals("USER", role);
    }

    @Test
    void testExpiredToken() {
        String expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }

    @Test
    void testRefreshToken() {
        String refreshedToken = jwtTokenProvider.refreshToken(testToken);
        assertNotNull(refreshedToken);
        assertTrue(jwtTokenProvider.validateToken(refreshedToken));
        assertNotEquals(testToken, refreshedToken);
    }
}
