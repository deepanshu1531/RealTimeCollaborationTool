import React, { Component, createRef } from 'react';
import axios from 'axios';
import UserList from './UserList';
import Constants from '../Services/Constants';
import EmojiPicker from 'emoji-picker-react';
import NotificationSound from './notification.mp3';
import './chat.css';
import 'primeicons/primeicons.css';


class ChatComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: JSON.parse(localStorage.getItem("user")),
            receiverEmail: sessionStorage.getItem("receiverEmail") !== null ? JSON.parse(sessionStorage.getItem("receiverEmail")) : null,
            recentChats: (sessionStorage.getItem("recentChats") !== undefined && sessionStorage.getItem("recentChats") !== null) ? JSON.parse(sessionStorage.getItem("recentChats")) : [],
            messages: sessionStorage.getItem("messages") !== null ? JSON.parse(sessionStorage.getItem("messages")) : [],
            newMessage: '',
            attachment: null,
            read: false,
            showEmojiPicker: false,
        };
        this.chatInterval = null;
        this.messagesEndRef = createRef(); // Ref to keep track of the last message
        this.notificationAudio = createRef();
    }

    componentDidMount() {
        // Clear any previous interval
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
        }
        // Start a new interval to refresh chat history every 3 seconds
        this.chatInterval = setInterval(() => {
            this.loadChatHistory(this.state.receiverEmail);
            this.loadRecentChats();
        }, 2000);
        this.scrollToBottom();

        // Add click listener to close emoji picker
        document.addEventListener("click", this.handleOutsideEmojiClick);
    }

    scrollToBottom = () => {
        setTimeout(() => {
            if (this.messagesEndRef.current) {
                this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
    };

    componentWillUnmount() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
        }

        // Remove click listener
        document.removeEventListener("click", this.handleOutsideClick);
    }

    formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-4);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} & ${hours}:${minutes}`;
    }

    playNotification = () => {
        if (this.notificationAudio.current) {
            this.notificationAudio.current.play().catch(error => {
                console.error("Audio play error:", error);
            });
        }
    };

    loadChatHistory = (receiver) => {
        if (receiver) {
            axios.get(`${Constants.BACKEND_URL}api/chat/message/${this.state.user.email}/${receiver}`)
                .then(response => {
                    sessionStorage.setItem('messages', JSON.stringify(response.data.message));
                    sessionStorage.setItem('receiverEmail', JSON.stringify(receiver));
                    this.setState({
                        messages: response.data.message
                    });
                })
                .catch(error => {
                    console.error('There was an error fetching the chat history!', error);
                });
        }
    };

    loadRecentChats = () => {
        axios.get(`${Constants.BACKEND_URL}api/chat/history`)
            .then(response => {
                const newRecentChats = response.data;
                const previousRecentChats = this.state.recentChats;
                sessionStorage.setItem('recentChats', JSON.stringify(newRecentChats));
                // Check if the new chats are different from the previous ones
                if (JSON.stringify(newRecentChats) !== JSON.stringify(previousRecentChats)) {
                    this.setState({
                        recentChats: newRecentChats
                    });
                    this.playNotification(); // Play sound only if recentChats have changed
                }
            })
            .catch(error => {
                console.error('There was an error fetching the chat history!', error);
            });
    }

    handleUserSelect = (receiverEmail) => {
        this.openPopup();
        this.setState({ receiverEmail }, () => {
            this.loadChatHistory(receiverEmail);
            axios.get(`${Constants.BACKEND_URL}api/chat/status/${this.state.user.email}/${receiverEmail}`)
                .then(response => {
                    this.setState({
                        read: !this.state.read
                    });
                    this.closePopup();
                })
                .catch(error => {
                    console.error('There was an error in changing status!', error);
                    this.closePopup();
                });
        });
    };

    handleOutsideEmojiClick = (event) => {
        const emojiPickerElement = document.querySelector('.emoji-picker'); // Adjust the selector if needed
        const toggleButton = event.target.closest('.pi-face-smile');

        // Check if the click is outside the emoji picker and not on the toggle button
        if (
            this.state.showEmojiPicker &&
            emojiPickerElement &&
            !emojiPickerElement.contains(event.target) &&
            !toggleButton
        ) {
            this.setState({ showEmojiPicker: false });
        }
    };

    toggleEmojiPicker = () => {
        this.setState((prevState) => ({ showEmojiPicker: !prevState.showEmojiPicker }));
    };

    onEmojiClick = (emojiObject) => {
        this.setState({ newMessage: this.state.newMessage + emojiObject.emoji });
    };

    handleMessageChange = (e) => {
        this.setState({ newMessage: e.target.value });
    };

    handleFileChange = (e) => {
        this.setState({ attachment: e.target.files[0] });
    };

    sendMessage = async (event) => {
        event.preventDefault();
        if (this.state.newMessage !== '') {
            const formData = new FormData();
            formData.append('senderEmail', this.state.user.email);
            formData.append('receiverEmail', this.state.receiverEmail);
            formData.append('content', this.state.newMessage);
            formData.append('attachment', this.state.attachment);

            await axios.post(`${Constants.BACKEND_URL}api/chat/send`, formData)
                .then(response => {
                    console.log('Message sent successfully- ', response.data);
                    this.setState({
                        newMessage: '',
                        attachment: null
                    })
                    this.loadChatHistory(this.state.receiverEmail);
                    this.loadRecentChats();
                    this.scrollToBottom();
                })
                .catch(error => {
                    console.error('There was an error sending the message!', error);
                });
        }
    };

    openPopup = () => {
        document.getElementById("loadingPopup").style.display = "flex";
    }

    closePopup = () => {
        document.getElementById("loadingPopup").style.display = "none";
    }

    render() {
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
                <audio ref={this.notificationAudio} src={NotificationSound} />
                <span style={{ marginLeft: '1.5rem' }}>
                    <div className="alert alert-primary">
                        <h5><i className="pi pi-envelope" style={{ fontSize: '1.5rem' }}></i> &nbsp;
                            {this.state.receiverEmail ? `${this.state.receiverEmail}` : ''}
                        </h5>
                    </div>
                    {/* {this.state.receiverEmail ? `${this.state.receiverEmail}` : ''} */}
                </span>
                <div className='row'>
                    <div className='chat-container col'>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <h4>RTCT Chats</h4>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.recentChats.slice().reverse().map((chat, chatIndex) => (
                                    (this.state.user.email === chat.user_1 || this.state.user.email === chat.user_2) && (
                                        <tr key={`${chatIndex}`} style={{ height: "60px" }}>
                                            <td>
                                                <button
                                                    onClick={() => {
                                                        this.handleUserSelect(
                                                            this.state.user.email === chat.user_1 ? chat.user_2 : chat.user_1
                                                        );
                                                        this.scrollToBottom();
                                                    }}
                                                    className={(chat.status === "unread" && this.state.user.email === chat.message[chat.message.length - 1]
                                                        .receiverEmail
                                                    ) ? "btn btn-outline-primary" : "btn btn-outline-secondary"}
                                                    style={{ height: "60px", width: "100%" }}
                                                >
                                                    {this.state.user.email === chat.user_1 ? chat.user_2 : chat.user_1}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="chat-container col-8">
                        <UserList onUserSelect={this.handleUserSelect} />
                        {this.state.receiverEmail && (
                            <>
                                <div className="chat-history">
                                    {this.state.messages.map((msg, index) => (
                                        <div key={index} className={`message ${msg.senderEmail === this.state.user.email ? 'sent' : 'received'}`}>
                                            <p>{msg.content}</p>
                                            <p className={`timestamp ${msg.senderEmail === this.state.user.email ? 'timestamp-sent' : 'timestamp-received'}`}>
                                                {this.formatDateTime(msg.timestamp)}
                                            </p>
                                            {msg.attachmentUrl && <a href={msg.attachmentUrl}>Download Attachment</a>}
                                        </div>
                                    ))}
                                    <div ref={this.messagesEndRef} />
                                </div>
                                <form className="new-message" onSubmit={this.sendMessage}>

                                    {/* Emoji Picker (Shown when active) */}
                                    {this.state.showEmojiPicker && (
                                        <div className="emoji-picker">
                                            <EmojiPicker onEmojiClick={(emojiData) => this.onEmojiClick(emojiData)} />
                                        </div>
                                    )}

                                    <div className="input-group">
                                        {/* Text Input */}
                                        <input
                                            className="form-control"
                                            type="text"
                                            value={this.state.newMessage}
                                            onChange={this.handleMessageChange}
                                            placeholder="Type a message..."
                                        />

                                        {/* File Upload Button */}
                                        <label htmlFor="file-upload" className="input-group-text btn btn-outline-secondary">
                                            <i className="pi pi-paperclip" style={{ fontSize: '1rem' }}></i>
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            onChange={this.handleFileChange}
                                            style={{ display: 'none' }}
                                        />

                                        {/* Emoji Picker Button */}
                                        <button
                                            type="button"
                                            onClick={this.toggleEmojiPicker}
                                            className="input-group-text btn btn-outline-secondary"
                                        >
                                            <i className="pi pi-face-smile" style={{ fontSize: '1rem' }}></i>
                                        </button>

                                        {/* Send Button */}
                                        <button
                                            type="button"
                                            onClick={this.sendMessage}
                                            className="input-group-text btn btn-outline-success"
                                        >
                                            <i className="pi pi-send" style={{ fontSize: '1rem' }}></i>
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatComponent;
