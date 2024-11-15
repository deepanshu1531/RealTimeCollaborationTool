package com.app.collabtool.controllers;

import com.app.collabtool.models.File;
import com.app.collabtool.repositories.FileRepository;
import com.app.collabtool.service.GoogleDriveService;
import com.google.api.services.drive.Drive;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileController {

	private final Path fileStorageLocation;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private FileRepository fileRepository; // Inject FileRepository for MongoDB

	@Autowired
	private GoogleDriveService googleDriveService;

	public FileController() {
		// Specify file upload directory (you may want to make this configurable)
		this.fileStorageLocation = Paths.get("uploaded_files").toAbsolutePath().normalize();

		try {
			Files.createDirectories(this.fileStorageLocation);
		} catch (Exception ex) {
			throw new RuntimeException("Could not create directory for file uploads", ex);
		}
	}

	@GetMapping
	public List<File> getAllFiles() {
		return fileRepository.findAll();
	}

	@PostMapping("/upload/{userEmail}")
	public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable String userEmail) {
		try {
			// Save file temporarily to local file system
			String fileName = saveFile(file);
			java.io.File tempFile = new java.io.File(System.getProperty("java.io.tmpdir") + "\\" + fileName);
			file.transferTo(tempFile);

			// Upload file to Google Drive
			com.google.api.services.drive.model.File googleDriveFile = googleDriveService.uploadFileToDrive(file, null,
					tempFile);

			// Share the file with your Google account (e.g., 'your-email@gmail.com')
			googleDriveService.shareFileWithUser(googleDriveFile.getId(), "vermadeepanshu1531@gmail.com");

			// Clean up the temporary file
			tempFile.delete();

			// Save file metadata to MongoDB
			File fileMetadata = new File();
			fileMetadata.setFileName(fileName);
			fileMetadata.setFileType(file.getContentType());
			fileMetadata.setFileSize(file.getSize());
			fileMetadata.setFilePath("Google Drive ID: " + googleDriveFile.getId());
			fileMetadata.setUploadedAt(LocalDateTime.now());
			fileMetadata.setUploadedBy(userEmail);

			// Set additional Google Drive details
			fileMetadata.setGoogleDriveFileId(googleDriveFile.getId()); // Google Drive file ID
			fileMetadata.setGoogleDriveParents(googleDriveFile.getParents()); // Parent folder ID
			fileMetadata.setWebContentLink(googleDriveFile.getWebContentLink()); // Download link
			fileMetadata.setWebViewLink(googleDriveFile.getWebViewLink()); // View link

			fileRepository.save(fileMetadata);

			// Notify WebSocket topic about new file
			Map<String, String> fileInfo = new HashMap<>();
			fileInfo.put("fileName", fileName);
			fileInfo.put("message", "A new file has been uploaded to Google Drive");
			fileInfo.put("uploadedBy", userEmail);

			messagingTemplate.convertAndSend("/topic/fileUpdates", fileInfo);

			return ResponseEntity.ok("File uploaded successfully to Google Drive: " + fileName);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("File upload failed: " + e.getMessage());
		}
	}

	/**
	 * Saves the uploaded file to the server's file system.
	 *
	 * @param file the file to save
	 * @return the file name of the saved file
	 * @throws Exception if file saving fails
	 */
	private String saveFile(MultipartFile file) throws Exception {
		String fileName = file.getOriginalFilename();
		Path targetLocation = this.fileStorageLocation.resolve(fileName);
		Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

		return fileName;
	}

	@GetMapping("/download/{fileId}")
	public ResponseEntity<InputStreamResource> downloadFile(@PathVariable("fileId") String fileId) {
		try {
			// Fetch file metadata from repository
			Optional<File> fileOptional = fileRepository.findByGoogleDriveFileId(fileId);

			// Check if file exists in repository
			if (fileOptional.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
			}

			File file = fileOptional.get();

			// Construct the file URL from the repository information
			String fileUrl = file.getWebContentLink();

			// Open the URL and retrieve the file's input stream
			URL url = new URL(fileUrl);
			InputStream inputStream = url.openStream();

			// Prepare headers for file download
			HttpHeaders headers = new HttpHeaders();
			headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"");
			headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);

			// Wrap InputStream into InputStreamResource and return as a response
			InputStreamResource resource = new InputStreamResource(inputStream);

			return new ResponseEntity<>(resource, headers, HttpStatus.OK);

		} catch (Exception e) {
			// Log the exception and return internal server error
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@DeleteMapping("/deleteFile/{fileId}")
	public ResponseEntity<Boolean> deleteFile(@PathVariable("fileId") String fileId) {
		try {
			googleDriveService.deleteFile(fileId);
			fileRepository.deleteByGoogleDriveFileId(fileId);
			return ResponseEntity.ok(true);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
}
