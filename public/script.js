document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        // User is logged in, redirect based on role
        if (user.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            showDashboard();
        }
        return;
    }
    
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Event Listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginForm);
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', showSignupForm);
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', showForgotPasswordForm);
    }
    
    // Form submission handlers
    handleLoginFormSubmission();
    handleSignupFormSubmission();
    handleForgotPasswordFormSubmission();
    handleOTPVerificationFormSubmission();
    handleResetPasswordFormSubmission();
    
    // Load blog preview
    loadBlogPreview();
});

// Load blog preview for home page
function loadBlogPreview() {
    fetch('/api/blogs')
    .then(response => response.json())
    .then(data => {
        const blogPreview = document.getElementById('blog-preview');
        if (data.blogs && data.blogs.length > 0) {
            // Show only the latest 3 blogs
            const latestBlogs = data.blogs.slice(0, 3);
            blogPreview.innerHTML = latestBlogs.map(blog => `
                <div class="blog-preview-item" data-blog-id="${blog.id || ''}">
                    <div class="blog-preview-image">
                        <img src="${blog.featured_image_url || 'https://via.placeholder.com/300x200'}" alt="${blog.title || 'Blog Post'}">
                    </div>
                    <div class="blog-preview-content">
                        <h3>${blog.title || 'Untitled'}</h3>
                        <p class="blog-preview-date">${blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'No date'}</p>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners for blog preview items
            setupBlogPreviewEventListeners();
        } else {
            blogPreview.innerHTML = '<p>No blog posts available yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading blog preview:', error);
        const blogPreview = document.getElementById('blog-preview');
        if (blogPreview) {
            blogPreview.innerHTML = '<p>Error loading blog posts.</p>';
        }
    });
}

// Show login form
function showLoginForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showLandingPage()">Back</button>
                        <button type="submit" class="btn btn-submit">Login</button>
                    </div>
                </form>
                <div class="form-footer">
                    <p>Don't have an account? <a href="#" onclick="showSignupForm()">Sign Up</a></p>
                    <p><a href="#" onclick="showForgotPasswordForm()">Forgot Password?</a></p>
                </div>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleLoginFormSubmission();
}

// Show signup form
function showSignupForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Sign Up</h2>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showLandingPage()">Back</button>
                        <button type="submit" class="btn btn-submit">Sign Up</button>
                    </div>
                </form>
                <div class="form-footer">
                    <p>Already have an account? <a href="#" onclick="showLoginForm()">Login</a></p>
                </div>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleSignupFormSubmission();
}

// Show forgot password form
function showForgotPasswordForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Forgot Password</h2>
                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showLandingPage()">Back</button>
                        <button type="submit" class="btn btn-submit">Send Reset Link</button>
                    </div>
                </form>
                <div class="form-footer">
                    <p>Remember your password? <a href="#" onclick="showLoginForm()">Login</a></p>
                </div>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleForgotPasswordFormSubmission();
}

// Show OTP verification form
function showOTPVerificationForm(signupToken) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Verify OTP</h2>
                <p>Please check your email for the verification code.</p>
                <form id="otpVerificationForm">
                    <input type="hidden" id="signupToken" name="signupToken" value="${signupToken}">
                    <div class="form-group">
                        <label for="otp">Verification Code</label>
                        <input type="text" id="otp" name="otp" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showSignupForm()">Back</button>
                        <button type="submit" class="btn btn-submit">Verify</button>
                    </div>
                </form>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleOTPVerificationFormSubmission();
}

// Show reset password OTP verification form
function showResetPasswordOTPForm(resetToken) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Verify Reset OTP</h2>
                <p>Please check your email for the reset code.</p>
                <form id="resetPasswordOTPForm">
                    <input type="hidden" id="resetToken" name="resetToken" value="${resetToken}">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="otp">Verification Code</label>
                        <input type="text" id="otp" name="otp" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showForgotPasswordForm()">Back</button>
                        <button type="submit" class="btn btn-submit">Verify</button>
                    </div>
                </form>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleResetPasswordOTPFormSubmission();
}

// Show reset password form
function showResetPasswordForm(resetToken, email) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <header>
            <h1>DobiTracker</h1>
            <p>Android Notification Capture System</p>
        </header>
        
        <main>
            <div class="form-container">
                <h2>Reset Password</h2>
                <form id="resetPasswordForm">
                    <input type="hidden" id="resetToken" name="resetToken" value="${resetToken}">
                    <input type="hidden" id="email" name="email" value="${email}">
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-back" onclick="showForgotPasswordForm()">Back</button>
                        <button type="submit" class="btn btn-submit">Reset Password</button>
                    </div>
                </form>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2025 DobiTracker. All rights reserved.</p>
        </footer>
    `;
    
    handleResetPasswordFormSubmission();
}

// Show landing page
function showLandingPage() {
    window.location.reload();
}

// Handle login form submission
function handleLoginFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful login
            console.log('Login attempt with:', { email, password });
            
            // Simulate API call
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Store token in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Check if user is admin and redirect accordingly
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        // Redirect to regular user dashboard
                    showDashboard();
                    }
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            });
        });
    }
}

