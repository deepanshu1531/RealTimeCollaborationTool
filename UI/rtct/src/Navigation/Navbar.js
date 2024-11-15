import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import constants from '../Services/Constants';
import axios from 'axios';

class Navbar extends Component {


    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem("user"));
    }


    handleLogout = () => {

        axios.get(constants.BACKEND_URL + 'api/users/logout')
            .then(response => {
                console.log(response.data);
                // Clear user data from localStorage or sessionStorage
                localStorage.removeItem("user");
                console.log("User logged out");

                // Redirect to login page
                window.location.href = "/";
            })
            .catch(error => {
                alert("Error Occured.")
                console.error('Error Occured', error);
            });
    };

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <i className="pi pi-user" style={{ fontSize: '2rem' }}></i>
                <Link className="navbar-brand ms-3" to="#">
                    {this.user.name} |
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/file-management">File Manager</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/task-manager">Task Manager</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/file-notifications">Notifications</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/messages">Chats</Link>
                        </li>
                    </ul>
                    <button className="btn btn-outline-danger ms-auto me-3" onClick={this.handleLogout}>
                        <i className="pi pi-sign-out" style={{ fontSize: '1rem' }}></i>
                    </button>
                </div>
            </nav>
        );
    }
}

export default Navbar;
