package com.banking.platform.user;

public class UserResponse {

  private Long id;
  private String username;
  private String email;
  private String fullName;
  private String role;

  public static UserResponse from(User user) {
    UserResponse r = new UserResponse();
    r.id = user.getId();
    r.username = user.getUsername();
    r.email = user.getEmail();
    r.fullName = user.getFullName();
    r.role = user.getRole().name();
    return r;
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