// Handle signup form submission
function handleSignupFormSubmission() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful signup
            console.log('Signup attempt with:', { name, email, password });
            
            // Simulate API call
            fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.signupToken) {
                    // Show OTP verification form
                    showOTPVerificationForm(data.signupToken);
                } else {
                    alert('Signup failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Signup error:', error);
                alert('Signup failed. Please try again.');
            });
        });
    }
}

// Handle forgot password form submission
function handleForgotPasswordFormSubmission() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful request
            console.log('Forgot password request for:', email);
            
            // Simulate API call
            fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.resetToken) {
                    // Show OTP verification form
                    showResetPasswordOTPForm(data.resetToken);
                } else {
                    alert('Password reset request failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Password reset request error:', error);
                alert('Password reset request failed. Please try again.');
            });
        });
    }
}

// Handle OTP verification form submission
function handleOTPVerificationFormSubmission() {
    const otpVerificationForm = document.getElementById('otpVerificationForm');
    if (otpVerificationForm) {
        otpVerificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const signupToken = document.getElementById('signupToken').value;
            const otp = document.getElementById('otp').value;
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful verification
            console.log('OTP verification attempt with:', { signupToken, otp });
            
            // Simulate API call
            fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ signupToken, otp })
            })
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    alert(`Signup successful! Your Device ID is: ${data.deviceId}\n\nPlease save this Device ID - you'll need it for your Android app.\n\nNow please login.`);
                    showLoginForm();
                } else {
                    alert('OTP verification failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('OTP verification error:', error);
                alert('OTP verification failed. Please try again.');
            });
        });
    }
}

// Handle reset password OTP form submission
function handleResetPasswordOTPFormSubmission() {
    const resetPasswordOTPForm = document.getElementById('resetPasswordOTPForm');
    if (resetPasswordOTPForm) {
        resetPasswordOTPForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resetToken = document.getElementById('resetToken').value;
            const email = document.getElementById('email').value;
            const otp = document.getElementById('otp').value;
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful verification
            console.log('Reset password OTP verification attempt with:', { resetToken, email, otp });
            
            // Simulate API call
            fetch('/api/auth/verify-password-reset-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp, resetToken })
            })
            .then(response => response.json())
            .then(data => {
                if (data.resetToken) {
                    // Show reset password form
                    showResetPasswordForm(data.resetToken, email);
                } else {
                    alert('OTP verification failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Reset password OTP verification error:', error);
                alert('OTP verification failed. Please try again.');
            });
        });
    }
}

// Handle reset password form submission
function handleResetPasswordFormSubmission() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resetToken = document.getElementById('resetToken').value;
            const email = document.getElementById('email').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // In a real application, you would send this to your backend
            // For now, we'll simulate a successful reset
            console.log('Password reset attempt with:', { email, resetToken, newPassword });
            
            // Simulate API call
            fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, resetToken, newPassword })
            })
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    alert('Password reset successful! Please login.');
                    showLoginForm();
                } else {
                    alert('Password reset failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Password reset error:', error);
                alert('Password reset failed. Please try again.');
            });
        });
    }
}

