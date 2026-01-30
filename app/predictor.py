# app2/predictor.py
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pandas as pd
from pathlib import Path

class GesturePredictor:
    def __init__(self):
        # Paths relative to app2/
        self.MODEL_PATH = Path('..') / 'model_artifacts' / 'keypoint_classifier' / 'keypoint_classifier.tflite'
        self.LABEL_PATH = Path('..') / 'model_artifacts' / 'keypoint_classifier_label.csv'
        
        self.interpreter = None
        self.labels = {}
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True, 
            max_num_hands=1, 
            min_detection_confidence=0.5
        )
        
        self._load_model()
        self._load_labels()

    def _load_model(self):
        if not self.MODEL_PATH.exists():
            print(f"❌ Model not found at {self.MODEL_PATH}")
            return
            
        try:
            self.interpreter = tf.lite.Interpreter(model_path=str(self.MODEL_PATH))
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()[0]
            self.output_details = self.interpreter.get_output_details()[0]
            print("✅ TFLite Model Loaded")
        except Exception as e:
            print(f"❌ Error loading model: {e}")

    def _load_labels(self):
        if self.LABEL_PATH.exists():
            df = pd.read_csv(self.LABEL_PATH, header=None)
            self.labels = dict(zip(df[0], df[1]))
        else:
            self.labels = {i: f"Class_{i}" for i in range(22)}

    def preprocess_landmarks(self, landmarks, img_shape):
        h, w = img_shape[:2]
        pixel_landmarks = []
        for lm in landmarks:
            pixel_landmarks.append((int(lm.x * w), int(lm.y * h)))
            
        base_x, base_y = pixel_landmarks[0]
        
        vector = []
        for x, y in pixel_landmarks:
            vector.extend([x - base_x, y - base_y])
            
        max_val = max(abs(v) for v in vector) if vector else 1.0
        normalized = [v/max_val for v in vector]
        return np.array(normalized, dtype=np.float32).reshape(1, -1)

    def predict(self, image):
        """
        Input: cv2 image (BGR)
        Output: (label, confidence, feature_vector)
        """
        if self.interpreter is None:
            return "Model Error", 0.0, []

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            return "No Hand Detected", 0.0, []

        hand_landmarks = results.multi_hand_landmarks[0]
        input_vec = self.preprocess_landmarks(hand_landmarks.landmark, image.shape)
        
        # Inference
        self.interpreter.set_tensor(self.input_details['index'], input_vec)
        self.interpreter.invoke()
        output_data = self.interpreter.get_tensor(self.output_details['index'])[0]
        
        class_id = np.argmax(output_data)
        confidence = float(np.max(output_data))
        label = self.labels.get(class_id, "Unknown")
        
        return label, confidence, input_vec[0]
