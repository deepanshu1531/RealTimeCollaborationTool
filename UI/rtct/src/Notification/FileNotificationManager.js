import React, { Component } from 'react';
import axios from 'axios'; // Make sure to import axios
import constants from '../Services/Constants'; // Import your constants file for backend URL

class FileNotificationManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            searchQuery: '' // State to hold the search query for notifications
        };
    }

    componentDidMount() {
        // Fetch all notifications when the component mounts
        this.openPopup();
        this.fetchNotification();
        this.closePopup();
        this.notifyInterval = setInterval(() => {
            this.fetchNotification();
        }, 2000);
    }

    componentWillUnmount() {
        if (this.notifyInterval) {
            clearInterval(this.notifyInterval);
        }
    }

    fetchNotification = () => {
        axios.get(constants.BACKEND_URL + 'api/notifications')
            .then(response => {
                this.setState({ notifications: response.data }); // Update the state with the fetched notifications
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
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
        // Filter notifications based on the search query
        const filteredNotifications = this.state.notifications.filter(notification =>
            notification.desc.toLowerCase().includes(this.state.searchQuery.toLowerCase())
        );

        return (
            <div>
                <div id="loadingPopup" className="popup-overlay" style={{ display: "none" }}>
                    <div className="popup-content">
                        <button className="btn btn-primary" disabled>
                            <span className="spinner-border spinner-border-sm"></span>
                            Loading..
                        </button>
                    </div>
                </div>
                <h3>File Notifications</h3>
                <br />
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by description"
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                />
                <br />
                <ul>
                    {filteredNotifications.slice().reverse().map((notification, index) => (
                        <li key={index}>
                            <h6>{notification.desc} - By: {notification.createdBy} | At: {this.formatDateTime(notification.createdAt)}</h6>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default FileNotificationManager;
