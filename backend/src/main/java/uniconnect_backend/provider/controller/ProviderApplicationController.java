package uniconnect_backend.provider.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.provider.dto.ProviderApplicationRequest;
import uniconnect_backend.provider.dto.ProviderApplicationResponse;
import uniconnect_backend.provider.service.ProviderApplicationService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/provider-applications")
@RequiredArgsConstructor
public class ProviderApplicationController {

    private final ProviderApplicationService service;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ProviderApplicationResponse> apply(
            @Valid @RequestBody ProviderApplicationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.apply(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProviderApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(service.getAllApplications());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProviderApplicationResponse> approveApplication(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.approveApplication(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProviderApplicationResponse> rejectApplication(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.rejectApplication(id));
    }
}
