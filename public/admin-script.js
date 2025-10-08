document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token || user.role !== 'admin') {
        // Redirect to login page
        window.location.href = '/';
        return;
    }
    
    // Setup tab event listeners
    setupAdminTabEventListeners();
    
    // Setup logout button
    setupLogoutButton();
    
    // Setup user management event listeners
    setupUserManagementListeners();
    
    // Setup document management event listeners
    setupDocumentManagementListeners();
    
    // Setup blog management event listeners
    setupBlogManagementListeners();
    
    // Load initial content
    loadUsers();
    loadDevices();
    loadDocuments();
    loadBlogPosts();
    loadNotificationsManagement();
});

// Setup admin tab event listeners
function setupAdminTabEventListeners() {
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showAdminTab(tabName, this);
        });
    });
}

// Show admin tab
function showAdminTab(tabName, clickedElement = null) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked tab
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

// Load users
function loadUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    fetch('/api/admin/users', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const usersTableBody = document.getElementById('users-table-body');
        if (data.users && data.users.length > 0) {
            // Update user statistics
            updateUserStats(data.users);
            
            // Store users for search functionality
            window.allUsers = data.users;
            
            // Render users table
            renderUsersTable(data.users);
        } else {
            usersTableBody.innerHTML = '<tr><td colspan="8">No users found.</td></tr>';
            updateUserStats([]);
        }
    })
    .catch(error => {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = '<tr><td colspan="7">Error loading users.</td></tr>';
    });
}

// Load devices
function loadDevices() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    fetch('/api/admin/devices', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const devicesTableBody = document.getElementById('devices-table-body');
        if (data.devices && data.devices.length > 0) {
            devicesTableBody.innerHTML = data.devices.map(device => {
                const heartbeatText = device.last_heartbeat ? 
                    `${new Date(device.last_heartbeat).toLocaleString()} (${device.heartbeat_minutes_ago}m ago)` : 
                    'Never';
                const notificationText = device.last_notification_sync ? 
                    `${new Date(device.last_notification_sync).toLocaleString()} (${device.notification_minutes_ago}m ago)` : 
                    'Never';
                
                return `
                <tr>
                    <td>${device.device_id}</td>
                    <td>${device.user_name}</td>
                    <td class="${device.is_online ? 'status-online' : 'status-offline'}">
                        ${device.is_online ? '🟢 Online' : '🔴 Offline'}
                    </td>
                    <td>${heartbeatText}</td>
                    <td>${notificationText}</td>
                    <td class="${device.permission_status === 'Enabled' ? 'status-enabled' : 'status-disabled'}">
                        ${device.permission_status}
                    </td>
                </tr>
            `;
            }).join('');
        } else {
            devicesTableBody.innerHTML = '<tr><td colspan="6">No devices found.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error loading devices:', error);
        document.getElementById('devices-table-body').innerHTML = '<tr><td colspan="6">Error loading devices.</td></tr>';
    });
}

