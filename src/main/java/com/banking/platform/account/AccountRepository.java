package com.banking.platform.account;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountRepository extends JpaRepository<Account, Long> {
  List<Account> findByCustomerId(Long customerId);

  @Query("SELECT a FROM Account a JOIN a.holders h WHERE h.id.customerId = :customerId")
  List<Account> findByHolderCustomerId(@Param("customerId") Long customerId);
}
