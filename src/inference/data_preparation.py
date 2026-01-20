import shutil
from pathlib import Path

# ==============================
# CONFIG
# ==============================
DATASET_ROOT = Path("dataset")
TARGET_GESTURES = ["where", "how"]
USERS = [f"User_{i}" for i in range(1, 7)]
IMAGES_PER_USER = 150
IMAGE_EXTS = {".jpg", ".png", ".jpeg"}

# ==============================
def restructure_gesture(gesture):
    print(f"\n🔧 Processing gesture: {gesture}")

    gesture_dir = DATASET_ROOT / gesture
    additional_dir = gesture_dir / "additional_images"

    if not gesture_dir.exists():
        print(f"❌ Folder not found: {gesture_dir}")
        return

    # Collect images directly from gesture folder
    images = sorted([
        p for p in gesture_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    ])

    if not images:
        print(f"⚠️ No images found in {gesture_dir}")
        return

    print(f"📸 Total images found: {len(images)}")

    additional_dir.mkdir(exist_ok=True)

    idx = 0

    # Create User folders and assign images
    for user in USERS:
        user_dir = gesture_dir / user
        user_dir.mkdir(exist_ok=True)

        user_images = images[idx: idx + IMAGES_PER_USER]
        print(f"👤 {user}: assigning {len(user_images)} images")

        for img in user_images:
            shutil.move(str(img), user_dir / img.name)

        idx += IMAGES_PER_USER

    # Remaining images
    remaining = images[idx:]
    print(f"➕ Moving {len(remaining)} extra images to additional_images/")

    for img in remaining:
        shutil.move(str(img), additional_dir / img.name)

    print(f"✅ Finished restructuring '{gesture}'")

# ==============================
if __name__ == "__main__":
    print("🚀 Starting dataset restructuring...")

    for gesture in TARGET_GESTURES:
        restructure_gesture(gesture)

    print("\n🎉 Dataset restructuring COMPLETE!")
