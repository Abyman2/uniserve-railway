package uniconnect_backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import uniconnect_backend.booking.controller.BookingController;
import uniconnect_backend.booking.dto.BookingResponse;
import uniconnect_backend.booking.service.BookingService;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.GlobalExceptionHandler;
import uniconnect_backend.config.MethodSecurityTestConfig;
import uniconnect_backend.security.JwtAuthenticationFilter;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = BookingController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import({GlobalExceptionHandler.class, MethodSecurityTestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private BookingService service;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createBooking_returns201() throws Exception {
        when(service.createBooking(any())).thenReturn(sampleBooking());

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listingId": "%s"}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "SERVICE_PROVIDER")
    void createBooking_wrongRole_returns403() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listingId": "%s"}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SERVICE_PROVIDER")
    void acceptBooking_bola_returns403() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.acceptBooking(id))
                .thenThrow(new ForbiddenException("You do not own this booking"));

        mockMvc.perform(patch("/api/bookings/{id}/accept", id))
                .andExpect(status().isForbidden());
    }

    private BookingResponse sampleBooking() {
        return BookingResponse.builder()
                .id(UUID.randomUUID())
                .listingTitle("Tutoring")
                .buyerName("Buyer")
                .providerName("Provider")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
    }
}
