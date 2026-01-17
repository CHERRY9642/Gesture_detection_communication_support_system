# src/validate_tflite.py
# Can be run from the project root directory

import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path


def validate_tflite_model():
    """Compare Keras vs TFLite predictions on the same test subset."""

    print("🔬 PHASE 5: TFLITE VALIDATION")
    print("=" * 60)

    # Load dataset
    data_path = Path(__file__).parent.parent.parent / "keypoint_classifier" / "keypoint.csv"
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    df = pd.read_csv(data_path)
    X = df.iloc[:, 1:].values
    y = df.iloc[:, 0].values

    # Use a fixed subset for validation (e.g., 15% of all data)
    test_size = int(len(X) * 0.15)
    np.random.seed(42)
    indices = np.random.choice(len(X), test_size, replace=False)
    X_test = X[indices].astype(np.float32)
    y_test = y[indices]

    print(f"📊 Test subset: {X_test.shape[0]:,} samples")

    # Paths
    keras_model_path = Path(__file__).parent.parent.parent / "model_artifacts" / "keypoint_classifier" / "keypoint_classifier.hdf5"
    tflite_model_path = Path(__file__).parent.parent.parent / "model_artifacts" / "keypoint_classifier" / "keypoint_classifier.tflite"

    # Load models
    keras_model = tf.keras.models.load_model(keras_model_path)
    interpreter = tf.lite.Interpreter(model_path=str(tflite_model_path))
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()[0]
    output_details = interpreter.get_output_details()[0]

    # Keras predictions
    print("\n🔮 Predicting with Keras model...")
    y_keras_probs = keras_model.predict(X_test, verbose=0)
    y_keras = np.argmax(y_keras_probs, axis=1)

    # TFLite predictions
    print("🔮 Predicting with TFLite model...")
    y_tflite = []
    for i in range(len(X_test)):
        sample = X_test[i:i+1].astype(np.float32)
        interpreter.set_tensor(input_details['index'], sample)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details['index'])
        y_tflite.append(np.argmax(output_data))
    y_tflite = np.array(y_tflite)

    # Accuracy comparison
    keras_acc = accuracy_score(y_test, y_keras)
    tflite_acc = accuracy_score(y_test, y_tflite)

    print(f"\n🎯 Keras accuracy:  {keras_acc:.3f} ({keras_acc*100:.1f}%)")
    print(f"🎯 TFLite accuracy: {tflite_acc:.3f} ({tflite_acc*100:.1f}%)")
    print(f"📉 Accuracy drop:   {(keras_acc - tflite_acc)*100:.2f}%")

    # Classification report (TFLite) - UPDATED FOR 20 CLASSES
    class_names = [
        'afraid', 'agree', 'assistance', 'bad', 'become', 'college', 'doctor', 'from',
        'pain', 'pray', 'secondary', 'skin', 'small', 'specific', 'stand', 'today',
        'warn', 'which', 'work', 'you'
    ]
    print("\n📋 TFLite Classification Report:")
    print(classification_report(y_test, y_tflite, target_names=class_names))

    # Plot comparison
    plt.figure(figsize=(8, 4))
    plt.bar(['Keras', 'TFLite'], [keras_acc, tflite_acc], color=['steelblue', 'orange'])
    plt.ylim(0, 1)
    plt.ylabel("Accuracy")
    plt.title("Keras vs TFLite Accuracy")
    for i, acc in enumerate([keras_acc, tflite_acc]):
        plt.text(i, acc + 0.01, f"{acc*100:.1f}%", ha='center')
    out_path = Path(__file__).parent.parent.parent / "presentation" / "tflite_comparison.png"
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"\n📸 Saved accuracy comparison plot to: {out_path}")
    print("✅ TFLite validation complete.")

    return keras_acc, tflite_acc


if __name__ == "__main__":
    validate_tflite_model()
