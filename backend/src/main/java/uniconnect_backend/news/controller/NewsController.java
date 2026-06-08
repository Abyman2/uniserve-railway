package uniconnect_backend.news.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.news.dto.CreateNewsRequest;
import uniconnect_backend.news.dto.NewsResponse;
import uniconnect_backend.news.service.NewsService;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NewsResponse> createNews(
            @Valid @RequestBody CreateNewsRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createNews(request));
    }

    @GetMapping
    public ResponseEntity<Page<NewsResponse>> getAllNews(Pageable pageable) {
        return ResponseEntity.ok(service.getAllNews(pageable));
    }
}
