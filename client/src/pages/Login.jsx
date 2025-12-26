import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userType', res.data.userType);
      
      if (res.data.userType === 'restaurant') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ 
      width: '100vw',               // 1. Take full Width of screen
      height: '100vh',              // 2. Take full Height of screen
      display: 'flex',              // 3. Use Flexbox
      justifyContent: 'center',     // 4. Center Horizontally (Left/Right)
      alignItems: 'center',         // 5. Center Vertically (Up/Down)
      backgroundColor: '#f4f4f4',   // Optional: Light grey background
      position: 'absolute',         // Force it to sit on top of everything
      top: 0,
      left: 0
    }}>
      
      <form onSubmit={handleLogin} style={{ 
        width: '100%', 
        maxWidth: '400px', 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <h1 style={{ marginTop: 0, fontSize: '2rem', textAlign: 'center' }}>Welcome Back 👋</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Login to continue</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
        </div>

        <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', fontSize: '1.1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Login
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          New user? <Link to="/register" style={{ color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none' }}>Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;