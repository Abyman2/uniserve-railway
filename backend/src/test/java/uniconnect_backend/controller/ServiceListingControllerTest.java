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
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import uniconnect_backend.common.exception.GlobalExceptionHandler;
import uniconnect_backend.config.MethodSecurityTestConfig;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.listing.controller.ServiceListingController;
import uniconnect_backend.listing.dto.ListingResponse;
import uniconnect_backend.listing.service.ServiceListingService;
import uniconnect_backend.security.JwtAuthenticationFilter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ServiceListingController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import({GlobalExceptionHandler.class, MethodSecurityTestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ServiceListingControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ServiceListingService service;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getAllListings_returns200() throws Exception {
        when(service.getAllListings(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk());
    }

    @Test
    void getListingById_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.getListingById(id)).thenReturn(sampleListing(id));

        mockMvc.perform(get("/api/listings/{id}", id))
                .andExpect(status().isOk());
    }

    @Test
    void getListingById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.getListingById(id))
                .thenThrow(new ResourceNotFoundException("Listing not found"));

        mockMvc.perform(get("/api/listings/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SERVICE_PROVIDER")
    void createListing_returns201() throws Exception {
        when(service.createListing(any())).thenReturn(sampleListing(UUID.randomUUID()));

        mockMvc.perform(post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Tutoring",
                                  "description": "Math tutoring sessions",
                                  "category": "Education",
                                  "price": 25.00,
                                  "campus": "Main"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createListing_wrongRole_returns403() throws Exception {
        mockMvc.perform(post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Tutoring",
                                  "description": "Math tutoring sessions",
                                  "category": "Education",
                                  "price": 25.00,
                                  "campus": "Main"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    private ListingResponse sampleListing(UUID id) {
        return ListingResponse.builder()
                .id(id)
                .providerName("Provider")
                .title("Tutoring")
                .description("Desc")
                .category("Education")
                .price(BigDecimal.TEN)
                .campus("Main")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
    }
}
