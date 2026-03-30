export default function About() {
  return (
    <div className="about-container fade-in">
      <div className="about-header">
        <h1>About <span className="gradient-text">Gesture AI</span></h1>
        <p>A deep dive into our real-time gesture recognition technology.</p>
      </div>

      <div className="about-content">
        <section className="about-section slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-icon">🔗</div>
          <h3>The Architecture</h3>
          <p>
            Gesture AI uses a multi-stage pipeline to ensure zero-latency and high accuracy. 
            By leveraging <b>MediaPipe Holistic</b> for hand tracking and <b>TensorFlow Lite</b> 
            for classification, we move the compute power from the server to your browser.
          </p>
          <div className="pipeline-diagram">
            <div className="node">Camera</div>
            <div className="arrow">→</div>
            <div className="node highlight">MediaPipe</div>
            <div className="arrow">→</div>
            <div className="node">42-D Vector</div>
            <div className="arrow">→</div>
            <div className="node highlight">TFLite</div>
            <div className="arrow">→</div>
            <div className="node">Gesture</div>
          </div>
        </section>

        <section className="about-section slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-icon">🧠</div>
          <h3>Machine Learning Pipeline</h3>
          <p>
            Our model is a <b>Multilayer Perceptron (MLP)</b> trained on thousands of normalized 
            hand landmark coordinates. The 42-D feature vector is created by taking 21 (x, y) 
            hand landmarks and normalizing them relative to the wrist. This makes the system 
            invariant to hand size and camera distance.
          </p>
          <ul className="feature-list">
            <li><b>21 Landmarks:</b> High-fidelity tracking of every finger joint.</li>
            <li><b>Preprocessing:</b> Data normalization and smoothing for stable predictions.</li>
            <li><b>TFLite Engine:</b> Ultra-lightweight (36 KB) model with sub-10ms inference.</li>
          </ul>
        </section>

        <section className="about-section slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="section-icon">🛠️</div>
          <h3>Tech Stack</h3>
          <div className="stack-grid">
            <div className="stack-item"><b>React 18</b> (UI Framework)</div>
            <div className="stack-item"><b>MediaPipe</b> (Computer Vision)</div>
            <div className="stack-item"><b>TF.js</b> (Inference)</div>
            <div className="stack-item"><b>Chart.js</b> (Analytics)</div>
            <div className="stack-item"><b>Flask</b> (Backend)</div>
            <div className="stack-item"><b>Vite</b> (Build Tool)</div>
          </div>
        </section>
      </div>

      <div className="footer-strip slide-up">
          <p>© 2026 Gesture AI Project - Built with ❤️ for Inclusive Communication</p>
      </div>
    </div>
  );
}
