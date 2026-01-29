# augment_dataset.py
import numpy as np
import pandas as pd

def augment_landmarks(landmarks, noise_level=0.02, rotation_range=10):
    """
    Augment landmark data with random noise and rotation.
    
    Args:
        landmarks (np.array): Shape (42,) or (N, 42) feature vector
        noise_level (float): Standard deviation of Gaussian noise
        rotation_range (int): Max rotation degree
        
    Returns:
        np.array: Augmented landmarks
    """
    # Reshape to (21, 2) for geometric operations
    reshaped = landmarks.reshape(-1, 21, 2)
    
    # 1. Add Gaussian Noise
    noise = np.random.normal(0, noise_level, reshaped.shape)
    augmented = reshaped + noise
    
    # 2. Random Rotation (around center of gravity or wrist)
    angle_deg = np.random.uniform(-rotation_range, rotation_range)
    angle_rad = np.radians(angle_deg)
    
    cos_val = np.cos(angle_rad)
    sin_val = np.sin(angle_rad)
    rotation_matrix = np.array([[cos_val, -sin_val], [sin_val, cos_val]])
    
    # Rotate around (0,0) since data is normalized to wrist-relative often
    # If not, we would subtract centroid first. Assuming pre-normalized:
    for i in range(augmented.shape[0]): # Batch size if multiple
       augmented[i] = np.dot(augmented[i], rotation_matrix)
       
    return augmented.reshape(landmarks.shape)

if __name__ == "__main__":
    print("Test Augmentation:")
    dummy_data = np.random.rand(42)
    aug_data = augment_landmarks(dummy_data)
    print(f"Original shape: {dummy_data.shape}, Augmented shape: {aug_data.shape}")
    print("Augmentation script verified.")
