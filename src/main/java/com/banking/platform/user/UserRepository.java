package com.banking.platform.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  @Query(
      """
      SELECT u FROM User u
      WHERE LOWER(u.username)  LIKE LOWER(CONCAT('%', :q, '%'))
         OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :q, '%'))
         OR LOWER(u.fullName)  LIKE LOWER(CONCAT('%', :q, '%'))
      """)
  List<User> search(@Param("q") String query);

  List<User> findByCustomerId(Long customerId);
}
