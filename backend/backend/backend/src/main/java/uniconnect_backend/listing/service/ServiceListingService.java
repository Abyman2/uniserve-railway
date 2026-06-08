package uniconnect_backend.listing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uniconnect_backend.listing.dto.CreateListingRequest;
import uniconnect_backend.listing.dto.ListingResponse;
import uniconnect_backend.listing.entity.ListingStatus;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ServiceListingService {

    private final ServiceListingRepository repository;
    private final UserRepository userRepository;

    public ListingResponse createListing(
            CreateListingRequest request
    ) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

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

        ServiceListing saved = repository.save(listing);

        return mapToResponse(saved);
    }

    public Page<ListingResponse> getAllListings(
            String category,
            String campus,
            Pageable pageable
    ) {

        Page<ServiceListing> listings =
                repository
                        .findByCategoryContainingIgnoreCaseAndCampusContainingIgnoreCase(
                                category,
                                campus,
                                pageable
                        );

        return listings.map(this::mapToResponse);
    }

    private ListingResponse mapToResponse(
            ServiceListing listing
    ) {

        return ListingResponse.builder()
                .id(listing.getId())
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