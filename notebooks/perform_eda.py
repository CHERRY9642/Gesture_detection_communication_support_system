# perform_eda.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

def generate_new_features(df):
    """
    Engineers 3-5 new features:
    1. aspect_ratio: height / width of the hand
    2. spread: distance between thumb tip and pinky tip
    3. thumb_index_dist: distance between thumb tip and index tip
    """
    print("\n🛠️  ENGINEERING NEW FEATURES...")
    
    # Calculate bounding box
    x_cols = [c for c in df.columns if '_x' in c]
    y_cols = [c for c in df.columns if '_y' in c]
    
    min_x = df[x_cols].min(axis=1)
    max_x = df[x_cols].max(axis=1)
    min_y = df[y_cols].min(axis=1)
    max_y = df[y_cols].max(axis=1)
    
    width = max_x - min_x
    height = max_y - min_y
    
    # 1. Aspect Ratio (avoid div by zero)
    df['aspect_ratio'] = height / (width + 1e-6)
    
    # 2. Spread (Thumb Tip to Pinky Tip)
    # columns: thumb_tip_x, thumb_tip_y, pinky_tip_x, pinky_tip_y
    df['spread'] = np.sqrt(
        (df['thumb_tip_x'] - df['pinky_tip_x'])**2 + 
        (df['thumb_tip_y'] - df['pinky_tip_y'])**2
    )
    
    # 3. Thumb-Index Distance (Pinch feature)
    df['thumb_index_dist'] = np.sqrt(
        (df['thumb_tip_x'] - df['index_tip_x'])**2 + 
        (df['thumb_tip_y'] - df['index_tip_y'])**2
    )
    
    print("✅ Created features: 'aspect_ratio', 'spread', 'thumb_index_dist'")
    return df

def perform_eda():
    print("="*60)
    print("📊 PHASE 3: EXPLORATORY DATA ANALYSIS (EDA)")
    print("="*60)

    INPUT_FILE = Path('..') / 'notebooks_data' / 'train_cleaned.csv'
    if not INPUT_FILE.exists():
        print(f"❌ Input not found: {INPUT_FILE}")
        return

    df = pd.read_csv(INPUT_FILE)
    
    # 1. Statistical Summary
    print("\n📈 Statistical Summary (Desc):")
    print(df.describe().T.head(10)) # First 10 features
    
    # 2. Class Distribution
    print("\n⚖️  Class Distribution:")
    class_dist = df.iloc[:, 0].value_counts()
    print(class_dist)
    
    # 3. Feature Engineering
    df = generate_new_features(df)
    
    # 4. Correlation Analysis
    print("\n🔗 Correlation Analysis (New Features):")
    corr = df[['aspect_ratio', 'spread', 'thumb_index_dist', 'class']].corr()
    print(corr)
    
    # 5. Save Feature Engineered Dataset
    OUTPUT_FILE = Path('..') / 'notebooks_data' / 'train_fe.csv'
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n💾 Saved FE dataset to {OUTPUT_FILE}")
    
    # 6. Save Plots
    REPORT_DIR = Path('..') / 'notebooks_data' / 'reports'
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    plt.figure(figsize=(10, 6))
    sns.countplot(x=df.columns[0], data=df)
    plt.title('Class Distribution')
    plt.savefig(REPORT_DIR / 'class_distribution.png')
    print(f"📸 Saved plot to {REPORT_DIR / 'class_distribution.png'}")

if __name__ == "__main__":
    perform_eda()
