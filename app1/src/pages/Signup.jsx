import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock signup - just redirect to dashboard
    navigate('/dashboard');
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
            <input type="text" placeholder="John Doe" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" required />
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
