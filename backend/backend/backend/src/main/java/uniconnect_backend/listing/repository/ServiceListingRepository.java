package uniconnect_backend.listing.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.listing.entity.ServiceListing;

import java.util.UUID;

public interface ServiceListingRepository
        extends JpaRepository<ServiceListing, UUID> {

    Page<ServiceListing> findByCategoryContainingIgnoreCaseAndCampusContainingIgnoreCase(
            String category,
            String campus,
            Pageable pageable
    );
}