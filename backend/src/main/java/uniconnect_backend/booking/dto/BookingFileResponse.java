package uniconnect_backend.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingFileResponse {
    private UUID id;
    private UUID bookingId;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
}
