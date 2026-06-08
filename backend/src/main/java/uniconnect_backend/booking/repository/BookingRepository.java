package uniconnect_backend.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.booking.entity.Booking;

import java.util.List;
import java.util.UUID;

public interface BookingRepository
        extends JpaRepository<Booking, UUID> {

    List<Booking> findByBuyerId(UUID buyerId);

    List<Booking> findByProviderId(UUID providerId);
}