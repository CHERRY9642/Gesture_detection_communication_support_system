import csv
import random
import time
from datetime import datetime, timedelta

# Configuration
LOG_FILE = r'd:\Final year project-landmarks\app2\data\prediction_logs.csv'
NUM_RECORDS = 300

# Demo Data Pools
gestures = ["afraid", "agree", "become", "college", "doctor", "form", "from", "go", "good", "hello", "help", "pain", "skin", "small", "specific", "warn", "where", "work", "world", "you"]
user_types = ["Individual", "Doctor", "Student", "Researcher", "Enterprise"]
regions = ["US-East", "US-West", "EU-Central", "Asia-Pacific", "SA-North"]
risk_levels = ["Low", "Medium", "High"]

def get_random_date():
    end = datetime.now()
    start = end - timedelta(days=60)
    random_date = start + (end - start) * random.random()
    return random_date.strftime("%Y-%m-%d %H:%M:%S")

def generate_ip():
    return f"{random.randint(10,200)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def generate_csv():
    print(f"🚀 Generating {NUM_RECORDS} rich log entries for Analytics Demo...")
    
    headers = ["Timestamp", "Predicted_Gesture", "Confidence", "User_IP", "User_Type", "Region", "Risk_Score", "Lat", "Lon"]
    
    data = []
    
    for _ in range(NUM_RECORDS):
        timestamp = get_random_date()
        gesture = random.choice(gestures)
        user_type = random.choice(user_types)
        region = random.choice(regions)
        
        # Simulate business logic: 'pain' or 'doctor' might be higher urgency/risk if low confidence
        if random.random() > 0.15:
            # Good prediction
            conf = random.uniform(0.80, 0.99)
            risk = "Low"
        else:
            # Bad prediction (Risk)
            conf = random.uniform(0.40, 0.75)
            risk = "High" if conf < 0.6 else "Medium"
        
        # Geo simulation
        if region == "US-East": lat, lon = 40.7128, -74.0060
        elif region == "US-West": lat, lon = 34.0522, -118.2437
        elif region == "EU-Central": lat, lon = 52.5200, 13.4050
        elif region == "Asia-Pacific": lat, lon = 35.6762, 139.6503
        else: lat, lon = -23.5505, -46.6333
        
        # Add slight jitter to lat/lon so they aren't all on top of each other
        lat += random.uniform(-2, 2)
        lon += random.uniform(-2, 2)

        row = [timestamp, gesture, round(conf, 4), generate_ip(), user_type, region, risk, round(lat, 4), round(lon, 4)]
        data.append(row)

    # Sort by timestamp
    data.sort(key=lambda x: x[0])

    # Write
    try:
        with open(LOG_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)
        print(f"✅ Successfully wrote to {LOG_FILE}")
    except Exception as e:
        print(f"❌ Error writing CSV: {e}")

if __name__ == "__main__":
    generate_csv()
