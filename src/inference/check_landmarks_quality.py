# keypoint_classifier/check_landmarks_quality.py
# Run from: final year project-landmarks/src/inference

import pandas as pd
from pathlib import Path


def check_quality():
    # raw_landmarks is inside model_artifacts
    raw_landmarks_dir = Path("../../model_artifacts/raw_landmarks")
    total_samples = 0
    valid_samples = 0

    print("🔍 LANDMARK QUALITY CHECK")
    print("=" * 50)
    print(f"Looking for CSVs in: {raw_landmarks_dir.resolve()}\n")

    if not raw_landmarks_dir.exists():
        print(f"❌ Folder not found: {raw_landmarks_dir}")
        return

    csv_files = list(raw_landmarks_dir.glob("*.csv"))
    if not csv_files:
        print("❌ No CSV files found in raw_landmarks/. Run extract_landmarks.py first.")
        return

    for csv_file in csv_files:
        df = pd.read_csv(csv_file)
        samples_count = len(df)
        total_samples += samples_count

        # Check for NaN values
        nan_count = df.isnull().sum().sum()

        # Check for invalid ranges (landmarks normalized ~[-1,1])
        invalid_range = ((df.iloc[:, 1:] < -2) | (df.iloc[:, 1:] > 2)).sum().sum()

        # Check zero variance features (should rarely be all same)
        zero_var = (df.iloc[:, 1:].var() == 0).sum()

        valid = samples_count - nan_count - invalid_range - zero_var
        valid_samples += valid

        status = "✅" if valid == samples_count else "⚠️"
        print(
            f"{status} {csv_file.name}: {samples_count} total, {valid} valid "
            f"(NaN:{nan_count}, Invalid:{invalid_range}, ZeroVar:{zero_var})"
        )

    print("\n" + "=" * 50)
    print(f"🎯 TOTAL: {valid_samples}/{total_samples} valid samples")
    print(f"✅ Ready for PHASE 3: {valid_samples >= 6400}")


if __name__ == "__main__":
    check_quality()
