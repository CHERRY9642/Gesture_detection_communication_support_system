# 04_advanced_models.py
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler

def train_advanced():
    print("="*60)
    print("🚀 PHASE 5: ADVANCED MODELS (ENSEMBLE)")
    print("="*60)
    
    # Load Data
    INPUT_FILE = Path('..') / 'notebooks_data' / 'train_fe.csv'
    df = pd.read_csv(INPUT_FILE)
    X = df.iloc[:, 1:].values
    y = df.iloc[:, 0].values
    
    # Scale (Trees don't strictly need it but good for consistency)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "Gradient Boosting (Hist)": HistGradientBoostingClassifier(max_iter=100, random_state=42)
    }
    
    results = {}
    
    kf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    
    for name, model in models.items():
        print(f"\nqyTraining {name} with 3-Fold CV...")
        scores = cross_val_score(model, X_scaled, y, cv=kf, scoring='accuracy')
        mean_acc = scores.mean()
        results[name] = mean_acc
        print(f"🎯 Mean Accuracy: {mean_acc:.4f} (+/- {scores.std()*2:.4f})")
        
    # Save Results
    pd.DataFrame([results]).to_csv(Path('..') /'notebooks_data'/ 'reports' / 'advanced_results.csv', index=False)
    print("\n✅ Advanced modeling complete.")

if __name__ == "__main__":
    train_advanced()
