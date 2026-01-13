# notebooks/extract_landmarks.py  (run from notebooks/)

import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import os
from pathlib import Path
from tqdm import tqdm   
import warnings

warnings.filterwarnings('ignore')


class LandmarkExtractor:
    def __init__(self):
        # Requires mediapipe to be correctly installed/imported
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.7
        )
        self.mp_draw = mp.solutions.drawing_utils

    def preprocess_landmarks(self, landmarks, img_shape):
        """Convert 21 landmarks to 42‑dim normalized vector"""
        if not landmarks:
            return None

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

        return normalized

    def extract_from_folder(self, folder_path, class_id, output_csv):
        """Extract landmarks from all images in ../dataset/<class>/User_*"""
        folder = Path(folder_path)
        all_samples = []

        user_folders = sorted(folder.glob("User_*"))
        print(f"\n📁 Processing class '{folder.name}' (ID: {class_id})...")
        if not user_folders:
            print(f"❌ No User_* folders found in {folder}")
            return 0

        for user_folder in tqdm(user_folders, desc="Users"):
            user_samples = []
            img_files = list(user_folder.glob("*.jpg")) + list(user_folder.glob("*.png"))

            for img_file in tqdm(img_files, desc=f"{user_folder.name}", leave=False):
                try:
                    image = cv2.imread(str(img_file))
                    if image is None:
                        continue

                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    results = self.hands.process(image_rgb)

                    if results.multi_hand_landmarks and results.multi_hand_landmarks[0]:
                        landmarks = results.multi_hand_landmarks[0].landmark
                        vector = self.preprocess_landmarks(landmarks, image.shape)

                        if vector is not None:
                            user_samples.append([class_id] + vector)

                except Exception as e:
                    print(f"Error processing {img_file}: {e}")
                    continue

            all_samples.extend(user_samples)
            print(f"  {user_folder.name}: {len(user_samples)} valid samples")

        if all_samples:
            df = pd.DataFrame(all_samples, columns=['class'] + [f'feature_{i}' for i in range(42)])
            df.to_csv(output_csv, index=False)
            print(f"✅ Saved {len(all_samples)} samples to {output_csv}")
            return len(all_samples)
        else:
            print(f"❌ No valid samples found for {folder.name}")
            return 0


def main():
    # Class mapping (must match keypoint_classifier_label.csv)
    class_mapping = {
        'afraid': 0,
        'agree': 1,
        'assistance': 2,
        'bad': 3,
        'become': 4,
        'college': 5,
        'doctor': 6,
        'from': 7,
        'pain': 8,
        'pray': 9,
        'secondary': 10,
        'skin': 11,
        'small': 12,
        'specific': 13,
        'stand': 14,
        'today': 15,
        'warn': 16,
        'which': 17,
        'work': 18,
        'you': 19
    }

    extractor = LandmarkExtractor()
    total_samples = 0

    # From src/data/ to model_artifacts/raw_landmarks at project root
    output_root = Path("../..") / "model_artifacts" / "raw_landmarks"
    os.makedirs(output_root, exist_ok=True)

    # From src/data/ to dataset/<class> at project root
    dataset_root = Path("../..") / "dataset"

    for class_name, class_id in class_mapping.items():
        class_folder = dataset_root / class_name
        output_csv = output_root / f"{class_name}.csv"

        if not class_folder.exists():
            print(f"❌ Missing folder: {class_folder}")
            continue

        samples = extractor.extract_from_folder(class_folder, class_id, output_csv)
        total_samples += samples

    print(f"\n🎉 PHASE 2 COMPLETE!")
    print(f"📊 Total landmark vectors extracted: {total_samples}/7200")
    print(f"📁 Files saved in: {output_root}")

    print("\n📋 SUMMARY:")
    for class_name in class_mapping:
        csv_file = output_root / f"{class_name}.csv"
        if csv_file.exists():
            df = pd.read_csv(csv_file)
            print(f"  {class_name}: {len(df)} samples ✓")
        else:
            print(f"  {class_name}: 0 samples ❌")


if __name__ == "__main__":
    main()
