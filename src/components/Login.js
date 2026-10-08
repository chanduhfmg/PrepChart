import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser } from "../components/UserContext";
import Spinner from './Spinner';

const Login = () => {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("http://172.22.6.98:100/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      const data = await response.json();
      setUser(data);
      setLoading(false);
      navigate('/home'); 
    } else {
      setError('Sorry your password did not work. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <img src=".../public/logo512.png" alt="Logo" style={{ width: '150px' }} />
        </div>
        <h4 className="text-center mb-4">Prep Station Login</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email">Username</label>
            <input
              id="email"
              type="text"
              className="form-control"
              value={email}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <div className="text-danger mt-2 small">{error}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
          <div>
            {loading ? <Spinner /> : <div></div>}
          </div>

        <div>

        </div>
        <footer className="mt-4 text-center text-muted small">
          &copy; 2025 &mdash; Horizon Family Medical Group
        </footer>
      </div>
    </div>
  );
};

export default Login;