package uniconnect_backend.review.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.review.entity.Review;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository
        extends JpaRepository<Review, UUID> {

    List<Review> findByProviderId(UUID providerId);
}