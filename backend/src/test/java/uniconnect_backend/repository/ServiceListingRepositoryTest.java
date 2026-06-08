package uniconnect_backend.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import uniconnect_backend.listing.entity.ListingStatus;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ServiceListingRepositoryTest {

    @Autowired
    private ServiceListingRepository repository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByCategoryAndCampus_filtersResults() {
        User provider = persistUser("provider@uni.edu");
        ServiceListing match = persistListing(provider, "Education", "Main Campus");
        persistListing(provider, "Food", "North Campus");

        var page = repository.findByCategoryContainingIgnoreCaseAndCampusContainingIgnoreCase(
                "edu",
                "main",
                PageRequest.of(0, 10)
        );

        assertThat(page.getContent()).extracting(ServiceListing::getId)
                .containsExactly(match.getId());
    }

    @Test
    void findByProviderId_returnsOwnedListings() {
        User provider = persistUser("owner@uni.edu");
        ServiceListing listing = persistListing(provider, "Tech", "Main");

        var page = repository.findByProviderId(provider.getId(), PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().getFirst().getId()).isEqualTo(listing.getId());
    }

    private User persistUser(String email) {
        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email(email)
                .password("encoded")
                .role(Role.SERVICE_PROVIDER)
                .createdAt(LocalDateTime.now())
                .build();
        return entityManager.persistAndFlush(user);
    }

    private ServiceListing persistListing(User provider, String category, String campus) {
        ServiceListing listing = ServiceListing.builder()
                .provider(provider)
                .title("Service")
                .description("Description")
                .category(category)
                .price(BigDecimal.TEN)
                .campus(campus)
                .status(ListingStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        return entityManager.persistAndFlush(listing);
    }
}
