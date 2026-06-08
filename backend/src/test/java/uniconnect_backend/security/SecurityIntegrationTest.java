package uniconnect_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.listing.entity.ListingStatus;
import uniconnect_backend.listing.entity.ServiceListing;
import uniconnect_backend.listing.repository.ServiceListingRepository;
import uniconnect_backend.user.entity.Role;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ServiceListingRepository listingRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private UUID bookingId;

    @BeforeEach
    void seedBooking() {
        User providerOne = userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .fullName("Provider One")
                .email("provider1@uni.edu")
                .password(passwordEncoder.encode("password"))
                .role(Role.SERVICE_PROVIDER)
                .createdAt(LocalDateTime.now())
                .build());

        userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .fullName("Provider Two")
                .email("provider2@uni.edu")
                .password(passwordEncoder.encode("password"))
                .role(Role.SERVICE_PROVIDER)
                .createdAt(LocalDateTime.now())
                .build());

        User buyer = userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .fullName("Buyer")
                .email("buyer@uni.edu")
                .password(passwordEncoder.encode("password"))
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .build());

        ServiceListing listing = listingRepository.save(ServiceListing.builder()
                .provider(providerOne)
                .title("Tutoring")
                .description("Help")
                .category("Education")
                .price(BigDecimal.valueOf(20))
                .campus("Main")
                .status(ListingStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        Booking booking = bookingRepository.save(Booking.builder()
                .listing(listing)
                .buyer(buyer)
                .provider(providerOne)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build());

        bookingId = booking.getId();
    }

    @Test
    void protectedEndpointWithoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/bookings/customer"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@uni.edu", roles = "CUSTOMER")
    void adminEndpointWithWrongRole_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/test"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "provider2@uni.edu", roles = "SERVICE_PROVIDER")
    void acceptBooking_bola_returns403() throws Exception {
        mockMvc.perform(patch("/api/bookings/{id}/accept", bookingId))
                .andExpect(status().isForbidden());
    }
}
