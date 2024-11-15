package com.app.collabtool.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.app.collabtool.models.Notification;
import com.app.collabtool.repositories.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        try {
            List<Notification> notifications = notificationRepository.findAll();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Add a new notification to the database
    @PostMapping("/add")
    public ResponseEntity<Notification> addNotification(@RequestBody Notification notification) {
        try {
            notification.setCreatedAt(LocalDateTime.now());
            Notification savedNotification = notificationRepository.save(notification);
            return ResponseEntity.ok(savedNotification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get a notification by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotification(@PathVariable String id) {
        try {
            return notificationRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
