package com.banking.platform.account;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountResponse {

  private Long id;
  private String accountNumber;
  private Long customerId;
  private String accountType;
  private String status;
  private BigDecimal balance;
  private String currency;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static AccountResponse from(Account account) {
    AccountResponse r = new AccountResponse();
    r.id = account.getId();
    r.accountNumber = account.getAccountNumber();
    r.customerId = account.getCustomer().getId();
    r.accountType = account.getAccountType().name();
    r.status = account.getStatus().name();
    r.balance = account.getBalance();
    r.currency = account.getCurrency();
    r.createdAt = account.getCreatedAt();
    r.updatedAt = account.getUpdatedAt();
    return r;
  }

  public Long getId() {
    return id;
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public Long getCustomerId() {
    return customerId;
  }

  public String getAccountType() {
    return accountType;
  }

  public String getStatus() {
    return status;
  }

  public BigDecimal getBalance() {
    return balance;
  }

  public String getCurrency() {
    return currency;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
}
