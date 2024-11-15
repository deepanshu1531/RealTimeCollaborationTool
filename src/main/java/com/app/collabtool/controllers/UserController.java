package com.app.collabtool.controllers;

import com.app.collabtool.models.User;
import com.app.collabtool.repositories.UserRepository;
import com.app.collabtool.service.UserService; // Assuming you have a UserService to handle business logic

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService; // Autowire the UserService
	
	@Autowired
    private UserRepository userRepository;
	
	// Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

	@PostMapping("/auth")
	public ResponseEntity<User> login(@RequestBody User user, HttpServletRequest req) {
		try {
			// Attempt to authenticate the user
			User authenticatedUser = userService.authenticate(user.getEmail(), user.getPassword());
			if (authenticatedUser != null) {
				HttpSession session = req.getSession();
				session.setAttribute("user", authenticatedUser);
				return ResponseEntity.ok(authenticatedUser); // Return the authenticated User object
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/logout")
	public ResponseEntity<Boolean> logout(HttpServletRequest req) {
		try {
			HttpSession session = req.getSession();
			System.out.println(session.getAttribute("user"));
			return ResponseEntity.ok(true);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
}
