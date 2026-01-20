const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture');
const clearBtn = document.getElementById('clear');
const formSentenceBtn = document.getElementById('form-sentence');
const replayBtn = document.getElementById('replay');
const gesturesSpan = document.getElementById('gestures');
const sentenceSpan = document.getElementById('sentence');
const liveGestureSpan = document.getElementById('live-gesture');
const confidenceSpan = document.getElementById('confidence');
const canvasCtx = canvas.getContext('2d');

// Timer UI
const timerSpan = document.getElementById('timer');
const captureStatus = document.getElementById('capture-status');

let holistic;
let model;
let labels;
let sentenceRules = {};

let capturedGestures = [];
let captureTimer = null;
let captureCountdown = 0;
let isCapturing = false;

// Paths
const tfliteModelPath = '/model_artifacts/keypoint_classifier/keypoint_classifier.tflite';
const labelsPath = '/model_artifacts/keypoint_classifier_label.csv';
const rulesPath  = '/app/gesture_to_sentence_rules.json';

/* ===========================
   LOAD LABELS
=========================== */
async function loadLabels() {
    const response = await fetch(labelsPath);
    const data = await response.text();
    labels = data.trim().split('\n').map(line => line.split(',')[1]);
    console.log("✅ Labels loaded");
}

/* ===========================
   LOAD SENTENCE RULES (JSON)
=========================== */
async function loadSentenceRules() {
    const response = await fetch(rulesPath);
    sentenceRules = await response.json();
    console.log("✅ Sentence rules loaded");
}

/* ===========================
   CAMERA SETUP
=========================== */
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => resolve(video);
    });
}

/* ===========================
   LANDMARK PREPROCESSING
=========================== */
function preprocessLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const baseX = landmarks[0].x;
    const baseY = landmarks[0].y;
    const data = [];

    for (const lm of landmarks) {
        data.push(lm.x - baseX, lm.y - baseY);
    }

    const maxVal = Math.max(...data.map(Math.abs)) || 1;
    return data.map(v => v / maxVal);
}

/* ===========================
   MEDIAPIPE CALLBACK
=========================== */
async function onResults(results) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const landmarks = results.rightHandLandmarks || results.leftHandLandmarks;

    if (landmarks) {
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: isCapturing ? '#FF6B6B' : '#00FF00',
            lineWidth: 3
        });

        window.drawLandmarks(canvasCtx, landmarks, {
            color: isCapturing ? '#FF6B6B' : '#0000FF',
            radius: 3
        });

        const inputData = preprocessLandmarks(landmarks);
        if (inputData && model) {
            const inputTensor = tf.tensor2d([inputData]);
            const output = model.predict(inputTensor).dataSync();

            const maxProb = Math.max(...output);
            const classId = output.indexOf(maxProb);

            liveGestureSpan.innerText = labels[classId];
            confidenceSpan.innerText = `${(maxProb * 100).toFixed(2)}%`;
        }
    } else {
        liveGestureSpan.innerText = '';
        confidenceSpan.innerText = '';
    }
}

/* ===========================
   SENTENCE FORMATION (JSON LOGIC)
=========================== */
function formSentenceFromRules(gestures) {
    const key = gestures.map(g => g.toLowerCase().trim()).join(',');
    console.log("🔎 Gesture key:", key);

    if (sentenceRules[key]) {
        const rule = sentenceRules[key];

        if (rule.type === "question") {
            return `❓ ${rule.question}\n✅ ${rule.answer}`;
        }

        if (rule.type === "statement") {
            return rule.sentence;
        }
    }

    // Fallback
    return gestures.join(' ').charAt(0).toUpperCase() +
           gestures.slice(1).join(' ') + '.';
}

/* ===========================
   CAPTURE TIMER
=========================== */
function startCaptureTimer() {
    if (isCapturing) return;

    isCapturing = true;
    captureCountdown = 5;
    captureBtn.disabled = true;
    captureBtn.textContent = '⏳ CAPTURING...';

    timerSpan.style.display = 'inline';
    timerSpan.innerText = captureCountdown;

    captureTimer = setInterval(() => {
        captureCountdown--;
        timerSpan.innerText = captureCountdown;

        if (captureCountdown <= 0) {
            stopCaptureTimer();
            captureGesture();
        }
    }, 1000);
}

function stopCaptureTimer() {
    isCapturing = false;
    captureBtn.disabled = false;
    captureBtn.textContent = '🎯 Capture Gesture';
    timerSpan.style.display = 'none';

    if (captureTimer) clearInterval(captureTimer);
}

/* ===========================
   CAPTURE GESTURE
=========================== */
function captureGesture() {
    const gesture = liveGestureSpan.innerText;
    if (gesture) {
        capturedGestures.push(gesture);
        gesturesSpan.innerText = capturedGestures.join(', ');
        captureStatus.innerText = `✓ Captured: ${gesture}`;
        captureStatus.style.color = '#28a745';
    } else {
        captureStatus.innerText = '❌ No gesture detected';
        captureStatus.style.color = '#dc3545';
    }
}

/* ===========================
   TEXT TO SPEECH
=========================== */
function speakSentence(text) {
    if (!('speechSynthesis' in window)) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace('❓','').replace('✅',''));
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
}

/* ===========================
   MAIN INITIALIZATION
=========================== */
async function main() {
    await loadLabels();
    await loadSentenceRules();

    holistic = new window.Holistic({
        locateFile: file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
    });

    holistic.setOptions({
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
    });

    holistic.onResults(onResults);

    model = await tflite.loadTFLiteModel(tfliteModelPath);

    await setupCamera();
    video.play();

    async function detect() {
        await holistic.send({ image: video });
        requestAnimationFrame(detect);
    }
    detect();
}

/* ===========================
   EVENT LISTENERS
=========================== */
captureBtn.addEventListener('click', startCaptureTimer);

formSentenceBtn.addEventListener('click', () => {
    if (capturedGestures.length === 0) {
        alert("Please capture gestures first!");
        return;
    }

    const output = formSentenceFromRules(capturedGestures);
    sentenceSpan.innerText = output;
    speakSentence(output);
});

replayBtn.addEventListener('click', () => {
    if (sentenceSpan.innerText) speakSentence(sentenceSpan.innerText);
});

clearBtn.addEventListener('click', () => {
    capturedGestures = [];
    gesturesSpan.innerText = '';
    sentenceSpan.innerText = '';
    stopCaptureTimer();
    speechSynthesis.cancel();
});

main();
