package com.banking.platform.customer;

import com.banking.platform.user.Role;
import com.banking.platform.user.User;
import com.banking.platform.user.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customers")
public class CustomerController {

  private final CustomerRepository customerRepository;
  private final UserRepository userRepository;

  public CustomerController(CustomerRepository customerRepository, UserRepository userRepository) {
    this.customerRepository = customerRepository;
    this.userRepository = userRepository;
  }

  @PostMapping
  public ResponseEntity<?> create(
      @Valid @RequestBody CustomerRequest request, Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
    if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.EMPLOYEE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("error", "Only staff can create customers"));
    }
    Customer customer =
        new Customer(
            request.getFullName(), request.getEmail(), request.getPhone(), request.getAddress());
    customerRepository.save(customer);
    return ResponseEntity.status(HttpStatus.CREATED).body(CustomerResponse.from(customer));
  }

  @GetMapping
  public ResponseEntity<List<CustomerResponse>> list() {
    List<CustomerResponse> customers =
        customerRepository.findAll().stream().map(CustomerResponse::from).toList();
    return ResponseEntity.ok(customers);
  }

  @GetMapping("/{id}")
  public ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
    return customerRepository
        .findById(id)
        .map(CustomerResponse::from)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/me")
  public ResponseEntity<CustomerResponse> myProfile(Authentication auth) {
    User user = userRepository.findByUsername(auth.getName()).orElseThrow();
    return ResponseEntity.ok(CustomerResponse.from(user.getCustomer()));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<?> updateStatus(
      @PathVariable Long id, @Valid @RequestBody StatusRequest request, Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
    if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.EMPLOYEE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("error", "Only staff can change customer status"));
    }

    CustomerStatus newStatus;
    try {
      newStatus = CustomerStatus.valueOf(request.getStatus().toUpperCase());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Invalid status. Use ACTIVE, SUSPENDED, or CLOSED"));
    }

    return customerRepository
        .findById(id)
        .map(
            customer -> {
              customer.setStatus(newStatus);
              customerRepository.save(customer);
              return ResponseEntity.ok(CustomerResponse.from(customer));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(
      @PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
    return customerRepository
        .findById(id)
        .map(
            customer -> {
              customer.setFullName(request.getFullName());
              customer.setEmail(request.getEmail());
              customer.setPhone(request.getPhone());
              customer.setAddress(request.getAddress());
              customerRepository.save(customer);
              return ResponseEntity.ok(CustomerResponse.from(customer));
            })
        .orElse(ResponseEntity.notFound().build());
  }
}
