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
import uniconnect_backend.common.exception.GlobalExceptionHandler;
import uniconnect_backend.config.MethodSecurityTestConfig;
import uniconnect_backend.review.controller.ReviewController;
import uniconnect_backend.review.dto.ReviewResponse;
import uniconnect_backend.review.service.ReviewService;
import uniconnect_backend.security.JwtAuthenticationFilter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ReviewController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import({GlobalExceptionHandler.class, MethodSecurityTestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ReviewService service;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getReviewsByProvider_returns200() throws Exception {
        UUID providerId = UUID.randomUUID();
        when(service.getReviewsByProvider(providerId)).thenReturn(List.of());

        mockMvc.perform(get("/api/reviews/provider/{providerId}", providerId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createReview_returns201() throws Exception {
        when(service.createReview(any())).thenReturn(sampleReview());

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 5,
                                  "comment": "Great"
                                }
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isCreated());
    }

    private ReviewResponse sampleReview() {
        return ReviewResponse.builder()
                .id(UUID.randomUUID())
                .reviewerName("Buyer")
                .providerName("Provider")
                .rating(5)
                .comment("Great")
                .createdAt(LocalDateTime.now())
                .build();
    }
}
