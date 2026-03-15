import base64
import numpy as np
import cv2
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE ----------------

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)


with app.app_context():
    db.create_all()

# ---------------- LOAD MODELS ----------------

IMG_SIZE = 224

print("Loading models...")

model_stage1 = load_model("stage1_model.h5")
model_stage2 = load_model("stage2_model.h5")

print("Models loaded successfully")

stage2_classes = ["AMD", "Diabetic_Retinopathy", "Glaucoma"]

# find last conv layer automatically
last_conv_layer_name = None
for layer in reversed(model_stage2.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv_layer_name = layer.name
        break

print("Last Conv Layer:", last_conv_layer_name)

# ---------------- IMAGE PREPROCESS ----------------


def preprocess_image(img):

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)

    return img


# ---------------- GRAD-CAM ----------------


def generate_gradcam(img_array):

    grad_model = tf.keras.models.Model(
        inputs=model_stage2.input,
        outputs=[
            model_stage2.get_layer(last_conv_layer_name).output,
            model_stage2.output,
        ],
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(img_array)

        # FIX: convert list → tensor
        if isinstance(predictions, list):
            predictions = predictions[0]

        class_index = tf.argmax(predictions[0])

        loss = predictions[:, class_index]

    grads = tape.gradient(loss, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)

    heatmap = tf.maximum(heatmap, 0)

    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)

    return heatmap.numpy(), int(class_index)


# ---------------- MEDICAL MESSAGE ----------------


def get_medical_message(disease):

    messages = {
        "AMD": "Age-related macular degeneration detected.",
        "Diabetic_Retinopathy": "Diabetic Retinopathy detected.",
        "Glaucoma": "Glaucoma detected.",
    }

    return messages.get(disease, "Abnormal retinal condition detected.")


# ---------------- HOME ----------------


@app.route("/")
def home():
    return "EyeDx Backend Running"


# ---------------- SIGNUP ----------------


@app.route("/signup", methods=["POST"])
def signup():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user:
        return jsonify({"message": "User already exists"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"})


# ---------------- LOGIN ----------------


@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    return jsonify({"message": "Login successful", "user": email})


# ---------------- PREDICT ----------------


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    file_bytes = np.frombuffer(file.read(), np.uint8)

    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    img_array = preprocess_image(img_rgb)

    # ---------- Stage 1 ----------

    stage1_pred = model_stage1.predict(img_array, verbose=0)[0][0]

    if stage1_pred > 0.5:

        return jsonify(
            {
                "status": "Normal",
                "disease": "Eye condition looks healthy",
                "gradcam": None,
            }
        )

    # ---------- Stage 2 ----------

    heatmap, class_index = generate_gradcam(img_array)

    disease = stage2_classes[class_index]

    explanation = get_medical_message(disease)

    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))

    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    gradcam_img = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

    _, buffer = cv2.imencode(".jpg", gradcam_img)

    gradcam_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify(
        {"status": disease, "disease": explanation, "gradcam": gradcam_base64}
    )


# ---------------- RUN SERVER ----------------


if __name__ == "__main__":
    app.run(debug=True)