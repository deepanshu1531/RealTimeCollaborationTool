package com.app.collabtool.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.app.collabtool.models.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
}
