package com.app.collabtool.models;

import java.time.LocalDateTime;

public class Message {

	private String senderEmail;
	private String receiverEmail;
	private String content;
	private LocalDateTime timestamp;
	private String attachmentUrl;

	public String getSenderEmail() {
		return senderEmail;
	}

	public void setSenderEmail(String senderEmail) {
		this.senderEmail = senderEmail;
	}

	public String getReceiverEmail() {
		return receiverEmail;
	}

	public void setReceiverEmail(String receiverEmail) {
		this.receiverEmail = receiverEmail;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public String getAttachmentUrl() {
		return attachmentUrl;
	}

	public void setAttachmentUrl(String attachmentUrl) {
		this.attachmentUrl = attachmentUrl;
	}

	@Override
	public String toString() {
		return "Message [senderEmail=" + senderEmail + ", receiverEmail=" + receiverEmail + ", content=" + content
				+ ", timestamp=" + timestamp + ", attachmentUrl=" + attachmentUrl + "]";
	}

}
