package com.sistemas.invernadero.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .authorizeHttpRequests(authz ->
                authz
                    // Public endpoints
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/auth/login").permitAll()
                    .requestMatchers("/auth/register").permitAll()
                    
                    // Prometheus metrics (internal only)
                    .requestMatchers("/actuator/prometheus").hasRole("ADMIN")
                    
                    // Analytics endpoints require authentication
                    .requestMatchers(HttpMethod.GET, "/api/v1/analytics/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/v1/analytics/**").hasRole("ADMIN")
                    
                    // Sensor management endpoints
                    .requestMatchers(HttpMethod.GET, "/sensors/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/sensors/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/sensors/**").hasRole("ADMIN")
                    
                    // Ingest endpoints (can be public or require API key)
                    .requestMatchers(HttpMethod.POST, "/ingest/**").permitAll()
                    
                    // Admin endpoints
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    
                    // All other requests require authentication
                    .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
