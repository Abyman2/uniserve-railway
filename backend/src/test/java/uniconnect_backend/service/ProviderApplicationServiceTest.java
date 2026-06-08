package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uniconnect_backend.common.exception.ConflictException;
import uniconnect_backend.provider.dto.ProviderApplicationRequest;
import uniconnect_backend.provider.entity.ApplicationStatus;
import uniconnect_backend.provider.entity.ProviderApplication;
import uniconnect_backend.provider.repository.ProviderApplicationRepository;
import uniconnect_backend.provider.service.ProviderApplicationService;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProviderApplicationServiceTest {

    @Mock
    private ProviderApplicationRepository repository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ProviderApplicationService service;

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void apply_duplicateThrowsConflict() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("cust@uni.edu")
                .role(Role.CUSTOMER)
                .build();
        TestSecurity.loginAs(user.getEmail(), "CUSTOMER");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(repository.existsByUserId(user.getId())).thenReturn(true);

        ProviderApplicationRequest request = new ProviderApplicationRequest();
        request.setSkills("Java");

        assertThatThrownBy(() -> service.apply(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void approveApplication_updatesRole() {
        UUID appId = UUID.randomUUID();
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("cust@uni.edu")
                .role(Role.CUSTOMER)
                .build();
        ProviderApplication application = ProviderApplication.builder()
                .id(appId)
                .user(user)
                .skills("Design")
                .status(ApplicationStatus.PENDING)
                .build();

        when(repository.findById(appId)).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(userRepository.save(user)).thenReturn(user);

        service.approveApplication(appId);
    }
}
