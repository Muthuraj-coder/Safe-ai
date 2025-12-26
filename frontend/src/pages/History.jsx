import { useState, useEffect } from 'react';
import api from '../utils/api';
import './History.css';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logs/history');
      setLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getErrorSummary = (maskedLog) => {
    const lines = maskedLog.split('\n');
    const firstLine = lines[0] || '';
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  };

  if (loading) {
    return (
      <div className="history">
        <div className="history-container">
          <div className="loading">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-container">
        <h1>Log History</h1>
        <p className="history-subtitle">View all your submitted error logs</p>

        {error && <div className="error-message">{error}</div>}

        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No logs submitted yet.</p>
            <p>Go to Dashboard to submit your first error log.</p>
          </div>
        ) : (
          <div className="history-content">
            <div className="history-list">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className={`history-item ${selectedLog?._id === log._id ? 'active' : ''}`}
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="history-item-header">
                    <span className="history-date">{formatDate(log.createdAt)}</span>
                    <span className={`cache-badge ${log.hitCount > 1 ? 'cached' : 'new'}`}>
                      {log.hitCount > 1 ? 'Cached' : 'New'}
                    </span>
                  </div>
                  <div className="history-summary">{getErrorSummary(log.maskedLog)}</div>
                  {log.hitCount > 1 && (
                    <div className="history-hit-count">Occurred {log.hitCount} times</div>
                  )}
                </div>
              ))}
            </div>

            {selectedLog && (
              <div className="history-detail">
                <div className="detail-header">
                  <h2>Log Details</h2>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedLog(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="detail-section">
                  <h3>Date</h3>
                  <p>First seen: {formatDate(selectedLog.createdAt)}</p>
                  {selectedLog.updatedAt !== selectedLog.createdAt && (
                    <p>Last seen: {formatDate(selectedLog.updatedAt)}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Masked Log</h3>
                  <pre className="log-display">{selectedLog.maskedLog}</pre>
                </div>

                {selectedLog.aiSolution && (
                  <div className="detail-section">
                    <h3>AI Solution</h3>
                    <div className="solution-content">{selectedLog.aiSolution}</div>
                  </div>
                )}

                {selectedLog.hitCount > 1 && (
                  <div className="detail-section">
                    <h3>Occurrence Count</h3>
                    <p className="hit-count">This error has occurred {selectedLog.hitCount} times</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

