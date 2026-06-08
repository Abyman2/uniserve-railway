package uniconnect_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uniconnect_backend.provider.entity.ApplicationStatus;
import uniconnect_backend.provider.entity.ProviderApplication;
import uniconnect_backend.provider.repository.ProviderApplicationRepository;
import uniconnect_backend.provider.service.ProviderApplicationService;
import uniconnect_backend.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProviderApplicationServiceExtendedTest {

    @Mock
    private ProviderApplicationRepository repository;
    @Mock
    private uniconnect_backend.user.repository.UserRepository userRepository;
    @InjectMocks
    private ProviderApplicationService service;

    @Test
    void getAllApplications_returnsList() {
        User user = User.builder().id(UUID.randomUUID()).fullName("A").email("a@b.com").build();
        ProviderApplication app = ProviderApplication.builder()
                .id(UUID.randomUUID())
                .user(user)
                .skills("Java")
                .status(ApplicationStatus.PENDING)
                .build();
        when(repository.findAll()).thenReturn(List.of(app));

        assertThat(service.getAllApplications()).hasSize(1);
    }

    @Test
    void rejectApplication_success() {
        UUID appId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).fullName("A").build();
        ProviderApplication application = ProviderApplication.builder()
                .id(appId)
                .user(user)
                .skills("Java")
                .status(ApplicationStatus.PENDING)
                .build();
        when(repository.findById(appId)).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);

        assertThat(service.rejectApplication(appId).getStatus()).isEqualTo("REJECTED");
    }
}
