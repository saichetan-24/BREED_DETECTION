import json
import logging
from pathlib import Path
from datetime import datetime

import numpy as np
import pickle
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "breed_classifier.h5"
CLASS_INDICES_PATH = BASE_DIR / "class_indices.pkl"
SUBMISSIONS_PATH = BASE_DIR / "submissions.json"

app = Flask(__name__)
CORS(app)

try:
    model = load_model(str(MODEL_PATH))
    with CLASS_INDICES_PATH.open("rb") as f:
        class_indices = pickle.load(f)
    idx_to_class = {v: k for k, v in class_indices.items()}
    class_list = [idx_to_class[i] for i in sorted(idx_to_class.keys())]
    logger.info("Model and class indices loaded successfully.")
except Exception as exc:
    logger.exception("Error loading model or class indices: %s", exc)
    model = None
    class_indices = {}
    idx_to_class = {}
    class_list = []


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB").resize((224, 224))
    arr = np.array(image, dtype=np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr


@app.get("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.get("/class_list")
def get_class_list():
    return jsonify({"breeds": class_list})


@app.post("/predict")
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Empty file"}), 400

    try:
        image = Image.open(file.stream)
        img_array = preprocess_image(image)
        preds = model.predict(img_array, verbose=0)[0]
        top3_idx = np.argsort(preds)[::-1][:3]

        top3 = [
            {
                "label": idx_to_class.get(int(i), str(i)),
                "confidence": float(preds[i]),
            }
            for i in top3_idx
        ]

        return jsonify(
            {
                "prediction": top3[0]["label"],
                "confidence": top3[0]["confidence"],
                "top3": top3,
                "class_list": class_list,
            }
        )
    except Exception as exc:
        logger.exception("Prediction error: %s", exc)
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


@app.post("/submit")
def submit():
    payload = request.get_json(silent=True) or {}
    predicted = payload.get("predicted")
    confirmed = payload.get("confirmed")

    if not isinstance(predicted, str) or not predicted.strip():
        return jsonify({"error": "Invalid predicted breed"}), 400
    if not isinstance(confirmed, str) or not confirmed.strip():
        return jsonify({"error": "Invalid confirmed breed"}), 400

    predicted = predicted.strip()
    confirmed = confirmed.strip()

    if class_list and (predicted not in class_list or confirmed not in class_list):
        return jsonify({"error": "Breed name not recognized"}), 400

    entry = {
        "predicted": predicted,
        "confirmed": confirmed,
        "timestamp": datetime.now().strftime("%Y-%m-%d"),
    }

    try:
        if SUBMISSIONS_PATH.exists():
            with SUBMISSIONS_PATH.open("r", encoding="utf-8") as f:
                results = json.load(f)
            if not isinstance(results, list):
                results = []
        else:
            results = []

        results.append(entry)
        with SUBMISSIONS_PATH.open("w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)

        return jsonify({"message": "Final decision saved", "entry": entry})
    except Exception as exc:
        logger.exception("Submit error: %s", exc)
        return jsonify({"error": f"Submit failed: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
