package uniconnect_backend.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uniconnect_backend.booking.dto.BookingFileResponse;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingFile;
import uniconnect_backend.booking.repository.BookingFileRepository;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.notification.service.NotificationService;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingFileService {

    private final BookingFileRepository fileRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingFileResponse uploadFile(UUID bookingId, MultipartFile file) throws IOException {
        User provider = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getProvider().getId().equals(provider.getId())) {
            throw new ForbiddenException("Only the service provider can upload work files");
        }

        BookingFile bookingFile = BookingFile.builder()
                .id(UUID.randomUUID())
                .booking(booking)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .data(file.getBytes())
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(provider)
                .build();

        BookingFile saved = fileRepository.save(bookingFile);

        // Notify customer
        notificationService.createNotification(
                booking.getBuyer(),
                "Work Delivered",
                String.format("Provider %s has uploaded a file (%s) for your service: %s",
                        provider.getFullName(), file.getOriginalFilename(), booking.getListing().getTitle())
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingFileResponse> getBookingFiles(UUID bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isBuyer = booking.getBuyer().getId().equals(currentUser.getId());
        boolean isProvider = booking.getProvider().getId().equals(currentUser.getId());
        if (!isBuyer && !isProvider) {
            throw new ForbiddenException("You are not authorized to view files for this booking");
        }

        return fileRepository.findByBookingId(bookingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingFile downloadFile(UUID bookingId, UUID fileId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isBuyer = booking.getBuyer().getId().equals(currentUser.getId());
        boolean isProvider = booking.getProvider().getId().equals(currentUser.getId());
        if (!isBuyer && !isProvider) {
            throw new ForbiddenException("You are not authorized to download files for this booking");
        }

        return fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private BookingFileResponse mapToResponse(BookingFile file) {
        return BookingFileResponse.builder()
                .id(file.getId())
                .bookingId(file.getBooking().getId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .uploadedAt(file.getUploadedAt())
                .uploadedByName(file.getUploadedBy().getFullName())
                .build();
    }
}
