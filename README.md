# Install Spring Boot from terminal

```
curl -s https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.5.0 \
  -d baseDir=. \
  -d groupId=com.banking.platform \
  -d artifactId=core-banking-platform \
  -d javaVersion=21 \
  -d name=CoreBankingApplication \
  -d packageName=com.banking.platform \
  -d dependencies=web,security,data-jpa,flyway,postgresql,validation,springdoc-openapi \
  -o banking.zip
```

# Development 

Docker Postgres, Spring Boot dev tools, and Angular.

_Spring Boot and Angular both hot reload enabled._

```bash
$ docker compose up --detach postgres

$ ./mvnw spring-boot:run -DskipTests

$ npm start
```

