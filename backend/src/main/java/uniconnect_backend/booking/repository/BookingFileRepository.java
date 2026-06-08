package uniconnect_backend.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uniconnect_backend.booking.entity.BookingFile;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingFileRepository extends JpaRepository<BookingFile, UUID> {
    List<BookingFile> findByBookingId(UUID bookingId);
}
