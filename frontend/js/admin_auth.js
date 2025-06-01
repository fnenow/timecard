document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const messageArea = document.getElementById('messageArea');
    const API_BASE_URL = ''; // Relative

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // In a real app, you'd make an API call to /api/auth/login
            // For now, we'll use a placeholder/mock login
            if (username === 'admin' && password === 'password') {
                showMessage('Login successful! Redirecting...', 'success');
                // Store a mock token or flag
                localStorage.setItem('adminAuthToken', 'mock_admin_token'); // Replace with real token
                localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin' }));
                window.location.href = 'admin/dashboard.html'; // Redirect to admin dashboard
            } else {
                showMessage('Invalid username or password.', 'error');
                localStorage.removeItem('adminAuthToken');
                localStorage.removeItem('adminUser');
            }

            /*
            // Real API call example:
            try {
                const response = await makeApiCall(`${API_BASE_URL}/api/auth/login`, 'POST', { username, password });
                if (response.token) {
                    localStorage.setItem('adminAuthToken', response.token);
                    localStorage.setItem('adminUser', JSON.stringify(response.user)); // Assuming user info is returned
                    showMessage('Login successful! Redirecting...', 'success');
                    window.location.href = 'admin/dashboard.html';
                } else {
                    throw new Error(response.message || 'Login failed, no token received.');
                }
            } catch (error) {
                showMessage(`Login failed: ${error.message}`, 'error');
                localStorage.removeItem('adminAuthToken');
                localStorage.removeItem('adminUser');
            }
            */
        });
    }

    function showMessage(msg, type = 'info') {
        if (messageArea) {
            messageArea.textContent = msg;
            messageArea.className = `message ${type}`;
            messageArea.style.display = 'block';
            setTimeout(() => { messageArea.style.display = 'none'; }, 3000);
        }
    }
});

// Utility for checking auth on admin pages
function checkAdminAuth() {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) { // Replace 'mock_admin_token' with actual check if not using mock
        alert('You are not authorized. Redirecting to login.');
        window.location.href = '../admin_login.html'; // Adjust path based on file location
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminUser');
    window.location.href = '../admin_login.html'; // Adjust path
}