import { useState, useEffect, useRef, useCallback } from 'react';

// ── CDN scripts needed (same as original app) ────────────────────────────────
const CDN_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/holistic.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/tf-tflite.min.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
];

const MODEL_PATH = '/model_artifacts/keypoint_classifier/keypoint_classifier.tflite';
const LABEL_PATH = '/model_artifacts/keypoint_classifier_label.csv';

// ── Sentence rules (mirrors gesture_to_sentence_rules.json) ──────────────────
const SENTENCE_RULES = {
    'where,doctor': { type: 'question', question: 'Where is the doctor?', answer: 'The doctor is at the hospital.' },
    'where,college': { type: 'question', question: 'Where is the college?', answer: 'The college is located in RVS Nagar' },
    'where,you,work': { sentence: 'Where do you work?' },
    'where,you,stand': { sentence: 'Where do you stand?' },
    'where,you,from': { sentence: 'Where are you from?' },
    'how,pain': { sentence: 'How is the pain?' },
    'how,skin': { sentence: 'How is the skin?' },
    'how,you,afraid': { sentence: 'How are you feeling?' },
    'you,work,today': { sentence: 'You work today.' },
    'you,stand': { sentence: 'You stand here.' },
    'doctor,warn,skin': { sentence: 'The doctor warns about skin problems.' },
    'you,pray,today': { sentence: 'You pray today.' },
    'pain,small': { sentence: 'The pain is small.' },
    'skin,bad': { sentence: 'The skin is bad.' },
    'you,afraid': { sentence: 'You are afraid.' },
    'you,need,assistance': { sentence: 'You need assistance.' },
};

function formSentenceLocal(gestures) {
    const key = gestures.map(g => g.toLowerCase().trim()).join(',');
    const rule = SENTENCE_RULES[key];
    if (!rule) return gestures.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' ') + '.';
    if (rule.type === 'question') return `❓ ${rule.question}\n✅ ${rule.answer}`;
    return rule.sentence;
}

