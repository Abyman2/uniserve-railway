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
import uniconnect_backend.provider.controller.ProviderApplicationController;
import uniconnect_backend.provider.dto.ProviderApplicationResponse;
import uniconnect_backend.provider.service.ProviderApplicationService;
import uniconnect_backend.security.JwtAuthenticationFilter;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ProviderApplicationController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import({GlobalExceptionHandler.class, MethodSecurityTestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ProviderApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ProviderApplicationService service;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void apply_returns201() throws Exception {
        when(service.apply(any())).thenReturn(sample());

        mockMvc.perform(post("/api/provider-applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"skills": "Java, Spring"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void apply_wrongRole_returns403() throws Exception {
        mockMvc.perform(post("/api/provider-applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"skills": "Java"}
                                """))
                .andExpect(status().isForbidden());
    }

    private ProviderApplicationResponse sample() {
        return ProviderApplicationResponse.builder()
                .id(UUID.randomUUID())
                .fullName("User")
                .skills("Java")
                .status("PENDING")
                .submittedAt(LocalDateTime.now())
                .build();
    }
}
