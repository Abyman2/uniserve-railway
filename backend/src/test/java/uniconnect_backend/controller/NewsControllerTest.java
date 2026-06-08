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
import uniconnect_backend.news.controller.NewsController;
import uniconnect_backend.news.dto.NewsResponse;
import uniconnect_backend.news.service.NewsService;
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
        controllers = NewsController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
@Import({GlobalExceptionHandler.class, MethodSecurityTestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class NewsControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private NewsService service;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getAllNews_returns200() throws Exception {
        when(service.getAllNews(any())).thenReturn(new PageImpl<>(List.of()));
        mockMvc.perform(get("/api/news")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createNews_returns201() throws Exception {
        when(service.createNews(any())).thenReturn(NewsResponse.builder()
                .id(UUID.randomUUID())
                .adminName("Admin")
                .title("Title")
                .content("Body")
                .category("General")
                .createdAt(LocalDateTime.now())
                .build());

        mockMvc.perform(post("/api/news")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Campus",
                                  "content": "Update body text",
                                  "category": "General"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createNews_wrongRole_returns403() throws Exception {
        mockMvc.perform(post("/api/news")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Campus",
                                  "content": "Update body text",
                                  "category": "General"
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}
