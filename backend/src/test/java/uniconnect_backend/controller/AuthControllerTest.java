package uniconnect_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import uniconnect_backend.auth.controller.AuthController;
import uniconnect_backend.auth.dto.AuthResponse;
import uniconnect_backend.auth.service.AuthService;
import uniconnect_backend.common.exception.ConflictException;
import uniconnect_backend.common.exception.GlobalExceptionHandler;
import uniconnect_backend.security.JwtAuthenticationFilter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private AuthService authService;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void register_returns201() throws Exception {
        when(authService.register(any())).thenReturn(
                AuthResponse.builder().message("ok").build());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Test",
                                  "email": "a@b.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void register_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Test",
                                  "email": "not-an-email",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_returns200() throws Exception {
        when(authService.login(any())).thenReturn(
                AuthResponse.builder().token("jwt").message("ok").build());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "a@b.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void register_conflict_returns409() throws Exception {
        when(authService.register(any()))
                .thenThrow(new ConflictException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Test",
                                  "email": "a@b.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isConflict());
    }
}
