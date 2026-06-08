package uniconnect_backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uniconnect_backend.common.exception.ResourceNotFoundException;
import uniconnect_backend.security.SecurityUtils;
import uniconnect_backend.user.dto.DepositRequest;
import uniconnect_backend.user.dto.UserResponse;
import uniconnect_backend.user.entity.User;
import uniconnect_backend.user.repository.UserRepository;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/api/users/me")
    public ResponseEntity<UserResponse> getMe() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PostMapping("/api/users/deposit")
    public ResponseEntity<UserResponse> deposit(@RequestBody DepositRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid deposit amount");
        }

        user.setBalance(user.getBalance().add(request.getAmount()));
        userRepository.save(user);

        return ResponseEntity.ok(mapToResponse(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .balance(user.getBalance())
                .build();
    }

    @GetMapping("/api/users/test")
    public String test() {
        return "Protected endpoint accessed";
    }

    @GetMapping("/api/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOnly() {
        return "Admin access granted";
    }

    @GetMapping("/api/provider/test")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public String providerOnly() {
        return "Provider access granted";
    }

    @GetMapping("/api/customer/test")
    @PreAuthorize("hasRole('CUSTOMER')")
    public String customerOnly() {
        return "Customer access granted";
    }
}