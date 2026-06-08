package uniconnect_backend.provider.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProviderApplicationResponse {

    private UUID id;

    private String fullName;

    private String skills;

    private String portfolioLinks;

    private String status;

    private LocalDateTime submittedAt;
}