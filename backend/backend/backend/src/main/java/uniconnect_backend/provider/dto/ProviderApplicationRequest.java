package uniconnect_backend.provider.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProviderApplicationRequest {

    @NotBlank
    private String skills;

    private String portfolioLinks;
}