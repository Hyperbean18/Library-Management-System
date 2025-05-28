import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  // Hardcoded credentials for validation
  const validCredentials = {
    'library_viewer': 'view_password',
    'library_staff': 'staff_password'
  };

  // Simple client-side authentication
  if (username in validCredentials && validCredentials[username] === password) {
    try {
      // Store user role and credentials in localStorage
      const userRole = username === 'library_staff' ? 'staff' : 'viewer';
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('password', password); // Store password for API calls
      
      // Redirect to main app
      setIsLoading(false);
      navigate('/app');
    } catch (error) {
      setError('An error occurred during login');
      setIsLoading(false);
    }
  } else {
    setError('Invalid username or password');
    setIsLoading(false);
  }
};
  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Library Management System</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