// Load documents
function loadDocuments() {
    const token = localStorage.getItem('token');
    
    fetch('/api/documents', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const documentsManagement = document.getElementById('documents-management');
        if (data.documents && data.documents.length > 0) {
            documentsManagement.innerHTML = `
                <div class="documents-header">
                    <h2>Document Management</h2>
                    <button class="btn primary" id="createDocumentBtn">Create New Document</button>
                    </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Version</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.documents.map(doc => `
                                <tr>
                                    <td>${doc.id}</td>
                                    <td>${doc.type}</td>
                                    <td>${doc.version}</td>
                                    <td>${new Date(doc.updated_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn primary" data-document-id="${doc.id}" data-action="edit">Edit</button>
                                        <button class="btn danger" data-document-id="${doc.id}" data-action="delete">Delete</button>
                                    </td>
                                </tr>
                `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Setup document management event listeners
            setupDocumentManagementListeners();
        } else {
            documentsManagement.innerHTML = `
                <div class="documents-header">
                    <h2>Document Management</h2>
                    <button class="btn primary" id="createDocumentBtn">Create New Document</button>
                </div>
                <p>No documents available.</p>
            `;
            setupDocumentManagementListeners();
        }
    })
    .catch(error => {
        console.error('Error loading documents:', error);
        document.getElementById('documents-management').innerHTML = '<p>Error loading documents.</p>';
    });
}

// Load blog posts
function loadBlogPosts() {
    fetch('/api/blogs')
    .then(response => response.json())
    .then(data => {
        const blogManagement = document.getElementById('blog-management');
        if (data.blogs && data.blogs.length > 0) {
            blogManagement.innerHTML = `
                <div class="blog-list">
                    ${data.blogs.map(blog => `
                        <div class="blog-card">
                            <img src="${blog.featured_image_url || 'https://via.placeholder.com/300x200'}" alt="${blog.title}" class="blog-image">
                            <div class="blog-content">
                                <h3 class="blog-title">${blog.title}</h3>
                                <p class="blog-date">${new Date(blog.created_at).toLocaleDateString()}</p>
                                <button class="btn primary" data-blog-id="${blog.id}" data-action="edit">Edit</button>
                                <button class="btn danger" data-blog-id="${blog.id}" data-action="delete">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Setup blog management event listeners
            setupBlogManagementListeners();
        } else {
            blogManagement.innerHTML = '<p>No blog posts available.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading blog posts:', error);
        document.getElementById('blog-management').innerHTML = '<p>Error loading blog posts.</p>';
    });
}

// Show create blog form
function showCreateBlogForm() {
    const blogManagement = document.getElementById('blog-management');
    blogManagement.innerHTML = `
        <div class="form-container">
            <h2>Create New Blog Post</h2>
            <form id="createBlogForm">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="featuredImageUrl">Featured Image URL</label>
                    <input type="text" id="featuredImageUrl" name="featuredImageUrl">
                </div>
                <div class="form-group">
                    <label for="htmlContent">Content (HTML)</label>
                    <textarea id="htmlContent" name="htmlContent" rows="10" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-back" id="cancelCreateBlogBtn">Cancel</button>
                    <button type="submit" class="btn btn-submit">Create Post</button>
                </div>
            </form>
        </div>
    `;
    
    // Handle form submission
    document.getElementById('createBlogForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const featuredImageUrl = document.getElementById('featuredImageUrl').value;
        const htmlContent = document.getElementById('htmlContent').value;
        
        // Simulate API call
        fetch('/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ title, featuredImageUrl, htmlContent })
        })
        .then(response => response.json())
        .then(data => {
            if (data.blog) {
                alert('Blog post created successfully!');
                loadBlogPosts();
            } else {
                alert('Failed to create blog post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error creating blog post:', error);
            alert('Error creating blog post.');
        });
    });
    
    // Handle cancel button
    document.getElementById('cancelCreateBlogBtn').addEventListener('click', function() {
        loadBlogPosts();
    });
}

// Edit blog post
function editBlogPost(id) {
    // Simulate API call to get blog post
    fetch(`/api/blogs/${id}`)
    .then(response => response.json())
    .then(data => {
        if (data.blog) {
            const blogManagement = document.getElementById('blog-management');
            blogManagement.innerHTML = `
                <div class="form-container">
                    <h2>Edit Blog Post</h2>
                    <form id="editBlogForm">
                        <input type="hidden" id="id" name="id" value="${data.blog.id}">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" value="${data.blog.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="featuredImageUrl">Featured Image URL</label>
                            <input type="text" id="featuredImageUrl" name="featuredImageUrl" value="${data.blog.featured_image_url || ''}">
                        </div>
                        <div class="form-group">
                            <label for="htmlContent">Content (HTML)</label>
                            <textarea id="htmlContent" name="htmlContent" rows="10" required>${data.blog.html_content}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-back" id="cancelEditBlogBtn">Cancel</button>
                            <button type="submit" class="btn btn-submit">Update Post</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Handle form submission
            document.getElementById('editBlogForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const id = document.getElementById('id').value;
                const title = document.getElementById('title').value;
                const featuredImageUrl = document.getElementById('featuredImageUrl').value;
                const htmlContent = document.getElementById('htmlContent').value;
                
                // Simulate API call
                fetch(`/api/blogs/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ title, featuredImageUrl, htmlContent })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.blog) {
                        alert('Blog post updated successfully!');
                        loadBlogPosts();
                    } else {
                        alert('Failed to update blog post: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error updating blog post:', error);
                    alert('Error updating blog post.');
                });
            });
            
            // Handle cancel button
            document.getElementById('cancelEditBlogBtn').addEventListener('click', function() {
                loadBlogPosts();
            });
        } else {
            alert('Blog post not found.');
        }
    })
    .catch(error => {
        console.error('Error loading blog post:', error);
        alert('Error loading blog post.');
    });
}

// Delete blog post
function deleteBlogPost(id) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        // Simulate API call
        fetch(`/api/blogs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Blog post deleted successfully!');
                loadBlogPosts();
            } else {
                alert('Failed to delete blog post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting blog post:', error);
            alert('Error deleting blog post.');
        });
    }
}

// Setup document management event listeners
function setupDocumentManagementListeners() {
    const documentsManagement = document.getElementById('documents-management');
    
    // Handle create document button
    const createBtn = documentsManagement.querySelector('#createDocumentBtn');
    if (createBtn) {
        createBtn.addEventListener('click', showCreateDocumentForm);
    }
    
    // Handle edit and delete buttons using event delegation
    documentsManagement.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="edit"]')) {
            const documentId = e.target.getAttribute('data-document-id');
            editDocument(documentId);
        } else if (e.target.matches('[data-action="delete"]')) {
            const documentId = e.target.getAttribute('data-document-id');
            deleteDocument(documentId);
        }
    });
}

// Show create document form
function showCreateDocumentForm() {
    const documentsManagement = document.getElementById('documents-management');
    documentsManagement.innerHTML = `
        <div class="form-container">
            <h2>Create New Document</h2>
            <form id="createDocumentForm">
                <div class="form-group">
                    <label for="type">Type</label>
                    <input type="text" id="type" name="type" required placeholder="e.g., privacy-policy, terms-of-service">
                </div>
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required placeholder="Document title">
                </div>
                <div class="form-group">
                    <label for="content">Content (HTML)</label>
                    <textarea id="content" name="content" rows="10" required placeholder="Enter HTML content..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-back" onclick="loadDocuments()">Cancel</button>
                    <button type="submit" class="btn btn-submit">Create Document</button>
                </div>
            </form>
        </div>
    `;
    
    // Handle form submission
    document.getElementById('createDocumentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createDocument();
    });
}

// Create document
function createDocument() {
    const token = localStorage.getItem('token');
    const type = document.getElementById('type').value;
    const title = document.getElementById('title').value;
    const html_content = document.getElementById('content').value;
    
    fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, title, html_content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('Document created successfully!');
            loadDocuments();
        } else {
            alert('Error creating document: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error creating document:', error);
        alert('Error creating document.');
    });
}

