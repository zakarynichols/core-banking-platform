package com.banking.platform.account;

import com.banking.platform.customer.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "account_holders")
public class AccountHolder {

  @EmbeddedId private AccountHolderId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("accountId")
  @JoinColumn(name = "account_id")
  private Account account;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("customerId")
  @JoinColumn(name = "customer_id")
  private Customer customer;

  @Column(name = "added_at", nullable = false, updatable = false)
  private LocalDateTime addedAt = LocalDateTime.now();

  public AccountHolder() {}

  public AccountHolder(Account account, Customer customer) {
    this.id = new AccountHolderId(account.getId(), customer.getId());
    this.account = account;
    this.customer = customer;
  }

  public AccountHolderId getId() {
    return id;
  }

  public Account getAccount() {
    return account;
  }

  public Customer getCustomer() {
    return customer;
  }

  public LocalDateTime getAddedAt() {
    return addedAt;
  }

  @Embeddable
  public static class AccountHolderId implements Serializable {
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "customer_id")
    private Long customerId;

    public AccountHolderId() {}

    public AccountHolderId(Long accountId, Long customerId) {
      this.accountId = accountId;
      this.customerId = customerId;
    }

    public Long getAccountId() {
      return accountId;
    }

    public Long getCustomerId() {
      return customerId;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (!(o instanceof AccountHolderId that)) return false;
      return Objects.equals(accountId, that.accountId)
          && Objects.equals(customerId, that.customerId);
    }

    @Override
    public int hashCode() {
      return Objects.hash(accountId, customerId);
    }
  }
}
