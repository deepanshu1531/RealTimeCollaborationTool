package com.app.collabtool.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.app.collabtool.models.User;

public interface UserRepository extends MongoRepository<User, String> {
	Optional<User> findByName(String username);

	Optional<User> findByEmail(String email);
}
