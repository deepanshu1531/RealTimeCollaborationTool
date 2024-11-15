package com.app.collabtool.repositories;

import com.app.collabtool.models.File;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface FileRepository extends MongoRepository<File, String> {

	// Custom query method to find by Google Drive file by ID
	Optional<File> findByGoogleDriveFileId(String googleDriveFileId);

	// Custom query method to delete by Google Drive file by ID
	void deleteByGoogleDriveFileId(String googleDriveFileId);
}