package com.banking.platform.customer;

import java.time.LocalDateTime;
import java.util.List;

public class CustomerResponse {

  private Long id;
  private String fullName;
  private String email;
  private String phone;
  private String address;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<LinkedUser> linkedUsers;

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

  public List<LinkedUser> getLinkedUsers() {
    return linkedUsers;
  }

  public void setLinkedUsers(List<LinkedUser> linkedUsers) {
    this.linkedUsers = linkedUsers;
  }

  public static class LinkedUser {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;

    public LinkedUser(Long id, String username, String email, String fullName, String role) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.fullName = fullName;
      this.role = role;
    }

    public Long getId() {
      return id;
    }

    public String getUsername() {
      return username;
    }

    public String getEmail() {
      return email;
    }

    public String getFullName() {
      return fullName;
    }

    public String getRole() {
      return role;
    }
  }
}
