# app2/data_simulator.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_mock_logs(n_samples=500):
    """
    Generates synthetic prediction logs for dashboard visualization.
    """
    np.random.seed(42)
    
    # Date range: Last 30 days
    end_date = datetime.now()
    dates = [end_date - timedelta(days=x) for x in range(30)]
    
    data = []
    classes = ['afraid', 'agree', 'assistance', 'bad', 'become', 'college', 'doctor']
    users = ['User_01', 'User_02', 'User_03', 'User_Guest']
    
    for _ in range(n_samples):
        date = np.random.choice(dates)
        # Add random time
        time_offset = np.random.randint(0, 86400)
        timestamp = date + timedelta(seconds=time_offset)
        
        pred_class = np.random.choice(classes)
        confidence = np.random.beta(5, 1) # Skewed towards 1.0
        user = np.random.choice(users)
        
        # High Risk: Low confidence
        risk = "High" if confidence < 0.75 else "Low"
        
        # Location (Simulate US/World coords roughly or just random lat/lon)
        lat = 37.77 + np.random.normal(0, 5)
        lon = -122.41 + np.random.normal(0, 5)
        
        data.append({
            "Timestamp": timestamp,
            "User": user,
            "Predicted_Gesture": pred_class,
            "Confidence": round(confidence, 4),
            "Risk_Status": risk,
            "Latitude": lat,
            "Longitude": lon
        })
        
    df = pd.DataFrame(data)
    df.sort_values(by="Timestamp", inplace=True)
    return df

def forecast_usage(df):
    """
    Simple linear forecast for the next 7 days based on daily counts.
    """
    daily_counts = df.set_index('Timestamp').resample('D').size().reset_index(name='Count')
    
    # Last 7 days trend
    last_7 = daily_counts.tail(7)
    avg_growth = last_7['Count'].pct_change().mean()
    
    last_val = last_7['Count'].iloc[-1]
    last_date = last_7['Timestamp'].iloc[-1]
    
    forecast = []
    for i in range(1, 8):
        next_val = last_val * ((1 + avg_growth) ** i)
        next_date = last_date + timedelta(days=i)
        forecast.append({"Timestamp": next_date, "Predicted_Count": int(next_val)})
        
    return pd.DataFrame(forecast)