// Edit document
function editDocument(id) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/documents/admin/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.document) {
            const documentsManagement = document.getElementById('documents-management');
            documentsManagement.innerHTML = `
                <div class="form-container">
                    <h2>Edit Document</h2>
                    <form id="editDocumentForm">
                        <input type="hidden" id="id" name="id" value="${data.document.id}">
                        <div class="form-group">
                            <label for="type">Type</label>
                            <input type="text" id="type" name="type" value="${data.document.type}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" value="${data.document.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="content">Content (HTML)</label>
                            <textarea id="content" name="content" rows="10" required>${data.document.html_content}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-back" onclick="loadDocuments()">Cancel</button>
                            <button type="submit" class="btn btn-submit">Update Document</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Handle form submission
            document.getElementById('editDocumentForm').addEventListener('submit', function(e) {
                e.preventDefault();
                updateDocument(data.document.id);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching document:', error);
        alert('Error fetching document.');
    });
}

// Update document
function updateDocument(id) {
    const token = localStorage.getItem('token');
    const title = document.getElementById('title').value;
    const html_content = document.getElementById('content').value;
    
                fetch(`/api/documents/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
                    },
        body: JSON.stringify({ title, html_content })
                })
                .then(response => response.json())
                .then(data => {
        if (data.message) {
                        alert('Document updated successfully!');
                        loadDocuments();
                    } else {
            alert('Error updating document: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error updating document:', error);
                    alert('Error updating document.');
    });
}

// Delete document
function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        const token = localStorage.getItem('token');
        
        fetch(`/api/documents/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Document deleted successfully!');
                loadDocuments();
            } else {
                alert('Error deleting document: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting document:', error);
            alert('Error deleting document.');
        });
    }
}

// Edit user
function editUser(id) {
    console.log('Editing user with ID:', id);
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    fetch(`/api/admin/users/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('User data received:', data);
        if (data.user) {
            const usersTableBody = document.getElementById('users-table-body');
            usersTableBody.innerHTML = `
                <tr>
                    <td>${data.user.id}</td>
                    <td><input type="text" id="name-${data.user.id}" value="${data.user.name}"></td>
                    <td><input type="email" id="email-${data.user.id}" value="${data.user.email}"></td>
                    <td>
                        <select id="role-${data.user.id}">
                            <option value="user" ${data.user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${data.user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td>${data.user.device_id || 'N/A'}</td>
                    <td>${new Date(data.user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn primary save-user-btn" data-user-id="${data.user.id}">Save</button>
                        <button class="btn secondary cancel-edit-btn">Cancel</button>
                    </td>
                </tr>
            `;
        } else {
            console.log('No user found in response:', data);
            alert('User not found.');
        }
    })
    .catch(error => {
        console.error('Error loading user:', error);
        alert('Error loading user: ' + error.message);
    });
}

