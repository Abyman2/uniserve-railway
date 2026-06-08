package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.listing.dto.CreateListingRequest;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceListingServiceTest {

    @Mock
    private ServiceListingRepository repository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ServiceListingService service;

    private final UUID providerId = UUID.randomUUID();
    private final User provider = User.builder()
            .id(providerId)
            .email("provider@uni.edu")
            .fullName("Provider")
            .role(Role.SERVICE_PROVIDER)
            .build();

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void createListing_success() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        CreateListingRequest request = new CreateListingRequest();
        request.setTitle("Tutoring");
        request.setDescription("Math help");
        request.setCategory("Education");
        request.setPrice(BigDecimal.TEN);
        request.setCampus("Main");

        ServiceListing saved = ServiceListing.builder()
                .id(UUID.randomUUID())
                .provider(provider)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .campus(request.getCampus())
                .status(ListingStatus.ACTIVE)
                .build();

        when(repository.save(any(ServiceListing.class))).thenReturn(saved);

        assertThat(service.createListing(request).getTitle()).isEqualTo("Tutoring");
    }

    @Test
    void getListingById_notFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getListingById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateListing_wrongOwnerForbidden() {
        TestSecurity.loginAs("other@uni.edu", "SERVICE_PROVIDER");
        User other = User.builder().id(UUID.randomUUID()).email("other@uni.edu").build();
        when(userRepository.findByEmail(other.getEmail())).thenReturn(Optional.of(other));

        UUID listingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder()
                .id(listingId)
                .provider(provider)
                .title("Old")
                .build();
        when(repository.findById(listingId)).thenReturn(Optional.of(listing));

        UpdateListingRequest request = new UpdateListingRequest();
        request.setTitle("New");
        request.setDescription("Desc");
        request.setCategory("Cat");
        request.setPrice(BigDecimal.ONE);
        request.setCampus("Campus");

        assertThatThrownBy(() -> service.updateListing(listingId, request))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void getAllListings_returnsPage() {
        ServiceListing listing = ServiceListing.builder()
                .id(UUID.randomUUID())
                .provider(provider)
                .title("T")
                .description("D")
                .category("C")
                .price(BigDecimal.ONE)
                .campus("Main")
                .status(ListingStatus.ACTIVE)
                .build();

        when(repository.findByCategoryContainingIgnoreCaseAndCampusContainingIgnoreCase(
                "", "", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(listing)));

        assertThat(service.getAllListings("", "", PageRequest.of(0, 10)).getTotalElements())
                .isEqualTo(1);
    }

    @Test
    void deleteListing_deactivatesOwnedListing() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID listingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder()
                .id(listingId)
                .provider(provider)
                .status(ListingStatus.ACTIVE)
                .build();
        when(repository.findById(listingId)).thenReturn(Optional.of(listing));

        service.deleteListing(listingId);
        verify(repository).save(listing);
        assertThat(listing.getStatus()).isEqualTo(ListingStatus.INACTIVE);
    }
}
