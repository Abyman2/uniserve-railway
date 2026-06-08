package uniconnect_backend.message.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uniconnect_backend.message.entity.Message;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByBookingIdOrderByCreatedAtAsc(UUID bookingId);
}
