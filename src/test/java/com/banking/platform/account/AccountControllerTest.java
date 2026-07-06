package com.banking.platform.account;

import static org.assertj.core.api.Assertions.assertThat;

import com.banking.platform.AbstractIntegrationTest;
import com.banking.platform.auth.JwtUtil;
import com.banking.platform.customer.Customer;
import com.banking.platform.customer.CustomerRepository;
import com.banking.platform.user.User;
import com.banking.platform.user.UserRepository;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AccountControllerTest extends AbstractIntegrationTest {

  @Autowired private TestRestTemplate rest;
  @Autowired private AccountRepository accountRepository;
  @Autowired private CustomerRepository customerRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private JwtUtil jwtUtil;

  private String adminToken;
  private String employeeToken;
  private String customerToken;
  private Long customerId;
  private Long employeeCustomerId;

  @BeforeEach
  void setUp() {
    accountRepository.deleteAll();
    User cu = userRepository.findByUsername("customer").orElseThrow();
    cu.setCustomer(null);
    userRepository.save(cu);
    customerRepository.deleteAll();

    Customer c = customerRepository.save(new Customer("Jane Doe", "jane@test.com", "123", "Addr"));
    customerId = c.getId();

    Customer ec =
        customerRepository.save(new Customer("Staff Customer", "staffcust@test.com", null, null));
    employeeCustomerId = ec.getId();

    User customerUser = userRepository.findByUsername("customer").orElseThrow();
    customerUser.setCustomer(c);
    userRepository.save(customerUser);

    adminToken = jwtUtil.generateToken("admin", "ADMIN");
    employeeToken = jwtUtil.generateToken("employee", "EMPLOYEE");
    customerToken = jwtUtil.generateToken("customer", "CUSTOMER");
  }

  private HttpEntity<Void> auth(String token) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);
    return new HttpEntity<>(headers);
  }

  private <T> HttpEntity<T> authWithBody(String token, T body) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);
    return new HttpEntity<>(body, headers);
  }

  /* ---------- Open Account ---------- */

  @Test
  void adminCanOpenAccount() {
    var req = Map.of("customerId", customerId, "accountType", "CHECKING");
    var resp =
        rest.exchange("/accounts", HttpMethod.POST, authWithBody(adminToken, req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(resp.getBody().get("accountNumber")).asString().startsWith("ACC-");
    assertThat(((Number) resp.getBody().get("balance")).doubleValue()).isEqualTo(0.0);
  }

  @Test
  void customerCanOpenAccountForSelf() {
    var req = Map.of("customerId", customerId, "accountType", "SAVINGS");
    var resp =
        rest.exchange("/accounts", HttpMethod.POST, authWithBody(customerToken, req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
  }

  @Test
  void customerCannotOpenAccountForOther() {
    var req = Map.of("customerId", employeeCustomerId, "accountType", "CHECKING");
    var resp =
        rest.exchange("/accounts", HttpMethod.POST, authWithBody(customerToken, req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
  }

  @Test
  void openAccountFailsForUnknownCustomer() {
    var req = Map.of("customerId", 99999L, "accountType", "CHECKING");
    var resp =
        rest.exchange("/accounts", HttpMethod.POST, authWithBody(adminToken, req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
  }

  @Test
  void openAccountFailsForInvalidType() {
    var req = Map.of("customerId", customerId, "accountType", "INVALID");
    var resp =
        rest.exchange("/accounts", HttpMethod.POST, authWithBody(adminToken, req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
  }

  @Test
  void openAccountRequiresAuth() {
    var req = Map.of("customerId", customerId, "accountType", "CHECKING");
    var resp = rest.exchange("/accounts", HttpMethod.POST, new HttpEntity<>(req), Map.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  /* ---------- List Accounts ---------- */

  @Test
  void adminSeesAllAccounts() {
    createAccount(adminToken, customerId, "CHECKING");
    createAccount(adminToken, employeeCustomerId, "SAVINGS");

    var resp = rest.exchange("/accounts", HttpMethod.GET, auth(adminToken), Map[].class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(resp.getBody()).hasSize(2);
  }

  @Test
  void customerSeesOnlyOwnAccounts() {
    createAccount(adminToken, customerId, "CHECKING");
    createAccount(adminToken, employeeCustomerId, "SAVINGS");

    var resp = rest.exchange("/accounts", HttpMethod.GET, auth(customerToken), Map[].class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(resp.getBody()).hasSize(1);
    assertThat(resp.getBody()[0].get("customerId")).isEqualTo(customerId.intValue());
  }

  /* ---------- Get Account ---------- */

  @Test
  void getAccountById() {
    Long id = createAccount(adminToken, customerId, "CHECKING");
    var resp = rest.exchange("/accounts/{id}", HttpMethod.GET, auth(adminToken), Map.class, id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(resp.getBody().get("accountNumber")).isNotNull();
  }

  @Test
  void customerCannotSeeOtherAccount() {
    Long id = createAccount(adminToken, employeeCustomerId, "CHECKING");
    var resp = rest.exchange("/accounts/{id}", HttpMethod.GET, auth(customerToken), Map.class, id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  @Test
  void getAccountReturns404() {
    var resp = rest.exchange("/accounts/{id}", HttpMethod.GET, auth(adminToken), Map.class, 99999L);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  /* ---------- Get Balance ---------- */

  @Test
  void getBalance() {
    Long id = createAccount(adminToken, customerId, "CHECKING");
    var resp =
        rest.exchange("/accounts/{id}/balance", HttpMethod.GET, auth(customerToken), Map.class, id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(((Number) resp.getBody().get("balance")).doubleValue()).isEqualTo(0.0);
    assertThat(resp.getBody().get("currency")).isEqualTo("USD");
  }

  @Test
  void customerCannotSeeOtherBalance() {
    Long id = createAccount(adminToken, employeeCustomerId, "CHECKING");
    var resp =
        rest.exchange("/accounts/{id}/balance", HttpMethod.GET, auth(customerToken), Map.class, id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  /* ---------- Update Status ---------- */

  @Test
  void adminCanChangeStatus() {
    Long id = createAccount(adminToken, customerId, "CHECKING");
    var req = Map.of("status", "FROZEN");
    var resp =
        rest.exchange(
            "/accounts/{id}/status",
            HttpMethod.PATCH,
            authWithBody(adminToken, req),
            Map.class,
            id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(resp.getBody().get("status")).isEqualTo("FROZEN");
  }

  @Test
  void customerCannotChangeStatus() {
    Long id = createAccount(adminToken, customerId, "CHECKING");
    var req = Map.of("status", "FROZEN");
    var resp =
        rest.exchange(
            "/accounts/{id}/status",
            HttpMethod.PATCH,
            authWithBody(customerToken, req),
            Map.class,
            id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
  }

  @Test
  void changeStatusFailsForInvalidValue() {
    Long id = createAccount(adminToken, customerId, "CHECKING");
    var req = Map.of("status", "BOGUS");
    var resp =
        rest.exchange(
            "/accounts/{id}/status",
            HttpMethod.PATCH,
            authWithBody(adminToken, req),
            Map.class,
            id);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
  }

  /* ---------- helpers ---------- */

  @SuppressWarnings("unchecked")
  private Long createAccount(String token, Long cid, String type) {
    var req = Map.of("customerId", cid, "accountType", type);
    var resp = rest.exchange("/accounts", HttpMethod.POST, authWithBody(token, req), Map.class);
    return ((Number) resp.getBody().get("id")).longValue();
  }
}
