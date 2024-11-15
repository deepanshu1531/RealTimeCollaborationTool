import React, { Component } from 'react';
import axios from 'axios';
import './chat.css';
import Constants from '../Services/Constants';

class UserList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            searchQuery: '',
            loading: true,
            error: null,
            foundUser: null
        };
    }

    componentDidMount() {
        this.loadUsers();
    }

    // Fetch all users from the backend
    loadUsers = () => {
        axios.get(Constants.BACKEND_URL + 'api/users')
            .then(response => {
                this.setState({ users: response.data, loading: false });
            })
            .catch(error => {
                console.error('Error loading users:', error);
                this.setState({ error: 'Failed to load users.', loading: false });
            });
    };

    // Handle search input change and search for user by email
    handleSearchChange = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        this.setState({ searchQuery });

        if (searchQuery.length > 0) {
            const foundUser = this.state.users.find(user =>
                user.email.toLowerCase().includes(searchQuery)
            );
            this.setState({ foundUser });
        } else {
            this.setState({ foundUser: null });  // Reset if input is cleared
        }
    };

    // Handle user selection and pass selected user email to parent
    handleUserSelect = (userEmail) => {
        this.setState({ selectedUserEmail: userEmail, searchQuery: '', foundUser: null });
        this.props.onUserSelect(userEmail); // Pass selected user back to parent component
    };

    render() {
        const { searchQuery, foundUser, loading, error } = this.state;

        return (
            <div className="user-list container p-3">

                {/* Search Box */}
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={this.handleSearchChange}
                    className="form-control mb-3"
                />

                {/* Loading, error, or no user message */}
                {loading && <p>Loading users...</p>}  {/* Show loading message */}
                {error && <p className="text-danger">{error}</p>}  {/* Show error message */}

                {/* Show found user or no results */}
                {!loading && searchQuery && !foundUser && <p>No user found.</p>}
                {foundUser && (
                    <div className="user-list-item mb-3">
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => this.handleUserSelect(foundUser.email)}
                        >
                            {foundUser.name}({foundUser.email})
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default UserList;
