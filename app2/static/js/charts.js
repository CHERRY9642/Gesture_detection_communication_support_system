/* static/js/charts.js */

async function updateDashboard() {
    try {
        const response = await fetch('/api/dashboard_data');
        const data = await response.json();

        if (data.status === 'no_data') return;

        // Update KPIs
        document.getElementById('kpi-total').innerText = data.kpi.total;
        document.getElementById('kpi-top').innerText = data.kpi.top_gesture;
        document.getElementById('kpi-acc').innerText = data.kpi.avg_confidence + '%';

        // Render Charts (Real Metrics Only)
        renderTrendChart(data.charts.trends);
        renderDistChart(data.charts.distribution);
        if (data.risk_list) renderRiskTable(data.risk_list);

    } catch (e) {
        console.error("Error fetching dashboard data:", e);
    }
}

let trendChartInst = null;
let distChartInst = null;
// Removed Seg/Feat/Map instances as requested by user


function renderSegChart(segData) {
    const canvas = document.getElementById('userSegChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (segChartInst) segChartInst.destroy();

    segChartInst = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(segData),
            datasets: [{
                data: Object.values(segData),
                backgroundColor: ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'right' } }
        }
    });
}


function renderRiskTable(riskList) {
    const tbody = document.getElementById('risk-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (riskList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="padding:10px; text-align:center;">No high risks detected</td></tr>';
        return;
    }

    riskList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${item.Timestamp.split(' ')[1]}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-weight: bold;">${item.Predicted_Gesture}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border-color); color: #dc3545;">${(item.Confidence * 100).toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function renderFeatureChart(featData) {
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;

    const labels = Object.keys(featData);
    const values = Object.values(featData);

    if (featChartInst) featChartInst.destroy();

    featChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Importance',
                data: values,
                backgroundColor: '#0d9488',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 1.0 }
            }
        }
    });
}


function renderTrendChart(trendData) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels = trendData.map(d => d.Timestamp.split(' ')[1]); // Just time
    const values = trendData.map(d => d.Confidence); // Plotting confidence as "performance" proxy

    if (trendChartInst) trendChartInst.destroy();

    trendChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confidence Trend',
                data: values,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 1.0, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderDistChart(distData) {
    const ctx = document.getElementById('distChart').getContext('2d');
    const labels = Object.keys(distData);
    const values = Object.values(distData);

    if (distChartInst) distChartInst.destroy();

    distChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#ff007f', '#00d4ff', '#00ff00', '#ffff00', '#ff8800'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'right', labels: { color: 'white' } } }
        }
    });
}

let mapInst = null;
function renderMap(points) {
    if (!document.getElementById('map')) return;

    if (mapInst === null) {
        mapInst = L.map('map').setView([37.0902, -95.7129], 3);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18,
        }).addTo(mapInst);
    }

    // Clear old markers (naive approach for demo, ideally track layers)
    mapInst.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapInst.removeLayer(layer);
    });

    points.forEach(p => {
        L.circleMarker([p[0], p[1]], {
            radius: p[2] * 10,
            color: '#00d4ff',
            fillColor: '#00d4ff',
            fillOpacity: 0.5
        }).addTo(mapInst);
    });
}

// Auto update every 5 seconds
// Auto update every 5 seconds
setInterval(updateDashboard, 5000);
// Initial update
updateDashboard();
