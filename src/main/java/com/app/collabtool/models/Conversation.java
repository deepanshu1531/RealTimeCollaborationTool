package com.app.collabtool.models;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "conversation")
public class Conversation {

	@Id
	private String convoId;
	private String user_1;
	private String user_2;
	private List<Message> message;
	private String status;

	public String getConvoId() {
		return convoId;
	}

	public void setConvoId(String convoId) {
		this.convoId = convoId;
	}

	public String getUser_1() {
		return user_1;
	}

	public void setUser_1(String user_1) {
		this.user_1 = user_1;
	}

	public String getUser_2() {
		return user_2;
	}

	public void setUser_2(String user_2) {
		this.user_2 = user_2;
	}

	public List<Message> getMessage() {
		return message;
	}

	public void setMessage(List<Message> message) {
		this.message = message;
	}
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Override
	public String toString() {
		return "Conversation [convoId=" + convoId + ", user_1=" + user_1 + ", user_2=" + user_2 + ", message=" + message
				+ ", status=" + status + "]";
	}

}
