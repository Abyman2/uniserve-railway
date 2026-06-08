package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uniconnect_backend.booking.dto.CreateBookingRequest;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.booking.service.BookingService;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceListingRepository listingRepository;
    @InjectMocks
    private BookingService bookingService;

    private final User buyer = User.builder()
            .id(UUID.randomUUID())
            .email("buyer@uni.edu")
            .role(Role.CUSTOMER)
            .build();

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
    void acceptBooking_wrongProviderForbidden() {
        TestSecurity.loginAs("wrong@uni.edu", "SERVICE_PROVIDER");
        User wrongProvider = User.builder()
                .id(UUID.randomUUID())
                .email("wrong@uni.edu")
                .build();
        when(userRepository.findByEmail(wrongProvider.getEmail()))
                .thenReturn(Optional.of(wrongProvider));

        UUID bookingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder()
                .id(UUID.randomUUID())
                .provider(provider)
                .title("Service")
                .build();
        Booking booking = Booking.builder()
                .id(bookingId)
                .listing(listing)
                .buyer(buyer)
                .provider(provider)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.acceptBooking(bookingId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void createBooking_ownListingForbidden() {
        TestSecurity.loginAs(provider.getEmail(), "CUSTOMER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID listingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder()
                .id(listingId)
                .provider(provider)
                .title("Own")
                .build();
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));

        CreateBookingRequest request = new CreateBookingRequest();
        request.setListingId(listingId);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void cancelBooking_onlyBuyerCanCancel() {
        TestSecurity.loginAs(buyer.getEmail(), "CUSTOMER");
        when(userRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));

        UUID bookingId = UUID.randomUUID();
        ServiceListing listing = ServiceListing.builder().provider(provider).title("S").build();
        Booking booking = Booking.builder()
                .id(bookingId)
                .listing(listing)
                .buyer(buyer)
                .provider(provider)
                .status(BookingStatus.PENDING)
                .build();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        bookingService.cancelBooking(bookingId);
    }
}
