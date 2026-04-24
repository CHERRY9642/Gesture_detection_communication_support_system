import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('gesture_ai_users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    // Set current user (session)
    const sessionUser = {
      fullName: user.fullName,
      email: user.email
    };
    localStorage.setItem('gesture_ai_current_user', JSON.stringify(sessionUser));
    
    // Dispatch a storage event so Topbar can react if it's already mounted
    window.dispatchEvent(new Event('storage'));
    
    navigate('/dashboard');
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card slide-up">
        <div className="auth-header">
           <div className="auth-logo">🤟</div>
           <h1>Welcome Back</h1>
           <p>Log in to your Gesture AI account</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
            <div className="label-row">
              <label>Password</label>
              <a href="#" className="forgot-link">Forgot?</a>
            </div>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-auth-primary">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up for free</Link></p>
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
