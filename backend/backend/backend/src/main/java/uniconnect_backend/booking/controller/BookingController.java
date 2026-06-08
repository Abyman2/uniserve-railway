package uniconnect_backend.booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.booking.dto.BookingResponse;
import uniconnect_backend.booking.dto.CreateBookingRequest;
import uniconnect_backend.booking.service.BookingService;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService service;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> createBooking(

            @Valid @RequestBody
            CreateBookingRequest request
    ) {

        return ResponseEntity.ok(
                service.createBooking(request)
        );
    }
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingResponse>>
    getCustomerBookings() {

        return ResponseEntity.ok(
                service.getCustomerBookings()
        );
    }
    @GetMapping("/provider")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<List<BookingResponse>>
    getProviderBookings() {

        return ResponseEntity.ok(
                service.getProviderBookings()
        );
    }
    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<BookingResponse>
    acceptBooking(

            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                service.acceptBooking(id)
        );
    }
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<BookingResponse>
    rejectBooking(

            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                service.rejectBooking(id)
        );
    }
}