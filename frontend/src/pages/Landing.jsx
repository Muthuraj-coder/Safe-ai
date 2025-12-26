import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-container">
        <header className="landing-header">
          <h1 className="landing-title">Safe Log AI</h1>
          <p className="landing-subtitle">Secure log masking and AI-powered error solutions</p>
        </header>

        <main className="landing-content">
          <section className="landing-section">
            <h2>What is Safe Log AI?</h2>
            <p>
              Safe Log AI is an intelligent error log analysis platform that automatically masks 
              sensitive information from your logs and provides AI-powered solutions to help you 
              debug and resolve issues faster.
            </p>
          </section>

          <section className="landing-section">
            <h2>Secure Log Masking</h2>
            <p>
              Our advanced masking service uses Presidio to automatically detect and mask PII, 
              API keys, session tokens, and other sensitive data from your error logs, ensuring 
              your sensitive information never leaves your environment unsecured.
            </p>
          </section>

          <section className="landing-section">
            <h2>AI-Powered Error Solutions</h2>
            <p>
              Get instant, intelligent solutions to your error logs powered by NVIDIA's advanced 
              AI models. Our system analyzes masked logs and provides root cause analysis, 
              step-by-step solutions, and preventive measures.
            </p>
          </section>

          <section className="landing-section">
            <h2>Cache-Based Cost Optimization</h2>
            <p>
              Safe Log AI intelligently caches solutions for similar errors, reducing API costs 
              and providing instant responses for recurring issues. See cache hits in real-time 
              and track how often similar errors occur.
            </p>
          </section>

          <div className="landing-cta">
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;

