# App2: Business Dashboard Documentation

## Overview
The `app2` folder contains a complete Business Intelligence Dashboard for Sign Language Recognition. It transforms the raw ML model into a user-facing product with Analytics, Security, and Reporting.

## File Structure & Connections

### 1. Backend (`server.py`)
-   **Role**: The Brain. It runs a Flask web server.
-   **Connections**:
    -   Serves `templates/dashboard.html` to the browser.
    -   Serves static assets (CSS, JS) and Model Artifacts (`.tflite`, `.csv`).
    -   **API Endpoints**:
        -   `/api/login` & `/api/signup`: Manages `users.csv`.
        -   `/api/log_prediction`: Receives real-time predictions from the frontend and saves them to `reports/prediction_logs.csv`.
        -   `/api/dashboard_data`: Reads the CSV log and returns aggregated JSON for charts.

### 2. Frontend (`templates/dashboard.html`)
-   **Role**: The UI. Single Page Application (SPA) design.
-   **Connections**:
    -   Loads `style.css` for the "Glassmorphism" look.
    -   Loads `model.js` for ML inference.
    -   Loads `charts.js` for graphs.
    -   Contains the "Login/Signup Overlay" and the main "Dashboard" with Tabs.

### 3. ML Logic (`static/js/model.js`)
-   **Role**: The Eye. Handles Webcam & AI.
-   **Connections**:
    -   Uses **MediaPipe** (CDN) to extract hand landmarks.
    -   Uses **TensorFlow.js (TFLite)** to run your `keypoint_classifier.tflite` model directly in the browser.
    -   **Critical Flow**:
        1.  Webcam Frame -> MediaPipe -> Landmarks (x,y)
        2.  Landmarks -> Preprocessing (Relative coords, Normalization)
        3.  Normalized Vector -> TFLite Model -> Prediction (Class ID)
        4.  Prediction -> POST to `/api/log_prediction`.

### 4. Intelligence (`static/js/charts.js`)
-   **Role**: The Analyst. Visualizes data.
-   **Connections**:
    -   Fetches data from `/api/dashboard_data`.
    -   Uses **Chart.js** to render Trends and Pie charts.
    -   Uses **Leaflet.js** used for the Geographic Map.
    -   Auto-refreshes every 5 seconds to show live updates.

## User Flow
1.  **Start**: User runs `python server.py`.
2.  **Login**: Browser opens. User sees Login/Signup screen.
    -   *New Feature*: Users can Sign Up (saved to `users.csv`).
3.  **Live Tab**: User sees their webcam. The system predicts gestures in real-time.
    -   Low confidence (<70%) triggers a "High Risk" alert.
4.  **Analytics Tab**: User sees KPIs, Usage Trends, and Class Distribution.
    -   Includes a Map showing user activity locations (simulated).
5.  **Logs Tab**: User can download the full prediction history as CSV.

## How to Run
Simply execute:
```bash
python server.py
```
Then open the displayed URL (usually `http://127.0.0.1:5000`).
