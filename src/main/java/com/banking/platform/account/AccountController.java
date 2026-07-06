package com.banking.platform.account;

import com.banking.platform.customer.Customer;
import com.banking.platform.customer.CustomerRepository;
import com.banking.platform.user.Role;
import com.banking.platform.user.User;
import com.banking.platform.user.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/accounts")
public class AccountController {

  private final AccountRepository accountRepository;
  private final CustomerRepository customerRepository;
  private final UserRepository userRepository;

  public AccountController(
      AccountRepository accountRepository,
      CustomerRepository customerRepository,
      UserRepository userRepository) {
    this.accountRepository = accountRepository;
    this.customerRepository = customerRepository;
    this.userRepository = userRepository;
  }

  @PostMapping
  public ResponseEntity<?> open(@Valid @RequestBody AccountRequest request, Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();

    Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
    if (customer == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "Customer not found"));
    }

    if (currentUser.getRole() == Role.CUSTOMER) {
      if (!currentUser.getCustomer().getId().equals(request.getCustomerId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "You can only open accounts for yourself"));
      }
    }

    AccountType accountType;
    try {
      accountType = AccountType.valueOf(request.getAccountType().toUpperCase());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Invalid account type. Use CHECKING or SAVINGS"));
    }

    String accountNumber = generateAccountNumber();
    Account account = new Account(accountNumber, customer, accountType);
    accountRepository.save(account);

    return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(account));
  }

  @GetMapping
  public ResponseEntity<List<AccountResponse>> list(Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
    List<Account> accounts;
    if (currentUser.getRole() == Role.CUSTOMER) {
      accounts = accountRepository.findByCustomerId(currentUser.getCustomer().getId());
    } else {
      accounts = accountRepository.findAll();
    }
    return ResponseEntity.ok(accounts.stream().map(AccountResponse::from).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable Long id, Authentication auth) {
    return accountRepository
        .findById(id)
        .map(
            account -> {
              if (!canAccess(account, auth)) {
                return ResponseEntity.<AccountResponse>notFound().build();
              }
              return ResponseEntity.ok(AccountResponse.from(account));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}/balance")
  public ResponseEntity<?> getBalance(@PathVariable Long id, Authentication auth) {
    return accountRepository
        .findById(id)
        .map(
            account -> {
              if (!canAccess(account, auth)) {
                return ResponseEntity.notFound().build();
              }
              return ResponseEntity.ok(
                  Map.of(
                      "accountNumber",
                      account.getAccountNumber(),
                      "balance",
                      account.getBalance(),
                      "currency",
                      account.getCurrency()));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<?> updateStatus(
      @PathVariable Long id,
      @Valid @RequestBody AccountStatusRequest request,
      Authentication auth) {
    User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
    if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.EMPLOYEE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("error", "Only staff can change account status"));
    }

    AccountStatus newStatus;
    try {
      newStatus = AccountStatus.valueOf(request.getStatus().toUpperCase());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Invalid status. Use OPEN, FROZEN, or CLOSED"));
    }

    return accountRepository
        .findById(id)
        .map(
            account -> {
              account.setStatus(newStatus);
              accountRepository.save(account);
              return ResponseEntity.ok(AccountResponse.from(account));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  private boolean canAccess(Account account, Authentication auth) {
    User user = userRepository.findByUsername(auth.getName()).orElseThrow();
    if (user.getRole() != Role.CUSTOMER) {
      return true;
    }
    return user.getCustomer().getId().equals(account.getCustomer().getId());
  }

  private String generateAccountNumber() {
    return "ACC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
  }
}