// Show dashboard
function showDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h1>Dashboard</h1>
                <div class="header-actions">
                    <button class="btn secondary" id="refreshBtn">Refresh</button>
                    <button class="logout-btn" id="userLogoutBtn">Logout</button>
                </div>
            </div>
            
            <div class="device-info">
                <h3>Your Device ID</h3>
                <div class="device-id-container">
                    <input type="text" id="deviceIdDisplay" value="${user.deviceId}" readonly class="device-id-input">
                    <button class="btn secondary" id="copyDeviceBtn">Copy</button>
                </div>
                <p class="device-instruction">Use this Device ID in your Android app to connect and start tracking notifications.</p>
            </div>
            
            <div class="tabs">
                <div class="tab active" data-tab="whatsapp">WhatsApp</div>
                <div class="tab" data-tab="instagram">Instagram</div>
                <div class="tab" data-tab="others">Others</div>
                <div class="tab" data-tab="blog">Blog</div>
                <div class="tab" data-tab="documents">Documents</div>
            </div>
            
            <div class="tab-content active" id="whatsapp-tab">
                <div class="notifications-container">
                    <h2>WhatsApp Notifications</h2>
                    <div id="whatsapp-notifications">
                        <div class="loading">Loading notifications...</div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="instagram-tab">
                <div class="notifications-container">
                    <h2>Instagram Notifications</h2>
                    <div id="instagram-notifications">
                        <div class="loading">Loading notifications...</div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="others-tab">
                <div class="notifications-container">
                    <h2>Other Notifications</h2>
                    <div id="others-notifications">
                        <div class="loading">Loading notifications...</div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="blog-tab">
                <div class="blog-list">
                    <div class="loading">Loading blog posts...</div>
                </div>
            </div>
            
            <div class="tab-content" id="documents-tab">
                <div class="document-content">
                    <h2>Documents</h2>
                    <div id="documents-content">
                        <div class="loading">Loading documents...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load initial content
    loadNotifications();
    loadBlogPosts();
    loadDocuments();
    
    // Add event listeners for tabs
    setupTabEventListeners();
    setupUserLogoutButton();
    setupCopyDeviceButton();
    
    // Setup event delegation for dynamically created buttons
    setupDynamicButtonEventListeners();
}

// Setup tab event listeners
function setupTabEventListeners() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName, this);
        });
    });
}

// Show tab
function showTab(tabName, clickedElement = null) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTabContent = document.getElementById(tabName + '-tab');
    if (targetTabContent) {
        targetTabContent.classList.add('active');
    } else {
        console.error('Tab content not found:', tabName + '-tab');
    }
    
    // Add active class to clicked tab
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    // Always refresh content when tab is clicked
    if (['whatsapp', 'instagram', 'others'].includes(tabName)) {
        loadNotifications();
    } else if (tabName === 'blog') {
        // Always fetch and display blog posts
        loadBlogPosts();
    } else if (tabName === 'documents') {
        // Always fetch and display documents
        loadDocuments();
    }
}

// Load notifications
function loadNotifications() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.deviceId) {
        console.error('User or device ID not found');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authentication token not found');
        return;
    }

    // Fetch all notifications for the user's device
    fetch(`/api/notifications/fetch-notifications?device_id=${user.deviceId}`, {
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
        if (data.notifications && data.notifications.length > 0) {
            displayNotifications(data.notifications);
        } else {
            displayNoNotifications();
        }
    })
    .catch(error => {
        console.error('Error loading notifications:', error);
        displayNotificationError();
    });
}

// Display notifications in appropriate tabs
function displayNotifications(notifications) {
    // Group notifications by app
    const whatsappNotifications = notifications.filter(n => n.app_name === 'WhatsApp');
    const instagramNotifications = notifications.filter(n => n.app_name === 'Instagram');
    const otherNotifications = notifications.filter(n => 
        n.app_name !== 'WhatsApp' && n.app_name !== 'Instagram'
    );

    // Display WhatsApp notifications
    const whatsappContainer = document.getElementById('whatsapp-notifications');
    if (whatsappNotifications.length > 0) {
        whatsappContainer.innerHTML = whatsappNotifications.map(notification => `
            <div class="notification-item">
                <div class="notification-header">
                    <span class="notification-sender">${notification.sender || 'Unknown'}</span>
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <div class="notification-message">${notification.message || 'No message content'}</div>
            </div>
        `).join('');
    } else {
        whatsappContainer.innerHTML = '<p class="no-notifications">No WhatsApp notifications found.</p>';
    }

    // Display Instagram notifications
    const instagramContainer = document.getElementById('instagram-notifications');
    if (instagramNotifications.length > 0) {
        instagramContainer.innerHTML = instagramNotifications.map(notification => `
            <div class="notification-item">
                <div class="notification-header">
                    <span class="notification-sender">${notification.sender || 'Unknown'}</span>
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <div class="notification-message">${notification.message || 'No message content'}</div>
            </div>
        `).join('');
    } else {
        instagramContainer.innerHTML = '<p class="no-notifications">No Instagram notifications found.</p>';
    }

    // Display other notifications
    const othersContainer = document.getElementById('others-notifications');
    if (otherNotifications.length > 0) {
        othersContainer.innerHTML = otherNotifications.map(notification => `
            <div class="notification-item">
                <div class="notification-header">
                    <span class="notification-app">${notification.app_name}</span>
                    <span class="notification-sender">${notification.sender || 'Unknown'}</span>
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <div class="notification-message">${notification.message || 'No message content'}</div>
            </div>
        `).join('');
    } else {
        othersContainer.innerHTML = '<p class="no-notifications">No other notifications found.</p>';
    }
}

