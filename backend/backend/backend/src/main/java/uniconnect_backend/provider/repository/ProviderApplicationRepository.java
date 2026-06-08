package uniconnect_backend.provider.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.provider.entity.ProviderApplication;

import java.util.UUID;

public interface ProviderApplicationRepository
        extends JpaRepository<ProviderApplication, UUID> {
}