# backend/sample_data/populate_all.py

import os
import sys
import importlib
import time
import subprocess

# Add the parent directory to the path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Ensure the sample_data directory exists
current_dir = os.path.dirname(os.path.abspath(__file__))
os.makedirs(current_dir, exist_ok=True)

# Define script files to run (in order)
script_files = [
    "populate_time_events_messages.py",
    "populate_report_cards.py",
    "populate_learning_materials.py"
]

def run_script(script_file):
    """Run a Python script file"""
    try:
        print(f"\n{'='*50}")
        print(f"Running {script_file}...")
        print(f"{'='*50}\n")
        
        # Check if file exists
        script_path = os.path.join(current_dir, script_file)
        if not os.path.exists(script_path):
            print(f"Error: Script file {script_file} not found at {script_path}")
            return False
        
        # Run the script as a subprocess to ensure clean environment
        result = subprocess.run([sys.executable, script_path], check=True)
        
        if result.returncode == 0:
            print(f"\n{script_file} executed successfully.")
            return True
        else:
            print(f"\nError executing {script_file}. Return code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"Error running {script_file}: {e}")
        return False

def main():
    """Run all sample data population scripts"""
    print("Starting sample data population...")
    
    success_count = 0
    for script_file in script_files:
        if run_script(script_file):
            success_count += 1
        time.sleep(1)  # Brief pause between scripts
    
    print(f"\n{'='*50}")
    print(f"Sample data population completed: {success_count}/{len(script_files)} scripts executed successfully.")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()