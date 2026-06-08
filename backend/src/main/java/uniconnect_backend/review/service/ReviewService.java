package uniconnect_backend.review.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.common.exception.ConflictException;
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.review.dto.CreateReviewRequest;
import uniconnect_backend.review.dto.ReviewResponse;
import uniconnect_backend.review.entity.Review;
import uniconnect_backend.review.repository.ReviewRepository;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository repository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        User reviewer = getCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getBuyer().getId().equals(reviewer.getId())) {
            throw new ForbiddenException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ForbiddenException("You can only review completed bookings");
        }

        if (repository.existsByBookingId(booking.getId())) {
            throw new ConflictException("A review already exists for this booking");
        }

        Review review = Review.builder()
                .booking(booking)
                .reviewer(reviewer)
                .provider(booking.getProvider())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        log.info("Review created for booking {}", booking.getId());
        return mapToResponse(repository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProvider(UUID providerId) {
        if (!userRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider not found");
        }
        return repository.findByProviderId(providerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .reviewerName(review.getReviewer().getFullName())
                .providerName(review.getProvider().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