// Update user
function updateUser(id) {
    const name = document.getElementById(`name-${id}`).value;
    const email = document.getElementById(`email-${id}`).value;
    const role = document.getElementById(`role-${id}`).value;
    
    console.log('Updating user:', { id, name, email, role });
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ name, email, role })
    })
    .then(response => {
        console.log('Update response status:', response.status);
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Update response data:', data);
        if (data.user) {
            alert('User updated successfully!');
            loadUsers();
        } else {
            alert('Failed to update user: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + error.message);
    });
}

// Delete user
function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const token = localStorage.getItem('token');
        
        fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert('User deleted successfully!');
                loadUsers();
            } else {
                alert('Failed to delete user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please try again later.');
        });
    }
}

// Setup logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '/';
        });
    }
}

// Setup user management event listeners
function setupUserManagementListeners() {
    // Use event delegation for dynamically created buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            editUser(userId);
        } else if (e.target.classList.contains('delete-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            deleteUser(userId);
        } else if (e.target.classList.contains('save-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            updateUser(userId);
        } else if (e.target.classList.contains('cancel-edit-btn')) {
            loadUsers();
        } else if (e.target.classList.contains('create-user-btn')) {
            showCreateUserForm();
        } else if (e.target.id === 'clearSearch') {
            document.getElementById('userSearch').value = '';
            if (window.allUsers) {
                renderUsersTable(window.allUsers);
            }
        }
    });
    
    // Setup search functionality
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (window.allUsers) {
                const filteredUsers = window.allUsers.filter(user => 
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    user.role.toLowerCase().includes(searchTerm)
                );
                renderUsersTable(filteredUsers);
            }
        });
    }
}

// Update user statistics
function updateUserStats(users) {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const regularUsers = users.filter(user => user.role === 'user').length;
    const usersWithDevices = users.filter(user => user.device_id).length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('adminUsers').textContent = adminUsers;
    document.getElementById('regularUsers').textContent = regularUsers;
    document.getElementById('usersWithDevices').textContent = usersWithDevices;
}

// Render users table
function renderUsersTable(users) {
    const usersTableBody = document.getElementById('users-table-body');
    if (users.length > 0) {
        usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${user.role}</span>
                </td>
                <td>${user.device_id || 'N/A'}</td>
                <td>
                    <span class="status-badge ${user.device_id ? 'status-active' : 'status-inactive'}">
                        ${user.device_id ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn secondary edit-user-btn" data-user-id="${user.id}">Edit</button>
                    <button class="btn danger delete-user-btn" data-user-id="${user.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    } else {
        usersTableBody.innerHTML = '<tr><td colspan="8">No users found.</td></tr>';
    }
}

// Show create user form
function showCreateUserForm() {
    const usersTab = document.getElementById('users-tab');
    usersTab.innerHTML = `
        <div class="create-user-form">
            <div class="form-header">
                <h2>Create New User</h2>
                <button class="btn secondary" id="backToUsers">Back to Users</button>
            </div>
            
            <form id="createUserForm" class="user-form">
                <div class="form-group">
                    <label for="newUserName">Full Name</label>
                    <input type="text" id="newUserName" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="newUserEmail">Email</label>
                    <input type="email" id="newUserEmail" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="newUserPassword">Password</label>
                    <input type="password" id="newUserPassword" name="password" required minlength="6">
                </div>
                
                <div class="form-group">
                    <label for="newUserRole">Role</label>
                    <select id="newUserRole" name="role" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn secondary" id="cancelCreateUser">Cancel</button>
                    <button type="submit" class="btn primary">Create User</button>
                </div>
            </form>
        </div>
    `;
    
    // Setup form event listeners
    setupCreateUserFormListeners();
}

// Setup create user form listeners
function setupCreateUserFormListeners() {
    const backBtn = document.getElementById('backToUsers');
    const cancelBtn = document.getElementById('cancelCreateUser');
    const form = document.getElementById('createUserForm');
    
    if (backBtn) {
        backBtn.addEventListener('click', loadUsers);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', loadUsers);
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            createUser();
        });
    }
}

