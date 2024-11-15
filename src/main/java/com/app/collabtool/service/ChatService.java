package com.app.collabtool.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.app.collabtool.models.Conversation;
import com.app.collabtool.models.Message;
import com.app.collabtool.models.User;
import com.app.collabtool.repositories.ConversationRepository;
import com.app.collabtool.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

	@Autowired
	private ConversationRepository conversationRepository;

	@Autowired
	private UserRepository userRepository;

	// get convoId
	public String getConvoId(String sender, String receiver) {
		String newConvoId = "";
		int len = Math.min(sender.indexOf('@'), receiver.indexOf('@'));

		if (sender.charAt(0) < receiver.charAt(0)) {
			for (int i = 0; i < len; i++) {
				newConvoId += sender.charAt(i);
				newConvoId += receiver.charAt(i);
			}
		} else if (sender.charAt(0) > receiver.charAt(0)) {
			for (int i = 0; i < len; i++) {
				newConvoId += receiver.charAt(i);
				newConvoId += sender.charAt(i);
			}
		} else {
			if (sender.compareTo(receiver) < 0) {
				for (int i = 0; i < len; i++) {
					newConvoId += sender.charAt(i);
					newConvoId += receiver.charAt(i);
				}
			} else {
				for (int i = 0; i < len; i++) {
					newConvoId += receiver.charAt(i);
					newConvoId += sender.charAt(i);
				}
			}
		}
		return newConvoId;
	}

	public Optional<Conversation> createChat(String sender, String receiver) {

		String convoId = getConvoId(sender, receiver);

		// Retrieve messages where the user is either sender or receiver
		Optional<Conversation> conversation = conversationRepository.findByConvoId(convoId);

		// If conversation is not available
		if (conversation.isEmpty()) {

			// Create a new Conversation instance if not found
			Conversation newConversation = new Conversation();
			newConversation.setConvoId(convoId);
			newConversation.setUser_1(sender);
			newConversation.setUser_2(receiver);
			newConversation.setMessage(new ArrayList<>());
			newConversation.setStatus("read");
			conversationRepository.save(newConversation);

			return Optional.of(newConversation);
		}

		return conversation;
	}
	
	public Optional<Conversation> changeChatStatus(String sender, String receiver) {

		String convoId = getConvoId(sender, receiver);

		// Retrieve messages where the user is either sender or receiver
		Optional<Conversation> conversation = conversationRepository.findByConvoId(convoId);

		// If conversation is not available
		if (!conversation.isEmpty()) {
			conversation.get().setStatus("read");
			conversationRepository.save(conversation.get());
			return conversation;
		}
		return conversation;
	}

	public List<Conversation> getChatHistory() {
		return conversationRepository.findAll();
	}

	public Conversation sendMessage(String sender, String receiver, String content, MultipartFile attachment) {

		Optional<User> senderObj = userRepository.findByEmail(sender);
		Optional<User> receiverObj = userRepository.findByEmail(receiver);

		Conversation conversation = new Conversation();

		if (!senderObj.isEmpty() && !receiverObj.isEmpty()) {

			String attachmentUrl = null;
			if (attachment != null && (!attachment.isEmpty())) {
				attachmentUrl = saveAttachment(attachment);
			}

			String convoId = getConvoId(sender, receiver);

			Optional<Conversation> existingConvo = conversationRepository.findByConvoId(convoId);

			if (existingConvo.get().getMessage() == null) {
				existingConvo.get().setMessage(new ArrayList<>());
			}

			Message message = new Message();
			message.setSenderEmail(sender);
			message.setReceiverEmail(receiver);
			message.setContent(content);
			message.setTimestamp(LocalDateTime.now());
			message.setAttachmentUrl(attachmentUrl);

			existingConvo.get().getMessage().add(message);
			existingConvo.get().setStatus("unread");

			conversationRepository.deleteById(convoId);
			return conversationRepository.save(existingConvo.get());
		}

		return conversation;
	}

	private String saveAttachment(MultipartFile attachment) {
		// Save file logic (could be local or cloud storage like AWS S3)
		return "/uploads/" + attachment.getOriginalFilename(); // Placeholder
	}
}
