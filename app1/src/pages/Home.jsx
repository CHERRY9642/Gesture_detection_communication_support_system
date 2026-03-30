import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-container">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">✨ Real-time TFLite Inference</div>
          <h1 className="hero-title">
            Empowering Communication through <span className="gradient-text">Gesture AI</span>
          </h1>
          <p className="hero-subtitle">
            Bridge the gap between sign language and spoken words with our advanced, 
            low-latency gesture recognition system. Built with MediaPipe and TensorFlow.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn-get-started">
              Get Started →
            </Link>
            <Link to="/about" className="btn-learn-more">
              Learn Technique
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card c1 info-card">🖐️ 22+ Gestures</div>
          <div className="floating-card c2 info-card">⚡ 30 FPS</div>
          <div className="floating-card c3 info-card">📱 Responsive</div>
          <div className="visual-circle" />
          <div className="visual-circle-small" />
        </div>
      </section>

      {/* 2. Numerical Showcase */}
      <section className="numerical-showcase info-card">
        <div className="showcase-grid">
           <div className="showcase-item">
              <span className="sc-val">42-D</span>
              <span className="sc-label">Input Features</span>
           </div>
           <div className="showcase-item">
              <span className="sc-val">543</span>
              <span className="sc-label">Total Landmarks</span>
           </div>
           <div className="showcase-item">
              <span className="sc-val">MLP</span>
              <span className="sc-label">Neural Engine</span>
           </div>
           <div className="showcase-item">
              <span className="sc-val">&lt;10ms</span>
              <span className="sc-label">Inference Lag</span>
           </div>
           <div className="showcase-item">
              <span className="sc-val">4X</span>
              <span className="sc-label">WASM Boost</span>
           </div>
           <div className="showcase-item">
              <span className="sc-val">98%</span>
              <span className="sc-label">Test Precision</span>
           </div>
        </div>
      </section>

      {/* 3. Technical Comparison */}
      <section className="comparison-section">
        <div className="comparison-header">
          <h2>Technical <span className="gradient-text">Excellence</span></h2>
          <p>Local edge computing (TFLite) outperforms traditional cloud-based systems.</p>
        </div>
        
        <div className="comparison-table-wrapper info-card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Cloud-Based AI</th>
                <th className="highlight-col">Gesture AI (Our App)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inference Latency</td>
                <td>500ms - 2s (Network Lag)</td>
                <td className="highlight-cell">~30ms (Real-time Flow)</td>
              </tr>
              <tr>
                <td>Privacy & Security</td>
                <td>Data sent to server</td>
                <td className="highlight-cell">100% Client-side (Local)</td>
              </tr>
              <tr>
                <td>Device Requirement</td>
                <td>High-end Server GPU</td>
                <td className="highlight-cell">Standard Browser / Native</td>
              </tr>
              <tr>
                <td>Internet Dependency</td>
                <td>Always Required</td>
                <td className="highlight-cell">Zero (Offline Capable)</td>
              </tr>
              <tr>
                <td>Operating Cost</td>
                <td>Pay-per-request API</td>
                <td className="highlight-cell">$0 (Uses User Hardware)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. How it Works */}
      <section className="how-it-works">
          <div className="section-header">
            <h2>How it <span className="gradient-text">Works</span></h2>
            <p>Our 3-step high-fidelity gesture translation pipeline.</p>
          </div>
          <div className="pipeline-steps">
            <div className="step-card info-card">
              <div className="step-num">01</div>
              <h3>Vision Capture</h3>
              <p>Camera feed is processed by MediaPipe Holistic to extract 21 hand landmarks.</p>
            </div>
            <div className="step-card info-card">
              <div className="step-num">02</div>
              <h3>Feature Normalization</h3>
              <p>Landmarks are converted into a 42-D wrist-relative vector for size invariance.</p>
            </div>
            <div className="step-card info-card">
              <div className="step-num">03</div>
              <h3>Neural Inference</h3>
              <p>Our TFLite MLP model predicts the gesture with over 98% accuracy.</p>
            </div>
          </div>
      </section>

      {/* 5. Features Grid */}
      <section className="features-grid">
        <div className="feature-card info-card">
          <div className="feature-icon">🛡️</div>
          <h3>Private & Secure</h3>
          <p>Processing happens entirely on your local browser. No video frames are ever uploaded to any server.</p>
        </div>
        <div className="feature-card info-card">
          <div className="feature-icon">📊</div>
          <h3>Detailed Analytics</h3>
          <p>Monitor your performance, see confidence scores, and analyze usage trends in real-time.</p>
        </div>
        <div className="feature-card info-card">
          <div className="feature-icon">🗣️</div>
          <h3>Text-To-Speech</h3>
          <p>Form full sentences and listen to the translation using standard web speech synthesis (TTS).</p>
        </div>
        <div className="feature-card info-card">
          <div className="feature-icon">📱</div>
          <h3>Cross-Platform Ready</h3>
          <p>Optimized for both Desktop and Mobile browsers using WebAssembly (WASM) acceleration.</p>
        </div>
        <div className="feature-card info-card">
          <div className="feature-icon">📜</div>
          <h3>History Log</h3>
          <p>Automatically save your previously translated sentences for quick replay and review later.</p>
        </div>
        <div className="feature-card info-card">
          <div className="feature-icon">✨</div>
          <h3>Inclusive Design</h3>
          <p>Built with accessibility in mind to empower communication for everyone, everywhere.</p>
        </div>
      </section>

      {/* 6. Impact / Use Cases */}
      <section className="impact-section">
        <div className="impact-container">
           <div className="impact-text">
              <h2>Real-world <span className="gradient-text">Impact</span></h2>
              <p>Our technology is designed for high-stakes communication environments where every second matters.</p>
              <ul className="impact-list">
                 <li><b>Healthcare:</b> Bridges the gap between patients and medical staff in emergencies.</li>
                 <li><b>Education:</b> Enhances learning for students with hearing or speech impairments.</li>
                 <li><b>Business:</b> Facilitates inclusive meetings and professional collaborations.</li>
              </ul>
           </div>
           <div className="impact-image-placeholder info-card">
              <div className="placeholder-content">
                <span>Inclusive Tech</span>
              </div>
           </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="final-cta">
          <h2>Ready to transform communication?</h2>
          <Link to="/dashboard" className="btn-get-started lg">Try Live Inference Now</Link>
      </section>

      <footer className="home-footer">
          <p>© 2026 Gesture AI Project - Built with ❤️ for Inclusive Communication</p>
      </footer>
    </div>
  );
}
