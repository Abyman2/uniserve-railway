package uniconnect_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // For local dev: http://localhost:5173
        // For Railway/prod: set CORS_ALLOWED_ORIGINS to a comma-separated list, e.g.
        //   https://your-frontend.up.railway.app,https://your-custom-domain.com
        //
        // Note: we use allowedOriginPatterns so you can also pass patterns (e.g. "*")
        // while keeping allowCredentials=true.
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        List<String> allowedOrigins = (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank())
                ? Arrays.stream(allowedOriginsEnv.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList()
                : List.of("http://localhost:5173");

        configuration.setAllowedOriginPatterns(allowedOrigins);

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
