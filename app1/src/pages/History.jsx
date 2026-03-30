import { useState, useEffect } from 'react';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gesture_history') || '[]');
    setHistory(saved.reverse()); // Show newest first
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your sentence history?')) {
      localStorage.removeItem('gesture_history');
      setHistory([]);
    }
  };

  const speakSentence = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utt = new SpeechSynthesisUtterance(text.replace(/[❓✅\n]/g, ' '));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

  const deleteItem = (timestamp) => {
    const updated = history.filter(item => item.timestamp !== timestamp);
    localStorage.setItem('gesture_history', JSON.stringify([...updated].reverse()));
    setHistory(updated);
  };

  return (
    <div className="history-container fade-in">
      <div className="history-header">
        <div className="header-text">
          <h1>Sentence <span className="gradient-text">History</span></h1>
          <p>Review and replay your previously formed sentences.</p>
        </div>
        <button className="btn-clear" onClick={clearHistory} disabled={history.length === 0}>
           🗑️ Clear All
        </button>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No history yet</h3>
            <p>Go to the Dashboard and form some sentences to see them here.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.timestamp} className="history-card slide-up">
              <div className="card-info">
                <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                <p className="sentence-text">{item.sentence}</p>
                <div className="gesture-tags">
                  {item.gestures.map((g, i) => (
                    <span key={i} className="mini-tag">{g}</span>
                  ))}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-icon-action" onClick={() => speakSentence(item.sentence)}>
                  🔊 Listen
                </button>
                <button className="btn-icon-delete" onClick={() => deleteItem(item.timestamp)}>
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
