package com.banking.platform.customer;

import java.time.LocalDateTime;

public class CustomerResponse {

  private Long id;
  private String fullName;
  private String email;
  private String phone;
  private String address;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static CustomerResponse from(Customer customer) {
    CustomerResponse r = new CustomerResponse();
    r.id = customer.getId();
    r.fullName = customer.getFullName();
    r.email = customer.getEmail();
    r.phone = customer.getPhone();
    r.address = customer.getAddress();
    r.status = customer.getStatus().name();
    r.createdAt = customer.getCreatedAt();
    r.updatedAt = customer.getUpdatedAt();
    return r;
  }

  public Long getId() {
    return id;
  }

  public String getFullName() {
    return fullName;
  }

  public String getEmail() {
    return email;
  }

  public String getPhone() {
    return phone;
  }

  public String getAddress() {
    return address;
  }

  public String getStatus() {
    return status;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
}