// Display no notifications message
function displayNoNotifications() {
    const containers = ['whatsapp-notifications', 'instagram-notifications', 'others-notifications'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p class="no-notifications">No notifications found. Make sure your Android app is running and capturing notifications.</p>';
        }
    });
}

// Display notification error
function displayNotificationError() {
    const containers = ['whatsapp-notifications', 'instagram-notifications', 'others-notifications'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p class="error-message">Error loading notifications. Please try again later.</p>';
        }
    });
}

// Load blog posts
function loadBlogPosts() {
    fetch('/api/blogs')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Find the blog tab content container
        const blogTab = document.getElementById('blog-tab');
        if (!blogTab) {
            console.error('Blog tab element not found');
            return;
        }
        
        // Create the blog list HTML
        let blogListHTML = '';
        if (data.blogs && data.blogs.length > 0) {
            blogListHTML = `
                <div class="blog-list">
                    ${data.blogs.map(blog => `
                        <div class="blog-card" data-blog-id="${blog.id || ''}" style="cursor: pointer;">
                            <img src="${blog.featured_image_url || 'https://via.placeholder.com/300x200'}" alt="${blog.title || 'Blog Post'}" class="blog-image">
                            <div class="blog-content">
                                <h3 class="blog-title">${blog.title || 'Untitled'}</h3>
                                <p class="blog-date">${blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'No date'}</p>
                                <p class="blog-excerpt">${getExcerpt(blog.html_content)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            blogListHTML = '<div class="blog-list"><p>No blog posts available.</p></div>';
        }
        
        // Set the blog tab content
        blogTab.innerHTML = blogListHTML;
        
        // Add event listeners for blog cards
        setupBlogCardEventListeners();
    })
    .catch(error => {
        console.error('Error loading blog posts:', error);
        const blogTab = document.getElementById('blog-tab');
        if (blogTab) {
            blogTab.innerHTML = '<div class="blog-list"><p class="error-message">Error loading blog posts. Please try again later.</p></div>';
        }
    });
}

// Load blog post
function loadBlogPost(id) {
    fetch(`/api/blogs/${id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.blog) {
            const blogTab = document.getElementById('blog-tab');
            blogTab.innerHTML = `
                <div class="blog-post-view">
                    <div class="blog-post-header">
                        <h1>${data.blog.title}</h1>
                        <p class="blog-post-meta">
                            Published on ${new Date(data.blog.created_at).toLocaleDateString()}
                            ${data.blog.updated_at !== data.blog.created_at ? 
                                ` • Updated on ${new Date(data.blog.updated_at).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                    ${data.blog.featured_image_url ? `
                        <div class="blog-post-featured-image">
                            <img src="${data.blog.featured_image_url}" alt="${data.blog.title}">
                        </div>
                    ` : ''}
                    <div class="blog-post-content">
                        ${data.blog.html_content}
                    </div>
                </div>
            `;
            
                    // Event listeners are handled by setupDynamicButtonEventListeners
            showTab('blog');
        } else {
            alert('Blog post not found.');
        }
    })
    .catch(error => {
        console.error('Error loading blog post:', error);
        alert('Error loading blog post. Please try again later.');
    });
}

