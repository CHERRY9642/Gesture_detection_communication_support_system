from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
import csv

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
CORS(app)

# Load gesture labels
with open('../model_artifacts/keypoint_classifier_label.csv', encoding='utf-8-sig') as f:
    gesture_labels = [row[0] for row in csv.reader(f)]

# Define sentence patterns - STRINGS for easier debugging
SENTENCE_PATTERNS = {
    ("doctor", "warn", "skin"): "The doctor warns about skin problems.",
    ("you", "afraid", "pain"): "You are afraid because of pain.",
    ("you", "work", "college"): "You work at the college.",
    ("doctor", "specific", "pain"): "The doctor asks about specific pain.",
    ("you", "pray", "today"): "You pray today.",
    ("you", "stand", "secondary"): "You stand near the secondary building.",
}

def form_sentence(gestures):
    """Forms a sentence from a list of gestures based on predefined patterns."""
    if not gestures:
        return ""
    
    # ✅ CRITICAL FIX: Convert ALL gestures to lowercase + strip whitespace
    gestures_lower = [gesture.lower().strip() for gesture in gestures]
    gestures_tuple = tuple(gestures_lower)
    
    print(f"🔍 DEBUG: Original: {gestures}")
    print(f"🔍 DEBUG: Lowercase: {gestures_lower}") 
    print(f"🔍 DEBUG: Tuple: {gestures_tuple}")
    print(f"🔍 DEBUG: Available patterns: {list(SENTENCE_PATTERNS.keys())}")
    
    # Check for exact pattern match
    if gestures_tuple in SENTENCE_PATTERNS:
        sentence = SENTENCE_PATTERNS[gestures_tuple]
        print(f"✅ PATTERN MATCHED! Sentence: {sentence}")
        return sentence
    
    # Fallback sentence
    fallback = " ".join(gestures_lower).capitalize() + '.'
    print(f"❌ No pattern match. Fallback: {fallback}")
    return fallback

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/model_artifacts/<path:path>')
def send_model_artifacts(path):
    return send_from_directory(os.path.join('..', 'model_artifacts'), path)

@app.route('/api/sentence', methods=['POST'])
def get_sentence():
    try:
        data = request.get_json()
        gesture_indices = data.get('gestures', []) if data else []
        print(f"📨 API Received: {gesture_indices}")
        
        # Convert indices to gesture names
        gestures = [gesture_labels[int(i)] for i in gesture_indices if i.isdigit() and 0 <= int(i) < len(gesture_labels)]

        sentence = form_sentence(gestures)
        print(f"✅ Generated: '{sentence}'")
        
        return jsonify({'sentence': sentence})
    except Exception as e:
        print(f"❌ API Error: {e}")
        return jsonify({'sentence': 'Error processing request'}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask server on http://localhost:5001")
    print("📋 Available patterns:")
    for pattern, sentence in SENTENCE_PATTERNS.items():
        print(f"   {pattern} → '{sentence}'")
    app.run(debug=True, port=5001)
