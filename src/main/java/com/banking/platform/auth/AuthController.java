package com.banking.platform.auth;

import com.banking.platform.user.Role;
import com.banking.platform.user.User;
import com.banking.platform.user.UserRepository;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public AuthController(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
    }
    if (userRepository.existsByEmail(request.getEmail())) {
      return ResponseEntity.badRequest().body(Map.of("error", "Email already taken"));
    }

    User user =
        new User(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getFullName(),
            Role.CUSTOMER);
    userRepository.save(user);

    String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new AuthResponse(token, user.getUsername(), user.getRole().name()));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    var userOpt = userRepository.findByUsername(request.getUsername());
    if (userOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "Invalid credentials"));
    }

    User user = userOpt.get();
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "Invalid credentials"));
    }

    String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
    return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
  }
}
