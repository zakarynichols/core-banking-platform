package com.banking.platform;

import java.util.Map;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

  private final GreetingRepository greetingRepository;
  private final DataSource dataSource;

  public HelloController(GreetingRepository greetingRepository, DataSource dataSource) {
    this.greetingRepository = greetingRepository;
    this.dataSource = dataSource;
  }

  @GetMapping("/hello")
  public Map<String, Object> hello() {
    String greeting =
        greetingRepository.findById(1L).map(Greeting::getMessage).orElse("No greeting found");

    boolean dbConnected;
    try (var conn = dataSource.getConnection()) {
      dbConnected = conn.isValid(2);
    } catch (Exception e) {
      dbConnected = false;
    }

    return Map.of(
        "app",
        "CoreBankingApplication",
        "status",
        "running",
        "greeting",
        greeting,
        "database",
        dbConnected ? "connected" : "disconnected");
  }

  @GetMapping("/secured")
  public Map<String, Object> secured() {
    return Map.of(
        "message", "You are authenticated!",
        "status", "success");
  }
}
