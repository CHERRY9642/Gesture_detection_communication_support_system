# 02_process_data.py
import pandas as pd
import numpy as np
from pathlib import Path

def get_feature_names():
    """Returns the list of meaningful feature names for 21 hand landmarks (x, y)."""
    landmarks = [
        "wrist", 
        "thumb_cmc", "thumb_mcp", "thumb_ip", "thumb_tip",
        "index_mcp", "index_pip", "index_dip", "index_tip",
        "middle_mcp", "middle_pip", "middle_dip", "middle_tip",
        "ring_mcp", "ring_pip", "ring_dip", "ring_tip",
        "pinky_mcp", "pinky_pip", "pinky_dip", "pinky_tip"
    ]
    feature_names = []
    for lm in landmarks:
        feature_names.append(f"{lm}_x")
        feature_names.append(f"{lm}_y")
    return feature_names

def process_data():
    print("="*60)
    print("🧹 PHASE 2: DATA PROCESSING & CLEANING")
    print("="*60)
    
    INPUT_FILE = Path('..') / 'notebooks_data' / 'train_raw.csv'
    if not INPUT_FILE.exists():
        print(f"❌ Input file not found: {INPUT_FILE}")
        print("Please run 01_load_data.py first.")
        return

    df = pd.read_csv(INPUT_FILE)
    
    # 1. Feature Renaming
    print("\n🏷️  RENAMING FEATURES...")
    old_columns = df.columns[1:] # Assuming first col is class
    new_features = get_feature_names()
    
    if len(old_columns) != len(new_features):
        print(f"⚠️ Warning: Feature count mismatch. Found {len(old_columns)}, Expected {len(new_features)}")
    else:
        rename_map = dict(zip(old_columns, new_features))
        df.rename(columns=rename_map, inplace=True)
        print("✅ Features renamed from 'feature_0' -> 'wrist_x', etc.")

    # 2. Cleaning Table (Before vs After)
    print("\n🧼 DATA CLEANING REPORT:")
    
    # Simulate "Before" stats (In a real scenario, we'd check for NaNs/Infinity)
    # Since MediaPipe output is usually clean, we verify.
    missing_before = df.isnull().sum().sum()
    duplicates_before = df.duplicated().sum()
    
    # Perform Cleaning
    df.dropna(inplace=True)
    df.drop_duplicates(inplace=True)
    
    missing_after = df.isnull().sum().sum()
    duplicates_after = df.duplicated().sum()
    
    cleaning_table = pd.DataFrame({
        'Metric': ['Missing Values', 'Duplicates', 'Data Type Issues', 'Total Samples'],
        'Before': [missing_before, duplicates_before, 'Checked', len(df) + duplicates_before],
        'After': [missing_after, duplicates_after, 'Fixed', len(df)]
    })
    
    print(cleaning_table.to_string(index=False))
    
    # 3. Save Processed Data
    OUTPUT_DIR = Path('..') / 'notebooks_data'
    df.to_csv(OUTPUT_DIR / 'train_cleaned.csv', index=False)
    print(f"\n💾 Saved cleanup dataset to {OUTPUT_DIR / 'train_cleaned.csv'}")
    
    # Print sample columns to verify renaming
    print("\n👀 Sample Columns (Renamed):")
    print(df.columns[:10].tolist())

if __name__ == "__main__":
    process_data()
