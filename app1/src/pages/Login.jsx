import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - just redirect to dashboard
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
            <input type="email" placeholder="name@example.com" required />
          </div>
          
          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <a href="#" className="forgot-link">Forgot?</a>
            </div>
            <input type="password" placeholder="••••••••" required />
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
