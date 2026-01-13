import setuptools

# Read the requirements.txt file and filter out comments/empty lines
with open("requirements.txt", "r", encoding="utf-8") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setuptools.setup(
    name="sign_language_gesture_detection",
    version="1.0.0",
    author="ICHAR",
    author_email="placeholder@example.com",
    description="A real-time sign language gesture recognition application using MediaPipe and TensorFlow.",
    long_description="This project captures hand landmarks using MediaPipe and uses a trained MLP model with TensorFlow to recognize sign language gestures in real-time. This setup file also creates console scripts for training, exporting, and running the model.",
    long_description_content_type="text/plain",
    url="https://github.com/ICHAR/Final-year-project-landmarks", # Placeholder URL
    packages=setuptools.find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=requirements,
    python_requires=">=3.10",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    entry_points={
        "console_scripts": [
            "slr-realtime=app_realtime:main",
            "slr-train=train_mlp:main",
            "slr-export=export_tflite:main",
            "slr-validate=validate_tflite:main",
        ]
    },
)
