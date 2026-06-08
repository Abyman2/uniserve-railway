package uniconnect_backend.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.review.dto.CreateReviewRequest;
import uniconnect_backend.review.dto.ReviewResponse;
import uniconnect_backend.review.entity.Review;
import uniconnect_backend.review.repository.ReviewRepository;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewResponse createReview(
            CreateReviewRequest request
    ) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Booking booking =
                bookingRepository.findById(request.getBookingId())
                        .orElseThrow(() ->
                                new RuntimeException("Booking not found"));

        Review review = Review.builder()
                .booking(booking)
                .reviewer(reviewer)
                .provider(booking.getProvider())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = repository.save(review);

        return mapToResponse(saved);
    }

    private ReviewResponse mapToResponse(
            Review review
    ) {

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