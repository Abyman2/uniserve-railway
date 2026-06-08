package uniconnect_backend.review.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {

    private UUID id;

    private String reviewerName;

    private String providerName;

    private Integer rating;

    private String comment;

    private LocalDateTime createdAt;
}