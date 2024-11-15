package com.app.collabtool.service;

import com.app.collabtool.models.User;
import com.app.collabtool.repositories.UserRepository; // Assuming you have a UserRepository

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository; // Autowire the UserRepository

	public User authenticate(String email, String password) {
		Optional<User> user = userRepository.findByEmail(email); // Find user by email
		// Check if user exists and password matches
		if (user.get() != null && user.get().getPassword().equals(password)) {
			return user.get(); // Return the authenticated user
		}
		return null; // Return null if authentication fails
	}
}
