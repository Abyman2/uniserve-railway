package uniconnect_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uniconnect_backend.booking.entity.Booking;
import uniconnect_backend.booking.entity.BookingStatus;
import uniconnect_backend.booking.repository.BookingRepository;
import uniconnect_backend.review.entity.Review;
import uniconnect_backend.review.repository.ReviewRepository;
import uniconnect_backend.review.service.ReviewService;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceExtendedTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ReviewService reviewService;

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void getReviewsByProvider_returnsReviews() {
        UUID providerId = UUID.randomUUID();
        when(userRepository.existsById(providerId)).thenReturn(true);
        when(reviewRepository.findByProviderId(providerId)).thenReturn(List.of());

        assertThat(reviewService.getReviewsByProvider(providerId)).isEmpty();
    }

    @Test
    void createReview_success() {
        User buyer = User.builder()
                .id(UUID.randomUUID())
                .email("buyer@uni.edu")
                .fullName("Buyer")
                .build();
        User provider = User.builder()
                .id(UUID.randomUUID())
                .email("provider@uni.edu")
                .fullName("Provider")
                .build();

        TestSecurity.loginAs(buyer.getEmail(), "CUSTOMER");
        when(userRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));

        UUID bookingId = UUID.randomUUID();
        Booking booking = Booking.builder()
                .id(bookingId)
                .buyer(buyer)
                .provider(provider)
                .status(BookingStatus.COMPLETED)
                .build();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(bookingId)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new uniconnect_backend.review.dto.CreateReviewRequest();
        request.setBookingId(bookingId);
        request.setRating(5);
        request.setComment("Great");

        assertThat(reviewService.createReview(request).getRating()).isEqualTo(5);
    }
}
