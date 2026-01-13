import cv2
import pandas as pd
from pathlib import Path

def verify_dataset_integrity(dataset_root, labels_path, expected_users, expected_images_per_user):
    """
    Scans the dataset to check for correctness.

    Args:
        dataset_root (str or Path): The root directory of the dataset.
        labels_path (str or Path): Path to the CSV file containing class labels.
        expected_users (int): The expected number of user folders per class.
        expected_images_per_user (int): The expected number of images per user folder.
    """
    dataset_root = Path(dataset_root)
    labels_path = Path(labels_path)

    if not labels_path.exists():
        print(f"ERROR: Label file not found at {labels_path}")
        return

    try:
        labels_df = pd.read_csv(labels_path, header=None, names=['id', 'name'])
        classes = labels_df['name'].tolist()
    except Exception as e:
        print(f"ERROR: Could not read labels file: {e}")
        return

    total_valid_images = 0
    total_expected_images = 0

    print("🔍 Verifying dataset integrity...")
    print("=" * 60)

    for class_name in classes:
        class_path = dataset_root / class_name
        total_expected_images += expected_users * expected_images_per_user

        if not class_path.exists():
            print(f"❌ Missing folder for class: {class_name}")
            continue

        user_folders = sorted(list(class_path.glob("User_*")))
        if len(user_folders) != expected_users:
            print(f"⚠️  {class_name}: Expected {expected_users} user folders, found {len(user_folders)}")

        print(f"\n✅ Verifying class: {class_name}")
        class_valid_images = 0
        for user_folder in user_folders:
            img_files = list(user_folder.glob("*.jpg")) + list(user_folder.glob("*.png"))
            if len(img_files) != expected_images_per_user:
                print(f"  - {user_folder.name}: {len(img_files)} images (Expected {expected_images_per_user})")

            for img_path in img_files:
                try:
                    img = cv2.imread(str(img_path))
                    if img is not None and img.size > 0:
                        class_valid_images += 1
                    else:
                        print(f"  - CORRUPTED IMAGE: {img_path}")
                except Exception as e:
                    print(f"  - ERROR READING {img_path}: {e}")
        
        total_valid_images += class_valid_images
        print(f"  -> Found {class_valid_images} valid images for this class.")

    print("\n" + "=" * 60)
    print("🎉 Verification Complete!")
    print(f"Total valid images found: {total_valid_images} / {total_expected_images}")

if __name__ == '__main__':
    # This allows the script to be run directly for verification from the command line.
    # It assumes a specific directory structure relative to this script.
    project_root = Path(__file__).resolve().parents[2]
    labels = project_root / 'model_artifacts' / 'keypoint_classifier_label.csv'
    dataset = project_root / 'dataset'
    
    print("Running verification from command line...")
    verify_dataset_integrity(
        dataset_root=dataset,
        labels_path=labels,
        expected_users=6,
        expected_images_per_user=150
    )