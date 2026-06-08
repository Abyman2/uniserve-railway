package uniconnect_backend.booking.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.booking.dto.BookingResponse;
import uniconnect_backend.booking.dto.CreateBookingRequest;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.entity.PaymentStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.notification.service.NotificationService;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository repository;
    private final UserRepository userRepository;
    private final ServiceListingRepository listingRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User buyer = getCurrentUser();

        ServiceListing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getProvider().getId().equals(buyer.getId())) {
            throw new ForbiddenException("You cannot book your own listing");
        }

        Booking booking = Booking.builder()
                .listing(listing)
                .buyer(buyer)
                .provider(listing.getProvider())
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .price(listing.getPrice())
                .createdAt(LocalDateTime.now())
                .build();

        Booking saved = repository.save(booking);

        notificationService.createNotification(
                booking.getProvider(),
                "New Booking Request",
                String.format("You have a new booking request for your service: %s from customer: %s",
                        listing.getTitle(), buyer.getFullName())
        );

        log.info("Booking created by {}", buyer.getEmail());
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse payBooking(UUID bookingId) {
        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User customer = getCurrentUser();
        if (!booking.getBuyer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You do not own this booking");
        }

        if (booking.getPaymentStatus() != PaymentStatus.UNPAID) {
            throw new ForbiddenException("Booking is already paid or completed");
        }

        BigDecimal price = booking.getPrice();
        if (customer.getBalance().compareTo(price) < 0) {
            throw new ForbiddenException("Insufficient wallet balance. Please deposit fake money.");
        }

        customer.setBalance(customer.getBalance().subtract(price));
        userRepository.save(customer);

        booking.setPaymentStatus(PaymentStatus.ESCROWED);
        Booking saved = repository.save(booking);

        notificationService.createNotification(
                booking.getProvider(),
                "Funds Escrowed",
                String.format("Customer %s has funded %s ETB in escrow for your service: %s",
                        customer.getFullName(), price, booking.getListing().getTitle())
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getProviderBookings() {
        User provider = getCurrentUser();
        return repository.findByProviderId(provider.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings() {
        User customer = getCurrentUser();
        return repository.findByBuyerId(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse acceptBooking(UUID bookingId) {
        Booking booking = getBookingForProvider(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ForbiddenException("Only pending bookings can be accepted");
        }
        booking.setStatus(BookingStatus.ACCEPTED);
        Booking saved = repository.save(booking);

        notificationService.createNotification(
                booking.getBuyer(),
                "Booking Accepted",
                String.format("Your booking for service: %s has been accepted by provider: %s",
                        booking.getListing().getTitle(), booking.getProvider().getFullName())
        );

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(UUID bookingId) {
        Booking booking = getBookingForProvider(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ForbiddenException("Only pending bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);

        if (booking.getPaymentStatus() == PaymentStatus.ESCROWED) {
            User buyer = booking.getBuyer();
            buyer.setBalance(buyer.getBalance().add(booking.getPrice()));
            userRepository.save(buyer);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        Booking saved = repository.save(booking);

        notificationService.createNotification(
                booking.getBuyer(),
                "Booking Rejected",
                String.format("Your booking for service: %s was rejected by the provider.",
                        booking.getListing().getTitle())
        );

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse completeBooking(UUID bookingId) {
        Booking booking = getBookingForProvider(bookingId);
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ForbiddenException("Only accepted bookings can be completed");
        }
        booking.setStatus(BookingStatus.COMPLETED);

        if (booking.getPaymentStatus() == PaymentStatus.ESCROWED) {
            User provider = booking.getProvider();
            provider.setBalance(provider.getBalance().add(booking.getPrice()));
            userRepository.save(provider);
            booking.setPaymentStatus(PaymentStatus.RELEASED);
        }

        Booking saved = repository.save(booking);
        log.info("Booking {} completed", bookingId);

        notificationService.createNotification(
                booking.getBuyer(),
                "Booking Completed",
                String.format("Provider %s has marked the service: %s as completed.",
                        booking.getProvider().getFullName(), booking.getListing().getTitle())
        );

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId) {
        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User customer = getCurrentUser();
        if (!booking.getBuyer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You do not own this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ForbiddenException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        if (booking.getPaymentStatus() == PaymentStatus.ESCROWED) {
            customer.setBalance(customer.getBalance().add(booking.getPrice()));
            userRepository.save(customer);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        Booking saved = repository.save(booking);

        notificationService.createNotification(
                booking.getProvider(),
                "Booking Cancelled",
                String.format("Booking for service: %s was cancelled by customer: %s.",
                        booking.getListing().getTitle(), customer.getFullName())
        );

        return mapToResponse(saved);
    }

    private Booking getBookingForProvider(UUID bookingId) {
        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User provider = getCurrentUser();
        if (!booking.getProvider().getId().equals(provider.getId())) {
            throw new ForbiddenException("You do not own this booking");
        }
        return booking;
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .listingTitle(booking.getListing().getTitle())
                .buyerName(booking.getBuyer().getFullName())
                .providerName(booking.getProvider().getFullName())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : null)
                .price(booking.getPrice())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
