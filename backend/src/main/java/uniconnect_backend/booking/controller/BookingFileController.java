package uniconnect_backend.booking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uniconnect_backend.booking.dto.BookingFileResponse;
import uniconnect_backend.booking.entity.BookingFile;
import uniconnect_backend.booking.service.BookingFileService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings/{bookingId}/delivery")
@RequiredArgsConstructor
public class BookingFileController {

    private final BookingFileService fileService;

    @PostMapping
    public ResponseEntity<BookingFileResponse> uploadFile(
            @PathVariable UUID bookingId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileService.uploadFile(bookingId, file));
    }

    @GetMapping
    public ResponseEntity<List<BookingFileResponse>> getFiles(
            @PathVariable UUID bookingId
    ) {
        return ResponseEntity.ok(fileService.getBookingFiles(bookingId));
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable UUID bookingId,
            @PathVariable UUID fileId
    ) {
        BookingFile file = fileService.downloadFile(bookingId, fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(file.getData());
    }
}
