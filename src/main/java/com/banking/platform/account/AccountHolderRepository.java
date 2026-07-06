package com.banking.platform.account;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountHolderRepository
    extends JpaRepository<AccountHolder, AccountHolder.AccountHolderId> {
  List<AccountHolder> findByCustomerId(Long customerId);

  List<AccountHolder> findByAccountId(Long accountId);
}
