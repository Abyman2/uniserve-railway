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
import uniconnect_backend.common.exception.ForbiddenException;
import uniconnect_backend.review.dto.CreateReviewRequest;
import uniconnect_backend.review.service.ReviewService;
import uniconnect_backend.support.TestSecurity;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private uniconnect_backend.review.repository.ReviewRepository reviewRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ReviewService reviewService;

    private final User buyer = User.builder()
            .id(UUID.randomUUID())
            .email("buyer@uni.edu")
            .fullName("Buyer")
            .build();

    private final User provider = User.builder()
            .id(UUID.randomUUID())
            .email("provider@uni.edu")
            .fullName("Provider")
            .build();

    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void createReview_notBuyerForbidden() {
        TestSecurity.loginAs("other@uni.edu", "CUSTOMER");
        User other = User.builder().id(UUID.randomUUID()).email("other@uni.edu").build();
        when(userRepository.findByEmail(other.getEmail())).thenReturn(Optional.of(other));

        UUID bookingId = UUID.randomUUID();
        Booking booking = Booking.builder()
                .id(bookingId)
                .buyer(buyer)
                .provider(provider)
                .status(BookingStatus.COMPLETED)
                .build();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(bookingId);
        request.setRating(5);

        assertThatThrownBy(() -> reviewService.createReview(request))
                .isInstanceOf(ForbiddenException.class);
    }
}
