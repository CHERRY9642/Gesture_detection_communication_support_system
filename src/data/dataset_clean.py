import pandas as pd
import numpy as np
import os
import glob

def remove_outliers_iqr(df, columns):
    """
    Removes outliers from specified columns of a DataFrame using the IQR method.

    Args:
        df (pd.DataFrame): The input DataFrame.
        columns (list): A list of column names to check for outliers.

    Returns:
        pd.DataFrame: The DataFrame with outliers removed.
    """
    initial_rows = len(df)
    print(f"Initial rows before outlier removal: {initial_rows}")

    for col in columns:
        if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
        else:
            print(f"Warning: Column '{col}' not found or not numeric, skipping outlier removal for this column.")

    rows_after_outlier_removal = len(df)
    print(f"Rows after outlier removal: {rows_after_outlier_removal} (Dropped {initial_rows - rows_after_outlier_removal} rows)")
    return df

def clean_raw_landmark_data(input_dir, output_file):
    """
    Cleans raw landmark data from multiple CSV files in a directory.
    Steps include:
    1. Reading and concatenating all CSVs.
    2. Removing rows with NaN values.
    3. Ensuring all landmark data is numeric.
    4. Removing outliers using the IQR method.

    Args:
        input_dir (str): Path to the directory containing raw landmark CSV files.
        output_file (str): Path to save the single cleaned CSV file.
    """
    print(f"Starting cleaning process for raw landmark data in {input_dir}...")

    all_files = glob.glob(os.path.join(input_dir, "*.csv"))
    if not all_files:
        print(f"No CSV files found in {input_dir}. Exiting.")
        return

    df_list = []
    for f in all_files:
        try:
            df = pd.read_csv(f)
            # Add a 'label' column based on the filename (e.g., 'afraid' from 'afraid.csv')
            label = os.path.basename(f).replace('.csv', '')
            df.insert(0, 'label', label)
            df_list.append(df)
        except Exception as e:
            print(f"Error reading {f}: {e}")
            continue

    if not df_list:
        print("No dataframes were successfully loaded. Exiting.")
        return

    combined_df = pd.concat(df_list, ignore_index=True)
    initial_rows = len(combined_df)
    print(f"Initial combined number of rows: {initial_rows}")

    # Drop rows with any NaN values
    df_cleaned = combined_df.dropna()
    rows_after_nan_drop = len(df_cleaned)
    print(f"Rows after dropping NaNs: {rows_after_nan_drop} (Dropped {initial_rows - rows_after_nan_drop} rows)")

    # Ensure all landmark columns are numeric
    # Assuming landmark data starts from the second column (index 1)
    # and the first column is 'label'
    landmark_columns = df_cleaned.columns[1:]
    for col in landmark_columns:
        df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce')

    # Drop rows where conversion to numeric resulted in NaN (if any non-numeric data was present)
    df_cleaned = df_cleaned.dropna(subset=landmark_columns)
    rows_after_numeric_check = len(df_cleaned)
    print(f"Rows after numeric check: {rows_after_nan_drop - rows_after_numeric_check} rows dropped due to non-numeric data.")

    if df_cleaned.empty:
        print("Warning: Cleaned dataset is empty after initial cleaning steps. No data to save.")
        return

    # Remove outliers using IQR method
    df_cleaned = remove_outliers_iqr(df_cleaned, landmark_columns)

    if df_cleaned.empty:
        print("Warning: Cleaned dataset is empty after outlier removal. No data to save.")
        return

    # Save the cleaned dataset
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df_cleaned.to_csv(output_file, index=False)
    print(f"Cleaned dataset saved to {output_file}")
    print(f"Final number of rows: {len(df_cleaned)}")

if __name__ == '__main__':
    RAW_LANDMARKS_DIR = '../../model_artifacts/raw_landmarks'
    CLEANED_DATA_DIR = '../../model_artifacts/cleaned_data'
    CLEANED_OUTPUT_FILE = os.path.join(CLEANED_DATA_DIR, 'all_landmarks_cleaned.csv')

    # Create the directory for cleaned data if it doesn't exist
    os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

    clean_raw_landmark_data(
        input_dir=os.path.abspath(RAW_LANDMARKS_DIR),
        output_file=os.path.abspath(CLEANED_OUTPUT_FILE)
    )
    print("\nDataset cleaning process completed.")