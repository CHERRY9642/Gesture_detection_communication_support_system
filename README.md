DEMO VIDEO LINK:  https://drive.google.com/file/d/1-h7pn3HUCkcE2X2Du8DrDr4AWzJZT503/view?usp=sharing

# Sign Language & Gesture Recognition

This project is a real-time gesture recognition system that uses computer vision to detect and classify hand gestures from a webcam feed. It is built with MediaPipe for landmark extraction and a TensorFlow/Keras model for classification. The system is designed to recognize a vocabulary of signs, with a pipeline for data collection, training, and real-time inference.

## Features

- **Real-time Gesture Recognition**: Classifies hand gestures from a live webcam stream.
- **Custom Vocabulary**: Easily extensible to add new gestures.
- **Data Collection Pipeline**: Scripts to automate the process of collecting landmark data for new signs.
- **MLP Classifier**: Uses a simple but effective Multi-Layer Perceptron (MLP) for classification.
- **TFLite Export**: Includes scripts to convert the trained model to TensorFlow Lite for deployment on edge devices.
- **Web Application**: A simple Flask and JavaScript-based web app to demonstrate sentence construction from recognized signs.

## Project Structure

```
├── .gitignore
├── README.md
├── requirements.txt
├── setup.py
├── app/
│   ├── app.js
│   ├── backend.py
│   ├── gesture_to_sentence_rules.json
│   └── index.html
├── dataset/
│   ├── (afraid,agree,etc)/
│   │   └── User_1...User_6
├── model_artifacts/
│   ├── keypoint_classifier_label.csv
│   ├── keypoint.csv
│   ├── keypoint_classifier/
│   │   ├── keypoint_classifier.hdf5
│   │   └── keypoint_classifier.tflite
│   └── raw_landmarks/
│       ├── afraid.csv
│       ├── agree.csv
│       └── ...
├── notebooks/
│   ├── 01_data_loading_and_integrity.ipynb
│   ├── 02_data_cleaning.ipynb
│   ├── 03_exploratory_data_analysis.ipynb
│   ├── 04_feature_engineering.ipynb
│   ├── 05_baseline_models.ipynb
│   ├── 06_advanced_models.ipynb
│   ├── 07_hyperparameter_tuning.ipynb
│   ├── 08_model_interpretation.ipynb
│   ├── 09_statistical_validation.ipynb
│   ├── 10_business_optimization.ipynb
│   └── 11_final_model_selection.ipynb
├── presentation/
│   ├── confusion_matrix.png
│   ├── tflite_comparison.png
│   └── training_history.png
├── src/
│   ├── data/
│   │   ├── dataset_clean.py
│   │   ├── extract_landmarks.py
│   │   └── merge_datasets.py
│   ├── inference/
│   │   ├── check_images.py
│   │   ├── check_landmarks_quality.py
│   │   ├── data_preparation.py
│   │   ├── test_mediapipe.py
│   │   └── validate_tflite.py
│   └── models/
│       ├── __init__.py
│       ├── app_realtime.py
│       ├── export_tflite.py
│       └── train_mlp.py
└── venv/                   # Virtual environment
```

## Dependencies

The project uses Python 3.10 and the main libraries are:
- **TensorFlow**: For creating and training the neural network.
- **MediaPipe**: For hand and pose landmark detection.
- **OpenCV**: For camera access and image processing.
- **scikit-learn**: For data splitting and model evaluation.
- **Flask**: To power the backend of the sentence-building web app.

For a full list of dependencies, see the `requirements.txt` file.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

## Workflow

### 1. Data Collection

To add a new gesture, create a folder with the gesture's name inside the `dataset/` directory. The system will then need to be trained on this new data.

### 2. Landmark Extraction

The `notebooks/extract_landmarks.py` script processes the images in the `dataset` folder, uses MediaPipe to extract hand/pose landmarks, and saves them into CSV files in the `keypoint_classifier/raw_landmarks/` directory.

### 3. Training the Classifier

Run the training script to train the MLP model on the extracted landmarks. The script will save the trained model and the corresponding labels.

```bash
python src/train_mlp.py
```

### 4. Running the Real-time Application

To start the real-time gesture recognition, run the following command. This will open a window showing your webcam feed with the detected gesture overlaid.

```bash
python src/app_realtime.py
```

## Sentence App

The project also includes a web-based application for demonstrating how the recognized signs can be used to form sentences.

1.  **Start the backend server:**
    ```bash
    python sentence_app/backend.py
    ```

2.  **Open the frontend:**
    Open the `sentence_app/index.html` file in your web browser. The page will connect to the backend and display the recognized signs.
