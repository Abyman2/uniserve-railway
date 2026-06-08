package uniconnect_backend.review.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReviewRequest {

    @NotNull
    private UUID bookingId;

    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}