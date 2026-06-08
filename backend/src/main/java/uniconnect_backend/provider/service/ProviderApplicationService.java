package uniconnect_backend.provider.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.common.exception.ConflictException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.provider.dto.ProviderApplicationRequest;
import uniconnect_backend.provider.dto.ProviderApplicationResponse;
import uniconnect_backend.provider.entity.ApplicationStatus;
import uniconnect_backend.provider.entity.ProviderApplication;
import uniconnect_backend.provider.repository.ProviderApplicationRepository;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ProviderApplicationService.class);

    private final ProviderApplicationRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public ProviderApplicationResponse apply(ProviderApplicationRequest request) {
        User user = getCurrentUser();

        if (repository.existsByUserId(user.getId())) {
            throw new ConflictException("You have already submitted an application");
        }

        if (user.getRole() == Role.SERVICE_PROVIDER) {
            throw new ConflictException("You are already a service provider");
        }

        ProviderApplication application = ProviderApplication.builder()
                .user(user)
                .skills(request.getSkills())
                .portfolioLinks(request.getPortfolioLinks())
                .status(ApplicationStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        ProviderApplication saved = repository.save(application);
        log.info("Provider application submitted by {}", user.getEmail());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProviderApplicationResponse> getAllApplications() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProviderApplicationResponse approveApplication(UUID applicationId) {
        ProviderApplication application = repository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);
        User user = application.getUser();
        user.setRole(Role.SERVICE_PROVIDER);
        userRepository.save(user);

        ProviderApplication updated = repository.save(application);
        log.info("Application {} approved", applicationId);
        return mapToResponse(updated);
    }

    @Transactional
    public ProviderApplicationResponse rejectApplication(UUID applicationId) {
        ProviderApplication application = repository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(ApplicationStatus.REJECTED);
        ProviderApplication updated = repository.save(application);
        log.info("Application {} rejected", applicationId);
        return mapToResponse(updated);
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProviderApplicationResponse mapToResponse(ProviderApplication application) {
        return ProviderApplicationResponse.builder()
                .id(application.getId())
                .fullName(application.getUser().getFullName())
                .skills(application.getSkills())
                .portfolioLinks(application.getPortfolioLinks())
                .status(application.getStatus().name())
                .submittedAt(application.getSubmittedAt())
                .build();
    }
}
