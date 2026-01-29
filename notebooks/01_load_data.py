# 01_load_data.py
import pandas as pd
import numpy as np
import os
from pathlib import Path

def load_data():
    """
    Loads the raw dataset from model_artifacts.
    """
    print("="*60)
    print("📂 PHASE 1: DATA LOADING")
    print("="*60)
    
    # Path to the dataset (adjust based on project structure)
    # notebooks/ is current dir, so go up one level
    DATA_PATH = Path('..') / 'model_artifacts' / 'keypoint.csv'
    
    if not DATA_PATH.exists():
        print(f"❌ Error: Dataset not found at {DATA_PATH}")
        return None
    
    print(f"Reading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    print("\n📊 DATA SUMMARY:")
    print(f"- Total Samples: {df.shape[0]}")
    print(f"- Total Features: {df.shape[1] - 1}") # Minus class label
    print(f"- Class Column: '{df.columns[0]}'")
    
    print("\n📋 First 5 Rows:")
    print(df.head())
    
    print("\n✅ Data Loaded Successfully.")
    return df

if __name__ == "__main__":
    df = load_data()
    # Save a raw checkpoint for the next step if needed, or just demonstrate loading
    if df is not None:
        OUTPUT_DIR = Path('..') / 'notebooks_data'
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(OUTPUT_DIR / 'train_raw.csv', index=False)
        print(f"\n💾 Saved raw copy to {OUTPUT_DIR / 'train_raw.csv'}")
