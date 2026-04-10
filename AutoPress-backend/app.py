from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.fayda import fayda_bp
from routes.wedding import wedding_bp
import os

app = Flask(__name__, static_folder='static')

# Configure CORS - Allow frontend to communicate
CORS(app, origins=[
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",   # React default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000"
], supports_credentials=True)

# Register blueprints
app.register_blueprint(fayda_bp)
app.register_blueprint(wedding_bp)

@app.route('/')
def index():
    return jsonify({'status': 'AutoPress API is running!', 'message': 'Welcome to AutoPress Backend'})

@app.route('/health')
def health_check():
    """Health check endpoint for frontend status monitoring"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running smoothly!'})

# Serve static preview images for wedding cards
@app.route('/static/previews/<path:filename>')
def serve_wedding_preview(filename):
    """Serve wedding card preview images from static/previews folder"""
    previews_path = os.path.join('static', 'previews')
    return send_from_directory(previews_path, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')