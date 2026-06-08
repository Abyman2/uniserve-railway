package uniconnect_backend.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uniconnect_backend.booking.dto.BookingResponse;
import uniconnect_backend.booking.dto.CreateBookingRequest;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository repository;
    private final UserRepository userRepository;
    private final ServiceListingRepository listingRepository;

    public BookingResponse createBooking(
            CreateBookingRequest request
    ) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ServiceListing listing =
                listingRepository.findById(request.getListingId())
                        .orElseThrow(() ->
                                new RuntimeException("Listing not found"));

        Booking booking = Booking.builder()
                .listing(listing)
                .buyer(buyer)
                .provider(listing.getProvider())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Booking saved = repository.save(booking);

        return mapToResponse(saved);
    }

    private BookingResponse mapToResponse(
            Booking booking
    ) {

        return BookingResponse.builder()
                .id(booking.getId())
                .listingTitle(booking.getListing().getTitle())
                .buyerName(booking.getBuyer().getFullName())
                .providerName(booking.getProvider().getFullName())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }
    public List<BookingResponse> getProviderBookings() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return repository.findByProviderId(provider.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public List<BookingResponse> getCustomerBookings() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return repository.findByBuyerId(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public BookingResponse acceptBooking(
            java.util.UUID bookingId
    ) {

        Booking booking = repository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.ACCEPTED);

        Booking updated = repository.save(booking);

        return mapToResponse(updated);
    }
    public BookingResponse rejectBooking(
            java.util.UUID bookingId
    ) {

        Booking booking = repository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.REJECTED);

        Booking updated = repository.save(booking);

        return mapToResponse(updated);
    }
}