// Load documents
function loadDocuments() {
    fetch('/api/documents')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Find the documents tab content container
        const documentsTab = document.getElementById('documents-tab');
        if (!documentsTab) {
            console.error('Documents tab element not found');
            return;
        }
        
        // Create the documents HTML
        let documentsHTML = '';
        if (data.documents && data.documents.length > 0) {
            // Group documents by type
            const documentsByType = {};
            data.documents.forEach(doc => {
                if (!documentsByType[doc.type]) {
                    documentsByType[doc.type] = [];
                }
                documentsByType[doc.type].push(doc);
            });
            
            // Display documents
            documentsHTML = `
                <div id="documents-content">
                    ${Object.keys(documentsByType).map(type => `
                        <div class="document-section">
                            <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                            ${documentsByType[type].map(doc => `
                                <div class="document-card" data-document-type="${doc.type}" style="cursor: pointer;">
                                    <div class="document-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10,9 9,9 8,9"></polyline>
                                        </svg>
                                    </div>
                                    <div class="document-info">
                                        <h4>${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</h4>
                                        <p class="document-date">Last updated: ${new Date(doc.updated_at).toLocaleDateString()}</p>
                                        <p class="document-preview">Click to read the full document</p>
                                    </div>
                                    <div class="document-arrow">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="9,18 15,12 9,6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            documentsHTML = '<div id="documents-content"><p>No documents available.</p></div>';
        }
        
        // Set the documents tab content
        documentsTab.innerHTML = documentsHTML;
        
        // Add event listeners for document cards
        setupDocumentCardEventListeners();
    })
    .catch(error => {
        console.error('Error loading documents:', error);
        const documentsTab = document.getElementById('documents-tab');
        if (documentsTab) {
            documentsTab.innerHTML = '<div id="documents-content"><p class="error-message">Error loading documents. Please try again later.</p></div>';
        }
    });
}

// Load document
function loadDocument(type) {
    fetch(`/api/documents/${type}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.document) {
            const documentsTab = document.getElementById('documents-tab');
            documentsTab.innerHTML = `
                <div class="document-view">
                    <div class="document-header">
                        <h1>${data.document.type.charAt(0).toUpperCase() + data.document.type.slice(1)}</h1>
                        <p class="document-meta">
                            Last updated: ${new Date(data.document.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="document-content">
                        ${data.document.content}
                    </div>
                </div>
            `;
            
                    // Event listeners are handled by setupDynamicButtonEventListeners
            showTab('documents');
        } else {
            alert('Document not found.');
        }
    })
    .catch(error => {
        console.error('Error loading document:', error);
        alert('Error loading document. Please try again later.');
    });
}

// Refresh all data
function refreshAll() {
    // Show loading states
    const containers = ['whatsapp-notifications', 'instagram-notifications', 'others-notifications'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Refreshing notifications...</div>';
        }
    });
    
    const blogList = document.querySelector('.blog-list');
    if (blogList) {
        blogList.innerHTML = '<div class="loading">Refreshing blog posts...</div>';
    }
    
    const documentsContent = document.getElementById('documents-content');
    if (documentsContent) {
        documentsContent.innerHTML = '<div class="loading">Refreshing documents...</div>';
    }
    
    // Reload all data
    loadNotifications();
    loadBlogPosts();
    loadDocuments();
}

// Setup user logout button
function setupUserLogoutButton() {
    const logoutBtn = document.getElementById('userLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '/';
        });
    }
}


// Setup copy device ID button
function setupCopyDeviceButton() {
    const copyBtn = document.getElementById('copyDeviceBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            copyDeviceId();
        });
    }
}

// Logout function (for compatibility)
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// Copy device ID to clipboard
function copyDeviceId() {
    const deviceIdInput = document.getElementById('deviceIdDisplay');
    deviceIdInput.select();
    deviceIdInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        alert('Device ID copied to clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(deviceIdInput.value).then(() => {
            alert('Device ID copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy. Please select and copy manually.');
        });
    }
}

// Helper function to get excerpt from HTML content
function getExcerpt(htmlContent, maxLength = 150) {
    // Check if htmlContent exists and is a string
    if (!htmlContent || typeof htmlContent !== 'string') {
        return 'No content available';
    }
    
    // Remove HTML tags and get plain text
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= maxLength) {
        return textContent;
    }
    
    return textContent.substring(0, maxLength).trim() + '...';
}

// Setup blog card event listeners
function setupBlogCardEventListeners() {
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('click', function() {
            const blogId = this.getAttribute('data-blog-id');
            if (blogId) {
                loadBlogPost(blogId);
            }
        });
    });
}


// Setup document card event listeners
function setupDocumentCardEventListeners() {
    const documentCards = document.querySelectorAll('.document-card');
    documentCards.forEach(card => {
        card.addEventListener('click', function() {
            const documentType = this.getAttribute('data-document-type');
            if (documentType) {
                loadDocument(documentType);
            }
        });
    });
}


// Setup blog preview event listeners
function setupBlogPreviewEventListeners() {
    const blogPreviewItems = document.querySelectorAll('.blog-preview-item');
    blogPreviewItems.forEach(item => {
        item.addEventListener('click', function() {
            const blogId = this.getAttribute('data-blog-id');
            if (blogId) {
                window.location.href = `/blog-post.html?id=${blogId}`;
            }
        });
    });
}

// Setup event delegation for all dynamically created buttons
function setupDynamicButtonEventListeners() {
    // Use event delegation on the document body for all dynamic buttons
    document.body.addEventListener('click', function(e) {
        // Refresh button
        if (e.target && e.target.id === 'refreshBtn') {
            console.log('Refresh button clicked');
            refreshAll();
        }
    });
}
