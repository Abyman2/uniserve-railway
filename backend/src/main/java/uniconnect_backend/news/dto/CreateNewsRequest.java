package uniconnect_backend.news.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNewsRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String category;
}