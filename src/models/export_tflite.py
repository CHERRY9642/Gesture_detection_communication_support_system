# src/export_tflite.py
# Run from: final year project-landmarks/src

import tensorflow as tf
import os
from pathlib import Path

def export_tflite_model():
    """Convert trained Keras model → optimized TFLite"""

    print("⚙️  PHASE 5: MODEL EXPORT (Keras → TFLite)")
    print("=" * 60)

    keras_model_path = Path("../..") / "model_artifacts" / "keypoint_classifier" / "keypoint_classifier.hdf5"
    tflite_model_path = Path("../..") / "model_artifacts" / "keypoint_classifier" / "keypoint_classifier.tflite"

    if not keras_model_path.exists():
        raise FileNotFoundError(f"❌ Keras model not found: {keras_model_path}")

    print(f"📂 Loading Keras model: {keras_model_path}")
    model = tf.keras.models.load_model(keras_model_path)

    # ✅ SAFETY: freeze model
    model.trainable = False

    # ✅ SAFETY: verify output classes
    output_units = model.output_shape[-1]
    if output_units != 22:
        raise ValueError(f"❌ Model output classes = {output_units}, expected 22")

    print("🔄 Converting to TFLite (float16 optimized)...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]

    tflite_model = converter.convert()

    tflite_model_path.parent.mkdir(parents=True, exist_ok=True)
    with open(tflite_model_path, "wb") as f:
        f.write(tflite_model)

    keras_size = os.path.getsize(keras_model_path) / 1024
    tflite_size = os.path.getsize(tflite_model_path) / 1024

    print(f"✅ TFLite model saved: {tflite_model_path}")
    print(f"📦 Keras size:  {keras_size:.1f} KB")
    print(f"📦 TFLite size: {tflite_size:.1f} KB ({tflite_size / keras_size * 100:.0f}% of original)")

    # --------------------------------------------------
    # Verify TFLite tensors
    # --------------------------------------------------
    print("\n🔍 Verifying TFLite input/output shapes...")
    interpreter = tf.lite.Interpreter(model_path=str(tflite_model_path))
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()[0]
    output_details = interpreter.get_output_details()[0]

    print(f"   Input tensor : shape={input_details['shape']}, dtype={input_details['dtype']}")
    print(f"   Output tensor: shape={output_details['shape']}, dtype={output_details['dtype']}")

    if output_details['shape'][-1] != 22:
        raise RuntimeError("❌ TFLite output mismatch: expected 22 classes")

    print("✅ TFLite model verified and ready for real-time use")

    return tflite_model_path


if __name__ == "__main__":
    export_tflite_model()
