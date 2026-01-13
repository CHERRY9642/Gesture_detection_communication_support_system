import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import tensorflow as tf
from pathlib import Path

# ---------- CONFIG ----------
CLASS_LABELS_CSV = Path(__file__).parent.parent.parent / "model_artifacts" / "keypoint_classifier_label.csv"
TFLITE_MODEL_PATH = Path(__file__).parent.parent.parent / "model_artifacts" / "keypoint_classifier" / "keypoint_classifier.tflite"
# ----------------------------


def load_labels(csv_path):
    df = pd.read_csv(csv_path, header=None, names=["id", "label"])
    id_to_label = dict(zip(df["id"], df["label"]))
    return id_to_label


def preprocess_landmarks(landmarks, img_shape):
    """Same preprocessing as in extract_landmarks.py"""
    h, w = img_shape[:2]
    pixel_landmarks = []
    for lm in landmarks:
        x_pixel = int(lm.x * w)
        y_pixel = int(lm.y * h)
        pixel_landmarks.append((x_pixel, y_pixel))

    base_x, base_y = pixel_landmarks[0]
    relative_landmarks = []
    for x, y in pixel_landmarks:
        relative_landmarks.append((x - base_x, y - base_y))

    vector = []
    for x_rel, y_rel in relative_landmarks:
        vector.extend([x_rel, y_rel])

    max_val = max(abs(v) for v in vector) if vector and max(abs(v) for v in vector) > 0 else 1.0
    normalized = [v / max_val for v in vector]

    return np.array(normalized, dtype=np.float32)


def main():
    # Load labels
    labels = load_labels(CLASS_LABELS_CSV)

    # Load TFLite model
    interpreter = tf.lite.Interpreter(model_path=str(TFLITE_MODEL_PATH))
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()[0]
    output_details = interpreter.get_output_details()[0]

    # MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
    )
    mp_draw = mp.solutions.drawing_utils

    # OpenCV webcam
    cap = cv2.VideoCapture(0)  # change index if you have multiple cameras

    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return

    print("🎥 Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)  # mirror view
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = hands.process(img_rgb)

        gesture_text = "No hand"
        conf_text = ""

        if results.multi_hand_landmarks:
            # Use first detected hand
            hand_landmarks = results.multi_hand_landmarks[0]

            # Draw landmarks
            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                mp_draw.DrawingSpec(color=(0, 0, 255), thickness=2),
            )

            # Preprocess landmarks
            vec = preprocess_landmarks(hand_landmarks.landmark, frame.shape)  # (42,)

            # Run TFLite inference
            input_data = np.expand_dims(vec, axis=0).astype(np.float32)  # (1, 42)
            interpreter.set_tensor(input_details["index"], input_data)
            interpreter.invoke()
            output_data = interpreter.get_tensor(output_details["index"])[0]  # (8,)

            class_id = int(np.argmax(output_data))
            confidence = float(np.max(output_data))

            gesture_text = labels.get(class_id, f"class_{class_id}")
            conf_text = f"{confidence*100:.1f}%"

        # Overlay text
        cv2.putText(frame, f"Gesture: {gesture_text}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        if conf_text:
            cv2.putText(frame, f"Conf: {conf_text}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        cv2.imshow("Sign Gesture Recognition", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
