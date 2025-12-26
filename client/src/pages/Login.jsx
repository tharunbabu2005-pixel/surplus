import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Save Token and User Data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('role', res.data.user.role); // Save Role for checks

      alert("Login Successful! ✅");

      // --- FIX: Redirect BOTH Restaurants AND Vendors to Dashboard ---
      if (res.data.user.role === 'restaurant' || res.data.user.role === 'vendor') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
      
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4', position: 'absolute', top: 0, left: 0 }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0, fontSize: '2rem', textAlign: 'center' }}>Welcome Back 👋</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', fontSize: '1.1rem', border: 'none', borderRadius: '8px' }}>Login</button>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>New here? <Link to="/register" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Register</Link></p>
      </form>
    </div>
  );
}

export default Login;