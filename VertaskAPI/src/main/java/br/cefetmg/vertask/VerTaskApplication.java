package br.cefetmg.vertask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// import org.springframework.cloud.openfeign.EnableFeignClients;

// @EnableFeignClients

@SpringBootApplication
@EnableScheduling
public class VerTaskApplication {

	public static void main(String[] args) {
		SpringApplication.run(VerTaskApplication.class, args);
	}

}
