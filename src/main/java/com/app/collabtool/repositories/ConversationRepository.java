package com.app.collabtool.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.app.collabtool.models.Conversation;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
	Optional<Conversation> findByConvoId(String convoId);
}
