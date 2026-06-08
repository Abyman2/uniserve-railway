package uniconnect_backend.message.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.message.dto.MessageResponse;
import uniconnect_backend.message.dto.SendMessageRequest;
import uniconnect_backend.message.service.MessageService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // Send a message in a booking thread
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(request));
    }

    // Get all messages for a booking
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable UUID bookingId
    ) {
        return ResponseEntity.ok(messageService.getMessages(bookingId));
    }
}
