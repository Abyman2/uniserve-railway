package uniconnect_backend.news.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NewsResponse {

    private UUID id;

    private String adminName;

    private String title;

    private String content;

    private String category;

    private LocalDateTime createdAt;
}