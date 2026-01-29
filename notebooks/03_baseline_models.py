# 03_baseline_models.py
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

def train_baselines():
    print("="*60)
    print("🏗️  PHASE 4: BASELINE MODELS")
    print("="*60)
    
    # Load FE Data
    INPUT_FILE = Path('..') / 'notebooks_data' / 'train_fe.csv'
    if not INPUT_FILE.exists():
        print("❌ Data not found. Run perform_eda.py first.")
        return
        
    df = pd.read_csv(INPUT_FILE)
    X = df.iloc[:, 1:].values
    y = df.iloc[:, 0].values
    
    # Train/Test Split (Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"Data Split: Train={X_train.shape}, Test={X_test.shape}")
    
    # Define Models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "SVM (Linear)": SVC(kernel='linear'),
        "KNN (k=5)": KNeighborsClassifier(n_neighbors=5)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)
        results[name] = acc
        print(f"🎯 Accuracy: {acc:.4f}")
        
    print("\n🏆 Baseline Summary:")
    print(pd.Series(results).sort_values(ascending=False))
    
    # Save best baseline
    best_model_name = max(results, key=results.get)
    print(f"\n💾 Saving Scaler and Best Baseline ({best_model_name})...")
    
    MODEL_DIR = Path('..') / 'notebooks_data' / 'models' / 'baseline'
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(MODEL_DIR / 'scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
        
    # We save the results for comparison
    REPORTS_DIR = Path('..') / 'notebooks_data' / 'reports'
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    pd.DataFrame([results]).to_csv(REPORTS_DIR / 'baseline_results.csv', index=False)

if __name__ == "__main__":
    train_baselines()
