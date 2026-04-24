import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('gesture_ai_users') || '[]');
    
    // Check if email exists
    if (existingUsers.some(u => u.email === formData.email)) {
      alert("Email already exists!");
      return;
    }

    // Add new user
    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password // Note: In a real app, this should be hashed
    };

    localStorage.setItem('gesture_ai_users', JSON.stringify([...existingUsers, newUser]));
    alert("Account created successfully! Please log in.");
    navigate('/login');
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card slide-up">
        <div className="auth-header">
           <div className="auth-logo">✨</div>
           <h1>Create Account</h1>
           <p>Join the future of inclusive communication</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              name="fullName"
              type="text" 
              placeholder="John Doe" 
              required 
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              name="email"
              type="email" 
              placeholder="name@example.com" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-auth-primary">
            Get Started
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
      </div>

      <div className="auth-bg-overlay">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>

      <Link to="/" className="back-home-btn">← Back to Home</Link>
    </div>
  );
}
