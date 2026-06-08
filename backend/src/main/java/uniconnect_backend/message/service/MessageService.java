package uniconnect_backend.message.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.message.dto.MessageResponse;
import uniconnect_backend.message.dto.SendMessageRequest;
import uniconnect_backend.message.entity.Message;
import uniconnect_backend.message.repository.MessageRepository;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        User sender = getCurrentUser();
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only the buyer or provider of this booking can send messages
        boolean isBuyer = booking.getBuyer().getId().equals(sender.getId());
        boolean isProvider = booking.getProvider().getId().equals(sender.getId());
        if (!isBuyer && !isProvider) {
            throw new ForbiddenException("You are not a participant in this booking");
        }

        Message message = Message.builder()
                .booking(booking)
                .sender(sender)
                .content(request.getContent().trim())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(UUID bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only buyer or provider can read messages
        boolean isBuyer = booking.getBuyer().getId().equals(currentUser.getId());
        boolean isProvider = booking.getProvider().getId().equals(currentUser.getId());
        if (!isBuyer && !isProvider) {
            throw new ForbiddenException("You are not a participant in this booking");
        }

        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private MessageResponse mapToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .bookingId(message.getBooking().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
