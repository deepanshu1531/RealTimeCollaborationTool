import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskManager from './TaskManagement/TaskManager';
import FileManagement from './FileManagement/FileManagement';
import FileNotificationManager from './Notification/FileNotificationManager';
import Navbar from './Navigation/Navbar';
import Login from './Login/Login';
import Chat from './Chat/Chat';

class App extends Component {
    render() {
        return (
            <Router>
                {localStorage.getItem("user") !== null ? (
                    <div>
                        <Navbar />
                        <br />
                        <div className='container'>
                            <h1>
                                {/* <img src="/RTCT logo.webp" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />&nbsp; */}
                                Real-Time Collaboration Tool</h1>
                            <hr />
                            <Routes>
                                <Route path="/task-manager" element={<TaskManager />} />
                                <Route path="/file-management" element={<FileManagement />} />
                                <Route path="/file-notifications" element={<FileNotificationManager />} />
                                <Route path="/messages" element={<Chat />} />
                                <Route path="/" element={<FileManagement />} /> {/* Default route */}
                            </Routes>
                        </div>
                    </div>
                ) : (
                    <Login />
                )}
            </Router>
        );
    }
}

export default App;
