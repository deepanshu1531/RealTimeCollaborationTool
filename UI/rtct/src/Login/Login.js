import React, { Component } from "react";
import axios from "axios";
import constants from '../Services/Constants';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            errorMessage: "",
            client: null // To store WebSocket client
        };
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        this.openPopup();

        const { email, password } = this.state;

        try {
            // Make a POST request to the backend API for login
            const response = await axios.post(constants.BACKEND_URL + "api/users/auth", {
                email,
                password,
            });

            // Handle successful login
            console.log("Login successful!", response.data);

            localStorage.setItem("user", JSON.stringify(response.data));
            sessionStorage.removeItem("messages");
            sessionStorage.removeItem("receiverEmail");

            this.setState({ errorMessage: "" });

            // Initialize WebSocket connection after successful login
            this.connectToWebSocket();

            this.closePopup();

            window.location = '/';

        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    this.setState({ errorMessage: "Invalid email or password" });
                    this.closePopup();
                } else {
                    this.setState({ errorMessage: "Something went wrong, please try again later" });
                    this.closePopup();
                }
            } else {
                this.setState({ errorMessage: "Network error, please try again later" });
                this.closePopup();
            }
            console.error("Error during login:", error);
            this.closePopup();
        }
    };

    connectToWebSocket = () => {
        const socket = new SockJS(constants.BACKEND_URL + "ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // Auto-reconnect with a delay
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/someTopic", (message) => {
                    console.log("Received message from /topic/someTopic:", message.body);
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket error:", frame);
            },
        });

        client.activate(); // Activate the WebSocket client
        this.setState({ client }); // Store the client in the state
    };

    componentWillUnmount() {
        // Disconnect WebSocket client when the component unmounts
        if (this.state.client) {
            this.state.client.deactivate();
        }
    }

    openPopup = () => {
        document.getElementById("loadingPopup").style.display = "flex";
    }

    closePopup = () => {
        document.getElementById("loadingPopup").style.display = "none";
    }

    render() {
        return (
            <div className="login-page">
                <div id="loadingPopup" class="popup-overlay" style={{ display: "none" }}>
                    <div class="popup-content">
                        <button class="btn btn-primary" disabled>
                            <span class="spinner-border spinner-border-sm"></span>
                            Loading..
                        </button>
                    </div>
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center min-vh-100">
                        <div className="col-md-6 col-lg-4">
                            <div className="card shadow-lg border-0 rounded">
                                <div className="card-body p-5">
                                    <h3 className="card-title text-center mb-4">RTCT</h3>
                                    {this.state.errorMessage && (
                                        <div className="alert alert-danger" role="alert">
                                            {this.state.errorMessage}
                                        </div>
                                    )}
                                    <form onSubmit={this.handleSubmit}>
                                        <div className="form-group mb-3">
                                            <label htmlFor="email" className="form-label">Email address</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                id="email"
                                                name="email"
                                                value={this.state.email}
                                                onChange={this.handleChange}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label htmlFor="password" className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                id="password"
                                                name="password"
                                                value={this.state.password}
                                                onChange={this.handleChange}
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </div>
                                        <button style={{ width: '100%' }} type="submit" className="btn btn-primary btn-lg btn-block">
                                            LOGIN <i className="pi pi-sign-in"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
