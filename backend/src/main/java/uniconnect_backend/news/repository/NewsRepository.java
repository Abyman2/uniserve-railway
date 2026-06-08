package uniconnect_backend.news.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.news.entity.NewsArticle;

import java.util.UUID;

public interface NewsRepository
        extends JpaRepository<NewsArticle, UUID> {
}
