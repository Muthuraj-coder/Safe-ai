import { useState } from 'react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [rawLog, setRawLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await api.post('/logs/submit', { rawLog });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Submit Error Log</h1>
        <p className="dashboard-subtitle">
          Paste your error log below to get an AI-powered solution
        </p>

        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-group">
            <label htmlFor="rawLog">Error Log</label>
            <textarea
              id="rawLog"
              value={rawLog}
              onChange={(e) => setRawLog(e.target.value)}
              required
              placeholder="Paste your error log here..."
              rows={10}
              className="log-textarea"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !rawLog.trim()}>
            {loading ? 'Processing...' : 'Submit Log'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-container">
            <div className="result-header">
              <h2>Results</h2>
              <div className={`cache-badge ${result.fromCache ? 'cached' : 'new'}`}>
                {result.fromCache ? 'Cached Result' : 'New AI Generated'}
              </div>
            </div>

            {result.maskedLog && (
              <div className="result-section">
                <h3>Masked Log</h3>
                <pre className="log-display">{result.maskedLog}</pre>
              </div>
            )}

            <div className="result-section">
              <h3>AI Solution</h3>
              <div className="solution-content">
                {result.solution || result.message}
              </div>
            </div>

            {result.hitCount && (
              <div className="result-meta">
                <span>Occurrence count: {result.hitCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

