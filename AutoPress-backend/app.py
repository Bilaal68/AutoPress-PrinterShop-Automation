from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.fayda import fayda_bp
from routes.wedding import wedding_bp
import os

app = Flask(__name__, static_folder='static')

# ============================================================
# CORS CONFIGURATION - Update with your Render URL
# ============================================================
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local development
    "http://localhost:3000",
    "https://autopress-frontend.onrender.com",  # Your frontend on Render
    "https://your-custom-domain.com",  # Your custom domain if you have one
]

CORS(app, 
     origins=ALLOWED_ORIGINS,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
     supports_credentials=True)

# Register blueprints
app.register_blueprint(fayda_bp)
app.register_blueprint(wedding_bp)

@app.route('/')
def index():
    return jsonify({'status': 'AutoPress API is running!', 'message': 'Welcome to AutoPress Backend'})

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running smoothly!'})

@app.route('/static/previews/<path:filename>')
def serve_wedding_preview(filename):
    previews_path = os.path.join('static', 'previews')
    return send_from_directory(previews_path, filename)

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin', '')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)