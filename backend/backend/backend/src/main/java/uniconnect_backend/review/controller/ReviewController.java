package uniconnect_backend.review.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uniconnect_backend.review.dto.CreateReviewRequest;
import uniconnect_backend.review.dto.ReviewResponse;
import uniconnect_backend.review.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(

            @Valid @RequestBody
            CreateReviewRequest request
    ) {

        return ResponseEntity.ok(
                service.createReview(request)
        );
    }
}