import React, { Component } from 'react';
import axios from 'axios';
import constants from '../Services/Constants';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadedFiles: [], // State to hold the uploaded files
            selectedFile: null,  // State to hold the selected file
            searchQuery: '' // State to hold the search query
        };
        this.user = JSON.parse(localStorage.getItem("user"));
        this.client = null;
    }

    componentDidMount() {
        this.fetchUploadedFiles(); // Fetch uploaded files when the component mounts
        const socket = new SockJS(constants.BACKEND_URL + 'ws'); // Ensure this matches your server's endpoint
        this.client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                this.client.subscribe('/topic/fileUpdates', (message) => {
                    const notification = JSON.parse(message.body);
                    if (notification.uploadedBy === this.user.email) {
                        notification.desc = `${notification.fileName} uploaded to the server by ${notification.uploadedBy}.`;
                        axios.post(constants.BACKEND_URL + 'api/notifications/add', {
                            desc: notification.desc, // Assuming the notification has a 'desc' field
                            createdBy: this.user.email
                        })
                            .then(response => {
                                console.log('Notification added: ' + response.data);
                            })
                            .catch(error => {
                                console.error('Error adding notification:', error);
                            });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker error: ', frame);
            }
        });
        this.client.activate();
        // Start a new interval to refresh chat history every 3 seconds
        this.uploadInterval = setInterval(() => {
            this.fetchUploadedFiles();
        }, 2000);
    }

    componentWillUnmount() {
        if (this.client) {
            this.client.deactivate();
        }
        if (this.uploadInterval) {
            clearInterval(this.uploadInterval);
        }
    }

    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    }

    handleFileUpload = () => {
        this.openPopup();
        const formData = new FormData();
        this.state.selectedFile.uploadedBy = this.user.email;
        formData.append('file', this.state.selectedFile);
        axios.post(constants.BACKEND_URL + 'api/files/upload/' + this.user.email, formData)
            .then(response => {
                alert('File uploaded successfully- ' + response.data);
                this.fetchUploadedFiles(); // Refresh the file list after successful upload
                this.setState({ selectedFile: null }); // Clear the selected file after upload
                document.getElementById("file").value = '';
                this.closePopup();
            })
            .catch(error => {
                this.closePopup();
                alert('Error uploading file: ' + error.message);
            });
    }

    handleDownload = (event, file) => {
        event.preventDefault();
        this.openPopup();
        const fileId = file.googleDriveFileId;

        axios.get(`${constants.BACKEND_URL}api/files/download/${fileId}`, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;

                // Set the filename from the file object
                const fileName = file.fileName; // Assuming the file object contains 'fileName'
                link.setAttribute('download', fileName);

                document.body.appendChild(link);
                link.click();

                // Clean up after download
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                this.closePopup();
            })
            .catch(error => {
                this.closePopup();
                alert('Error downloading file: ' + error.message);
            });
    }

    handleDelete = (event, file) => {
        event.preventDefault();
        this.openPopup();

        if (this.user.email === file.uploadedBy) {
            if (window.confirm("Are you sure you want to delete this file?")) {
                const fileId = file.googleDriveFileId;

                axios.delete(`${constants.BACKEND_URL}api/files/deleteFile/${fileId}`)
                    .then(response => {
                        this.closePopup();
                        alert(file.fileName + " deleted successfully.");
                        this.fetchUploadedFiles();
                        axios.post(constants.BACKEND_URL + 'api/notifications/add', {
                            desc: file.fileName + " deleted from the server.",
                            createdBy: this.user.email
                        })
                            .then(response => {
                                console.log('Notification added.');
                            })
                            .catch(error => {
                                console.error('Error adding notification:', error);
                            });
                    })
                    .catch(error => {
                        this.closePopup();
                        alert('Error deleting file: ' + error.message);
                    });
            } else {
                this.closePopup();
            }
        } else {
            this.closePopup();
            alert("You don't have permission to delete this file.");
        }
    }
    
    // Method to fetch uploaded files from the backend
    fetchUploadedFiles = () => {
        axios.get(constants.BACKEND_URL + 'api/files') // Update with the correct endpoint for fetching files
            .then(response => {
                this.setState({ uploadedFiles: response.data });
            })
            .catch(error => {
                console.error('Error fetching uploaded files:', error);
            });
    }

    formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = String(date.getFullYear()).slice(-4);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} & ${hours}:${minutes}`;
    }

    handleSearchChange = (event) => {
        this.setState({ searchQuery: event.target.value });
    }

    openPopup = () => {
        document.getElementById("loadingPopup").style.display = "flex";
    }

    closePopup = () => {
        document.getElementById("loadingPopup").style.display = "none";
    }

    render() {
        const filteredFiles = this.state.uploadedFiles.filter(file =>
            file.fileName.toLowerCase().includes(this.state.searchQuery.toLowerCase())
        );

        return (
            <div>
                <div id="loadingPopup" class="popup-overlay" style={{ display: "none" }}>
                    <div class="popup-content">
                        <button class="btn btn-primary" disabled>
                            <span class="spinner-border spinner-border-sm"></span>
                            Loading..
                        </button>
                    </div>
                </div>
                <h3>Uploaded Files</h3>
                <br />
                <div className='row'>
                    <div className='col'>
                        <input id="file" type="file" className='form-control' onChange={this.handleFileChange} />
                    </div>
                    <div className='col'>
                        <button
                            className='btn btn-primary'
                            onClick={this.handleFileUpload}
                            disabled={!this.state.selectedFile}  // Disable if no file is selected
                        >
                            <i className="pi pi-cloud-upload"></i>
                        </button>
                    </div>
                </div>
                <br />
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by file name"
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                />
                <br />
                <table className="table table-striped center-text">
                    <thead>
                        <tr>
                            <th scope="col">File Name</th>
                            <th scope="col">File Size</th>
                            <th scope="col">Upload Date & Time</th>
                            <th scope="col">Created By</th>
                            <th scope="col">Download</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredFiles.slice().reverse().map((file, index) => (
                                <tr key={file.fileId || index}>
                                    <td><a className='file-link' href={file.webViewLink} target="_blank" rel="noreferrer">{file.fileName}</a></td>
                                    <td>{file.fileSize} bytes</td>
                                    <td>{this.formatDateTime(file.uploadedAt)}</td>
                                    <td>{file.uploadedBy}</td>
                                    <td>
                                        <button className='btn btn-success' onClick={(event) => this.handleDownload(event, file)}>
                                            <i className="pi pi-cloud-download"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <button className='btn btn-danger' onClick={(event) => this.handleDelete(event, file)}>
                                            <i className="pi pi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default FileUpload;
