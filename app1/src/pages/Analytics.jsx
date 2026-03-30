import { useState, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Filler, Tooltip, Legend
);

// Backend removed for Vercel deployment


const GESTURE_CLASSES = [
    'afraid', 'agree', 'assistance', 'bad', 'become', 'college',
    'doctor', 'from', 'how', 'pain', 'pray', 'secondary',
    'skin', 'small', 'specific', 'stand', 'today', 'warn',
    'where', 'which', 'work', 'you'
];

// ── Generate plausible mock data ──────────────────────────────────────────────
function generateMockData() {
    const hours = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (30 - i) * 2);
        return d.toTimeString().slice(0, 5);
    });
    const confValues = hours.map(() => parseFloat((0.6 + Math.random() * 0.38).toFixed(3)));

    const dist = {};
    GESTURE_CLASSES.slice(0, 8).forEach(g => { dist[g] = Math.floor(Math.random() * 150) + 30; });

    const riskLogs = Array.from({ length: 10 }, (_, i) => ({
        Timestamp: `2026-03-09 ${String(8 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        Predicted_Gesture: GESTURE_CLASSES[Math.floor(Math.random() * GESTURE_CLASSES.length)],
        Confidence: parseFloat((0.3 + Math.random() * 0.38).toFixed(3)),
    }));

    const total = Object.values(dist).reduce((a, b) => a + b, 0) + Math.floor(Math.random() * 200);
    const topGesture = Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0];
    const avgConf = parseFloat((confValues.reduce((a, b) => a + b, 0) / confValues.length * 100).toFixed(1));

    return {
        kpi: { total, top_gesture: topGesture, avg_confidence: avgConf },
        charts: { trends: hours.map((t, i) => ({ Timestamp: `2026-03-09 ${t}:00`, Confidence: confValues[i] })), distribution: dist },
        risk_list: riskLogs,
        accuracy: 96.4,
        f1score: 95.8,
        precision: 96.1,
        recall: 95.5,
    };
}

// ── Color palette ─────────────────────────────────────────────────────────────
const PALETTE = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7'];

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState('');

    const fetchData = () => {
        setLoading(true);
        // Using mock data for frontend deployment
        setData(generateMockData());
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 10000);
        return () => clearInterval(id);
    }, []);

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                <p style={{ color: 'var(--text-muted)' }}>Loading analytics…</p>
            </div>
        );
    }

    // Chart configs
    const trendConfig = {
        labels: data.charts.trends.map(d => d.Timestamp.split(' ')[1]),
        datasets: [{
            label: 'Confidence',
            data: data.charts.trends.map(d => d.Confidence),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.1)',
            tension: 0.4, fill: true, pointRadius: 2,
        }],
    };

    const distConfig = {
        labels: Object.keys(data.charts.distribution),
        datasets: [{
            data: Object.values(data.charts.distribution),
            backgroundColor: PALETTE,
            borderWidth: 0,
        }],
    };

    const classLabels = GESTURE_CLASSES.slice(0, 12);
    const perClassAcc = {
        labels: classLabels,
        datasets: [{
            label: 'Accuracy %',
            data: classLabels.map(() => parseFloat((85 + Math.random() * 14).toFixed(1))),
            backgroundColor: classLabels.map((_, i) => PALETTE[i % PALETTE.length]),
            borderRadius: 6,
        }],
    };

    const commonOpts = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false }, x: { ticks: { maxTicksLimit: 8 } } },
    };

    return (
        <div>
            {/* ── Header row ───────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <p className="nav-label" style={{ margin: 0 }}>Last updated: {lastUpdated}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="icon-btn" onClick={fetchData} title="Refresh">🔄</button>
                </div>
            </div>

            {/* ── KPI Cards ──────────────────────────────── */}
            <div className="kpi-row">
                {[
                    { label: 'Total Predictions', value: data.kpi.total.toLocaleString(), icon: '📈', sub: 'Lifetime gestures logged' },
                    { label: 'Top Gesture', value: data.kpi.top_gesture, icon: '🏆', sub: 'Most predicted sign' },
                    { label: 'Avg Confidence', value: `${data.kpi.avg_confidence}%`, icon: '🎯', sub: 'Mean prediction score' },
                    { label: 'Model Accuracy', value: `${data.accuracy}%`, icon: '✅', sub: 'Test set performance' },
                    { label: 'F1 Score', value: `${data.f1score}%`, icon: '⚖️', sub: 'Macro-averaged' },
                ].map(k => (
                    <div className="kpi-card" key={k.label}>
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value">{k.value}</div>
                        <div className="kpi-sub">{k.sub}</div>
                        <div className="kpi-icon">{k.icon}</div>
                    </div>
                ))}
            </div>

            <h4 className="section-heading">📊 Model Performance</h4>

            {/* ── Charts ─────────────────────────────────── */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📉</span> Confidence Trend</h3>
                    <div style={{ height: '220px' }}>
                        <Line
                            data={trendConfig}
                            options={{
                                ...commonOpts,
                                maintainAspectRatio: false,
                                scales: {
                                    y: { beginAtZero: true, max: 1, ticks: { callback: v => `${(v * 100).toFixed(0)}%`, font: { size: 10 } } },
                                    x: { ticks: { maxTicksLimit: 6, font: { size: 10 } } },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">🥧</span> Distribution</h3>
                    <div style={{ height: '220px' }}>
                        <Doughnut
                            data={distConfig}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Per-Class Accuracy</h3>
                    <div style={{ height: '220px' }}>
                        <Bar
                            data={perClassAcc}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%`, font: { size: 10 } } },
                                    x: { ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 } }
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Model Architecture Card ─────────────────── */}
            <h4 className="section-heading">🧠 Model Architecture</h4>
            <div className="model-stats" style={{ marginBottom: '1.25rem' }}>
                {[
                    { label: 'Input Layer', value: '42', sub: 'landmark features' },
                    { label: 'Hidden Layer 1', value: '128', sub: 'ReLU + Dropout 30%' },
                    { label: 'Hidden Layer 2', value: '64', sub: 'ReLU + Dropout 30%' },
                    { label: 'Hidden Layer 3', value: '32', sub: 'ReLU' },
                    { label: 'Output Layer', value: '22', sub: 'Softmax classes' },
                    { label: 'Optimizer', value: 'Adam', sub: 'Cat. Cross-Entropy' },
                ].map(s => (
                    <div className="stat-item" key={s.label} style={{ padding: '0.75rem' }}>
                        <div className="stat-value" style={{ fontSize: '1.15rem' }}>{s.value}</div>
                        <div className="stat-label" style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.7rem' }}>{s.label}</div>
                        <div className="stat-label" style={{ fontSize: '0.65rem' }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Risk Table ─────────────────────────────── */}
            <h4 className="section-heading">⚠️ Low-Confidence Predictions (Risk Monitor)</h4>
            <div className="risk-table-wrapper">
                <table className="risk-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Predicted Gesture</th>
                            <th>Confidence</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.risk_list.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No high-risk predictions found</td></tr>
                        ) : (
                            data.risk_list.map((row, i) => {
                                const conf = parseFloat(row.Confidence);
                                const isHigh = conf < 0.7;
                                return (
                                    <tr key={i}>
                                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                            {row.Timestamp?.split(' ')[1] || '—'}
                                        </td>
                                        <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.Predicted_Gesture}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 60, height: 6, background: 'var(--border-color)',
                                                    borderRadius: 3, overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${conf * 100}%`, height: '100%',
                                                        background: isHigh ? 'var(--danger)' : 'var(--success)',
                                                        borderRadius: 3
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{(conf * 100).toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={isHigh ? 'badge-high' : 'badge-low'}>
                                                {isHigh ? '⚠ HIGH' : '✓ LOW'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