// ── Load a script tag once (idempotent) ──────────────────────────────────────
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// ── Preprocessing (identical to extract_landmarks.py + model.js) ─────────────
function preprocessLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;
    const baseX = landmarks[0].x, baseY = landmarks[0].y;
    const data = [];
    for (const lm of landmarks) data.push(lm.x - baseX, lm.y - baseY);
    const maxVal = Math.max(...data.map(Math.abs)) || 1;
    return data.map(v => v / maxVal);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const modelRef = useRef(null);
    const holisticRef = useRef(null);
    const cameraRef = useRef(null);
    const labelsRef = useRef([]);
    const lastLogRef = useRef(0);
    const captureIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const isCapturingRef = useRef(false);
    const currentGestureRef = useRef('');
    const currentConfRef = useRef(0);

    const [status, setStatus] = useState('idle');   // idle | loading | ready | error
    const [gesture, setGesture] = useState('No Hand');
    const [confidence, setConfidence] = useState(0);
    const [capturing, setCapturing] = useState(false);
    const [timer, setTimer] = useState(0);
    const [captured, setCaptured] = useState([]);
    const [sentence, setSentence] = useState('');
    const [modelMsg, setModelMsg] = useState('');

    // ── Load CDN scripts then model + labels then start holistic ─────────────
    const initAll = useCallback(async () => {
        setStatus('loading');
        setModelMsg('Loading MediaPipe + TFLite scripts…');

        try {
            // 1. Load CDN scripts sequentially
            for (const src of CDN_SCRIPTS) await loadScript(src);

            // 2. Load labels CSV
            setModelMsg('Loading gesture labels…');
            const res = await fetch(LABEL_PATH);
            const text = await res.text();
            labelsRef.current = text.trim().split('\n').map(l => l.split(',')[1]);
            console.log('✅ Labels:', labelsRef.current);

            // 3. Load TFLite model
            setModelMsg('Loading TFLite model…');
            // eslint-disable-next-line no-undef
            modelRef.current = await tflite.loadTFLiteModel(MODEL_PATH);
            console.log('✅ TFLite model loaded');

            // 4. Setup MediaPipe Holistic
            setModelMsg('Starting MediaPipe Holistic…');
            // eslint-disable-next-line no-undef
            holisticRef.current = new Holistic({
                locateFile: f =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${f}`,
            });
            holisticRef.current.setOptions({
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5,
            });
            holisticRef.current.onResults(onResults);

            // 5. Start Camera utility
            // eslint-disable-next-line no-undef
            cameraRef.current = new Camera(videoRef.current, {
                onFrame: async () => {
                    await holisticRef.current.send({ image: videoRef.current });
                },
                width: 640, height: 480,
            });
            await cameraRef.current.start();
            setStatus('ready');
            setModelMsg('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setModelMsg(`Error: ${err.message}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── onResults callback (same as model.js) ─────────────────────────────────
    function onResults(results) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        const landmarks = results.rightHandLandmarks || results.leftHandLandmarks;

        if (landmarks) {
            const capturing = isCapturingRef.current;

            // Draw connectors + landmarks (exactly like model.js)
            // eslint-disable-next-line no-undef
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: capturing ? '#ff0000' : '#00ccff',
                lineWidth: 4,
            });
            // eslint-disable-next-line no-undef
            drawLandmarks(ctx, landmarks, {
                color: capturing ? '#ff0000' : '#ff007f',
                lineWidth: 2,
                radius: 4,
            });

            // Predict
            if (modelRef.current) {
                const inputData = preprocessLandmarks(landmarks);
                if (inputData) {
                    // eslint-disable-next-line no-undef
                    const inputTensor = tf.tensor2d([inputData]);
                    const outputTensor = modelRef.current.predict(inputTensor);
                    const outputData = outputTensor.dataSync();
                    inputTensor.dispose();
                    outputTensor.dispose();

                    const maxProb = Math.max(...outputData);
                    const classIndex = Array.from(outputData).indexOf(maxProb);
                    const label = labelsRef.current[classIndex] || 'Unknown';

                    currentGestureRef.current = label;
                    currentConfRef.current = maxProb;

                    setGesture(label);
                    setConfidence(maxProb);

                    // Log prediction locally (Backend removed for Vercel deployment)
                    const now = Date.now();
                    if (now - lastLogRef.current > 2000 && maxProb > 0.6) {
                        lastLogRef.current = now;
                        // Place any alternative telemetry or local logging here if needed
                    }
                }
            }
        } else {
            currentGestureRef.current = '';
            setGesture('No Hand');
            setConfidence(0);
        }

        ctx.restore();
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cameraRef.current) cameraRef.current.stop();
            if (holisticRef.current) holisticRef.current.close();
            clearInterval(captureIntervalRef.current);
            clearInterval(timerIntervalRef.current);
        };
    }, []);

    // ── Capture logic (5-second countdown, same as model.js) ─────────────────
    const startCapture = () => {
        if (isCapturingRef.current) return;
        isCapturingRef.current = true;
        setCapturing(true);
        let countdown = 5;
        setTimer(countdown);

        timerIntervalRef.current = setInterval(() => {
            countdown--;
            setTimer(countdown);
            if (countdown <= 0) {
                clearInterval(timerIntervalRef.current);
                // Grab current gesture
                const g = currentGestureRef.current;
                const c = currentConfRef.current;
                if (g && g !== 'No Hand' && g !== 'Unknown' && c > 0.5) {
                    setCaptured(prev => [...prev, g]);
                }
                isCapturingRef.current = false;
                setCapturing(false);
                setTimer(0);
            }
        }, 1000);
    };

    const clearGestures = () => {
        setCaptured([]);
        setSentence('');
    };

    const handleFormSentence = async () => {
        if (captured.length === 0) return;
        let result = '';
        // Form sentence using local rules (Backend removed for Vercel deployment)
        result = formSentenceLocal(captured);

        setSentence(result);

        // Save to History (localStorage)
        const history = JSON.parse(localStorage.getItem('gesture_history') || '[]');
        const newItem = {
            sentence: result,
            gestures: [...captured],
            timestamp: Date.now()
        };
        localStorage.setItem('gesture_history', JSON.stringify([...history, newItem]));
    };

    const speakResult = () => {
        if (!sentence || !('speechSynthesis' in window)) return;
        const utt = new SpeechSynthesisUtterance(sentence.replace(/[❓✅\n]/g, ' '));
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
    };

    // ── Confidence colour helper ───────────────────────────────────────────────
    const confColor = confidence > 0.75 ? 'var(--success)' : confidence > 0.5 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div>
            <div className="live-layout">

                {/* ── Left: Video + Canvas ───────────────────────────────────────── */}
                <div>
                    <div className="video-wrapper" style={{ background: '#111' }}>
                        {/* Raw video feed (hidden behind canvas) */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                        />
                        {/* Canvas — landmarks drawn here */}
                        <canvas
                            ref={canvasRef}
                            style={{
                                position: 'absolute', top: 0, left: 0,
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)',   // mirror view like the original
                            }}
                        />

                        {/* Loading overlay */}
                        {status === 'idle' && (
                            <div className="camera-placeholder">
                                <div className="cam-icon">📷</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                                    Camera not started
                                </p>
                                <button
                                    className="btn-primary"
                                    style={{ width: 'auto', padding: '0.6rem 1.6rem' }}
                                    onClick={initAll}
                                >
                                    ▶ Start Camera
                                </button>
                            </div>
                        )}

                        {(status === 'loading') && (
                            <div className="camera-placeholder">
                                <div style={{ fontSize: '2rem' }}>⏳</div>
                                <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', maxWidth: 260 }}>
                                    {modelMsg}
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="camera-placeholder">
                                <div style={{ fontSize: '2rem' }}>❌</div>
                                <p style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center', maxWidth: 300 }}>
                                    {modelMsg}
                                </p>
                                <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.2rem' }} onClick={initAll}>
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* LIVE badge */}
                        {status === 'ready' && (
                            <div style={{
                                position: 'absolute', top: 12, left: 12,
                                background: 'rgba(239,68,68,0.9)', color: '#fff',
                                fontSize: '0.7rem', fontWeight: 700,
                                padding: '3px 10px', borderRadius: 20,
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: '#fff', display: 'inline-block',
                                    animation: 'pulse 1.5s infinite',
                                }} />
                                LIVE
                            </div>
                        )}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
                </div>

                {/* ── Right: Control Panel ───────────────────────────────────────── */}
                <div className="control-panel glass-panel">
                    <h3 style={{ margin: 0 }}>Prediction Panel</h3>

                    {/* Current Gesture */}
                    <div className="prediction-display">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Current Gesture
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: confColor }}>
                                {(confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="gesture-label">{gesture}</div>
                        <div className="conf-bar-bg" style={{ marginTop: 8 }}>
                            <div className="conf-bar-fill" style={{ width: `${confidence * 100}%`, background: `linear-gradient(90deg, ${confColor}, var(--accent))` }} />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {/* Capture status + Timer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                            fontSize: '0.78rem', fontWeight: 600, padding: '3px 12px',
                            borderRadius: 20,
                            background: capturing ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.05)',
                            color: capturing ? 'var(--danger)' : 'var(--text-muted)',
                        }}>
                            {capturing ? `🔴 Capturing… ${timer}s` : status === 'ready' ? '⚪ Ready' : '⚫ Camera Off'}
                        </span>
                    </div>

                    {/* Capture / Clear buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <button
                            className="btn-primary"
                            onClick={status === 'idle' ? initAll : startCapture}
                            disabled={capturing || status === 'loading'}
                        >
                            {status === 'idle' ? '▶ Start' : capturing ? `⏳ ${timer}s` : '🎯 Capture'}
                        </button>
                        <button className="btn-secondary" onClick={clearGestures} disabled={capturing}>
                            🗑 Clear
                        </button>
                    </div>

                    {/* Captured gestures */}
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                            CAPTURED SEQUENCE
                        </div>
                        <div className="captured-gestures-box">
                            {captured.length === 0
                                ? <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                    Capture gestures to build a sentence
                                </span>
                                : captured.map((g, i) => (
                                    <span key={i} className="gesture-tag">{g}</span>
                                ))
                            }
                        </div>
                    </div>

                    {/* Form Sentence */}
                    <button
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
                        onClick={handleFormSentence}
                        disabled={captured.length === 0}
                    >
                        ✨ Form Sentence
                    </button>

                    {/* Sentence output */}
                    <div className="sentence-box" style={{ whiteSpace: 'pre-line' }}>
                        {sentence || <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Sentence will appear here…</span>}
                    </div>

                    <button className="btn-secondary" onClick={speakResult} disabled={!sentence}>
                        🔊 Speak
                    </button>
                </div>
            </div>
        </div>
    );
}


