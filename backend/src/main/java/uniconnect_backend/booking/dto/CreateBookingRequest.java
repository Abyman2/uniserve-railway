package uniconnect_backend.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateBookingRequest {

    @NotNull
    private UUID listingId;
}