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

// ✅ NEW: Timer elements
const timerSpan = document.getElementById('timer');
const captureStatus = document.getElementById('capture-status');

let holistic;
let model;
let labels;
let capturedGestures = [];
let captureTimer = null;
let captureCountdown = 0;
let isCapturing = false;

const SENTENCE_PATTERNS = {
    "doctor,warn,skin": "The doctor warns about skin problems.",
    "you,afraid,pain": "You are afraid because of pain.",
    "you,work,college": "You work at the college.",
    "doctor,specific,pain": "The doctor asks about specific pain.",
    "you,pray,today": "You pray today.",
    "you,stand,secondary": "You stand near the secondary building."
};

const tfliteModelPath = '/model_artifacts/keypoint_classifier/keypoint_classifier.tflite';
const labelsPath = '/model_artifacts/keypoint_classifier_label.csv';

async function loadLabels() {
    const response = await fetch(labelsPath);
    const data = await response.text();
    labels = data.split('\n').map(line => {
        const [id, label] = line.split(',');
        return label;
    });
}

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

function preprocessLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) {
        return null;
    }
    const preprocessed_landmarks = [];
    const base_x = landmarks[0].x;
    const base_y = landmarks[0].y;

    for (const lm of landmarks) {
        preprocessed_landmarks.push(lm.x - base_x, lm.y - base_y);
    }

    const max_val = Math.max(...preprocessed_landmarks.map(Math.abs));
    const normalized_landmarks = preprocessed_landmarks.map(v => v / max_val);

    return normalized_landmarks;
}

async function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.rightHandLandmarks || results.leftHandLandmarks) {
        const landmarks = results.rightHandLandmarks || results.leftHandLandmarks;
        if (window.drawConnectors) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { 
                color: isCapturing ? '#FF6B6B' : '#00FF00', lineWidth: 3 
            });
            window.drawLandmarks(canvasCtx, landmarks, { 
                color: isCapturing ? '#FF6B6B' : '#0000FF', lineWidth: 2, radius: isCapturing ? 4 : 2 
            });
        }

        const preprocessed = preprocessLandmarks(landmarks);
        if (preprocessed && model) {
            const input = tf.tensor2d([preprocessed]);
            const output = model.predict(input);
            const prediction = output.dataSync();
            const maxConfidence = Math.max(...prediction);
            const classId = prediction.indexOf(maxConfidence);
            const gesture = labels[classId];
            liveGestureSpan.innerText = gesture;
            confidenceSpan.innerText = `${(maxConfidence * 100).toFixed(2)}%`;
        }
    } else {
        liveGestureSpan.innerText = '';
        confidenceSpan.innerText = '';
    }
    canvasCtx.restore();
}

function formSentence(gestures) {
    console.log('Processing gestures:', gestures);
    const gesturesKey = gestures.map(g => g.toLowerCase().trim()).join(',');
    console.log('Gesture key:', gesturesKey);
    
    if (SENTENCE_PATTERNS[gesturesKey]) {
        console.log('✅ Pattern matched!');
        return SENTENCE_PATTERNS[gesturesKey];
    }
    
    const simpleSentence = gestures.join(' ').charAt(0).toUpperCase() + 
                          gestures.slice(1).join(' ') + '.';
    console.log('❌ No pattern match, using fallback:', simpleSentence);
    return simpleSentence;
}

// ✅ NEW: 5-Second Capture Timer
function startCaptureTimer() {
    if (isCapturing) return;
    
    isCapturing = true;
    captureCountdown = 5;
    
    captureBtn.textContent = '⏳ CAPTURING...';
    captureBtn.disabled = true;
    captureStatus.textContent = 'Hold your gesture steady!';
    captureStatus.style.color = '#FF6B6B';
    timerSpan.textContent = '5';
    timerSpan.style.display = 'inline';
    
    // Highlight video during capture
    document.getElementById('video-container').style.borderColor = '#FF6B6B';
    document.getElementById('video-container').style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
    
    captureTimer = setInterval(() => {
        captureCountdown--;
        timerSpan.textContent = captureCountdown;
        
        if (captureCountdown <= 0) {
            stopCaptureTimer();
            captureGesture();
        }
    }, 1000);
}

function stopCaptureTimer() {
    isCapturing = false;
    captureBtn.textContent = '🎯 Capture Gesture';
    captureBtn.disabled = false;
    captureStatus.textContent = '';
    timerSpan.style.display = 'none';
    
    // Reset video border
    document.getElementById('video-container').style.borderColor = '#007bff';
    document.getElementById('video-container').style.boxShadow = 'none';
    
    if (captureTimer) {
        clearInterval(captureTimer);
        captureTimer = null;
    }
}

function captureGesture() {
    const currentGesture = liveGestureSpan.innerText;
    if (currentGesture && currentGesture.trim()) {
        capturedGestures.push(currentGesture);
        gesturesSpan.innerText = capturedGestures.join(', ');
        console.log('✅ Captured:', currentGesture);
        
        // Visual feedback
        captureStatus.textContent = `✓ Captured: ${currentGesture}`;
        captureStatus.style.color = '#28a745';
        setTimeout(() => {
            captureStatus.textContent = '';
        }, 1500);
    } else {
        captureStatus.textContent = '❌ No gesture detected!';
        captureStatus.style.color = '#dc3545';
        console.log('❌ No gesture detected during capture');
    }
}

async function main() {
    await loadLabels();
    holistic = new window.Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
    });
    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
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

// ✅ EVENT LISTENERS
captureBtn.addEventListener('click', startCaptureTimer);

formSentenceBtn.addEventListener('click', () => {
    if (capturedGestures.length > 0) {
        const sentence = formSentence(capturedGestures);
        sentenceSpan.innerText = sentence;
        speakSentence(sentence);
        console.log('Final sentence:', sentence);
    } else {
        alert('Please capture some gestures first!');
    }
});

replayBtn.addEventListener('click', () => {
    const sentence = sentenceSpan.innerText;
    if (sentence && sentence !== '') {
        speakSentence(sentence);
    } else {
        alert('No sentence to replay!');
    }
});

clearBtn.addEventListener('click', () => {
    capturedGestures = [];
    gesturesSpan.innerText = '';
    sentenceSpan.innerText = '';
    stopCaptureTimer(); // Stop any ongoing capture
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
});

function speakSentence(sentence) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    } else {
        console.log('Text-to-speech not supported');
    }
}

main();
