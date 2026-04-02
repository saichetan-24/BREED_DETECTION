# app.py
import streamlit as st
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model as keras_load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import pickle

# ----------------------
# Sidebar & Footer
# ----------------------
st.sidebar.title("🐄 Cattle & Buffalo Breed Classifier")
st.sidebar.markdown("""
This app classifies cattle and buffalo breeds from images using a deep learning model (EfficientNet).

- Upload an image or use your webcam
- Get breed predictions with confidence scores

**Model:** TensorFlow/Keras EfficientNet
**Developer:** Your Name
""")

# Footer
footer = """
---
Developed by Your Name
"""

# ----------------------
# Utility Functions
# ----------------------
def load_model():
    try:
        model = keras_load_model("backend/breed_classifier.h5")
        with open("backend/class_indices.pkl", "rb") as f:
            class_indices = pickle.load(f)
        idx_to_class = {v: k for k, v in class_indices.items()}
        return model, idx_to_class
    except Exception as e:
        st.error(f"Error loading model or class indices: {e}")
        return None, None

def preprocess_image(img: Image.Image):
    img = img.convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_image(model, idx_to_class, img_array):
    preds = model.predict(img_array)
    top3_idx = np.argsort(preds[0])[::-1][:3]
    top3_scores = preds[0][top3_idx]
    top3_labels = [idx_to_class[i] for i in top3_idx]
    return top3_labels, top3_scores

# ----------------------
# Streamlit UI
# ----------------------
st.set_page_config(page_title="Cattle & Buffalo Breed Classifier", page_icon="🐄")
st.title("🐄 Cattle & Buffalo Breed Classifier")
st.markdown("""
Welcome! This app classifies cattle and buffalo breeds from your images using a deep learning model.\

**Instructions:**
- 📸 Upload an image or capture one from your webcam
- 📊 Click **Predict** to see the breed and confidence
""")

# Image input options
input_method = st.radio("Choose input method:", ("Upload Image", "Capture from Camera"), horizontal=True)

uploaded_img = None
if input_method == "Upload Image":
    uploaded_img = st.file_uploader("Upload an image (jpg, png, jpeg)", type=["jpg", "jpeg", "png"])
else:
    camera_img = st.camera_input("Capture image from webcam")
    if camera_img is not None:
        uploaded_img = camera_img

img_display = None
if uploaded_img is not None:
    try:
        img_display = Image.open(uploaded_img)
        st.image(img_display, caption="Selected Image", use_column_width=True)
    except Exception as e:
        st.error(f"Error loading image: {e}")

# Predict button
predict_btn = st.button("🔍 Predict")

if predict_btn:
    if img_display is None:
        st.warning("Please upload or capture an image first.")
    else:
        with st.spinner("Predicting... Please wait."):
            model, idx_to_class = load_model()
            if model is not None and idx_to_class is not None:
                try:
                    img_array = preprocess_image(img_display)
                    top3_labels, top3_scores = predict_image(model, idx_to_class, img_array)
                    confidence = float(top3_scores[0])
                    breed = top3_labels[0]
                    if confidence < 0.6:
                        st.warning(f"Uncertain prediction. (Confidence: {confidence*100:.1f}%)")
                    else:
                        st.success(f"**Predicted Breed:** {breed}  ")
                        st.markdown(f"**Confidence:** {confidence*100:.1f}%")
                    # Show top 3 predictions
                    st.markdown("### 📊 Top 3 Predictions:")
                    for i in range(3):
                        st.write(f"{i+1}. {top3_labels[i]} — {top3_scores[i]*100:.2f}%")
                except Exception as e:
                    st.error(f"Prediction failed: {e}")

st.markdown(footer)
