package com.banking.platform.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AccountRequest {

  @NotNull private Long customerId;

  @NotBlank private String accountType;

  private List<Long> additionalHolderIds;

  public Long getCustomerId() {
    return customerId;
  }

  public void setCustomerId(Long customerId) {
    this.customerId = customerId;
  }

  public String getAccountType() {
    return accountType;
  }

  public void setAccountType(String accountType) {
    this.accountType = accountType;
  }

  public List<Long> getAdditionalHolderIds() {
    return additionalHolderIds;
  }

  public void setAdditionalHolderIds(List<Long> additionalHolderIds) {
    this.additionalHolderIds = additionalHolderIds;
  }
}
