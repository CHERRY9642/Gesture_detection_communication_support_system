# 09_model_interpretation.py
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import tensorflow as tf
import os
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class ModelInterpreter:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True, 
            max_num_hands=1, 
            min_detection_confidence=0.5
        )
        self.load_resources()

    def load_resources(self):
        # Paths
        self.model_path = Path('..') / 'model_artifacts' / 'keypoint_classifier' / 'keypoint_classifier.hdf5'
        self.label_path = Path('..') / 'model_artifacts' / 'keypoint_classifier_label.csv'
        
        # Load Model
        if self.model_path.exists():
            print(f"Loading model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            self.model_available = True
        else:
            print("❌ Model not found! Using dummy prediction for demonstration.")
            self.model_available = False

        # Load Labels
        if self.label_path.exists():
            self.labels = pd.read_csv(self.label_path, header=None, index_col=0)[1].to_dict()
        else:
            # Fallback labels
            self.labels = {i: f"Class_{i}" for i in range(22)}

    def preprocess_landmarks(self, landmarks, img_shape):
        # Same preprocessing as training
        h, w = img_shape[:2]
        pixel_landmarks = []
        for lm in landmarks:
            pixel_landmarks.append((int(lm.x * w), int(lm.y * h)))
            
        base_x, base_y = pixel_landmarks[0]
        
        # Normalize to wrist
        vector = []
        for x, y in pixel_landmarks:
            vector.extend([x - base_x, y - base_y])
            
        # Max scaling
        max_val = max(abs(v) for v in vector) if vector else 1.0
        normalized = [v/max_val for v in vector]
        return np.array(normalized, dtype=np.float32).reshape(1, -1)

    def select_image(self):
        dataset_dir = Path('..') / 'dataset'
        if not dataset_dir.exists():
            print("❌ Dataset directory not found.")
            return None

        # 1. Select Class
        classes = [d.name for d in dataset_dir.iterdir() if d.is_dir()]
        print("\n📂 Available Classes:")
        for idx, cls in enumerate(classes):
            print(f"{idx}. {cls}")
            
        try:
            cls_idx = int(input("\n👉 Enter Class ID to explore: "))
            selected_class = classes[cls_idx]
        except (ValueError, IndexError):
            print("Invalid input.")
            return None
            
        # 2. Select Image
        class_dir = dataset_dir / selected_class
        # Look for User folders
        user_folders = list(class_dir.glob("User_*"))
        if not user_folders:
            print("No User directories found.")
            return None
            
        # Just pick first user for simplicity or ask
        img_files = list(user_folders[0].glob("*.jpg"))
        if not img_files:
            print("No images found for this user.")
            return None
            
        print(f"\n🖼️  Found {len(img_files)} images in {selected_class}/{user_folders[0].name}")
        print("Select an image index (0-9 for example):")
        for i, img in enumerate(img_files[:10]):
            print(f"{i}: {img.name}")
            
        try:
            img_idx = int(input("\n👉 Enter Image Index: "))
            return str(img_files[img_idx]), selected_class
        except (ValueError, IndexError):
            print("Invalid input.")
            return None

    def interpret_prediction(self, img_path, true_label):
        print(f"\n🔮 Analyzing Image: {img_path}")
        image = cv2.imread(img_path)
        if image is None: 
            print("Error loading image.")
            return

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            print("❌ No hand detected in image.")
            return

        landmarks = results.multi_hand_landmarks[0].landmark
        input_vector = self.preprocess_landmarks(landmarks, image.shape)
        
        # Prediction
        if self.model_available:
            pred_probs = self.model.predict(input_vector, verbose=0)
            pred_idx = np.argmax(pred_probs)
            confidence = np.max(pred_probs)
            pred_label = self.labels.get(pred_idx, "Unknown")
        else:
            pred_idx = -1
            pred_label = "Simulated"
            confidence = 0.99

        print("\n📝 RESULTS:")
        print(f"True Label:      {true_label}")
        print(f"Predicted Label: {pred_label}")
        print(f"Confidence:      {confidence*100:.2f}%")
        
        # Display Input Features (first 10)
        print("\n🔢 Input Features (First 10 normalized):")
        print(input_vector[0][:10])
        
        # Confusion Matrix (Simulated for single instance context)
        print("\n📊 Interpretation:")
        if true_label.lower() in pred_label.lower():
            print("✅ CORRECT PREDICTION")
        else:
            print("❌ MISCLASSIFICATION")
            
        print(f"Description: The model identified '{pred_label}' based on the spatial configuration of {len(landmarks)} landmarks.")

def main():
    print("="*60)
    print("🧠 PHASE 9: MODEL INTERPRETATION (Interactive)")
    print("="*60)
    
    interpreter = ModelInterpreter()
    
    selection = interpreter.select_image()
    if selection:
        img_path, true_label = selection
        interpreter.interpret_prediction(img_path, true_label)
    else:
        print("Aborted.")

if __name__ == "__main__":
    main()
