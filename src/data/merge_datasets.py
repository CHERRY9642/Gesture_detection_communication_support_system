# notebooks/merge_datasets.py
# Run from: final year project-landmarks/notebooks

import pandas as pd
import numpy as np
from pathlib import Path
import os
from sklearn.utils import shuffle


def merge_datasets():
    """Merge 8 class CSVs into single keypoint.csv"""

    # Input directory (from src/data/ → ../../model_artifacts/raw_landmarks)
    raw_landmarks_dir = Path("../..") / "model_artifacts" / "raw_landmarks"
    # Output file (../../model_artifacts/keypoint.csv)
    output_file = Path("../..") / "model_artifacts" / "keypoint.csv"

    print("🔗 PHASE 3: MERGING DATASETS")
    print("=" * 60)
    print(f"Input dir:  {raw_landmarks_dir.resolve()}")
    print(f"Output csv: {output_file.resolve()}\n")

    # Class mapping for verification
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

    all_dfs = []
    class_stats = {}
    total_samples = 0

    # Step 1: Load all 8 CSVs
    print("📂 Loading class files...")
    for class_name in class_mapping.keys():
        csv_file = raw_landmarks_dir / f"{class_name}.csv"

        if not csv_file.exists():
            print(f"❌ Missing: {csv_file}")
            continue

        df = pd.read_csv(csv_file)
        samples_count = len(df)

        expected_cols = 43  # class + 42 features
        if df.shape[1] != expected_cols:
            print(f"⚠️  {class_name}: {df.shape[1]} columns (expected {expected_cols})")

        expected_class_id = class_mapping[class_name]
        actual_class_ids = df['class'].unique()
        if expected_class_id not in actual_class_ids:
            print(f"⚠️  {class_name}: Expected class_id {expected_class_id}, found {actual_class_ids}")

        all_dfs.append(df)
        class_stats[class_name] = samples_count
        total_samples += samples_count

        print(f"✅ {class_name}: {samples_count:,} samples loaded")

    if not all_dfs:
        raise ValueError("❌ No valid CSV files found!")

    # Step 2: Concatenate all DataFrames vertically
    print(f"\n🔀 Merging {len(all_dfs)} class files...")
    merged_df = pd.concat(all_dfs, ignore_index=True)
    print(f"📊 Merged shape: {merged_df.shape}")

    # Step 3: Data quality checks
    print("\n🔍 DATA QUALITY CHECKS")
    print("-" * 40)

    nan_count = merged_df.isnull().sum().sum()
    print(f"NaN values: {nan_count:,}")

    feature_cols = merged_df.columns[1:]  # exclude 'class'
    min_val = merged_df[feature_cols].min().min()
    max_val = merged_df[feature_cols].max().max()
    print(f"Feature range: [{min_val:.3f}, {max_val:.3f}] ✓")

    class_dist = merged_df['class'].value_counts().sort_index()
    print("\n📈 CLASS DISTRIBUTION:")
    for class_id, count in class_dist.items():
        class_name = [k for k, v in class_mapping.items() if v == class_id][0]
        print(f"  Class {class_id} ({class_name}): {count:,} samples")

    # Step 4: Shuffle dataset
    print("\n🔀 Shuffling dataset...")
    final_df = shuffle(merged_df, random_state=42, n_samples=len(merged_df))

    # Step 5: Save final dataset
    print(f"\n💾 Saving to {output_file}...")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    final_df.to_csv(output_file, index=False)

    # Step 6: Final statistics
    print("\n" + "=" * 60)
    print("🎉 PHASE 3 COMPLETE!")
    print(f"📊 Final dataset: {len(final_df):,} rows × {len(final_df.columns)} columns")
    print(f"📁 Saved: {output_file}")
    print("🎯 Ready for PHASE 4 (Training)")

    print("\n📋 FINAL DATASET STATS:")
    print("-" * 40)
    print(f"{'Class':<12} {'Samples':<8} {'Percentage'}")
    print("-" * 40)
    for class_id, count in class_dist.items():
        class_name = [k for k, v in class_mapping.items() if v == class_id][0]
        pct = (count / total_samples) * 100
        print(f"{class_name:<12} {count:<8,} {pct:>6.1f}%")
    print("-" * 40)
    print(f"TOTAL:        {total_samples:<8,} 100.0%")

    return final_df


def verify_dataset():
    """Quick verification of final dataset"""
    final_csv = Path("../..") / "model_artifacts" / "keypoint.csv"

    if not final_csv.exists():
        print(f"❌ {final_csv} not found!")
        return False

    df = pd.read_csv(final_csv)
    print(f"\n✅ VERIFICATION:")
    print(f"   Shape: {df.shape}")
    print(f"   Memory: {df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")
    print(f"   Class balance std: {df['class'].value_counts().std():.1f}")

    print("\n📄 SAMPLE ROW:")
    print(df.head(1).to_string(index=False))

    return True


if __name__ == "__main__":
    dataset = merge_datasets()
    verify_dataset()
    print("\n🚀 Ready for PHASE 4: Model Training!")
