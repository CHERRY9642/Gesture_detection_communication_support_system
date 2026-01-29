# main.py
import subprocess
import sys
import time
from pathlib import Path

def run_script(script_name):
    """Runs a python script using subprocess and checks for errors."""
    print(f"\n{'='*60}")
    print(f"▶️  RUNNING: {script_name}")
    print(f"{'='*60}")
    
    script_path = Path(script_name)
    if not script_path.exists():
        print(f"❌ Error: File {script_name} not found.")
        return False
        
    start_time = time.time()
    try:
        # Run script and stream output
        result = subprocess.run(
            [sys.executable, script_name], 
            check=True,
            text=True
        )
        elapsed = time.time() - start_time
        print(f"\n✅ {script_name} completed in {elapsed:.2f}s")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running {script_name}: {e}")
        return False

def main():
    print("🚀 SIGN LANGUAGE RECOGNITION - PIPELINE RUNNER")
    print("Starting automated execution of notebook scripts...")
    
    # List of non-interactive scripts in order
    pipeline = [
        "augment_dataset.py",
        "01_load_data.py",
        "02_process_data.py",
        "perform_eda.py",
        "03_baseline_models.py",
        "04_advanced_models.py",
        "05_hyperparameter_tuning.py",
        "06_final_model_selection.py",
        "07_statistical_validation.py"
    ]
    
    success_count = 0
    for script in pipeline:
        if run_script(script):
            success_count += 1
        else:
            print("\n⛔ Pipeline stopped due to error.")
            break
            
    print(f"\n{'-'*60}")
    print(f"Pipeline finished. {success_count}/{len(pipeline)} steps completed.")
    print(f"{'-'*60}")
    
    # Interactive Step
    print("\nThe final step '09_model_interpretation.py' requires user interaction.")
    user_input = input("👉 Do you want to run the interactive interpretation mode? (y/n): ")
    
    if user_input.lower().strip() == 'y':
        run_script("09_model_interpretation.py")
    else:
        print("Skipping interactive mode. Goodbye! 👋")

if __name__ == "__main__":
    main()
