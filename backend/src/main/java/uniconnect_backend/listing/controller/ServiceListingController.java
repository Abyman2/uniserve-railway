package uniconnect_backend.listing.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.listing.dto.CreateListingRequest;
import uniconnect_backend.listing.dto.ListingResponse;
import uniconnect_backend.listing.dto.UpdateListingRequest;
import uniconnect_backend.listing.service.ServiceListingService;

import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ServiceListingController {

    private final ServiceListingService service;

    @PostMapping
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ListingResponse> createListing(
            @Valid @RequestBody CreateListingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createListing(request));
    }

    @GetMapping
    public ResponseEntity<Page<ListingResponse>> getAllListings(
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String campus,
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.getAllListings(category, campus, pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<Page<ListingResponse>> getMyListings(Pageable pageable) {
        return ResponseEntity.ok(service.getMyListings(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getListingById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateListingRequest request
    ) {
        return ResponseEntity.ok(service.updateListing(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id) {
        service.deleteListing(id);
        return ResponseEntity.noContent().build();
    }
}
