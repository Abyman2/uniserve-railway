package uniconnect_backend.listing.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.listing.dto.CreateListingRequest;
import uniconnect_backend.listing.dto.ListingResponse;
import uniconnect_backend.listing.service.ServiceListingService;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ServiceListingController {

    private final ServiceListingService service;

    @PostMapping
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ListingResponse> createListing(

            @Valid @RequestBody
            CreateListingRequest request
    ) {

        return ResponseEntity.ok(
                service.createListing(request)
        );
    }

    @GetMapping
    public ResponseEntity<Page<ListingResponse>> getAllListings(

            @RequestParam(defaultValue = "")
            String category,

            @RequestParam(defaultValue = "")
            String campus,

            Pageable pageable
    ) {

        return ResponseEntity.ok(
                service.getAllListings(
                        category,
                        campus,
                        pageable
                )
        );
    }
}