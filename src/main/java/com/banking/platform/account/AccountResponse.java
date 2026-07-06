package com.banking.platform.account;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AccountResponse {

  private Long id;
  private String accountNumber;
  private Long customerId;
  private String primaryCustomerName;
  private String accountType;
  private String status;
  private BigDecimal balance;
  private String currency;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<Long> holderIds;
  private Map<Long, String> holderNames;

  public static AccountResponse from(Account account) {
    AccountResponse r = new AccountResponse();
    r.id = account.getId();
    r.accountNumber = account.getAccountNumber();
    r.customerId = account.getCustomer().getId();
    r.primaryCustomerName = account.getCustomer().getFullName();
    r.accountType = account.getAccountType().name();
    r.status = account.getStatus().name();
    r.balance = account.getBalance();
    r.currency = account.getCurrency();
    r.createdAt = account.getCreatedAt();
    r.updatedAt = account.getUpdatedAt();
    r.holderIds = account.getHolders().stream().map(h -> h.getId().getCustomerId()).toList();
    r.holderNames =
        account.getHolders().stream()
            .collect(
                Collectors.toMap(
                    h -> h.getId().getCustomerId(), h -> h.getCustomer().getFullName()));
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

  public String getPrimaryCustomerName() {
    return primaryCustomerName;
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

  public List<Long> getHolderIds() {
    return holderIds;
  }

  public Map<Long, String> getHolderNames() {
    return holderNames;
  }
}
