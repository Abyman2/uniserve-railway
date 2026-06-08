package uniconnect_backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Maps Railway's DATABASE_URL (postgres://...) to Spring datasource properties
 * when DB_URL / DB_USER / DB_PASS are not already set.
 */
public class RailwayDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (hasText(environment.getProperty("DB_URL"))) {
            return;
        }

        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (!hasText(databaseUrl)) {
            databaseUrl = System.getenv("DATABASE_URL");
        }
        if (!hasText(databaseUrl)) {
            return;
        }

        try {
            Map<String, Object> props = parseDatabaseUrl(databaseUrl);
            environment.getPropertySources().addFirst(new MapPropertySource("railwayDatabase", props));
        } catch (Exception ignored) {
            // Fall back to application.yml defaults if parsing fails.
        }
    }

    private static Map<String, Object> parseDatabaseUrl(String databaseUrl) throws Exception {
        String normalized = databaseUrl.replaceFirst("^postgres(ql)?://", "http://");
        URI uri = URI.create(normalized);

        String userInfo = uri.getUserInfo();
        if (userInfo == null || !userInfo.contains(":")) {
            throw new IllegalArgumentException("DATABASE_URL missing credentials");
        }

        String[] credentials = userInfo.split(":", 2);
        String user = URLDecoder.decode(credentials[0], StandardCharsets.UTF_8);
        String password = URLDecoder.decode(credentials[1], StandardCharsets.UTF_8);

        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String database = uri.getPath() != null ? uri.getPath().replaceFirst("^/", "") : "";

        Map<String, Object> props = new HashMap<>();
        props.put("DB_URL", "jdbc:postgresql://" + host + ":" + port + "/" + database);
        props.put("DB_USER", user);
        props.put("DB_PASS", password);
        return props;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
