package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uniconnect_backend.news.dto.CreateNewsRequest;
import uniconnect_backend.news.entity.NewsArticle;
import uniconnect_backend.news.repository.NewsRepository;
import uniconnect_backend.news.service.NewsService;
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
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private NewsService newsService;

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void createNews_success() {
        User admin = User.builder()
                .id(UUID.randomUUID())
                .email("admin@uni.edu")
                .fullName("Admin")
                .role(Role.ADMIN)
                .build();
        TestSecurity.loginAs(admin.getEmail(), "ADMIN");
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        CreateNewsRequest request = new CreateNewsRequest();
        request.setTitle("Campus Update");
        request.setContent("Details");
        request.setCategory("General");

        NewsArticle saved = NewsArticle.builder()
                .id(UUID.randomUUID())
                .admin(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .build();
        when(newsRepository.save(any(NewsArticle.class))).thenReturn(saved);

        assertThat(newsService.createNews(request).getTitle()).isEqualTo("Campus Update");
    }

    @Test
    void getAllNews_returnsPage() {
        when(newsRepository.findAll(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of()));
        assertThat(newsService.getAllNews(PageRequest.of(0, 10)).getTotalElements())
                .isZero();
    }
}
