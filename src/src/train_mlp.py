# src/train_mlp.py
# Run from: final year project-landmarks/src

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import tensorflow as tf
import os
from pathlib import Path

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)


def train_mlp_classifier():
    """Train MLP classifier on landmark dataset"""

    print("🧠 PHASE 4: MLP MODEL TRAINING")
    print("=" * 70)

    # ------------------------------------------------------------------
    # Step 1: Load dataset  (from ../keypoint_classifier/keypoint.csv)
    # ------------------------------------------------------------------
    print("\n📂 Loading dataset...")
    data_path = Path("..") / "keypoint_classifier" / "keypoint.csv"
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    df = pd.read_csv(data_path)

    print(f"📊 Dataset shape: {df.shape}")
    print("📈 Class distribution:")
    print(df['class'].value_counts().sort_index())

    # Features and labels
    X = df.iloc[:, 1:].values  # 42 features
    y = df.iloc[:, 0].values   # class_ids (0-19)

    num_classes = 20
    y_cat = to_categorical(y, num_classes)

    print(f"✅ X shape: {X.shape}, y shape: {y_cat.shape}")

    # ------------------------------------------------------------------
    # Step 2: Train/Val/Test split (70 / 15 / 15)
    # ------------------------------------------------------------------
    print("\n🔀 Splitting dataset...")
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y_cat, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=0.1765, random_state=42,
        stratify=y_temp.argmax(axis=1)
    )  # 0.1765 * 0.85 ≈ 0.15

    print(f"Train: {X_train.shape[0]:,} samples ({X_train.shape[0] / len(X) * 100:.1f}%)")
    print(f"Val:   {X_val.shape[0]:,} samples ({X_val.shape[0] / len(X) * 100:.1f}%)")
    print(f"Test:  {X_test.shape[0]:,} samples ({X_test.shape[0] / len(X) * 100:.1f}%)")

    # ------------------------------------------------------------------
    # Step 3: Build MLP model
    # ------------------------------------------------------------------
    print("\n🏗️  Building MLP model...")
    model = Sequential([
        Dense(128, activation='relu', input_shape=(42,)),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(num_classes, activation='softmax')  # 16 classes
    ])

    model.summary()

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=20, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=10, min_lr=1e-7)
    ]

    # ------------------------------------------------------------------
    # Step 4: Train
    # ------------------------------------------------------------------
    print("\n🚀 Starting training (up to 150 epochs)...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=150,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )

    # ------------------------------------------------------------------
    # Step 5: Evaluate on test set
    # ------------------------------------------------------------------
    print("\n📊 Final evaluation on test set...")
    test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"🎯 Test Accuracy: {test_accuracy:.3f} ({test_accuracy * 100:.1f}%)")

    y_pred = model.predict(X_test, verbose=0)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_test_classes = np.argmax(y_test, axis=1)

    class_names = ['afraid','agree','assistance','bad','become','college','doctor','from','pain','pray','secondary','skin','small','specific','stand','today','warn','which','work','you']

    print("\n📋 CLASSIFICATION REPORT:")
    print(classification_report(y_test_classes, y_pred_classes, target_names=class_names))

    # ------------------------------------------------------------------
    # Step 6: Plots (saved inside src/)
    # ------------------------------------------------------------------
    plots_dir = Path(".")
    # Accuracy / loss curves
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True)

    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    acc_loss_path = plots_dir / "training_history.png"
    plt.savefig(acc_loss_path, dpi=300, bbox_inches='tight')
    plt.close()

    # Confusion matrix
    plt.figure(figsize=(8, 6))
    cm = confusion_matrix(y_test_classes, y_pred_classes)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix (Test Set)')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.xticks(rotation=45)
    plt.yticks(rotation=0)

    cm_path = plots_dir / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    plt.close()

    # ------------------------------------------------------------------
    # Step 7: Save model
    # ------------------------------------------------------------------
    print("\n💾 Saving model...")
    model_path = Path("..") / "keypoint_classifier" / "models" / "keypoint_classifier" / "keypoint_classifier.hdf5"
    model_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(model_path)

    model_size_kb = os.path.getsize(model_path) / 1024
    print(f"✅ Model saved: {model_path}")
    print(f"📦 Model size: {model_size_kb:.1f} KB")

    print("\n" + "=" * 70)
    print("🎉 PHASE 4 COMPLETE!")
    print(f"✅ Test Accuracy: {test_accuracy:.3f}")
    print(f"✅ Plots saved: {acc_loss_path}, {cm_path}")
    print("✅ Model ready for PHASE 5 (TFLite export)")

    return model, history, test_accuracy


if __name__ == "__main__":
    train_mlp_classifier()
