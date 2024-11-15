package com.app.collabtool.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.app.collabtool.interceptor.AuthInterceptor;
import com.app.collabtool.service.Constants;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Autowired
	AuthInterceptor authInterceptor;

	@Autowired
	Constants constants;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(authInterceptor).addPathPatterns("api/**");
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**") // Allow all paths
				.allowedOrigins(constants.getLocal_url(), constants.getNetwork_url(), constants.getForwarded_url())
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
				.allowedHeaders("*") // Allow all headers
				.allowCredentials(true); // Allow credentials (optional)
	}
}
