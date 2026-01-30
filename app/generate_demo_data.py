import csv
import random
from datetime import datetime, timedelta
from faker import Faker
import os

fake = Faker()
LOG_FILE = r'd:\Final year project-landmarks\app2\data\prediction_logs.csv'

# Expanded Schema: 
# Timestamp, Gesture, Confidence, User_ID, Region, User_Type, Risk_Score, Lat, Lon

gestures = ["afraid", "agree", "become", "college", "doctor", "form", "from", "go", "good", "hello", "help", "pain", "skin", "small", "specific", "warn", "where", "work", "world", "you", "secondary", "today"]
regions = ["North America", "Europe", "Asia-Pacific", "South America"]
user_types = ["Patient", "Student", "Healthcare Pro", "Researcher"]

def generate_data(num_records=200):
    data = []
    end_time = datetime.now()
    start_time = end_time - timedelta(days=30)
    
    for _ in range(num_records):
        timestamp = fake.date_time_between(start_date=start_time, end_date=end_time).strftime("%Y-%m-%d %H:%M:%S")
        gesture = random.choice(gestures)
        
        # Simulate realistic confidence distributions
        if random.random() > 0.1:
            confidence = random.uniform(0.85, 1.0) # High confidence
            risk_score = "Low"
        else:
            confidence = random.uniform(0.4, 0.75) # Low confidence
            risk_score = "High" if confidence < 0.6 else "Medium"
            
        region = random.choice(regions)
        user_type = random.choice(user_types)
        
        # Rough lat/lon for regions
        if region == "North America": lat, lon = random.uniform(30, 50), random.uniform(-120, -70)
        elif region == "Europe": lat, lon = random.uniform(40, 60), random.uniform(0, 30)
        elif region == "Asia-Pacific": lat, lon = random.uniform(10, 40), random.uniform(70, 140)
        else: lat, lon = random.uniform(-30, 10), random.uniform(-70, -40)

        data.append([timestamp, gesture, round(confidence, 4), fake.ipv4(), region, user_type, risk_score, lat, lon])
        
    # Sort by time
    data.sort(key=lambda x: x[0])
    
    # Write to CSV
    with open(LOG_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Predicted_Gesture", "Confidence", "User_IP", "Region", "User_Type", "Risk_Score", "Lat", "Lon"])
        writer.writerows(data)
    
    print(f"Generated {num_records} rich log entries.")

if __name__ == "__main__":
    generate_data()
