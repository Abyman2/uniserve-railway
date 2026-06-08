package uniconnect_backend.news.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.news.dto.CreateNewsRequest;
import uniconnect_backend.news.dto.NewsResponse;
import uniconnect_backend.news.entity.NewsArticle;
import uniconnect_backend.news.repository.NewsRepository;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NewsService {

    private static final Logger log = LoggerFactory.getLogger(NewsService.class);

    private final NewsRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public NewsResponse createNews(CreateNewsRequest request) {
        User admin = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NewsArticle news = NewsArticle.builder()
                .admin(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .createdAt(LocalDateTime.now())
                .build();

        NewsArticle saved = repository.save(news);
        log.info("News article created by {}", admin.getEmail());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<NewsResponse> getAllNews(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponse);
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
