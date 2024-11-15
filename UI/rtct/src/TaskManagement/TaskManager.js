import React, { Component } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios'; // Ensure axios is imported
import constants from '../Services/Constants'

class TaskManager extends Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem("user"));
        this.state = {
            tasks: [],
            filteredTasks: [], // New state to hold filtered tasks
            searchQuery: '', // New state to store the search query
            title: '',
            description: '',
            status: 'new',
            createdBy: this.user.email,
            updatedBy: '-',
            client: null // For WebSocket client
        };
    }

    componentDidMount() {
        const socket = new SockJS(constants.BACKEND_URL + 'ws'); // Adjust URL as needed
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe('/topic/taskUpdates', (message) => {
                    const notification = JSON.parse(message.body);
                    this.setState((prevState) => ({
                        tasks: prevState.tasks.map(t => t.id === notification.id ? notification : t),
                        filteredTasks: prevState.tasks.map(t => t.id === notification.id ? notification : t)
                    }));
                });
            },
            onStompError: (frame) => {
                console.error('Broker error: ', frame);
            }
        });

        client.activate();
        this.setState({ client });
        this.tasksInterval = setInterval(() => {
            this.fetchTasks();
        }, 2000);
    }

    componentWillUnmount() {
        if (this.state.client) {
            this.state.client.deactivate();
        }
        if (this.tasksInterval) {
            clearInterval(this.tasksInterval);
        }
    }

    fetchTasks = () => {
        axios.get(constants.BACKEND_URL + 'api/tasks') // Adjust URL as needed
            .then(response => {
                this.setState({ tasks: response.data, filteredTasks: response.data });
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    handleTaskUpdate = (task) => {
        this.openPopup();
        task.updatedBy = this.user.email;
        setTimeout(() => {
            axios.put(`${constants.BACKEND_URL}api/tasks/${task.id}`, task) // Adjust URL as needed
                .then(response => {
                    alert('Task added successfully- ' + response.data);
                    this.state.client.publish({ destination: '/app/updateTask', body: JSON.stringify(response.data) });
                    this.fetchTasks();
                    this.closePopup();
                })
                .catch(error => {
                    console.error('Error updating task:', error);
                    this.closePopup();
                });
        }, 1000);
    }

    handleTaskDelete = (task) => {
        this.openPopup();
        if (this.user.email === task.createdBy) {
            if (window.confirm("Are you sure you want to delete this task?")) {
                const id = task.id;
                console.log(id);
                axios.delete(`${constants.BACKEND_URL}api/tasks/deleteTask/${task.id}`) // Adjust URL as needed
                    .then(response => {
                        this.state.client.publish({ destination: '/app/deleteTask', body: JSON.stringify(response.data) });
                        this.fetchTasks();
                        axios.post(constants.BACKEND_URL + 'api/notifications/add', {
                            desc: task.title + "task deleted from the server.",
                            createdBy: this.user.email
                        })
                            .then(response => {
                                console.log('Notification added.');
                            })
                            .catch(error => {
                                console.error('Error adding notification:', error);
                            });
                        this.closePopup();
                    })
                    .catch(error => {
                        console.error('Error updating task:', error);
                        this.closePopup();
                    });
            } else {
                this.closePopup();
            }
        } else {
            alert("You don't have permission to delete this task.");
            this.closePopup();
        }
    }

    handleTaskCreation = () => {
        this.openPopup()
        const { title, description, status, createdBy, updatedBy } = this.state;
        axios.post(constants.BACKEND_URL + 'api/tasks', { title, description, status, createdBy, updatedBy }) // Adjust URL as needed
            .then(response => {
                this.setState((prevState) => ({
                    tasks: [...prevState.tasks, response.data],
                    filteredTasks: [...prevState.tasks, response.data],
                    title: '',
                    description: '',
                    status: 'new',
                    createdBy: this.user.email,
                    updatedBy: '-'
                }));
                this.state.client.publish({ destination: '/app/newTask', body: JSON.stringify(response.data) });
                this.closePopup()
            })
            .catch(error => {
                console.error('Error creating task:', error);
                this.closePopup();
            });

        let notification = this.state;
        notification.desc = `New task created "${notification.title}"`;
        axios.post(constants.BACKEND_URL + 'api/notifications/add', {
            desc: notification.desc, // Assuming the notification has a 'desc' field
            createdBy: notification.createdBy
        })
            .then(response => {
                console.log('Notification added:', response.data);
            })
            .catch(error => {
                console.error('Error adding notification:', error);
            });
    }

    handleSearch = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        const filteredTasks = this.state.tasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery) ||
            task.description.toLowerCase().includes(searchQuery)
        );
        this.setState({ searchQuery, filteredTasks });
    }

    openPopup = () => {
        document.getElementById("loadingPopup").style.display = "flex";
    }

    closePopup = () => {
        document.getElementById("loadingPopup").style.display = "none";
    }

    render() {
        const isCreateDisabled = !this.state.title || !this.state.description; // Disable button if title or description is empty

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
                <h3>Create New Task</h3>
                <br />
                <div className="row">
                    <div className="col">
                        <input type="text"
                            className="form-control"
                            placeholder="Task title"
                            value={this.state.title}
                            onChange={(e) => this.setState({ title: e.target.value })} />
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Task description"
                            value={this.state.description}
                            onChange={(e) => this.setState({ description: e.target.value })}
                        />
                    </div>
                    <div className='col'>
                        <button
                            className='btn btn-primary'
                            onClick={this.handleTaskCreation}
                            disabled={isCreateDisabled} // Disable button based on the condition
                        >
                            <i className="pi pi-book"></i>
                        </button>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search tasks"
                            value={this.state.searchQuery}
                            onChange={this.handleSearch}
                        />
                    </div>
                </div>
                <br />
                <h3>Task List</h3>
                <table className="table table-striped center-text">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Created By</th>
                            <th>Updated By</th>
                            <th>Status</th>
                            <th>Mark as pending</th>
                            <th>Mark as complete</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    {this.state.filteredTasks.slice().reverse().map((task, index) => (
                        <tbody key={task.id || index}>
                            <tr>
                                <td>{task.title}</td>
                                <td>{task.description}</td>
                                <td>{task.createdBy}</td>
                                <td>{task.updatedBy}</td>
                                <td>{task.status}</td>
                                <td><button className='btn btn-warning' onClick={() => this.handleTaskUpdate({ ...task, status: 'pending', updatedBy: 'user1' })}>
                                    <i className="pi pi-stop-circle"></i>
                                </button>
                                </td>
                                <td><button className='btn btn-success' onClick={() => this.handleTaskUpdate({ ...task, status: 'completed', updatedBy: 'user1' })}>
                                    <i className="pi pi-check-circle"></i>
                                </button>
                                </td>
                                <td><button className='btn btn-danger' onClick={() => this.handleTaskDelete(task)}>
                                    <i className="pi pi-trash"></i>
                                </button>
                                </td>
                            </tr>
                        </tbody>
                    ))}
                </table>
            </div>
        );
    }
}

export default TaskManager;
