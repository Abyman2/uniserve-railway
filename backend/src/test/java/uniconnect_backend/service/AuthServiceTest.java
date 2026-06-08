package uniconnect_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import uniconnect_backend.auth.dto.AuthResponse;
import uniconnect_backend.auth.dto.LoginRequest;
import uniconnect_backend.auth.dto.RegisterRequest;
import uniconnect_backend.auth.service.AuthService;
import uniconnect_backend.common.exception.ConflictException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.security.JwtService;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthService authService;

    @Test
    void register_savesCustomer() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@uni.edu");
        request.setPassword("password123");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded");

        AuthResponse response = authService.register(request);

        assertThat(response.getMessage()).contains("successfully");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmailThrowsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("dup@uni.edu");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void login_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@uni.edu");
        request.setPassword("password123");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .password("encoded")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtService.generateToken(user.getEmail())).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    void login_invalidCredentialsThrowsNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@uni.edu");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
