package com.app.collabtool.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.app.collabtool.models.Conversation;
import com.app.collabtool.service.ChatService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
//@CrossOrigin(origins = "http://localhost:8000")
public class ChatController {
	@Autowired
	private ChatService chatService;

	@GetMapping("/history")
	public List<Conversation> getChatHistory() {
		return chatService.getChatHistory();
	}

	@GetMapping("/message/{sender}/{recever}")
	public Optional<Conversation> createChat(@PathVariable String sender, @PathVariable String recever) {
		return chatService.createChat(sender, recever);
	}
	
	@GetMapping("/status/{sender}/{recever}")
	public Optional<Conversation> changeChatStatus(@PathVariable String sender, @PathVariable String recever) {
		return chatService.changeChatStatus(sender, recever);
	}

	@PostMapping("/send")
	public ResponseEntity<Conversation> sendMessage(@RequestParam String senderEmail,
			@RequestParam String receiverEmail, @RequestParam String content,
			@RequestParam(required = false) MultipartFile attachment) {

		Conversation conversation = chatService.sendMessage(senderEmail, receiverEmail, content, attachment);
		if (conversation.getConvoId() != null)
			return new ResponseEntity<>(conversation, HttpStatus.OK);
		else
			return new ResponseEntity<>(conversation, HttpStatus.NO_CONTENT);
	}

}
