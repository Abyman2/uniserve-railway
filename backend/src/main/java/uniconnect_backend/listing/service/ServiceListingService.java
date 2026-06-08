package uniconnect_backend.listing.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.listing.dto.CreateListingRequest;
import uniconnect_backend.listing.dto.ListingResponse;
import uniconnect_backend.listing.dto.UpdateListingRequest;
import uniconnect_backend.listing.entity.ListingStatus;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceListingService {

    private static final Logger log = LoggerFactory.getLogger(ServiceListingService.class);

    private final ServiceListingRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        User provider = getCurrentUser();
        log.info("Creating listing for provider {}", provider.getEmail());

        ServiceListing listing = ServiceListing.builder()
                .provider(provider)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .campus(request.getCampus())
                .status(ListingStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(repository.save(listing));
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> getAllListings(
            String category,
            String campus,
            Pageable pageable
    ) {
        return repository
                .findByCategoryContainingIgnoreCaseAndCampusContainingIgnoreCase(
                        category,
                        campus,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(UUID id) {
        ServiceListing listing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        return mapToResponse(listing);
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> getMyListings(Pageable pageable) {
        User provider = getCurrentUser();
        return repository.findByProviderId(provider.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ListingResponse updateListing(UUID id, UpdateListingRequest request) {
        ServiceListing listing = getOwnedListing(id);
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setPrice(request.getPrice());
        listing.setCampus(request.getCampus());
        log.info("Updated listing {}", id);
        return mapToResponse(repository.save(listing));
    }

    @Transactional
    public void deleteListing(UUID id) {
        ServiceListing listing = getOwnedListing(id);
        listing.setStatus(ListingStatus.INACTIVE);
        repository.save(listing);
        log.info("Deactivated listing {}", id);
    }

    private ServiceListing getOwnedListing(UUID id) {
        ServiceListing listing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        User currentUser = getCurrentUser();
        if (!listing.getProvider().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not own this listing");
        }
        return listing;
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ListingResponse mapToResponse(ServiceListing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .providerId(listing.getProvider().getId())
                .providerName(listing.getProvider().getFullName())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory())
                .price(listing.getPrice())
                .campus(listing.getCampus())
                .status(listing.getStatus().name())
                .createdAt(listing.getCreatedAt())
                .build();
    }
}