// Create new user
function createUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.user) {
            alert('User created successfully!');
            loadUsers();
        } else {
            alert('Failed to create user: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error creating user:', error);
        alert('Error creating user. Please try again.');
    });
}

// Logout function (for compatibility)
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// Load notifications management interface
function loadNotificationsManagement() {
    const notificationsManagement = document.getElementById('notifications-management');
    notificationsManagement.innerHTML = `
        <div class="notifications-header">
            <h2>Notification Management</h2>
            <div class="user-search-container">
                <label for="userIdInput">Enter User ID:</label>
                <input type="text" id="userIdInput" placeholder="Enter user ID to view notifications">
                <button class="btn primary" id="searchNotificationsBtn">Search Notifications</button>
            </div>
        </div>
        <div id="notifications-results">
            <p class="search-prompt">Enter a user ID above to view their notifications.</p>
        </div>
    `;
    
    // Setup notification search event listener
    setupNotificationSearchListener();
}

// Setup notification search event listener
function setupNotificationSearchListener() {
    const searchBtn = document.getElementById('searchNotificationsBtn');
    const userIdInput = document.getElementById('userIdInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchUserNotifications);
    }
    
    if (userIdInput) {
        userIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchUserNotifications();
            }
        });
    }
}

// Search notifications for a specific user
function searchUserNotifications() {
    const userId = document.getElementById('userIdInput').value.trim();
    
    if (!userId) {
        alert('Please enter a user ID');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
    window.location.href = '/';
        return;
    }
    
    // First, get user details to find their device ID
    fetch(`/api/admin/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.user && data.user.device_id) {
            // Now fetch notifications for this device
            fetchNotificationsForDevice(data.user.device_id, data.user.name);
        } else {
            document.getElementById('notifications-results').innerHTML = `
                <div class="error-message">
                    <p>User not found or user has no device ID.</p>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error fetching user:', error);
        document.getElementById('notifications-results').innerHTML = `
            <div class="error-message">
                <p>Error fetching user: ${error.message}</p>
            </div>
        `;
    });
}

// Fetch notifications for a specific device
function fetchNotificationsForDevice(deviceId, userName) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/admin/notifications/${deviceId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayUserNotifications(data.notifications, userName, deviceId);
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
        document.getElementById('notifications-results').innerHTML = `
            <div class="error-message">
                <p>Error fetching notifications: ${error.message}</p>
            </div>
        `;
    });
}

// Display user notifications in tabular format
function displayUserNotifications(notifications, userName, deviceId) {
    const resultsContainer = document.getElementById('notifications-results');
    
    if (!notifications || notifications.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-notifications">
                <h3>Notifications for User: ${userName} (Device: ${deviceId})</h3>
                <p>No notifications found for this user.</p>
            </div>
        `;
        return;
    }
    
    // Group notifications by app
    const notificationsByApp = {};
    notifications.forEach(notification => {
        const appName = notification.app_name || 'Unknown App';
        if (!notificationsByApp[appName]) {
            notificationsByApp[appName] = [];
        }
        notificationsByApp[appName].push(notification);
    });
    
    let html = `
        <div class="notifications-summary">
            <h3>Notifications for User: ${userName} (Device: ${deviceId})</h3>
            <p>Total notifications: ${notifications.length}</p>
        </div>
    `;
    
    // Display notifications grouped by app
    Object.keys(notificationsByApp).forEach(appName => {
        const appNotifications = notificationsByApp[appName];
        html += `
            <div class="app-notifications">
                <h4>${appName} (${appNotifications.length} notifications)</h4>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Sender</th>
                                <th>Message</th>
                                <th>Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appNotifications.map(notification => `
                                <tr>
                                    <td>${new Date(notification.timestamp).toLocaleString()}</td>
                                    <td>${notification.sender || 'N/A'}</td>
                                    <td class="notification-message-cell">${notification.message || 'N/A'}</td>
                                    <td>${notification.title || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

// Setup blog management event listeners
function setupBlogManagementListeners() {
    const blogManagement = document.getElementById('blog-management');
    
    // Handle create blog button
    const createBtn = document.getElementById('createBlogBtn');
    if (createBtn) {
        createBtn.addEventListener('click', showCreateBlogForm);
    }
    
    // Handle edit and delete buttons using event delegation
    blogManagement.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="edit"]')) {
            const blogId = e.target.getAttribute('data-blog-id');
            editBlogPost(blogId);
        } else if (e.target.matches('[data-action="delete"]')) {
            const blogId = e.target.getAttribute('data-blog-id');
            deleteBlogPost(blogId);
        }
    });
}
