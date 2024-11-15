# Real-Time Collaboration Tool

A powerful collaboration platform designed for remote teams, combining real-time messaging, file sharing, task management, and notifications. The backend is powered by Spring Boot, while the frontend leverages React for a seamless user experience.

---

## Features

1. **Chat System**
   - Real-time messaging with status updates (read/unread).
   - Displays recent chats and message history.
   
2. **File Management**
   - File uploads to Google Drive.
   - Supports file sharing and deletion.
   
3. **Task Management**
   - CRUD operations on tasks.
   - Real-time updates powered by WebSockets.
   
4. **Notifications**
   - Alerts for file uploads, deletions, and task updates.

---

## Technologies Used

### Backend:
- Java, Spring Boot
- MongoDB
- Google Drive API
- STOMP WebSocket

### Frontend:
- React.js
- Axios
- Bootstrap
- WebSocket (via SockJS and STOMP.js)

---

## Backend Structure (Spring Boot)

1. **Main Application Class**
   - Located in `com.app.collabtool`.
   - Bootstraps the application using `SpringApplication.run`.

2. **Configuration**
   - **WebConfig:**
     - Manages CORS settings.
     - Configures an `AuthInterceptor` for route protection.
   - **WebSocketConfig:**
     - Enables WebSocket communication with STOMP protocol.

3. **Controllers**
   - **ChatController:**
     - Manages chat operations (e.g., fetching chat history, sending messages).
   - **FileController:**
     - Handles file uploads to Google Drive and manages metadata in MongoDB.
   - **NotificationController:**
     - Manages notifications (creation, retrieval) stored in MongoDB.
   - **TaskController:**
     - Handles task creation, updates, and deletion using MongoDB.
   - **UserController:**
     - Manages user authentication.

4. **Services**
   - **ChatService:**
     - Implements chat-related business logic.
   - **GoogleDriveService:**
     - Integrates with Google Drive for file operations.
   - **UserService:**
     - Authenticates users via MongoDB.

5. **Interceptors**
   - **AuthInterceptor:**
     - Protects secured routes for authenticated users.

6. **Data Models**
   - Entities: `Conversation`, `File`, `Message`, `Notification`, `Task`, `User`.
   - Annotated for MongoDB persistence.

7. **Repositories**
   - Interfaces for MongoDB interaction via Spring Data MongoDB.

---

## Frontend Structure (React)

1. **Components**
   - **ChatComponent:**
     - Real-time chat functionality.
   - **FileUpload:**
     - Manages file uploads, downloads, and deletions.
   - **Login:**
     - User authentication and WebSocket integration post-login.
   - **TaskManager:**
     - Manages tasks with search functionality.
   - **FileNotificationManager:**
     - Displays file-related notifications.
   - **Navbar:**
     - Provides navigation across the tool.

2. **Features**
   - Real-Time Updates:
     - WebSocket-driven live updates for chats and tasks.
   - Notifications:
     - Push notifications for events like file uploads and task updates.
   - Search Functionality:
     - For users, tasks, and notifications.

3. **Styling and Libraries**
   - Bootstrap and custom CSS for styling.
   - Axios for API requests.

---

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/deepanshu1531/RealTimeCollaborationTool.git
   cd RealTimeCollaborationTool
   ```

