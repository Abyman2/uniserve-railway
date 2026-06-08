package uniconnect_backend.provider.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uniconnect_backend.provider.dto.ProviderApplicationRequest;
import uniconnect_backend.provider.dto.ProviderApplicationResponse;
import uniconnect_backend.provider.entity.ApplicationStatus;
import uniconnect_backend.provider.entity.ProviderApplication;
import uniconnect_backend.provider.repository.ProviderApplicationRepository;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderApplicationService {

    private final ProviderApplicationRepository repository;
    private final UserRepository userRepository;

    public ProviderApplicationResponse apply(
            ProviderApplicationRequest request
    ){

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ProviderApplication application =
                ProviderApplication.builder()
                        .user(user)
                        .skills(request.getSkills())
                        .portfolioLinks(request.getPortfolioLinks())
                        .status(ApplicationStatus.PENDING)
                        .submittedAt(LocalDateTime.now())
                        .build();

        ProviderApplication saved = repository.save(application);

        return ProviderApplicationResponse.builder()
                .id(saved.getId())
                .fullName(saved.getUser().getFullName())
                .skills(saved.getSkills())
                .portfolioLinks(saved.getPortfolioLinks())
                .status(saved.getStatus().name())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }
    public List<ProviderApplicationResponse> getAllApplications() {

        return repository.findAll()
                .stream()
                .map(application ->
                        ProviderApplicationResponse.builder()
                                .id(application.getId())
                                .fullName(application.getUser().getFullName())
                                .skills(application.getSkills())
                                .portfolioLinks(application.getPortfolioLinks())
                                .status(application.getStatus().name())
                                .submittedAt(application.getSubmittedAt())
                                .build()
                )
                .collect(Collectors.toList());
    }
    public ProviderApplicationResponse approveApplication(
            java.util.UUID applicationId
    ) {

        ProviderApplication application =
                repository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);

        User user = application.getUser();

        user.setRole(
                uniconnect_backend.user.entity.Role.SERVICE_PROVIDER
        );

        userRepository.save(user);

        ProviderApplication updated = repository.save(application);

        return ProviderApplicationResponse.builder()
                .id(updated.getId())
                .fullName(updated.getUser().getFullName())
                .skills(updated.getSkills())
                .portfolioLinks(updated.getPortfolioLinks())
                .status(updated.getStatus().name())
                .submittedAt(updated.getSubmittedAt())
                .build();
    }
    public ProviderApplicationResponse rejectApplication(
            java.util.UUID applicationId
    ) {

        ProviderApplication application =
                repository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.REJECTED);

        ProviderApplication updated = repository.save(application);

        return ProviderApplicationResponse.builder()
                .id(updated.getId())
                .fullName(updated.getUser().getFullName())
                .skills(updated.getSkills())
                .portfolioLinks(updated.getPortfolioLinks())
                .status(updated.getStatus().name())
                .submittedAt(updated.getSubmittedAt())
                .build();
    }
}