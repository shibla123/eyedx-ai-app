from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

app = Flask(__name__)

# 🔐 SECRET KEY
app.config['SECRET_KEY'] = 'supersecretkey'

# 🌐 Allow React Frontend
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]}})

# 🗄 Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ------------------ USER MODEL ------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))

# Create DB
with app.app_context():
    db.create_all()

# ------------------ HOME ------------------
@app.route("/")
def home():
    return "Backend is running successfully!"

# ------------------ SIGNUP ------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ------------------ LOGIN ------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):

        token = jwt.encode({
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        # Ensure token is string
        if isinstance(token, bytes):
            token = token.decode("utf-8")

        return jsonify({
            "message": "Login successful",
            "token": token
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401


# ------------------ TOKEN REQUIRED DECORATOR ------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message": "Token is missing"}), 401

        parts = auth_header.split(" ")

        if len(parts) != 2 or parts[0] != "Bearer":
            return jsonify({"message": "Invalid token format"}), 401

        token = parts[1]

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data["user_id"])

            if not current_user:
                return jsonify({"message": "User not found"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


# ------------------ PROTECTED DASHBOARD ------------------
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard(current_user):
    return jsonify({
        "message": f"Welcome {current_user.name}, this is a protected route!"
    })


# ------------------ PROTECTED PREDICT ------------------
@app.route("/predict", methods=["POST"])
@token_required
def predict(current_user):
    data = request.json
    input_data = data.get("input")

    if not input_data:
        return jsonify({"message": "Input data required"}), 400

    # Dummy AI logic (replace with real model)
    result = f"Prediction for {input_data}"

    return jsonify({
        "user": current_user.name,
        "result": result
    })


# ------------------ RUN ------------------
if __name__ == "__main__":
    app.run(debug=True)