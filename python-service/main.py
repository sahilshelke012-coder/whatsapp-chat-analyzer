import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import parse_whatsapp_chat_content
from stats import calculate_stats

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "UP",
        "service": "Python WhatsApp Analyzer API Service"
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_chat():
    if 'file' not in request.files and 'chatFile' not in request.files:
        return jsonify({
            "success": False,
            "error": "No file uploaded. Please send a .txt WhatsApp chat export file."
        }), 400

    uploaded_file = request.files.get('file') or request.files.get('chatFile')

    if not uploaded_file or uploaded_file.filename == '':
        return jsonify({
            "success": False,
            "error": "Empty filename provided."
        }), 400

    if not uploaded_file.filename.lower().endswith('.txt'):
        return jsonify({
            "success": False,
            "error": "Invalid file type. Only .txt files are supported."
        }), 400

    temp_file_path = None
    try:
        # Read file content safely into memory / temp storage
        content = uploaded_file.read().decode('utf-8', errors='replace')

        if not content.strip():
            return jsonify({
                "success": False,
                "error": "The uploaded WhatsApp chat file is empty."
            }), 400

        # Parse chat content and compute statistics
        messages = parse_whatsapp_chat_content(content)
        analysis_data = calculate_stats(messages)

        return jsonify({
            "success": True,
            "data": analysis_data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to analyze chat file: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Python Analytics Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
