package com.app.collabtool.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.client.http.FileContent;
import com.google.auth.oauth2.GoogleCredentials;

import com.google.auth.http.HttpCredentialsAdapter;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Component
public class GoogleDriveService {

	private final Path fileStorageLocation;

	private static final String APPLICATION_NAME = "RTCT";
	private static final String SERVICE_ACCOUNT_KEY_FILE = "src/main/resources/serviceAccountCredentials.json";
//	private static final String USER_OAUTH_ACCOUNT_KEY_FILE = "src/main/resources/userOAuthCredentials.json";

	private Drive driveService;

	public GoogleDriveService() throws IOException, GeneralSecurityException {
		// Specify file upload directory (you may want to make this configurable)
		this.fileStorageLocation = Paths.get("uploaded_files").toAbsolutePath().normalize();

		try {
			Files.createDirectories(this.fileStorageLocation);
		} catch (Exception ex) {
			throw new RuntimeException("Could not create directory for file uploads", ex);
		}

		this.driveService = createDriveService();
	}

	private Drive createDriveService() throws IOException {
		GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_FILE))
				.createScoped(Collections.singletonList(DriveScopes.DRIVE));

		return new Drive.Builder(new com.google.api.client.http.javanet.NetHttpTransport(),
				com.google.api.client.json.jackson2.JacksonFactory.getDefaultInstance(),
				new HttpCredentialsAdapter(credentials)).setApplicationName(APPLICATION_NAME).build();
	}

	// Method to upload a file to Google Drive
	public File uploadFileToDrive(MultipartFile multipartFile, String folderId, java.io.File tempFile)
			throws IOException {

		// Create a File metadata object
		File fileMetadata = new File();
		fileMetadata.setName(multipartFile.getOriginalFilename());

		// If you want to upload to a specific folder, set the folderId
		if (folderId != null && !folderId.isEmpty()) {
			fileMetadata.setParents(Collections.singletonList(folderId));
		}

		// Specify the file's content type and path
		FileContent mediaContent = new FileContent(multipartFile.getContentType(), tempFile);

		// Create the file on Google Drive
		File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
				.setFields("id, webContentLink, webViewLink, parents").execute();
		return uploadedFile;
	}

	// Method to share a file with a specific email
	public void shareFileWithUser(String fileId, String userEmail) throws IOException {
		// Create a permission granting 'reader' access
		com.google.api.services.drive.model.Permission permission = new com.google.api.services.drive.model.Permission();
//		permission.setType("user"); // This makes the file accessible to user
		permission.setType("anyone"); // This makes the file accessible to anyone
		permission.setRole("reader");
//		permission.setEmailAddress(userEmail); // In case of accessible to user only

		// Add the permission to the file
		driveService.permissions().create(fileId, permission).execute();
	}

	public void deleteFile(String fileId) throws IOException {
		try {
			driveService.files().delete(fileId).execute();
		} catch (IOException e) {
			throw e;
		}
	}
}
