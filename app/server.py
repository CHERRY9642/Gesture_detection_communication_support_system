# app2/server.py
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, send_file
import csv
import os
from datetime import datetime
import pandas as pd
import json
import random

app = Flask(__name__)
app.secret_key = 'super_secret_key_for_demo' # Change this for production

# Constants
DATA_DIR = "data"
LOG_FILE = os.path.join(DATA_DIR, "prediction_logs.csv")
USER_FILE = os.path.join(DATA_DIR, "users.csv")
MODEL_artifacts_DIR = "../model_artifacts"

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("../reports", exist_ok=True)

# Initialize Files
# Initialize Files
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Predicted_Gesture", "Confidence", "User_IP", "Risk_Score"])

if not os.path.exists(USER_FILE):
    with open(USER_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Username", "Password"])

# Define sentence patterns from backend.py
# Load Sentence Rules
RULES_FILE = "gesture_to_sentence_rules.json"
SENTENCE_RULES = {}

def load_rules():
    global SENTENCE_RULES
    if os.path.exists(RULES_FILE):
        try:
            with open(RULES_FILE, 'r') as f:
                SENTENCE_RULES = json.load(f)
            print(f"✅ Loaded {len(SENTENCE_RULES)} sentence rules.")
        except Exception as e:
            print(f"❌ Error loading rules: {e}")
    else:
        print("⚠️ Rules file not found.")

# Load initially
load_rules()

def form_sentence_logic(gestures):
    """Forms a sentence from a list of gestures based on predefined patterns."""
    if not gestures:
        return ""
    
    gestures_lower = [gesture.lower().strip() for gesture in gestures]
    
    # Create key: "word1,word2,word3"
    key = ",".join(gestures_lower)
    print(f"🔎 Looking up key: {key}")
    
    if key in SENTENCE_RULES:
        rule = SENTENCE_RULES[key]
        if rule.get('type') == 'question':
            return f"❓ {rule.get('question')}\n✅ {rule.get('answer')}"
        return rule.get('sentence', "")
    
    # Fallback sentence
    return " ".join(gestures_lower).capitalize() + '.'

@app.route('/')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login_page'))
    return render_template('dashboard.html', user=session['user'])

@app.route('/login')
def login_page():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/signup')
def signup_page():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('signup.html')

@app.route('/analytics')
def analytics_page():
    if 'user' not in session:
        return redirect(url_for('login_page'))
    return render_template('analytics.html', user=session['user'])

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login_page'))

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    # Check if exists
    try:
        users = pd.read_csv(USER_FILE)
        if username in users['Username'].values:
            return jsonify({"status": "error", "message": "User already exists"}), 400
    except pd.errors.EmptyDataError:
        pass # File might be empty initially
        
    with open(USER_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([username, password])
        
    return jsonify({"status": "success", "message": "User created"})

@app.route('/api/login', methods=['POST'])
def login_api():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    try:
        users = pd.read_csv(USER_FILE)
        user = users[(users['Username'] == username) & (users['Password'] == password)]
        
        if not user.empty:
            session['user'] = username
            return jsonify({"status": "success", "username": username})
        else:
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"status": "error", "message": "System error"}), 500

@app.route('/model_artifacts/<path:filename>')
def serve_artifacts(filename):
    return send_from_directory(MODEL_artifacts_DIR, filename)

@app.route('/api/log_prediction', methods=['POST'])
def log_prediction():
    try:
        data = request.json
        gesture = data.get('gesture', '').strip() # Remove newline
        confidence = float(data.get('confidence', 0))
        user_ip = request.remote_addr
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Real-time Metrics derived strictly from input
        risk_score = "High" if confidence < 0.7 else "Low"
        
        # Log to CSV (Simplified Schema: Timestamp, Gesture, Confidence, IP, Risk)
        with open(LOG_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, gesture, confidence, user_ip, risk_score])
            
        print(f"📝 Logged: {gesture} ({confidence}) - Risk: {risk_score}")
        return jsonify({"status": "success", "message": "Prediction logged"})
    except Exception as e:
        print(f"❌ Error logging: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/sentence', methods=['POST'])
def get_sentence():
    try:
        data = request.json
        gestures = data.get('gestures', [])
        print(f"📨 Sentence Req: {gestures}")
        
        sentence = form_sentence_logic(gestures)
        print(f"✅ Generated: '{sentence}'")
        
        return jsonify({'sentence': sentence})
    except Exception as e:
        print(f"❌ Sentence Error: {e}")
        return jsonify({'sentence': 'Error processing request'}), 500

@app.route('/api/dashboard_data')
def get_dashboard_data():
    """
    Returns aggregated data for charts from the CSV log.
    Simulates data if CSV is empty for demo purposes.
    """
    try:
        if os.path.exists(LOG_FILE) and os.path.getsize(LOG_FILE) > 50:
            df = pd.read_csv(LOG_FILE)
        else:
            return jsonify({"status": "no_data"})

        # KPI 1: Total predictions
        total_predictions = len(df)
        
        # KPI 2: Most frequent gesture
        if not df.empty:
            top_gesture = df['Predicted_Gesture'].mode()[0]
        else:
            top_gesture = "N/A"

        # KPI 3: Avg Confidence
        avg_confidence = df['Confidence'].mean() if not df.empty else 0

        # Chart Data: Trends (Last 50)
        recent_trends = df.tail(50)[['Timestamp', 'Confidence']].to_dict(orient='records')
        
        # Chart Data: Gesture Distribution
        class_dist = df['Predicted_Gesture'].value_counts().head(5).to_dict()

        # Risk Analysis: High Risk items (Confidence < 0.7)
        # Check if Risk_Score exists, else derive
        if 'Risk_Score' in df.columns:
             high_risk_df = df[df['Risk_Score'] == 'High'].tail(15)
        else:
             high_risk_df = df[df['Confidence'] < 0.7].tail(15)
             
        high_risk_logs = high_risk_df[['Timestamp', 'Predicted_Gesture', 'Confidence']].to_dict(orient='records')

        return jsonify({
            "kpi": {
                "total": total_predictions,
                "top_gesture": top_gesture,
                "avg_confidence": round(avg_confidence, 2)
            },
            "charts": {
                "trends": recent_trends,
                "distribution": class_dist
            },
            "risk_list": high_risk_logs
        })
    except Exception as e:
        print(f"Dashboard Data Error: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/export_logs')
def export_logs():
    """Exports the prediction logs as CSV."""
    if os.path.exists(LOG_FILE):
        return send_file(LOG_FILE, as_attachment=True, download_name='prediction_logs.csv')
    return "No logs found", 404

if __name__ == '__main__':
    # Initialize with default admin if file exists (it should now)
    # Initialize with default admin if file exists (it should now)
    try:
        if os.path.exists(USER_FILE):
            df = pd.read_csv(USER_FILE)
            if 'admin' not in df['Username'].values:
                 with open(USER_FILE, 'a', newline='') as f:
                    csv.writer(f).writerow(['admin', 'admin'])
        else:
             with open(USER_FILE, 'a', newline='') as f:
                csv.writer(f).writerow(['admin', 'admin']) 
    except Exception as e:
        print(f"⚠️ Error checking admin user: {e}")
    
    print("🚀 Starting Business Dashboard Server...")
    print(f"📂 Logging to: {os.path.abspath(LOG_FILE)}")
    app.run(debug=True, port=5000)
