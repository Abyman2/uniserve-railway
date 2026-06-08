package uniconnect_backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "jwt.secret=test-jwt-secret-key-at-least-32-characters-long")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @Test
    void generateAndValidateToken() {
        String token = jwtService.generateToken("user@uni.edu");
        User userDetails = new User("user@uni.edu", "pwd", java.util.List.of());

        assertThat(jwtService.extractEmail(token)).isEqualTo("user@uni.edu");
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }
}
