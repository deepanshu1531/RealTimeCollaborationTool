package com.app.collabtool.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "files")
public class File {

	@Id
	private String id;
	private String uploadedBy;
	private String fileName;
	private String fileType;
	private String filePath; // This will store Google Drive ID as well
	private long fileSize;
	private LocalDateTime uploadedAt;

	// New fields for Google Drive metadata
	private String googleDriveFileId; // Google Drive File ID
	private List<String> googleDriveParents; // Parent folder ID(s) on Google Drive
	private String webContentLink; // Link to download the file from Google Drive
	private String webViewLink; // Link to view the file on Google Drive

	// Getters and Setters for new fields
	public String getUploadedBy() {
		return uploadedBy;
	}

	public void setUploadedBy(String uploadedBy) {
		this.uploadedBy = uploadedBy;
	}

	public String getGoogleDriveFileId() {
		return googleDriveFileId;
	}

	public void setGoogleDriveFileId(String googleDriveFileId) {
		this.googleDriveFileId = googleDriveFileId;
	}

	public List<String> getGoogleDriveParents() {
		return googleDriveParents;
	}

	public void setGoogleDriveParents(List<String> googleDriveParents) {
		this.googleDriveParents = googleDriveParents;
	}

	public String getWebContentLink() {
		return webContentLink;
	}

	public void setWebContentLink(String webContentLink) {
		this.webContentLink = webContentLink;
	}

	public String getWebViewLink() {
		return webViewLink;
	}

	public void setWebViewLink(String webViewLink) {
		this.webViewLink = webViewLink;
	}

	// Existing fields, getters, and setters

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public String getFilePath() {
		return filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	public long getFileSize() {
		return fileSize;
	}

	public void setFileSize(long fileSize) {
		this.fileSize = fileSize;
	}

	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}

	public void setUploadedAt(LocalDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
	}
}
