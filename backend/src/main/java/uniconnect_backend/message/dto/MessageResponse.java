package uniconnect_backend.message.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageResponse {
    private UUID id;
    private UUID bookingId;
    private UUID senderId;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;
}
