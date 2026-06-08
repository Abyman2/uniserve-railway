package uniconnect_backend.listing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ListingResponse {

    private UUID id;

    private String providerName;

    private String title;

    private String description;

    private String category;

    private BigDecimal price;

    private String campus;

    private String status;

    private LocalDateTime createdAt;
}