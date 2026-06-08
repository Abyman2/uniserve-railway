package uniconnect_backend.message.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {
    private UUID bookingId;

    @NotBlank
    private String content;
}
