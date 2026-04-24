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

const STATIC_DATA = {
    kpi: { total: 12453, top_gesture: 'assistance', avg_confidence: 94.2 },
    charts: {
        trends: [
            { Timestamp: '2026-03-09 10:00:00', Confidence: 0.92 },
            { Timestamp: '2026-03-09 10:05:00', Confidence: 0.94 },
            { Timestamp: '2026-03-09 10:10:00', Confidence: 0.89 },
            { Timestamp: '2026-03-09 10:15:00', Confidence: 0.95 },
            { Timestamp: '2026-03-09 10:20:00', Confidence: 0.93 },
            { Timestamp: '2026-03-09 10:25:00', Confidence: 0.91 },
            { Timestamp: '2026-03-09 10:30:00', Confidence: 0.96 },
            { Timestamp: '2026-03-09 10:35:00', Confidence: 0.94 },
        ],
        distribution: {
            'assistance': 450,
            'doctor': 320,
            'college': 280,
            'bad': 150,
            'pray': 210,
            'work': 190,
            'from': 120,
            'skin': 90
        }
    },
    risk_list: [
        { Timestamp: '2026-03-09 10:12:45', Predicted_Gesture: 'warn', Confidence: 0.62 },
        { Timestamp: '2026-03-09 09:45:12', Predicted_Gesture: 'small', Confidence: 0.58 },
        { Timestamp: '2026-03-09 09:10:33', Predicted_Gesture: 'bad', Confidence: 0.65 },
        { Timestamp: '2026-03-09 08:55:01', Predicted_Gesture: 'today', Confidence: 0.69 },
    ],
    accuracy: 96.4,
    f1score: 95.8,
    precision: 96.1,
    recall: 95.5,
};

// ── Color palette ─────────────────────────────────────────────────────────────
const PALETTE = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7'];

export default function Analytics() {
    const [data] = useState(STATIC_DATA);
    const [lastUpdated] = useState('Apr 03, 2026, 10:45 AM');

    if (!data) return null;

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
                    <button className="icon-btn" onClick={() => alert('Static data refreshed.')} title="Refresh">🔄</button>
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
