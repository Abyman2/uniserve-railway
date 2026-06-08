package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uniconnect_backend.listing.dto.UpdateListingRequest;
import uniconnect_backend.listing.entity.ListingStatus;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.listing.service.ServiceListingService;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceListingServiceExtendedTest {

    @Mock
    private ServiceListingRepository repository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ServiceListingService service;

    private final User provider = User.builder()
            .id(UUID.randomUUID())
            .email("provider@uni.edu")
            .role(Role.SERVICE_PROVIDER)
            .build();

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void updateListing_success() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID listingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder()
                .id(listingId)
                .provider(provider)
                .title("Old")
                .description("Old desc")
                .category("Old")
                .price(BigDecimal.ONE)
                .campus("Old")
                .status(ListingStatus.ACTIVE)
                .build();
        when(repository.findById(listingId)).thenReturn(Optional.of(listing));
        when(repository.save(listing)).thenReturn(listing);

        UpdateListingRequest request = new UpdateListingRequest();
        request.setTitle("New");
        request.setDescription("New desc");
        request.setCategory("New");
        request.setPrice(BigDecimal.TEN);
        request.setCampus("New");

        assertThat(service.updateListing(listingId, request).getTitle()).isEqualTo("New");
    }

    @Test
    void getMyListings_returnsPage() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));
        when(repository.findByProviderId(provider.getId(), PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of()));

        assertThat(service.getMyListings(PageRequest.of(0, 10)).getTotalElements()).isZero();
    }
}
