package uniconnect_backend.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_success() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("user@uni.edu")
                .password("encoded")
                .role(Role.CUSTOMER)
                .build();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        var details = userDetailsService.loadUserByUsername(user.getEmail());
        assertThat(details.getUsername()).isEqualTo(user.getEmail());
        assertThat(details.getAuthorities()).extracting("authority")
                .containsExactly("ROLE_CUSTOMER");
    }

    @Test
    void loadUserByUsername_notFound() {
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("missing@uni.edu"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
