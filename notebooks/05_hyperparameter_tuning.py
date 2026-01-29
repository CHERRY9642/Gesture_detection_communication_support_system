# 05_hyperparameter_tuning.py
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import StandardScaler

def tune_hyperparameters():
    print("="*60)
    print("🎛️  PHASE 6: HYPERPARAMETER TUNING (Random Forest)")
    print("="*60)
    
    INPUT_FILE = Path('..') / 'notebooks_data' / 'train_fe.csv'
    df = pd.read_csv(INPUT_FILE)
    X = df.iloc[:, 1:].values
    y = df.iloc[:, 0].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    
    # Parameter Grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5]
    }
    
    rf = RandomForestClassifier(random_state=42)
    
    print("Starting GridSearchCV...")
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, 
                               cv=3, n_jobs=-1, verbose=2)
    
    grid_search.fit(X_train, y_train)
    
    print(f"\n✅ Best Parameters: {grid_search.best_params_}")
    print(f"🎯 Best Cross-Val Score: {grid_search.best_score_:.4f}")
    
    # Save Best Model
    best_rf = grid_search.best_estimator_
    MODEL_DIR = Path('..')/'notebooks_data' / 'models' / 'tuned'
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_rf, MODEL_DIR / 'rf_tuned.pkl')
    print(f"💾 Saved tuned model to {MODEL_DIR / 'rf_tuned.pkl'}")

if __name__ == "__main__":
    tune_hyperparameters()
