package com.banking.platform.user;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/search")
  public ResponseEntity<?> search(@RequestParam("q") String query, Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
    if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.EMPLOYEE) {
      return ResponseEntity.status(403)
          .body(java.util.Map.of("error", "Only staff can search users"));
    }

    if (query == null || query.trim().isEmpty()) {
      return ResponseEntity.badRequest()
          .body(java.util.Map.of("error", "Search query must not be empty"));
    }

    List<UserResponse> results =
        userRepository.search(query).stream().map(UserResponse::from).toList();

    return ResponseEntity.ok(results);
  }
}
