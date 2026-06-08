package uniconnect_backend.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {

    private UUID id;

    private String listingTitle;

    private String buyerName;

    private String providerName;

    private String status;

    private String paymentStatus;

    private BigDecimal price;

    private LocalDateTime createdAt;
}