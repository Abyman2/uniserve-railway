package uniconnect_backend.news.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uniconnect_backend.news.dto.CreateNewsRequest;
import uniconnect_backend.news.dto.NewsResponse;
import uniconnect_backend.news.entity.NewsArticle;
import uniconnect_backend.news.repository.NewsRepository;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository repository;
    private final UserRepository userRepository;

    public NewsResponse createNews(CreateNewsRequest request) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        NewsArticle news = NewsArticle.builder()
                .admin(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .createdAt(LocalDateTime.now())
                .build();

        NewsArticle saved = repository.save(news);

        return mapToResponse(saved);
    }

    public Page<NewsResponse> getAllNews(Pageable pageable) {

        return repository.findAll(pageable)
                .map(this::mapToResponse);
    }

    private NewsResponse mapToResponse(NewsArticle news) {

        return NewsResponse.builder()
                .id(news.getId())
                .adminName(news.getAdmin().getFullName())
                .title(news.getTitle())
                .content(news.getContent())
                .category(news.getCategory())
                .createdAt(news.getCreatedAt())
                .build();
    }
}