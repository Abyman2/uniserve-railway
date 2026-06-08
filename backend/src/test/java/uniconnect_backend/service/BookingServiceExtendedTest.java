package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.booking.service.BookingService;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceExtendedTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private uniconnect_backend.listing.repository.ServiceListingRepository listingRepository;
    @InjectMocks
    private BookingService bookingService;

    private final User provider = User.builder()
            .id(UUID.randomUUID())
            .email("provider@uni.edu")
            .fullName("Provider")
            .role(Role.SERVICE_PROVIDER)
            .build();

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void acceptBooking_success() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID bookingId = UUID.randomUUID();
        Booking booking = booking(bookingId, BookingStatus.PENDING);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        assertThat(bookingService.acceptBooking(bookingId).getStatus()).isEqualTo("ACCEPTED");
    }

    @Test
    void completeBooking_success() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID bookingId = UUID.randomUUID();
        Booking booking = booking(bookingId, BookingStatus.ACCEPTED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        assertThat(bookingService.completeBooking(bookingId).getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    void rejectBooking_success() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));

        UUID bookingId = UUID.randomUUID();
        Booking booking = booking(bookingId, BookingStatus.PENDING);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        assertThat(bookingService.rejectBooking(bookingId).getStatus()).isEqualTo("REJECTED");
    }

    @Test
    void getProviderBookings_returnsList() {
        TestSecurity.loginAs(provider.getEmail(), "SERVICE_PROVIDER");
        when(userRepository.findByEmail(provider.getEmail())).thenReturn(Optional.of(provider));
        when(bookingRepository.findByProviderId(provider.getId()))
                .thenReturn(List.of(booking(UUID.randomUUID(), BookingStatus.PENDING)));

        assertThat(bookingService.getProviderBookings()).hasSize(1);
    }

    private Booking booking(UUID id, BookingStatus status) {
        ServiceListing listing = ServiceListing.builder()
                .id(UUID.randomUUID())
                .provider(provider)
                .title("Tutoring")
                .build();
        return Booking.builder()
                .id(id)
                .listing(listing)
                .buyer(User.builder().id(UUID.randomUUID()).fullName("Buyer").build())
                .provider(provider)
                .status(status)
                .build();
    }
}
