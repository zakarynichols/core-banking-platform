package com.banking.platform;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private final GreetingRepository greetingRepository;

    public HelloController(GreetingRepository greetingRepository) {
        this.greetingRepository = greetingRepository;
    }

    @GetMapping("/hello")
    public String hello() {
        return greetingRepository.findById(1L)
                .map(Greeting::getMessage)
                .orElse("No greeting found");
    }
}
